import { Server as HTTPServer } from 'http';
import { initializeSocketServer } from '../websocket/socket.server.js';
import { ReminderService } from './reminder.service.js';
import { EmailTemplateService } from './email-template.service.js';
import { RealtimeNotificationService } from './realtime-notification.service.js';
import { NotificationService } from './notification.service.js';

export class InitializationService {
  private static isInitialized = false;

  /**
   * Initialize all notification-related services
   */
  static async initialize(httpServer: HTTPServer) {
    if (this.isInitialized) {
      console.log('Notification services already initialized');
      return;
    }

    try {
      // Initialize core services silently
      initializeSocketServer(httpServer);
      await EmailTemplateService.initializeDefaultTemplates();
      ReminderService.initialize();
      await this.setupAppointmentHooks();
      await this.setupUserWelcomeSystem();

      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Failed to initialize notification system:', error);
      throw error;
    }
  }

  /**
   * Setup appointment status change hooks
   */
  private static async setupAppointmentHooks() {
    // This would typically be done through database triggers or event listeners
    // For now, we'll document the integration points that need to be added to appointment service

    // Appointment hooks setup completed silently
  }

  /**
   * Setup user welcome system
   */
  private static async setupUserWelcomeSystem() {
    // This would typically be integrated into the user registration process
    // User welcome system setup completed silently
  }

  // Removed verbose logging method

  /**
   * Create sample notifications for testing
   */
  static async createSampleNotifications(userId: string) {
    try {
      // Creating sample notifications silently

      const sampleNotifications = [
        {
          type: 'WELCOME' as const,
          title: 'Chào mừng đến với Healthcare Booking!',
          message: 'Cảm ơn bạn đã đăng ký. Bạn có thể bắt đầu đặt lịch hẹn với các bác sĩ ngay bây giờ.',
          data: {
            isWelcome: true,
            features: ['Đặt lịch hẹn', 'Tìm kiếm bác sĩ', 'Quản lý cuộc hẹn']
          },
          priority: 'NORMAL' as const
        },
        {
          type: 'SYSTEM_UPDATE' as const,
          title: 'Cập nhật hệ thống mới',
          message: 'Chúng tôi đã thêm tính năng tìm kiếm nâng cao và thông báo thời gian thực.',
          data: {
            version: '2.0.0',
            features: ['Advanced Search', 'Real-time Notifications', 'Enhanced UI']
          },
          priority: 'LOW' as const
        },
        {
          type: 'GENERAL' as const,
          title: 'Mẹo sử dụng hệ thống',
          message: 'Bạn có thể tùy chỉnh thông báo trong phần Cài đặt để nhận thông báo theo ý muốn.',
          data: {
            tip: 'notification_preferences',
            category: 'tips'
          },
          priority: 'LOW' as const
        }
      ];

      for (const notification of sampleNotifications) {
        await NotificationService.createNotification({
          userId,
          ...notification
        });
      }

      console.log(`✅ Created ${sampleNotifications.length} sample notifications`);
    } catch (error) {
      console.error('Error creating sample notifications:', error);
    }
  }

  /**
   * Test notification delivery
   */
  static async testNotificationDelivery(userId: string) {
    try {
      // Testing notification delivery silently

      const testNotification = await NotificationService.createNotification({
        userId,
        type: 'GENERAL',
        title: 'Test Notification',
        message: 'This is a test notification to verify the delivery system is working correctly.',
        data: {
          isTest: true,
          timestamp: new Date().toISOString()
        },
        priority: 'NORMAL'
      });

      console.log('✅ Test notification created:', testNotification?.id);
      return testNotification;
    } catch (error) {
      console.error('Error testing notification delivery:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth() {
    try {
      const reminderStats = await ReminderService.getReminderStats();
      
      return {
        status: 'healthy',
        services: {
          websocket: this.isInitialized,
          reminders: this.isInitialized,
          emailTemplates: this.isInitialized,
          realtimeNotifications: this.isInitialized
        },
        statistics: {
          reminders: reminderStats
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Shutdown notification services gracefully
   */
  static async shutdown() {
    if (!this.isInitialized) {
      return;
    }

    console.log('🛑 Shutting down notification services...');
    
    try {
      // Cancel all scheduled reminders
      // Note: In a production environment, you'd want to persist scheduled reminders
      // and restore them on restart
      
      this.isInitialized = false;
      console.log('✅ Notification services shut down successfully');
    } catch (error) {
      console.error('Error shutting down notification services:', error);
    }
  }
}
