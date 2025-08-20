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
    
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });

    if (existingUser) {
      // If user exists and is verified, reject registration
      if (existingUser.isVerified) {
        return res.status(409).json({
          error: {
            message: 'Email already exists and is verified. Please sign in instead.',
            code: 'EMAIL_ALREADY_VERIFIED'
          }
        });
      }

      // If user exists but not verified, allow resending OTP
      console.log(`📧 User ${body.email} exists but not verified. Resending OTP...`);

      // Generate new OTP for existing unverified user
      const otp = await createOtp(existingUser.email, 'REGISTER');

      // Send OTP email
      await sendOtpEmail(existingUser.email, otp, existingUser.firstName);

      return res.status(200).json({
        message: 'Account exists but not verified. New OTP sent to your email.',
        userId: existingUser.id,
        resent: true
      });
    }

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

    // Auto-create patient profile for PATIENT role users
    if (body.role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    const otp = await createOtp(user.email, 'REGISTER');
    await sendOtpEmail(user.email, otp, firstName);

    // Get user with role-specific data for response
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        avatar: true,
        patient: {
          select: {
            id: true,
            bloodType: true,
            allergies: true,
            emergencyContact: true,
            insuranceNumber: true,
          }
        },
        doctor: {
          select: {
            id: true,
            licenseNumber: true,
            specialtyId: true,
            experience: true,
            biography: true,
            consultationFee: true,
            averageRating: true,
            totalReviews: true,
            isAvailable: true,
            specialty: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP verification.',
      user: userWithProfile
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
    
    // Get user with role-specific data for response
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        avatar: true,
        patient: {
          select: {
            id: true,
            bloodType: true,
            allergies: true,
            emergencyContact: true,
            insuranceNumber: true,
          }
        },
        doctor: {
          select: {
            id: true,
            licenseNumber: true,
            specialtyId: true,
            experience: true,
            biography: true,
            consultationFee: true,
            averageRating: true,
            totalReviews: true,
            isAvailable: true,
            specialty: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Email verified successfully',
      user: userWithProfile
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
        lastName: true,
        avatar: true
      }
    });
    
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    if (!user.passwordHash) return res.status(401).json({ error: { message: 'Invalid credentials' } });

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

    // Get user with role-specific data for response
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        avatar: true,
        patient: {
          select: {
            id: true,
            bloodType: true,
            allergies: true,
            emergencyContact: true,
            insuranceNumber: true,
          }
        },
        doctor: {
          select: {
            id: true,
            licenseNumber: true,
            specialtyId: true,
            experience: true,
            biography: true,
            consultationFee: true,
            averageRating: true,
            totalReviews: true,
            isAvailable: true,
            specialty: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userWithProfile
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


