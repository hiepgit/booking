import { UploadService } from '../services/upload.service.js';

/**
 * Initialize upload directories on server startup
 */
export async function initializeUploads() {
  try {
    await UploadService.initializeDirectories();
    console.log('✅ Upload directories initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize upload directories:', error);
    throw error;
  }
}
