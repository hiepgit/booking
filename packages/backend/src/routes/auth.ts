import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../libs/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { loadEnv } from '../config/env.js';
import { TokenPayloadSchema } from '@healthcare/shared/schemas';
import type { TokenPayload } from '@healthcare/shared/types';

const env = loadEnv();
const router = Router();

const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).default('PATIENT'),
});

const VerifyOtpBody = z.object({ email: z.string().email(), otp: z.string().length(6) });
const LoginBody = z.object({ email: z.string().email(), password: z.string().min(8) });
const ForgotBody = z.object({ email: z.string().email() });
const ResetBody = z.object({ email: z.string().email(), otp: z.string().length(6), newPassword: z.string().min(8) });

function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

async function sendOtpEmail(to: string, otp: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({
      from: 'no-reply@healthcare.local',
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
    });
  } catch (e) {
    // Dev helper: log OTP to console when SMTP not configured
    console.info(`[auth] DEV OTP for ${to}: ${otp}`);
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const body = RegisterBody.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return res.status(409).json({ error: { message: 'Email already exists' } });

    const [firstName, ...rest] = body.fullName.split(' ');
    const lastName = rest.join(' ');

    const password = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        role: body.role as any,
        firstName,
        lastName,
      },
    });

    // naive OTP: in real impl, store hashed OTP with expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail(user.email, otp);
    // store to AppConfig as a simple temp store for demo
    await prisma.appConfig.upsert({
      where: { key: `otp:${user.email}` },
      update: { value: otp },
      create: { key: `otp:${user.email}`, value: otp },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const body = VerifyOtpBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    const conf = await prisma.appConfig.findUnique({ where: { key: `otp:${user.email}` } });
    if (!conf || conf.value !== body.otp) return res.status(400).json({ error: { message: 'Invalid OTP' } });

    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    await prisma.appConfig.delete({ where: { key: `otp:${user.email}` } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = LoginBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true, email: true, role: true, isVerified: true, password: true } });
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await bcrypt.compare(body.password, user.password);
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

router.post('/refresh', async (req, res, next) => {
  try {
    const token = z.string().min(1).parse(req.body?.refreshToken);
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const parsed = TokenPayloadSchema.safeParse(decoded);
    if (!parsed.success) return res.status(401).json({ error: { message: 'Invalid token' } });
    const accessToken = signAccessToken(parsed.data);
    res.json({ accessToken, refreshToken: token });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  // stateless JWT: client drops tokens
  res.json({ ok: true });
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = ForgotBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ ok: true }); // do not reveal existence
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtpEmail(email, otp);
    await prisma.appConfig.upsert({
      where: { key: `reset:${email}` },
      update: { value: otp },
      create: { key: `reset:${email}`, value: otp },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = ResetBody.parse(req.body);
    const conf = await prisma.appConfig.findUnique({ where: { key: `reset:${email}` } });
    if (!conf || conf.value !== otp) return res.status(400).json({ error: { message: 'Invalid OTP' } });
    const password = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password } });
    await prisma.appConfig.delete({ where: { key: `reset:${email}` } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;


