import crypto from 'crypto';
import { prisma } from '../libs/prisma.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function createOtp(email: string, purpose: 'REGISTER' | 'RESET'): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000);
  const otpHash = hashOtp(otp);
  await prisma.otpRequest.upsert({
    where: { email_purpose: { email, purpose } },
    update: { otpHash, attemptCount: 0, expiresAt, purpose },
    create: { email, otpHash, attemptCount: 0, expiresAt, purpose },
  });
  return otp;
}

export async function verifyOtp(email: string, otp: string, purpose: 'REGISTER' | 'RESET'): Promise<boolean> {
  const item = await prisma.otpRequest.findUnique({ where: { email_purpose: { email, purpose } } });
  if (!item) return false;
  if (item.expiresAt < new Date()) return false;
  if (item.attemptCount >= env.OTP_MAX_ATTEMPTS) return false;
  const ok = item.otpHash === hashOtp(otp);
  await prisma.otpRequest.update({ where: { id: item.id }, data: { attemptCount: item.attemptCount + 1 } });
  if (ok) await prisma.otpRequest.delete({ where: { id: item.id } });
  return ok;
}
