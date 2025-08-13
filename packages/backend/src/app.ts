import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { loadEnv } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';

const env = loadEnv();

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      legacyHeaders: false,
      standardHeaders: true,
    })
  );

  if (env.SWAGGER_ENABLED) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/me', meRouter);

  app.get('/', (_req, res) => {
    res.json({ ok: true, name: 'backend', version: '0.0.0' });
  });

  // Global error handler (Zod friendly)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err?.status === 'number' ? err.status : 500;
    const isZod = err?.name === 'ZodError';
    const body = isZod
      ? { error: { message: 'Validation error', issues: err?.issues ?? [] } }
      : { error: { message: err?.message ?? 'Internal Server Error' } };
    res.status(isZod ? 400 : status).json(body);
  });

  return app;
}
