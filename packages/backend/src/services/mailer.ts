import nodemailer from 'nodemailer';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({ from: 'no-reply@healthcare.local', to, subject, text });
  } catch (e) {
    // Dev fallback: log to console
    console.info(`[mail] ${subject} to ${to}: ${text}`);
  }
}


