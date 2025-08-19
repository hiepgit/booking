import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../libs/prisma.js';
import type { UserRole } from '@prisma/client';
import { loadEnv } from '../config/env.js';
import { AuthLoginSchema, AuthRegisterSchema, VerifyOtpSchema, TokenPayloadSchema } from '@healthcare/shared/schemas';
import type { TokenPayload } from '@healthcare/shared/types';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../services/password.service.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, blacklistToken } from '../services/jwt.service.js';
import { createOtp, verifyOtp as verifyOtpService } from '../services/otp.service.js';
import { sendOtpEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/mailer.service.js';
import { 
  authRateLimit, 
  otpRateLimit, 
  passwordResetRateLimit, 
  loginRateLimit,
  forgotPasswordRateLimit 
} from '../middleware/rateLimit.js';

const env = loadEnv();
const router = Router();

const RegisterBody = AuthRegisterSchema;
const VerifyOtpBody = VerifyOtpSchema;
const LoginBody = AuthLoginSchema;
const ForgotBody = z.object({ email: z.string().email() });
const ResetBody = z.object({ 
  email: z.string().email(), 
  otp: z.string().length(6), 
  newPassword: z.string().min(8) 
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new account and receive OTP via email
 */
router.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const body = RegisterBody.parse(req.body);
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(body.password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: { 
          message: 'Password does not meet requirements',
          details: passwordValidation.errors
        } 
      });
    }
    
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return res.status(409).json({ error: { message: 'Email already exists' } });

    const [firstName, ...rest] = body.fullName.split(' ');
    const lastName = rest.join(' ');

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        role: body.role as UserRole,
        firstName,
        lastName,
      },
    });

    const otp = await createOtp(user.email, 'REGISTER');
    await sendOtpEmail(user.email, otp, firstName);

    res.json({ 
      message: 'Registration successful. Please check your email for OTP verification.',
      userId: user.id 
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify registration OTP
 */
router.post('/verify-otp', otpRateLimit, async (req, res, next) => {
  try {
    const body = VerifyOtpBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    
    const ok = await verifyOtpService(user.email, body.otp, 'REGISTER');
    if (!ok) return res.status(400).json({ error: { message: 'Invalid OTP' } });
    
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);
    
    res.json({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: true
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with email and password
 */
router.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const body = LoginBody.parse(req.body);
    const user = await prisma.user.findUnique({ 
      where: { email: body.email }, 
      select: { 
        id: true, 
        email: true, 
        role: true, 
        isVerified: true, 
        passwordHash: true,
        firstName: true,
        lastName: true
      } 
    });
    
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    if (!user.isVerified) return res.status(403).json({ error: { message: 'Account not verified' } });

    const payload: TokenPayload = TokenPayloadSchema.parse({ 
      sub: user.id as unknown as TokenPayload['sub'], 
      email: user.email, 
      role: user.role 
    });
    
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({ 
      message: 'Login successful',
      accessToken, 
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token using refresh token (rotated)
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const token = z.string().min(1).parse(req.body?.refreshToken);
    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    res.json({ 
      message: 'Token refreshed successfully',
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout and blacklist token
 */
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      blacklistToken(token);
    }
    res.json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request reset password OTP via email
 */
router.post('/forgot-password', forgotPasswordRateLimit, async (req, res, next) => {
  try {
    const { email } = ForgotBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If email exists, reset instructions have been sent' }); // do not reveal existence
    
    const otp = await createOtp(email, 'RESET');
    await sendPasswordResetEmail(email, otp, user.firstName);
    
    res.json({ message: 'If email exists, reset instructions have been sent' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password using OTP
 */
router.post('/reset-password', passwordResetRateLimit, async (req, res, next) => {
  try {
    const { email, otp, newPassword } = ResetBody.parse(req.body);
    
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: { 
          message: 'Password does not meet requirements',
          details: passwordValidation.errors
        } 
      });
    }
    
    const ok = await verifyOtpService(email, otp, 'RESET');
    if (!ok) return res.status(400).json({ error: { message: 'Invalid OTP' } });
    
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
});

export default router;


