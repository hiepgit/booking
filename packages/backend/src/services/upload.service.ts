import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export class UploadService {
  private static readonly UPLOAD_DIR = 'uploads';
  private static readonly AVATAR_DIR = 'avatars';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  /**
   * Initialize upload directories
   */
  static async initializeDirectories() {
    const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR);
    const avatarPath = path.join(uploadPath, this.AVATAR_DIR);

    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }

    try {
      await fs.access(avatarPath);
    } catch {
      await fs.mkdir(avatarPath, { recursive: true });
    }
  }

  /**
   * Configure multer for avatar uploads
   */
  static getAvatarUploadConfig() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const avatarPath = path.join(process.cwd(), this.UPLOAD_DIR, this.AVATAR_DIR);
        await this.initializeDirectories();
        cb(null, avatarPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
      },
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.MAX_FILE_SIZE,
      },
    });
  }

  /**
   * Process uploaded avatar file
   */
  static async processAvatarUpload(file: Express.Multer.File): Promise<UploadedFile> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate URL for the uploaded file
    const url = `/uploads/avatars/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
    };
  }

  /**
   * Delete uploaded file
   */
  static async deleteFile(filename: string, directory: string = this.AVATAR_DIR): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), this.UPLOAD_DIR, directory, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Delete old avatar when user uploads new one
   */
  static async deleteOldAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) {
      return;
    }

    const filename = path.basename(avatarUrl);
    await this.deleteFile(filename, this.AVATAR_DIR);
  }

  /**
   * Validate file size and type
   */
  static validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(filename: string, directory: string = this.AVATAR_DIR) {
    try {
      const filePath = path.join(process.cwd(), this.UPLOAD_DIR, directory, filename);
      const stats = await fs.stat(filePath);
      
      return {
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch {
      return {
        exists: false,
      };
    }
  }
}
