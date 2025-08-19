import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { getAppVersion } from '../libs/version.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();
const router = Router();
const prisma = new PrismaClient();

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Health check endpoint
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: getAppVersion(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    },
    metrics: {
      responseTime: 0,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error: any) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error: any) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  health.services.memory = memUsageMB.heapUsed > 500 ? 'warning' : 'healthy';
  health.metrics.responseTime = Date.now() - startTime;

  if (health.services.database === 'unhealthy' || health.services.redis === 'unhealthy') {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

// Detailed health check endpoint
router.get('/detailed', async (req, res) => {
  const detailedHealth: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: 'unknown',
        responseTime: 0,
        details: {}
      },
      redis: {
        status: 'unknown',
        responseTime: 0,
        details: {}
      },
      system: {
        status: 'unknown',
        details: {}
      }
    }
  };

  const dbStartTime = Date.now();
  try {
    if (env.NODE_ENV !== 'production') {
      const result = await prisma.$queryRaw<{ version: string; timestamp: Date }[]>`SELECT version() as version, current_timestamp as timestamp`;
      detailedHealth.checks.database.details = result[0];
    } else {
      await prisma.$queryRaw`SELECT 1`;
    }
    detailedHealth.checks.database.status = 'healthy';
    detailedHealth.checks.database.responseTime = Date.now() - dbStartTime;
  } catch (error: any) {
    detailedHealth.checks.database.status = 'unhealthy';
    detailedHealth.checks.database.responseTime = Date.now() - dbStartTime;
    detailedHealth.status = 'unhealthy';
  }

  const redisStartTime = Date.now();
  try {
    await redis.ping();
    if (env.NODE_ENV !== 'production') {
      const redisInfo = await redis.info();
      detailedHealth.checks.redis.details = {
        ping: 'PONG',
        info: redisInfo.split('\n').slice(0, 10)
      };
    }
    detailedHealth.checks.redis.status = 'healthy';
    detailedHealth.checks.redis.responseTime = Date.now() - redisStartTime;
  } catch (error: any) {
    detailedHealth.checks.redis.status = 'unhealthy';
    detailedHealth.checks.redis.responseTime = Date.now() - redisStartTime;
    detailedHealth.status = 'unhealthy';
  }

  // System check
  if (env.NODE_ENV !== 'production') {
    detailedHealth.checks.system.status = 'healthy';
    detailedHealth.checks.system.details = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    };
  } else {
    detailedHealth.checks.system.status = 'healthy';
    detailedHealth.checks.system.details = { uptime: process.uptime() };
  }

  if (detailedHealth.checks.database.status === 'unhealthy' || 
      detailedHealth.checks.redis.status === 'unhealthy') {
    detailedHealth.status = 'unhealthy';
  }

  const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(detailedHealth);
});

// Readiness probe endpoint
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString() });
  }
});

// Liveness probe endpoint
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

export default router;
