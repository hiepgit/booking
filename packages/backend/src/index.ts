import { createServer } from './app.js';
import { initializeUploads } from './middleware/upload.js';
import { InitializationService } from './services/initialization.service.js';
import { CacheService } from './services/cache.service.js';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  try {
    // Initialize upload directories
    await initializeUploads();

    // Initialize cache service
    await CacheService.initialize();

    // Create and start server
    const { app, httpServer } = createServer();

    // Initialize notification system
    await InitializationService.initialize(httpServer);

    httpServer.listen(port, () => {
      console.log(`[backend] listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
