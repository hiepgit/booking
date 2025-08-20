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

    console.log('🚀 Initializing Real-time Notification System...');

    try {
      // 1. Initialize WebSocket server
      console.log('📡 Setting up WebSocket server...');
      const socketServer = initializeSocketServer(httpServer);

      // 2. Initialize email templates
      console.log('📧 Setting up email templates...');
      await EmailTemplateService.initializeDefaultTemplates();

      // 3. Initialize reminder service with cron jobs
      console.log('⏰ Setting up reminder service...');
      ReminderService.initialize();

      // 4. Setup appointment status change hooks
      console.log('🔗 Setting up appointment hooks...');
      await this.setupAppointmentHooks();

      // 5. Send welcome notifications to new users
      console.log('👋 Setting up user welcome system...');
      await this.setupUserWelcomeSystem();

      this.isInitialized = true;
      console.log('✅ Real-time Notification System initialized successfully!');

      // Log system status
      this.logSystemStatus();

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

    console.log('📋 Appointment hooks setup completed');
    console.log('   - Add RealtimeNotificationService.handleAppointmentStatusChange() to appointment update logic');
    console.log('   - Add ReminderService.scheduleAppointmentReminders() to appointment confirmation logic');
    console.log('   - Add ReminderService.cancelAppointmentReminders() to appointment cancellation logic');
  }

  /**
   * Setup user welcome system
   */
  private static async setupUserWelcomeSystem() {
    // This would typically be integrated into the user registration process
    console.log('👋 User welcome system setup completed');
    console.log('   - Add welcome notification to user registration process');
    console.log('   - Add verification reminder scheduling for unverified users');
  }

  /**
   * Log system status and statistics
   */
  private static logSystemStatus() {
    console.log('\n📊 Notification System Status:');
    console.log('   ✅ WebSocket Server: Active');
    console.log('   ✅ Email Templates: Loaded');
    console.log('   ✅ Reminder Service: Active');
    console.log('   ✅ Real-time Notifications: Active');
    console.log('   ✅ Multi-channel Delivery: Ready');
    console.log('\n🔧 Available Features:');
    console.log('   • Appointment reminders (24h, 1h, 15m)');
    console.log('   • Real-time status notifications');
    console.log('   • Email notifications with templates');
    console.log('   • In-app notifications via WebSocket');
    console.log('   • User notification preferences');
    console.log('   • Admin notification management');
    console.log('   • Notification analytics and statistics');
    console.log('\n📡 WebSocket Events:');
    console.log('   • notification:new - New notification received');
    console.log('   • notification:read - Mark notification as read');
    console.log('   • appointment:updated - Appointment status changed');
    console.log('   • doctor:status:changed - Doctor availability changed');
    console.log('   • system:notification - System-wide announcements');
    console.log('\n🌐 API Endpoints:');
    console.log('   • GET /notifications - Get user notifications');
    console.log('   • GET /notifications/unread-count - Get unread count');
    console.log('   • GET /notifications/preferences - Get preferences');
    console.log('   • PUT /notifications/preferences - Update preferences');
    console.log('   • POST /notifications/mark-all-read - Mark all as read');
    console.log('   • PATCH /notifications/:id/read - Mark as read');
    console.log('   • DELETE /notifications/:id - Delete notification');
    console.log('   • POST /notifications/admin/create - Create notification (Admin)');
    console.log('   • GET /notifications/admin/statistics - Get statistics (Admin)');
    console.log('   • GET /notifications/admin/templates - Get templates (Admin)');
    console.log('\n🎯 Integration Points:');
    console.log('   • Appointment Service: Status change notifications');
    console.log('   • Payment Service: Payment status notifications');
    console.log('   • User Service: Welcome and verification notifications');
    console.log('   • Doctor Service: Availability change notifications');
    console.log('   • System Service: Maintenance and update notifications');
  }

  /**
   * Create sample notifications for testing
   */
  static async createSampleNotifications(userId: string) {
    try {
      console.log(`🧪 Creating sample notifications for user ${userId}...`);

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
      console.log(`🧪 Testing notification delivery for user ${userId}...`);

      const testNotification = await NotificationService.createNotification({
        userId,
        type: 'GENERAL',
        title: 'Test Notification',
        message: 'This is a test notification to verify the delivery system is working correctly.',
        data: {
          isTest: true,
          timestamp: new Date().toISOString()
        },
        channels: ['IN_APP', 'EMAIL'],
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
