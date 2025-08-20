import { prisma } from '../libs/prisma.js';
import { NotificationService } from './notification.service.js';
import { ReminderService } from './reminder.service.js';
import { getSocketServer } from '../websocket/socket.server.js';
import type { AppointmentStatus, NotificationType } from '@prisma/client';

export class RealtimeNotificationService {
  /**
   * Handle appointment status change notifications
   */
  static async handleAppointmentStatusChange(
    appointmentId: string, 
    oldStatus: AppointmentStatus, 
    newStatus: AppointmentStatus,
    updatedBy?: string
  ) {
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

      const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
      const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('vi-VN');
      const appointmentTime = appointment.startTime;

      // Notify patient about status change
      await this.notifyPatientStatusChange(appointment, oldStatus, newStatus, doctorName, appointmentDate, appointmentTime);

      // Notify doctor about status change (if not updated by doctor)
      if (updatedBy !== appointment.doctor.userId) {
        await this.notifyDoctorStatusChange(appointment, oldStatus, newStatus, appointmentDate, appointmentTime);
      }

      // Handle specific status changes
      switch (newStatus) {
        case 'CONFIRMED':
          await this.handleAppointmentConfirmed(appointment);
          break;
        case 'CANCELLED':
          await this.handleAppointmentCancelled(appointment, oldStatus);
          break;
        case 'COMPLETED':
          await this.handleAppointmentCompleted(appointment);
          break;
        case 'NO_SHOW':
          await this.handleAppointmentNoShow(appointment);
          break;
      }

      // Send real-time update via WebSocket
      const socketServer = getSocketServer();
      if (socketServer) {
        await socketServer.sendAppointmentUpdate(appointmentId, {
          appointmentId,
          oldStatus,
          newStatus,
          updatedAt: new Date(),
          appointment: {
            id: appointment.id,
            status: newStatus,
            appointmentDate: appointment.appointmentDate,
            startTime: appointment.startTime,
            doctor: {
              name: doctorName,
              specialty: appointment.doctor.specialty.name
            },
            clinic: appointment.clinic?.name
          }
        });
      }

    } catch (error) {
      console.error('Error handling appointment status change:', error);
    }
  }

  /**
   * Notify patient about appointment status change
   */
  static async notifyPatientStatusChange(
    appointment: any,
    oldStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    doctorName: string,
    appointmentDate: string,
    appointmentTime: string
  ) {
    const statusMessages = {
      CONFIRMED: `Cuộc hẹn của bạn với bác sĩ ${doctorName} vào ${appointmentTime} ngày ${appointmentDate} đã được xác nhận.`,
      CANCELLED: `Cuộc hẹn của bạn với bác sĩ ${doctorName} vào ${appointmentTime} ngày ${appointmentDate} đã bị hủy.`,
      RESCHEDULED: `Cuộc hẹn của bạn với bác sĩ ${doctorName} đã được dời lịch. Vui lòng kiểm tra thời gian mới.`,
      COMPLETED: `Cuộc hẹn của bạn với bác sĩ ${doctorName} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ.`,
      NO_SHOW: `Bạn đã không đến cuộc hẹn với bác sĩ ${doctorName} vào ${appointmentTime} ngày ${appointmentDate}.`
    };

    const notificationTypes: Record<AppointmentStatus, NotificationType> = {
      PENDING: 'GENERAL',
      CONFIRMED: 'APPOINTMENT_CONFIRMED',
      CANCELLED: 'APPOINTMENT_CANCELLED',
      RESCHEDULED: 'APPOINTMENT_RESCHEDULED',
      COMPLETED: 'APPOINTMENT_COMPLETED',
      IN_PROGRESS: 'GENERAL',
      NO_SHOW: 'GENERAL'
    };

    const message = statusMessages[newStatus];
    if (message) {
      await NotificationService.createNotification({
        userId: appointment.patient.userId,
        type: notificationTypes[newStatus],
        title: `Cập nhật cuộc hẹn - ${this.getStatusDisplayName(newStatus)}`,
        message,
        data: {
          appointmentId: appointment.id,
          oldStatus,
          newStatus,
          doctorName,
          appointmentDate,
          appointmentTime,
          specialty: appointment.doctor.specialty.name,
          clinicName: appointment.clinic?.name
        },
        priority: newStatus === 'CANCELLED' ? 'HIGH' : 'NORMAL',
        appointmentId: appointment.id
      });
    }
  }

  /**
   * Notify doctor about appointment status change
   */
  static async notifyDoctorStatusChange(
    appointment: any,
    oldStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    appointmentDate: string,
    appointmentTime: string
  ) {
    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
    
    const statusMessages = {
      CONFIRMED: `Bệnh nhân ${patientName} đã xác nhận cuộc hẹn vào ${appointmentTime} ngày ${appointmentDate}.`,
      CANCELLED: `Bệnh nhân ${patientName} đã hủy cuộc hẹn vào ${appointmentTime} ngày ${appointmentDate}.`,
      PENDING: `Có cuộc hẹn mới từ bệnh nhân ${patientName} vào ${appointmentTime} ngày ${appointmentDate}.`
    };

    const message = statusMessages[newStatus];
    if (message) {
      await NotificationService.createNotification({
        userId: appointment.doctor.userId,
        type: newStatus === 'PENDING' ? 'NEW_APPOINTMENT_REQUEST' : 'GENERAL',
        title: `Cập nhật cuộc hẹn - ${patientName}`,
        message,
        data: {
          appointmentId: appointment.id,
          oldStatus,
          newStatus,
          patientName,
          appointmentDate,
          appointmentTime,
          patientId: appointment.patient.id
        },
        priority: newStatus === 'PENDING' ? 'HIGH' : 'NORMAL',
        appointmentId: appointment.id
      });
    }
  }

  /**
   * Handle appointment confirmed
   */
  static async handleAppointmentConfirmed(appointment: any) {
    // Schedule appointment reminders
    await ReminderService.scheduleAppointmentReminders(appointment.id);
    
    console.log(`Scheduled reminders for confirmed appointment ${appointment.id}`);
  }

  /**
   * Handle appointment cancelled
   */
  static async handleAppointmentCancelled(appointment: any, oldStatus: AppointmentStatus) {
    // Cancel any scheduled reminders
    ReminderService.cancelAppointmentReminders(appointment.id);
    
    // If appointment was confirmed, notify about cancellation
    if (oldStatus === 'CONFIRMED') {
      // Additional cancellation handling can be added here
      console.log(`Cancelled reminders for appointment ${appointment.id}`);
    }
  }

  /**
   * Handle appointment completed
   */
  static async handleAppointmentCompleted(appointment: any) {
    // Cancel any remaining reminders
    ReminderService.cancelAppointmentReminders(appointment.id);
    
    // Send completion notification with feedback request
    await NotificationService.createNotification({
      userId: appointment.patient.userId,
      type: 'APPOINTMENT_COMPLETED',
      title: 'Cuộc hẹn hoàn thành',
      message: `Cuộc hẹn với bác sĩ ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} đã hoàn thành. Bạn có muốn đánh giá dịch vụ không?`,
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctor.id,
        showFeedbackRequest: true
      },
      priority: 'NORMAL',
      appointmentId: appointment.id
    });
  }

  /**
   * Handle appointment no-show
   */
  static async handleAppointmentNoShow(appointment: any) {
    // Cancel any remaining reminders
    ReminderService.cancelAppointmentReminders(appointment.id);
    
    // Notify patient about no-show
    await NotificationService.createNotification({
      userId: appointment.patient.userId,
      type: 'GENERAL',
      title: 'Vắng mặt cuộc hẹn',
      message: `Bạn đã không đến cuộc hẹn với bác sĩ ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}. Vui lòng liên hệ để đặt lịch mới.`,
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctor.id,
        noShow: true
      },
      priority: 'HIGH',
      appointmentId: appointment.id
    });
  }

  /**
   * Handle doctor availability status change
   */
  static async handleDoctorAvailabilityChange(doctorId: string, isAvailable: boolean) {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
          user: true,
          specialty: true
        }
      });

      if (!doctor) {
        console.error(`Doctor ${doctorId} not found`);
        return;
      }

      const doctorName = `${doctor.user.firstName} ${doctor.user.lastName}`;
      const notificationType: NotificationType = isAvailable ? 'DOCTOR_AVAILABLE' : 'DOCTOR_UNAVAILABLE';
      
      // Notify patients with upcoming appointments
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: {
            gte: new Date()
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          patient: {
            include: {
              user: true
            }
          }
        }
      });

      for (const appointment of upcomingAppointments) {
        const message = isAvailable 
          ? `Bác sĩ ${doctorName} hiện đã có sẵn để tư vấn.`
          : `Bác sĩ ${doctorName} hiện không có sẵn. Cuộc hẹn của bạn có thể bị ảnh hưởng.`;

        await NotificationService.createNotification({
          userId: appointment.patient.userId,
          type: notificationType,
          title: `Cập nhật trạng thái bác sĩ - ${doctorName}`,
          message,
          data: {
            doctorId,
            doctorName,
            isAvailable,
            appointmentId: appointment.id,
            specialty: doctor.specialty.name
          },
          priority: isAvailable ? 'NORMAL' : 'HIGH'
        });
      }

      // Broadcast to real-time clients
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.sendNotificationToRole('PATIENT', {
          type: 'doctor:availability:changed',
          doctorId,
          doctorName,
          specialty: doctor.specialty.name,
          isAvailable,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error handling doctor availability change:', error);
    }
  }

  /**
   * Handle payment status notifications
   */
  static async handlePaymentStatusChange(appointmentId: string, paymentStatus: string, amount?: number) {
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
              user: true
            }
          }
        }
      });

      if (!appointment) {
        console.error(`Appointment ${appointmentId} not found for payment notification`);
        return;
      }

      const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
      
      let notificationType: NotificationType;
      let title: string;
      let message: string;
      let priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';

      switch (paymentStatus) {
        case 'SUCCESS':
          notificationType = 'PAYMENT_SUCCESS';
          title = 'Thanh toán thành công';
          message = `Thanh toán ${amount?.toLocaleString('vi-VN')} VNĐ cho cuộc hẹn với bác sĩ ${doctorName} đã thành công.`;
          break;
        case 'FAILED':
          notificationType = 'PAYMENT_FAILED';
          title = 'Thanh toán thất bại';
          message = `Thanh toán cho cuộc hẹn với bác sĩ ${doctorName} đã thất bại. Vui lòng thử lại.`;
          priority = 'HIGH';
          break;
        case 'REFUNDED':
          notificationType = 'PAYMENT_REFUNDED';
          title = 'Hoàn tiền thành công';
          message = `Số tiền ${amount?.toLocaleString('vi-VN')} VNĐ cho cuộc hẹn với bác sĩ ${doctorName} đã được hoàn lại.`;
          break;
        default:
          return;
      }

      await NotificationService.createNotification({
        userId: appointment.patient.userId,
        type: notificationType,
        title,
        message,
        data: {
          appointmentId,
          paymentStatus,
          amount,
          doctorName
        },
        priority,
        appointmentId
      });

    } catch (error) {
      console.error('Error handling payment status change:', error);
    }
  }

  /**
   * Send system maintenance notification
   */
  static async sendSystemMaintenanceNotification(
    title: string,
    message: string,
    scheduledTime?: Date,
    duration?: string
  ) {
    try {
      // Get all active users
      const activeUsers = await prisma.user.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true
        }
      });

      // Send notification to all users
      for (const user of activeUsers) {
        await NotificationService.createNotification({
          userId: user.id,
          type: 'SYSTEM_MAINTENANCE',
          title,
          message,
          data: {
            scheduledTime,
            duration,
            isSystemNotification: true
          },
          priority: 'HIGH',
          scheduledFor: scheduledTime
        });
      }

      // Broadcast immediately via WebSocket
      const socketServer = getSocketServer();
      if (socketServer) {
        await socketServer.broadcastSystemNotification({
          type: 'system:maintenance',
          title,
          message,
          scheduledTime,
          duration,
          timestamp: new Date()
        });
      }

      console.log(`Sent system maintenance notification to ${activeUsers.length} users`);
    } catch (error) {
      console.error('Error sending system maintenance notification:', error);
    }
  }

  /**
   * Get display name for appointment status
   */
  static getStatusDisplayName(status: AppointmentStatus): string {
    const statusNames = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      IN_PROGRESS: 'Đang diễn ra',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      NO_SHOW: 'Vắng mặt'
    };

    return statusNames[status] || status;
  }
}
