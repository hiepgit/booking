import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserService } from '../services/user.service.js';
import { prisma } from '../libs/prisma.js';
import { UserRole, Gender } from '@prisma/client';

// Mock Prisma
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    patient: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile with patient data', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        phone: '+84901234567',
        role: UserRole.PATIENT,
        firstName: 'John',
        lastName: 'Doe',
        avatar: null,
        dateOfBirth: new Date('1990-01-01'),
        gender: Gender.MALE,
        address: '123 Main St',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: {
          id: 'patient1',
          bloodType: 'O+',
          allergies: 'None',
          emergencyContact: 'Jane Doe',
          insuranceNumber: 'INS123',
        },
        doctor: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await UserService.getUserProfile('user1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: expect.objectContaining({
          id: true,
          email: true,
          patient: expect.any(Object),
          doctor: expect.any(Object),
        }),
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(UserService.getUserProfile('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+84987654321',
      };

      const mockUpdatedUser = {
        id: 'user1',
        email: 'test@example.com',
        phone: '+84987654321',
        role: UserRole.PATIENT,
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: null,
        dateOfBirth: null,
        gender: null,
        address: null,
        isVerified: true,
        updatedAt: new Date(),
      };

      (prisma.user.update as any).mockResolvedValue(mockUpdatedUser);

      const result = await UserService.updateUserProfile('user1', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: updateData,
        select: expect.any(Object),
      });
    });
  });

  describe('updatePatientProfile', () => {
    it('should update existing patient profile', async () => {
      const mockUser = {
        role: UserRole.PATIENT,
        patient: { id: 'patient1' },
      };

      const mockUpdatedProfile = {
        id: 'user1',
        patient: {
          bloodType: 'A+',
          allergies: 'Peanuts',
        },
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.patient.update as any).mockResolvedValue({});
      
      // Mock getUserProfile for return value
      vi.spyOn(UserService, 'getUserProfile').mockResolvedValue(mockUpdatedProfile as any);

      const updateData = {
        bloodType: 'A+',
        allergies: 'Peanuts',
      };

      const result = await UserService.updatePatientProfile('user1', updateData);

      expect(result).toEqual(mockUpdatedProfile);
      expect(prisma.patient.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: updateData,
      });
    });

    it('should create patient profile if not exists', async () => {
      const mockUser = {
        role: UserRole.PATIENT,
        patient: null,
      };

      const mockUpdatedProfile = {
        id: 'user1',
        patient: {
          bloodType: 'B+',
        },
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.patient.create as any).mockResolvedValue({});
      
      // Mock getUserProfile for return value
      vi.spyOn(UserService, 'getUserProfile').mockResolvedValue(mockUpdatedProfile as any);

      const updateData = {
        bloodType: 'B+',
      };

      const result = await UserService.updatePatientProfile('user1', updateData);

      expect(result).toEqual(mockUpdatedProfile);
      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          ...updateData,
        },
      });
    });

    it('should throw error if user is not a patient', async () => {
      const mockUser = {
        role: UserRole.DOCTOR,
        patient: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(UserService.updatePatientProfile('user1', {})).rejects.toThrow('User is not a patient');
    });
  });

  describe('getProfileCompletion', () => {
    it('should calculate completion for patient with complete profile', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84901234567',
        dateOfBirth: new Date(),
        gender: Gender.MALE,
        address: '123 Main St',
        role: UserRole.PATIENT,
        patient: {
          bloodType: 'O+',
          emergencyContact: 'Jane Doe',
        },
        doctor: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await UserService.getProfileCompletion('user1');

      expect(result.isComplete).toBe(true);
      expect(result.completionPercentage).toBe(100);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should calculate completion for patient with incomplete profile', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        phone: null, // Missing
        dateOfBirth: null, // Missing
        gender: Gender.MALE,
        address: '123 Main St',
        role: UserRole.PATIENT,
        patient: {
          bloodType: null, // Missing
          emergencyContact: 'Jane Doe',
        },
        doctor: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await UserService.getProfileCompletion('user1');

      expect(result.isComplete).toBe(false);
      expect(result.completionPercentage).toBeLessThan(100);
      expect(result.missingFields).toContain('phone');
      expect(result.missingFields).toContain('dateOfBirth');
      expect(result.missingFields).toContain('patient.bloodType');
    });
  });

  describe('searchUsers', () => {
    it('should search users by name and email', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          avatar: null,
          role: UserRole.PATIENT,
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.user.count as any).mockResolvedValue(1);

      const result = await UserService.searchUsers('john', undefined, 1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        isActive: false,
      };

      (prisma.user.update as any).mockResolvedValue(mockUser);

      const result = await UserService.deactivateUser('user1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      });
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user successfully', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        isActive: true,
      };

      (prisma.user.update as any).mockResolvedValue(mockUser);

      const result = await UserService.reactivateUser('user1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      });
    });
  });
});
