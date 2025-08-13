import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';
import { TokenPayloadSchema } from '@healthcare/shared/schemas';
import { assertTokenPayload } from '@healthcare/shared/guards';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: { sub: string; email: string; role: 'PATIENT' | 'DOCTOR' | 'ADMIN' };
    }
  }
}

const env = loadEnv();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: { message: 'Unauthorized' } });
  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const parsed = TokenPayloadSchema.safeParse(decoded);
    if (!parsed.success) return res.status(401).json({ error: { message: 'Invalid token' } });
    // type narrowing via type guard assert
    assertTokenPayload(parsed.data);
    req.user = parsed.data;
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }
}

export function requireRole(roles: ReadonlyArray<'PATIENT' | 'DOCTOR' | 'ADMIN'>) {
  return function roleGuard(req: Request, res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: { message: 'Forbidden' } });
    next();
  };
}


