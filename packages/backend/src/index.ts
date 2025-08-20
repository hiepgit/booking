import { createServer } from './app.js';
import { initializeUploads } from './middleware/upload.js';
import { InitializationService } from './services/initialization.service.js';
import { CacheService } from './services/cache.service.js';
import { SchedulerService } from './services/scheduler.service.js';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  try {
    // Initialize services silently
    await initializeUploads();
    await CacheService.initialize();
    const { httpServer } = createServer();
    await InitializationService.initialize(httpServer);
    SchedulerService.start();

    httpServer.listen(port, () => {
      console.log(`[backend] listening on http://localhost:${port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      SchedulerService.stop();

      httpServer.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
