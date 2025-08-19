import rateLimit from 'express-rate-limit';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

// Helper to extract client IP
function getClientIp(req: any): string {
  return req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
}

// Rate limiting cho authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 5,
  message: {
    error: { message: 'Too many authentication attempts, please try again later', code: 'RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => getClientIp(req)
});

// Rate limiting cho general API endpoints
export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => getClientIp(req)
});

// Rate limiting cho OTP requests
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // nới lên 5 lần/15 phút
  message: {
    error: { message: 'Too many OTP requests, please wait before requesting another', code: 'OTP_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => getClientIp(req)
});

// Rate limiting cho forgot password (key theo email+IP)
export const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests/hour/email/IP
  message: {
    error: { message: 'Too many password reset requests, please try again later', code: 'FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req: any) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : 'no-email';
    return `${email}:${getClientIp(req)}`;
  }
});

// Rate limiting cho password reset (OTP verify)
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // nới lên 5 attempts/hour
  message: {
    error: { message: 'Too many password reset attempts, please try again later', code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => getClientIp(req)
});

// Rate limiting cho login attempts
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: { message: 'Too many login attempts, please try again later', code: 'LOGIN_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => getClientIp(req)
});
