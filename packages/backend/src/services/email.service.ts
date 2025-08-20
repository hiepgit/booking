import nodemailer from 'nodemailer';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  static async initialize() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      // Don't throw error to prevent app from crashing
      // Email notifications will be skipped if service is not available
    }
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('Email transporter not initialized, attempting to initialize...');
        await this.initialize();
        
        if (!this.transporter) {
          console.error('Email service not available');
          return false;
        }
      }

      const mailOptions = {
        from: options.from || `"Healthcare Booking" <${env.SMTP_FROM}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const subject = 'Chào mừng đến với Healthcare Booking!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Chào mừng đến với Healthcare Booking!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Hệ thống đặt lịch khám bệnh trực tuyến</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>${firstName}</strong>,</p>
          
          <p style="color: #555; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản Healthcare Booking. Bạn có thể bắt đầu sử dụng các tính năng sau:</p>
          
          <ul style="color: #555; line-height: 1.8;">
            <li>🔍 Tìm kiếm bác sĩ theo chuyên khoa</li>
            <li>📅 Đặt lịch hẹn trực tuyến</li>
            <li>💬 Nhận thông báo nhắc nhở</li>
            <li>📋 Quản lý lịch sử khám bệnh</li>
            <li>⭐ Đánh giá dịch vụ</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.FRONTEND_URL}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Bắt đầu sử dụng</a>
          </div>
          
          <p style="color: #777; font-size: 14px; margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
          <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          <p>© 2025 Healthcare Booking System. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
Xin chào ${firstName},

Cảm ơn bạn đã đăng ký tài khoản Healthcare Booking!

Bạn có thể bắt đầu sử dụng các tính năng:
- Tìm kiếm bác sĩ theo chuyên khoa
- Đặt lịch hẹn trực tuyến  
- Nhận thông báo nhắc nhở
- Quản lý lịch sử khám bệnh
- Đánh giá dịch vụ

Truy cập: ${env.FRONTEND_URL}

Trân trọng,
Healthcare Booking Team
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Đặt lại mật khẩu - Healthcare Booking';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Đặt lại mật khẩu</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Booking System</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>${firstName}</strong>,</p>
          
          <p style="color: #555; line-height: 1.6;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Đặt lại mật khẩu</a>
          </div>
          
          <p style="color: #777; font-size: 14px;">Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      </div>
    `;

    const text = `
Xin chào ${firstName},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Nhấp vào link sau để đặt lại mật khẩu:
${resetUrl}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Healthcare Booking Team
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send appointment confirmation email
   */
  static async sendAppointmentConfirmationEmail(
    to: string,
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    appointmentTime: string,
    clinicName: string,
    clinicAddress: string
  ): Promise<boolean> {
    const subject = `Xác nhận cuộc hẹn - ${doctorName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Cuộc hẹn đã được xác nhận</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Healthcare Booking System</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Xin chào <strong>${patientName}</strong>,</p>
          
          <p style="color: #4caf50; font-size: 18px; font-weight: 500; text-align: center; margin: 20px 0;">🎉 Cuộc hẹn của bạn đã được xác nhận!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Thông tin cuộc hẹn:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6c757d; width: 120px;">Bác sĩ:</td>
                <td style="padding: 8px 0; color: #495057; font-weight: 500;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d;">Thời gian:</td>
                <td style="padding: 8px 0; color: #495057; font-weight: 500;">${appointmentTime} ngày ${appointmentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d;">Địa điểm:</td>
                <td style="padding: 8px 0; color: #495057;">${clinicName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6c757d;">Địa chỉ:</td>
                <td style="padding: 8px 0; color: #495057;">${clinicAddress}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32; font-weight: 500;">📅 Lưu ý:</p>
            <ul style="margin: 10px 0 0 0; color: #2e7d32;">
              <li>Chúng tôi sẽ gửi nhắc nhở trước cuộc hẹn</li>
              <li>Vui lòng đến đúng giờ</li>
              <li>Mang theo CMND và thẻ bảo hiểm y tế</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        return false;
      }

      // Send test email to configured SMTP user
      const testResult = await this.sendEmail({
        to: env.SMTP_USER,
        subject: 'Healthcare Booking - Email Test',
        text: 'This is a test email to verify email configuration.',
        html: '<p>This is a test email to verify email configuration.</p>'
      });

      return testResult;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}
