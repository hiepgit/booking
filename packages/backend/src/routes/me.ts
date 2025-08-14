import { Router } from 'express';
import { prisma } from '../libs/prisma.js';
import { requireAuth } from '../security/requireAuth.js';
import { z } from 'zod';

const router = Router();

/**
 * @openapi
 * /me:
 *   get:
 *     tags:
 *       - Me
 *     security:
 *       - bearerAuth: []
 *     summary: Get current user profile
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, firstName: true, lastName: true, isVerified: true } });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

const PatchBody = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  address: z.string().optional(),
});

/**
 * @openapi
 * /me:
 *   patch:
 *     tags:
 *       - Me
 *     security:
 *       - bearerAuth: []
 *     summary: Update current user profile
 */
router.patch('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const body = PatchBody.parse(req.body);
    const updated = await prisma.user.update({ where: { id: userId }, data: body, select: { id: true, email: true, role: true, firstName: true, lastName: true, isVerified: true } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;


