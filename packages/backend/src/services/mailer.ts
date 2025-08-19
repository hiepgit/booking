import nodemailer from 'nodemailer';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

// Email templates
const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: (otp: string, userName: string) => ({
    subject: 'Xác thực tài khoản - Healthcare Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Xác thực tài khoản</h2>
        <p>Xin chào ${userName},</p>
        <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #e74c3c;">${otp}</strong></p>
        <p>Mã này có hiệu lực trong ${env.OTP_EXPIRES_MINUTES} phút.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    `
  }),
  
  PASSWORD_RESET: (otp: string, userName: string) => ({
    subject: 'Đặt lại mật khẩu - Healthcare Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Đặt lại mật khẩu</h2>
        <p>Xin chào ${userName},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã OTP của bạn là: <strong style="font-size: 24px; color: #e74c3c;">${otp}</strong></p>
        <p>Mã này có hiệu lực trong ${env.OTP_EXPIRES_MINUTES} phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    `
  }),
  
  WELCOME: (userName: string) => ({
    subject: 'Chào mừng bạn đến với Healthcare Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Chào mừng bạn!</h2>
        <p>Xin chào ${userName},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Healthcare Booking System.</p>
        <p>Tài khoản của bạn đã được tạo thành công và sẵn sàng sử dụng.</p>
        <p>Bạn có thể:</p>
        <ul>
          <li>Tìm kiếm và đặt lịch với bác sĩ</li>
          <li>Quản lý cuộc hẹn của mình</li>
          <li>Xem lịch sử khám bệnh</li>
          <li>Cập nhật thông tin cá nhân</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi.
        </p>
      </div>
    `
  })
};

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: env.SMTP_USER && env.SMTP_PASS ? { 
        user: env.SMTP_USER, 
        pass: env.SMTP_PASS 
      } : undefined,
    });
    
    await transporter.sendMail({ 
      from: env.SMTP_FROM, 
      to, 
      subject, 
      text,
      html: text // Fallback to HTML if text contains HTML
    });
  } catch (e) {
    // Dev fallback: log to console
    console.info(`[mail] ${subject} to ${to}: ${text}`);
  }
}

// Send OTP verification email
export async function sendOtpEmail(to: string, otp: string, userName: string): Promise<void> {
  const template = EMAIL_TEMPLATES.OTP_VERIFICATION(otp, userName);
  await sendEmail(to, template.subject, template.html);
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, otp: string, userName: string): Promise<void> {
  const template = EMAIL_TEMPLATES.PASSWORD_RESET(otp, userName);
  await sendEmail(to, template.subject, template.html);
}

// Send welcome email
export async function sendWelcomeEmail(to: string, userName: string): Promise<void> {
  const template = EMAIL_TEMPLATES.WELCOME(userName);
  await sendEmail(to, template.subject, template.html);
}

// Verify email configuration
export function verifyEmailConfig(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}


