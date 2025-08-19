import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadService } from '../services/upload.service.js';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    mkdir: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn(),
  },
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123'),
}));

describe('UploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeDirectories', () => {
    it('should create directories if they do not exist', async () => {
      (fs.access as any).mockRejectedValue(new Error('Directory not found'));
      (fs.mkdir as any).mockResolvedValue(undefined);

      await UploadService.initializeDirectories();

      expect(fs.mkdir).toHaveBeenCalledTimes(2); // uploads and avatars directories
    });

    it('should not create directories if they already exist', async () => {
      (fs.access as any).mockResolvedValue(undefined);

      await UploadService.initializeDirectories();

      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('processAvatarUpload', () => {
    it('should process uploaded file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'avatar',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads/avatars',
        filename: 'mock-uuid-123.jpg',
        path: '/uploads/avatars/mock-uuid-123.jpg',
        buffer: Buffer.from(''),
        stream: {} as any,
      };

      const result = await UploadService.processAvatarUpload(mockFile);

      expect(result).toEqual({
        filename: 'mock-uuid-123.jpg',
        originalName: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: '/uploads/avatars/mock-uuid-123.jpg',
      });
    });

    it('should throw error if no file provided', async () => {
      await expect(UploadService.processAvatarUpload(null as any)).rejects.toThrow('No file uploaded');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      (fs.unlink as any).mockResolvedValue(undefined);

      await UploadService.deleteFile('test.jpg');

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('uploads/avatars/test.jpg')
      );
    });

    it('should not throw error if file does not exist', async () => {
      (fs.unlink as any).mockRejectedValue(new Error('File not found'));

      // Should not throw
      await expect(UploadService.deleteFile('nonexistent.jpg')).resolves.toBeUndefined();
    });
  });

  describe('deleteOldAvatar', () => {
    it('should delete old avatar file', async () => {
      (fs.unlink as any).mockResolvedValue(undefined);

      await UploadService.deleteOldAvatar('/uploads/avatars/old-avatar.jpg');

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('uploads/avatars/old-avatar.jpg')
      );
    });

    it('should not delete if URL is invalid', async () => {
      await UploadService.deleteOldAvatar('https://external.com/avatar.jpg');

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should not delete if URL is empty', async () => {
      await UploadService.deleteOldAvatar('');

      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('validateFile', () => {
    it('should validate file successfully', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'avatar',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/uploads/avatars',
        filename: 'test.jpg',
        path: '/uploads/avatars/test.jpg',
        buffer: Buffer.from(''),
        stream: {} as any,
      };

      expect(() => UploadService.validateFile(mockFile)).not.toThrow();
    });

    it('should throw error for invalid file type', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'avatar',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        destination: '/uploads/avatars',
        filename: 'test.txt',
        path: '/uploads/avatars/test.txt',
        buffer: Buffer.from(''),
        stream: {} as any,
      };

      expect(() => UploadService.validateFile(mockFile)).toThrow('Invalid file type');
    });

    it('should throw error for file too large', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'avatar',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        destination: '/uploads/avatars',
        filename: 'test.jpg',
        path: '/uploads/avatars/test.jpg',
        buffer: Buffer.from(''),
        stream: {} as any,
      };

      expect(() => UploadService.validateFile(mockFile)).toThrow('File size too large');
    });

    it('should throw error if no file provided', () => {
      expect(() => UploadService.validateFile(null as any)).toThrow('No file provided');
    });
  });

  describe('getFileInfo', () => {
    it('should return file info if file exists', async () => {
      const mockStats = {
        size: 1024,
        birthtime: new Date('2024-01-01'),
        mtime: new Date('2024-01-02'),
      };

      (fs.stat as any).mockResolvedValue(mockStats);

      const result = await UploadService.getFileInfo('test.jpg');

      expect(result).toEqual({
        exists: true,
        size: 1024,
        createdAt: mockStats.birthtime,
        modifiedAt: mockStats.mtime,
      });
    });

    it('should return exists false if file does not exist', async () => {
      (fs.stat as any).mockRejectedValue(new Error('File not found'));

      const result = await UploadService.getFileInfo('nonexistent.jpg');

      expect(result).toEqual({
        exists: false,
      });
    });
  });
});
