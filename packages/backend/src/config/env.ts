import * as dotenv from 'dotenv';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SWAGGER_ENABLED: z
    .union([z.string(), z.boolean()])
    .transform((v) => (typeof v === 'string' ? v === 'true' : v))
    .default(true),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().default('change-me'),
  JWT_REFRESH_SECRET: z.string().default('change-me'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // SMTP Configuration
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@healthcare.local'),
  
  // OTP Configuration
  OTP_EXPIRES_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  
  // Facebook OAuth Configuration
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_REDIRECT_URI: z.string().optional(),
  
  // Security Configuration
  BCRYPT_ROUNDS: z.coerce.number().int().positive().default(12),
  SESSION_SECRET: z.string().default('change-me-session-secret'),
  
  // Redis Configuration (for session storage)
  REDIS_URL: z.string().optional(),
  
  // File Upload Configuration
  UPLOAD_MAX_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Health Check Configuration
  HEALTH_CHECK_INTERVAL: z.coerce.number().default(30000),

  // VNPay Configuration
  VNPAY_TMN_CODE: z.string().min(1, 'VNPAY_TMN_CODE is required'),
  VNPAY_HASH_SECRET: z.string().min(1, 'VNPAY_HASH_SECRET is required'),
  VNPAY_URL: z.string().url().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  VNPAY_RETURN_URL: z.string().url(),
  VNPAY_IPN_URL: z.string().url(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });
  dotenv.config();
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = JSON.stringify(flat.fieldErrors);
    throw new Error(`[env] Invalid environment variables: ${msg}`);
  }
  return parsed.data;
}

export function isEnv(input: unknown): input is Env {
  return EnvSchema.safeParse(input).success;
}
