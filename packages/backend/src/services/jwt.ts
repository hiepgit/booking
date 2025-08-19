import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';
import { TokenPayloadSchema } from '@healthcare/shared/schemas';
import type { TokenPayload } from '@healthcare/shared/types';

const env = loadEnv();

function sanitizePayload(input: TokenPayload): TokenPayload {
  // Ensure only whitelisted fields are signed
  return {
    sub: input.sub,
    email: input.email,
    role: input.role,
  };
}

export function signAccessToken(payload: TokenPayload): string {
  const parsed = TokenPayloadSchema.parse(payload);
  const clean = sanitizePayload(parsed);
  const secret: Secret = env.JWT_ACCESS_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any };
  return jwt.sign(clean as object, secret, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const parsed = TokenPayloadSchema.parse(payload);
  const clean = sanitizePayload(parsed);
  const secret: Secret = env.JWT_REFRESH_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(clean as object, secret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret: Secret = env.JWT_ACCESS_SECRET as unknown as Secret;
  const decoded = jwt.verify(token, secret);
  const parsed = TokenPayloadSchema.parse(decoded);
  return sanitizePayload(parsed);
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret: Secret = env.JWT_REFRESH_SECRET as unknown as Secret;
  const decoded = jwt.verify(token, secret);
  const parsed = TokenPayloadSchema.parse(decoded);
  return sanitizePayload(parsed);
}

// Token blacklist for logout (optional enhancement)
const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Clean up expired tokens from blacklist (run periodically)
export function cleanupBlacklistedTokens(): void {
  // In production, you might want to use Redis with TTL
  // This is a simple in-memory implementation
  tokenBlacklist.clear();
}


