import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../libs/prisma.js';
import type { UserRole } from '@prisma/client';
import { loadEnv } from '../config/env.js';
import { AuthLoginSchema, AuthRegisterSchema, VerifyOtpSchema, TokenPayloadSchema } from '@healthcare/shared/schemas';
import type { TokenPayload } from '@healthcare/shared/types';
import { hashPassword, verifyPassword } from '../services/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwt.js';
import { createOtp, verifyOtp as verifyOtpService } from '../services/otp.js';
import { sendEmail } from '../services/mailer.js';

const env = loadEnv();
const router = Router();

const RegisterBody = AuthRegisterSchema;

const VerifyOtpBody = VerifyOtpSchema;
const LoginBody = AuthLoginSchema;
const ForgotBody = z.object({ email: z.string().email() });
const ResetBody = z.object({ email: z.string().email(), otp: z.string().length(6), newPassword: z.string().min(8) });

// swagger tags are added on each route via JSDoc

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new account and receive OTP via email
 */
router.post('/register', async (req, res, next) => {
  try {
    const body = RegisterBody.parse(req.body);
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
    await sendEmail(user.email, 'Your OTP Code', `Your OTP is ${otp}`);

    res.json({ ok: true });
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
router.post('/verify-otp', async (req, res, next) => {
  try {
    const body = VerifyOtpBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    const ok = await verifyOtpService(user.email, body.otp, 'REGISTER');
    if (!ok) return res.status(400).json({ error: { message: 'Invalid OTP' } });
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    res.json({ ok: true });
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
router.post('/login', async (req, res, next) => {
  try {
    const body = LoginBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true, email: true, role: true, isVerified: true, passwordHash: true } });
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    if (!user.isVerified) return res.status(403).json({ error: { message: 'Account not verified' } });

    const payload: TokenPayload = TokenPayloadSchema.parse({ sub: user.id as unknown as TokenPayload['sub'], email: user.email, role: user.role });
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({ accessToken, refreshToken });
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
 *     summary: Refresh access token using refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const token = z.string().min(1).parse(req.body?.refreshToken);
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken(payload);
    res.json({ accessToken, refreshToken: token });
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
 *     summary: Logout (stateless)
 */
router.post('/logout', (_req, res) => {
  // stateless JWT: client drops tokens
  res.json({ ok: true });
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request reset password OTP via email
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = ForgotBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ ok: true }); // do not reveal existence
    const otp = await createOtp(email, 'RESET');
    await sendEmail(email, 'Reset OTP', `Your OTP is ${otp}`);
    res.json({ ok: true });
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
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = ResetBody.parse(req.body);
    const ok = await verifyOtpService(email, otp, 'RESET');
    if (!ok) return res.status(400).json({ error: { message: 'Invalid OTP' } });
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;


