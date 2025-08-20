import cron from 'node-cron';
import { prisma } from '../libs/prisma.js';
import { NotificationService } from './notification.service.js';
import type { NotificationType } from '@prisma/client';

export interface ReminderSchedule {
  appointmentId: string;
  userId: string;
  reminderTime: Date;
  type: 'APPOINTMENT_24H' | 'APPOINTMENT_1H' | 'APPOINTMENT_15M';
  sent: boolean;
}

export class ReminderService {
  private static isInitialized = false;
  private static scheduledReminders = new Map<string, NodeJS.Timeout>();

  /**
   * Initialize reminder service with cron jobs
   */
  static initialize() {
    if (this.isInitialized) {
      console.log('Reminder service already initialized');
      return;
    }

    // Initialize cron jobs silently
    cron.schedule('*/5 * * * *', async () => {
      await this.processPendingReminders();
    });

    cron.schedule('0 * * * *', async () => {
      await this.scheduleUpcomingReminders();
    });

    cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    this.isInitialized = true;
  }

  /**
   * Schedule reminders for a specific appointment
   */
  static async scheduleAppointmentReminders(appointmentId: string) {
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
        console.error(`Appointment ${appointmentId} not found`);
        return;
      }

      // Use default reminder timings: 24h, 1h, 15m before appointment
      const reminderTimings = [1440, 60, 15];

      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Schedule reminders based on user preferences
      for (const minutesBefore of reminderTimings) {
        const reminderTime = new Date(appointmentDateTime.getTime() - (minutesBefore * 60 * 1000));
        
        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          await this.scheduleReminder({
            appointmentId,
            userId: appointment.patient.userId,
            reminderTime,
            type: this.getReminderType(minutesBefore),
            sent: false
          });
        }
      }

      console.log(`Scheduled reminders for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  /**
   * Schedule a single reminder
   */
  static async scheduleReminder(reminder: ReminderSchedule) {
    const delay = reminder.reminderTime.getTime() - Date.now();
    
    if (delay <= 0) {
      // Send immediately if time has passed
      await this.sendAppointmentReminder(reminder.appointmentId, reminder.type);
      return;
    }

    // Schedule reminder
    const timeoutId = setTimeout(async () => {
      await this.sendAppointmentReminder(reminder.appointmentId, reminder.type);
      this.scheduledReminders.delete(reminder.appointmentId + reminder.type);
    }, delay);

    this.scheduledReminders.set(reminder.appointmentId + reminder.type, timeoutId);
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

      await NotificationService.createNotification({
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
   * Process pending scheduled notifications
   */
  static async processPendingReminders() {
    try {
      // Since we don't have scheduled notifications in the current schema,
      // this method is simplified to just log that it's running
      console.log('Checking for pending reminders...');
    } catch (error) {
      console.error('Error processing pending reminders:', error);
    }
  }

  /**
   * Schedule reminders for upcoming appointments
   */
  static async scheduleUpcomingReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          appointmentDate: {
            gte: new Date(),
            lte: tomorrow
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        select: {
          id: true
        }
      });

      for (const appointment of upcomingAppointments) {
        await this.scheduleAppointmentReminders(appointment.id);
      }

      console.log(`Scheduled reminders for ${upcomingAppointments.length} upcoming appointments`);
    } catch (error) {
      console.error('Error scheduling upcoming reminders:', error);
    }
  }

  /**
   * Cancel reminders for an appointment
   */
  static cancelAppointmentReminders(appointmentId: string) {
    const reminderTypes = ['APPOINTMENT_24H', 'APPOINTMENT_1H', 'APPOINTMENT_15M'];
    
    for (const type of reminderTypes) {
      const key = appointmentId + type;
      const timeoutId = this.scheduledReminders.get(key);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.scheduledReminders.delete(key);
      }
    }

    console.log(`Cancelled reminders for appointment ${appointmentId}`);
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete old read notifications (keep unread ones)
      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true
        }
      });

      console.log(`Cleanup completed: ${deletedNotifications.count} notifications deleted`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  /**
   * Get reminder type based on minutes before appointment
   */
  static getReminderType(minutesBefore: number): 'APPOINTMENT_24H' | 'APPOINTMENT_1H' | 'APPOINTMENT_15M' {
    if (minutesBefore >= 1440) return 'APPOINTMENT_24H';
    if (minutesBefore >= 60) return 'APPOINTMENT_1H';
    return 'APPOINTMENT_15M';
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

  /**
   * Get reminder statistics
   */
  static async getReminderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [sentToday, pendingToday, failedToday] = await Promise.all([
      prisma.notification.count({
        where: {
          type: 'APPOINTMENT_REMINDER',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // For now, we'll count all unread appointment reminders as pending
      prisma.notification.count({
        where: {
          type: 'APPOINTMENT_REMINDER',
          isRead: false
        }
      }),
      // Since we don't have delivery tracking, we'll return 0 for failed
      Promise.resolve(0)
    ]);

    return {
      sentToday,
      pendingToday,
      failedToday,
      scheduledReminders: this.scheduledReminders.size
    };
  }
}
