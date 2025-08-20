import { UploadService } from '../services/upload.service.js';

/**
 * Initialize upload directories on server startup
 */
export async function initializeUploads() {
  try {
    await UploadService.initializeDirectories();
    // Upload directories initialized silently
  } catch (error) {
    console.error('❌ Failed to initialize upload directories:', error);
    throw error;
  }
}
