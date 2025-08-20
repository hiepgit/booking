import { prisma } from '../libs/prisma.js';
import { getSocketServer } from '../websocket/socket.server.js';
import type { NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: string;
}

export class NotificationService {
  /**
   * Create and send a notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {}
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      // Send in-app notification via WebSocket
      await this.sendInAppNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send in-app notification via WebSocket
   */
  static async sendInAppNotification(notification: any): Promise<boolean> {
    try {
      const socketServer = getSocketServer();
      if (!socketServer) {
        console.warn('Socket server not available for in-app notification');
        return false;
      }

      return await socketServer.sendNotificationToUser(notification.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt
      });
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(userId: string, page = 1, limit = 20, isRead?: boolean) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { userId };
      
      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
      ]);

      return {
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId,
          userId // Ensure user can only update their own notifications
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      return await prisma.notification.delete({
        where: {
          id: notificationId,
          userId // Ensure user can only delete their own notifications
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create system notification for all users (Admin only)
   */
  static async createSystemNotification(data: Omit<CreateNotificationData, 'userId'>) {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });

      const notifications = [];
      for (const user of users) {
        const notification = await this.createNotification({
          ...data,
          userId: user.id
        });
        notifications.push(notification);
      }

      return {
        message: `Notification sent to ${notifications.length} users`,
        notifications: notifications.slice(0, 5) // Return first 5 as sample
      };
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  static async getStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        totalNotifications,
        todayNotifications,
        unreadNotifications,
        typeDistribution
      ] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }),
        prisma.notification.count({
          where: { isRead: false }
        }),
        prisma.notification.groupBy({
          by: ['type'],
          _count: {
            type: true
          },
          orderBy: {
            _count: {
              type: 'desc'
            }
          }
        })
      ]);

      return {
        total: totalNotifications,
        today: todayNotifications,
        unread: unreadNotifications,
        typeDistribution
      };
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  /**
   * Send appointment reminder notification
   */
  static async sendAppointmentReminder(appointmentId: string, reminderType: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              user: true
            }
          },
          doctor: {
            include: {
              user: true,
              specialty: true
            }
          },
          clinic: true
        }
      });

      if (!appointment) {
        console.error(`Appointment ${appointmentId} not found for reminder`);
        return;
      }

      // Skip if appointment is cancelled or completed
      if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)) {
        console.log(`Skipping reminder for ${appointment.status} appointment ${appointmentId}`);
        return;
      }

      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const timeUntilAppointment = this.getTimeUntilAppointment(reminderType);
      const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
      const clinicName = appointment.clinic?.name || 'Phòng khám';

      const title = `Nhắc nhở cuộc hẹn - ${timeUntilAppointment}`;
      const message = `Bạn có cuộc hẹn với bác sĩ ${doctorName} (${appointment.doctor.specialty.name}) tại ${clinicName} vào lúc ${appointment.startTime} ngày ${appointmentDateTime.toLocaleDateString('vi-VN')}.`;

      await this.createNotification({
        userId: appointment.patient.userId,
        type: 'APPOINTMENT_REMINDER',
        title,
        message,
        data: {
          appointmentId: appointment.id,
          reminderType,
          doctorName,
          clinicName,
          appointmentTime: appointment.startTime,
          appointmentDate: appointment.appointmentDate,
          specialty: appointment.doctor.specialty.name
        },
        priority: reminderType === 'APPOINTMENT_15M' ? 'HIGH' : 'NORMAL'
      });

      console.log(`Sent ${reminderType} reminder for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
    }
  }

  /**
   * Get human-readable time until appointment
   */
  static getTimeUntilAppointment(reminderType: string): string {
    switch (reminderType) {
      case 'APPOINTMENT_24H':
        return '24 giờ nữa';
      case 'APPOINTMENT_1H':
        return '1 giờ nữa';
      case 'APPOINTMENT_15M':
        return '15 phút nữa';
      default:
        return 'sắp tới';
    }
  }
}
