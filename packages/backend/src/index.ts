import { createServer } from './app.js';
import { initializeUploads } from './middleware/upload.js';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  try {
    // Initialize upload directories
    await initializeUploads();
    
    // Create and start server
    const app = createServer();
    
    app.listen(port, () => {
      console.log(`[backend] listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
