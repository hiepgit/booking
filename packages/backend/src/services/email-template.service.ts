import { prisma } from '../libs/prisma.js';
import type { NotificationType, NotificationChannel } from '@prisma/client';

export class EmailTemplateService {
  /**
   * Initialize default email templates
   */
  static async initializeDefaultTemplates() {
    const templates = [
      // Appointment Reminder Templates
      {
        type: 'APPOINTMENT_REMINDER' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        language: 'vi',
        subject: 'Nhắc nhở cuộc hẹn - {{data.reminderType}}',
        title: 'Nhắc nhở cuộc hẹn',
        body: `Xin chào {{user.firstName}},

Bạn có cuộc hẹn với bác sĩ {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}} ({{appointment.doctor.specialty.name}}) tại {{appointment.clinic.name}}.

Thời gian: {{appointment.startTime}} ngày {{appointment.appointmentDate}}
Địa chỉ: {{appointment.clinic.address}}

Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết.

Trân trọng,
Healthcare Booking System`,
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Nhắc nhở cuộc hẹn</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Booking System</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>{{user.firstName}}</strong>,</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #495057; margin-top: 0;">Chi tiết cuộc hẹn:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6c757d; width: 120px;">Bác sĩ:</td>
          <td style="padding: 8px 0; color: #495057; font-weight: 500;">{{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Chuyên khoa:</td>
          <td style="padding: 8px 0; color: #495057;">{{appointment.doctor.specialty.name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Thời gian:</td>
          <td style="padding: 8px 0; color: #495057; font-weight: 500;">{{appointment.startTime}} ngày {{appointment.appointmentDate}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Địa điểm:</td>
          <td style="padding: 8px 0; color: #495057;">{{appointment.clinic.name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Địa chỉ:</td>
          <td style="padding: 8px 0; color: #495057;">{{appointment.clinic.address}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #1976d2; font-weight: 500;">💡 Lưu ý quan trọng:</p>
      <ul style="margin: 10px 0 0 0; color: #1976d2;">
        <li>Vui lòng đến đúng giờ</li>
        <li>Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)</li>
        <li>Chuẩn bị danh sách thuốc đang sử dụng</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{data.appointmentUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Xem chi tiết cuộc hẹn</a>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    <p>© 2025 Healthcare Booking System. All rights reserved.</p>
  </div>
</div>`,
        variables: {
          'user.firstName': 'Tên bệnh nhân',
          'appointment.doctor.user.firstName': 'Tên bác sĩ',
          'appointment.doctor.user.lastName': 'Họ bác sĩ',
          'appointment.doctor.specialty.name': 'Chuyên khoa',
          'appointment.startTime': 'Giờ hẹn',
          'appointment.appointmentDate': 'Ngày hẹn',
          'appointment.clinic.name': 'Tên phòng khám',
          'appointment.clinic.address': 'Địa chỉ phòng khám',
          'data.appointmentUrl': 'Link xem chi tiết cuộc hẹn'
        }
      },

      // Appointment Confirmed Template
      {
        type: 'APPOINTMENT_CONFIRMED' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        language: 'vi',
        subject: 'Cuộc hẹn đã được xác nhận - {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}',
        title: 'Cuộc hẹn đã được xác nhận',
        body: `Xin chào {{user.firstName}},

Cuộc hẹn của bạn đã được xác nhận thành công!

Bác sĩ: {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}
Chuyên khoa: {{appointment.doctor.specialty.name}}
Thời gian: {{appointment.startTime}} ngày {{appointment.appointmentDate}}
Địa điểm: {{appointment.clinic.name}}

Chúng tôi sẽ gửi nhắc nhở trước cuộc hẹn.

Trân trọng,
Healthcare Booking System`,
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">✅ Cuộc hẹn đã được xác nhận</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Booking System</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>{{user.firstName}}</strong>,</p>
    
    <p style="color: #4caf50; font-size: 18px; font-weight: 500; text-align: center; margin: 20px 0;">🎉 Cuộc hẹn của bạn đã được xác nhận thành công!</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #495057; margin-top: 0;">Thông tin cuộc hẹn:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6c757d; width: 120px;">Bác sĩ:</td>
          <td style="padding: 8px 0; color: #495057; font-weight: 500;">{{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Chuyên khoa:</td>
          <td style="padding: 8px 0; color: #495057;">{{appointment.doctor.specialty.name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Thời gian:</td>
          <td style="padding: 8px 0; color: #495057; font-weight: 500;">{{appointment.startTime}} ngày {{appointment.appointmentDate}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6c757d;">Địa điểm:</td>
          <td style="padding: 8px 0; color: #495057;">{{appointment.clinic.name}}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #2e7d32; font-weight: 500;">📅 Bước tiếp theo:</p>
      <ul style="margin: 10px 0 0 0; color: #2e7d32;">
        <li>Chúng tôi sẽ gửi nhắc nhở trước cuộc hẹn 24 giờ, 1 giờ và 15 phút</li>
        <li>Bạn có thể hủy hoặc dời lịch hẹn trước 2 giờ</li>
        <li>Liên hệ hotline nếu cần hỗ trợ</li>
      </ul>
    </div>
  </div>
</div>`,
        variables: {
          'user.firstName': 'Tên bệnh nhân',
          'appointment.doctor.user.firstName': 'Tên bác sĩ',
          'appointment.doctor.user.lastName': 'Họ bác sĩ',
          'appointment.doctor.specialty.name': 'Chuyên khoa',
          'appointment.startTime': 'Giờ hẹn',
          'appointment.appointmentDate': 'Ngày hẹn',
          'appointment.clinic.name': 'Tên phòng khám'
        }
      },

      // Appointment Cancelled Template
      {
        type: 'APPOINTMENT_CANCELLED' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        language: 'vi',
        subject: 'Cuộc hẹn đã bị hủy - {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}',
        title: 'Cuộc hẹn đã bị hủy',
        body: `Xin chào {{user.firstName}},

Cuộc hẹn của bạn đã bị hủy.

Bác sĩ: {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}
Thời gian: {{appointment.startTime}} ngày {{appointment.appointmentDate}}

Bạn có thể đặt lịch hẹn mới hoặc liên hệ với chúng tôi để được hỗ trợ.

Trân trọng,
Healthcare Booking System`,
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">❌ Cuộc hẹn đã bị hủy</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Booking System</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>{{user.firstName}}</strong>,</p>
    
    <p style="color: #f44336; font-size: 16px; margin: 20px 0;">Rất tiếc, cuộc hẹn của bạn đã bị hủy.</p>
    
    <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #c62828; font-weight: 500;">📋 Thông tin cuộc hẹn đã hủy:</p>
      <ul style="margin: 10px 0 0 0; color: #c62828;">
        <li>Bác sĩ: {{appointment.doctor.user.firstName}} {{appointment.doctor.user.lastName}}</li>
        <li>Thời gian: {{appointment.startTime}} ngày {{appointment.appointmentDate}}</li>
        <li>Địa điểm: {{appointment.clinic.name}}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{data.bookingUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; margin-right: 10px;">Đặt lịch mới</a>
      <a href="{{data.supportUrl}}" style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Liên hệ hỗ trợ</a>
    </div>
  </div>
</div>`,
        variables: {
          'user.firstName': 'Tên bệnh nhân',
          'appointment.doctor.user.firstName': 'Tên bác sĩ',
          'appointment.doctor.user.lastName': 'Họ bác sĩ',
          'appointment.startTime': 'Giờ hẹn',
          'appointment.appointmentDate': 'Ngày hẹn',
          'appointment.clinic.name': 'Tên phòng khám',
          'data.bookingUrl': 'Link đặt lịch mới',
          'data.supportUrl': 'Link hỗ trợ'
        }
      }
    ];

    // Insert templates if they don't exist
    for (const template of templates) {
      await prisma.notificationTemplate.upsert({
        where: {
          type_channel_language: {
            type: template.type,
            channel: template.channel,
            language: template.language
          }
        },
        update: {
          subject: template.subject,
          title: template.title,
          body: template.body,
          htmlBody: template.htmlBody,
          variables: template.variables,
          isActive: true
        },
        create: template
      });
    }

    // Email templates initialized silently
  }

  /**
   * Get all available templates
   */
  static async getAllTemplates() {
    return await prisma.notificationTemplate.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { type: 'asc' },
        { channel: 'asc' },
        { language: 'asc' }
      ]
    });
  }

  /**
   * Update template
   */
  static async updateTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    language: string,
    updates: {
      subject?: string;
      title?: string;
      body?: string;
      htmlBody?: string;
      variables?: any;
      isActive?: boolean;
    }
  ) {
    return await prisma.notificationTemplate.update({
      where: {
        type_channel_language: {
          type,
          channel,
          language
        }
      },
      data: updates
    });
  }
}
