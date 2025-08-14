import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';
import { TokenPayloadSchema } from '@healthcare/shared/schemas';
import type { TokenPayload } from '@healthcare/shared/types';

const env = loadEnv();

export function signAccessToken(payload: TokenPayload): string {
  const parsed = TokenPayloadSchema.parse(payload);
  return jwt.sign(parsed, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenPayload): string {
  const parsed = TokenPayloadSchema.parse(payload);
  return jwt.sign(parsed, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  const parsed = TokenPayloadSchema.parse(decoded);
  return parsed;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  const parsed = TokenPayloadSchema.parse(decoded);
  return parsed;
}


