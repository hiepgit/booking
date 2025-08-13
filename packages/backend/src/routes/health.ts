import { Router } from 'express';
import { prisma } from '../libs/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'down', error: String(e) });
  }
});

export default router;
