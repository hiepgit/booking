import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { loadEnv } from './config/env.js';
import healthRouter from './routes/health.js';

loadEnv();

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/health', healthRouter);

  app.get('/', (_req, res) => {
    res.json({ ok: true, name: 'backend', version: '0.0.0' });
  });

  return app;
}
