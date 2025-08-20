import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { loadEnv } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import socialAuthRouter from './routes/socialAuth.js';
import meRouter from './routes/me.js';
import doctorsRouter from './routes/doctors.js';
import specialtiesRouter from './routes/specialties.js';
import reviewsRouter from './routes/reviews.js';
import clinicsRouter from './routes/clinics.js';
import appointmentsRouter from './routes/appointments.js';
import searchRouter from './routes/search.js';
import { getAppVersion } from './libs/version.js';

const env = loadEnv();

export function createServer() {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Static file serving for uploads
  app.use('/uploads', express.static('uploads'));
  
  // Logging middleware
  app.use(morgan('dev'));
  
  // Global rate limiting
  app.use(apiRateLimit);

  // Swagger documentation
  if (env.SWAGGER_ENABLED) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // Health check routes (no rate limiting)
  app.use('/health', healthRouter);
  
  // Authentication routes (with specific rate limiting)
  app.use('/auth', authRouter);
  app.use('/auth', socialAuthRouter);
  
  // Protected routes
  app.use('/me', meRouter);
  
  // API routes
  app.use('/doctors', doctorsRouter);
  app.use('/specialties', specialtiesRouter);
  app.use('/reviews', reviewsRouter);
  app.use('/clinics', clinicsRouter);
  app.use('/appointments', appointmentsRouter);
  app.use('/search', searchRouter);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({ 
      ok: true, 
      name: 'Healthcare Backend API', 
      version: getAppVersion(),
      environment: env.NODE_ENV,
      endpoints: {
        health: '/health',
        auth: '/auth',
        docs: '/docs'
      }
    });
  });

  // 404 handler (no wildcard to avoid path-to-regexp issue)
  app.use((req, res) => {
    res.status(404).json({ 
      error: { 
        message: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND'
      } 
    });
  });

  // Global error handler (Zod friendly)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Global error handler:', err);
    
    const status = typeof err?.status === 'number' ? err.status : 500;
    const isZod = err?.name === 'ZodError';
    const isPrisma = err?.code?.startsWith('P');
    
    let body;
    if (isZod) {
      body = { 
        error: { 
          message: 'Validation error', 
          code: 'VALIDATION_ERROR',
          issues: err?.issues ?? [] 
        } 
      };
    } else if (isPrisma) {
      body = { 
        error: { 
          message: 'Database operation failed', 
          code: 'DATABASE_ERROR'
        } 
      };
    } else {
      body = { 
        error: { 
          message: err?.message ?? 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        } 
      };
    }
    
    res.status(isZod ? 400 : status).json(body);
  });

  return app;
}
