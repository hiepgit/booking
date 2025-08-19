import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DoctorService } from '../services/doctor.service.js';
import { prisma } from '../libs/prisma.js';
import { UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    doctor: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    specialty: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    appointment: {
      groupBy: vi.fn(),
    },
    review: {
      aggregate: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

describe('DoctorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerDoctor', () => {
    it('should register a new doctor successfully', async () => {
      const mockUser = {
        id: 'user1',
        email: 'doctor@example.com',
        doctor: null,
      };

      const mockSpecialty = {
        id: 'specialty1',
        name: 'Tim mạch',
      };

      const mockDoctor = {
        id: 'doctor1',
        userId: 'user1',
        licenseNumber: 'VN123456',
        specialtyId: 'specialty1',
        experience: 5,
        consultationFee: new Decimal(500000),
        user: mockUser,
        specialty: mockSpecialty,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.doctor.findUnique as any).mockResolvedValue(null); // No existing license
      (prisma.specialty.findUnique as any).mockResolvedValue(mockSpecialty);
      (prisma.doctor.create as any).mockResolvedValue(mockDoctor);
      (prisma.user.update as any).mockResolvedValue({});

      const result = await DoctorService.registerDoctor({
        userId: 'user1',
        licenseNumber: 'VN123456',
        specialtyId: 'specialty1',
        experience: 5,
        consultationFee: 500000,
      });

      expect(result).toEqual(mockDoctor);
      expect(prisma.doctor.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          licenseNumber: 'VN123456',
          specialtyId: 'specialty1',
          experience: 5,
          consultationFee: new Decimal(500000),
          biography: undefined,
        },
        include: expect.any(Object),
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: UserRole.DOCTOR },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(DoctorService.registerDoctor({
        userId: 'nonexistent',
        licenseNumber: 'VN123456',
        specialtyId: 'specialty1',
        experience: 5,
        consultationFee: 500000,
      })).rejects.toThrow('User not found');
    });

    it('should throw error if user is already a doctor', async () => {
      const mockUser = {
        id: 'user1',
        doctor: { id: 'doctor1' },
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await expect(DoctorService.registerDoctor({
        userId: 'user1',
        licenseNumber: 'VN123456',
        specialtyId: 'specialty1',
        experience: 5,
        consultationFee: 500000,
      })).rejects.toThrow('User is already registered as a doctor');
    });

    it('should throw error if license number already exists', async () => {
      const mockUser = {
        id: 'user1',
        doctor: null,
      };

      const existingDoctor = {
        id: 'doctor2',
        licenseNumber: 'VN123456',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.doctor.findUnique as any).mockResolvedValue(existingDoctor);

      await expect(DoctorService.registerDoctor({
        userId: 'user1',
        licenseNumber: 'VN123456',
        specialtyId: 'specialty1',
        experience: 5,
        consultationFee: 500000,
      })).rejects.toThrow('License number already exists');
    });

    it('should throw error if specialty not found', async () => {
      const mockUser = {
        id: 'user1',
        doctor: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.doctor.findUnique as any).mockResolvedValue(null);
      (prisma.specialty.findUnique as any).mockResolvedValue(null);

      await expect(DoctorService.registerDoctor({
        userId: 'user1',
        licenseNumber: 'VN123456',
        specialtyId: 'nonexistent',
        experience: 5,
        consultationFee: 500000,
      })).rejects.toThrow('Specialty not found');
    });
  });

  describe('getDoctorProfile', () => {
    it('should return doctor profile successfully', async () => {
      const mockDoctor = {
        id: 'doctor1',
        userId: 'user1',
        licenseNumber: 'VN123456',
        user: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
        },
        specialty: {
          id: 'specialty1',
          name: 'Tim mạch',
        },
        clinicDoctors: [],
        reviews: [],
      };

      (prisma.doctor.findUnique as any).mockResolvedValue(mockDoctor);

      const result = await DoctorService.getDoctorProfile('user1');

      expect(result).toEqual(mockDoctor);
      expect(prisma.doctor.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: expect.any(Object),
      });
    });

    it('should throw error if doctor not found', async () => {
      (prisma.doctor.findUnique as any).mockResolvedValue(null);

      await expect(DoctorService.getDoctorProfile('nonexistent')).rejects.toThrow('Doctor not found');
    });
  });

  describe('updateDoctorProfile', () => {
    it('should update doctor profile successfully', async () => {
      const existingDoctor = {
        id: 'doctor1',
        licenseNumber: 'VN123456',
      };

      const updatedDoctor = {
        id: 'doctor1',
        experience: 10,
        biography: 'Updated biography',
      };

      (prisma.doctor.findUnique as any).mockResolvedValue(existingDoctor);
      (prisma.doctor.update as any).mockResolvedValue(updatedDoctor);

      const result = await DoctorService.updateDoctorProfile('user1', {
        experience: 10,
        biography: 'Updated biography',
      });

      expect(result).toEqual(updatedDoctor);
      expect(prisma.doctor.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: {
          experience: 10,
          biography: 'Updated biography',
        },
        include: expect.any(Object),
      });
    });

    it('should throw error if doctor not found', async () => {
      (prisma.doctor.findUnique as any).mockResolvedValue(null);

      await expect(DoctorService.updateDoctorProfile('nonexistent', {})).rejects.toThrow('Doctor not found');
    });

    it('should throw error if license number already exists', async () => {
      const existingDoctor = {
        id: 'doctor1',
        licenseNumber: 'VN123456',
      };

      const duplicateDoctor = {
        id: 'doctor2',
        licenseNumber: 'VN789012',
      };

      (prisma.doctor.findUnique as any)
        .mockResolvedValueOnce(existingDoctor) // First call for existing doctor
        .mockResolvedValueOnce(duplicateDoctor); // Second call for duplicate check

      await expect(DoctorService.updateDoctorProfile('user1', {
        licenseNumber: 'VN789012',
      })).rejects.toThrow('License number already exists');
    });
  });

  describe('searchDoctors', () => {
    it('should search doctors with filters', async () => {
      const mockDoctors = [
        {
          id: 'doctor1',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
          specialty: {
            name: 'Tim mạch',
          },
          averageRating: 4.5,
          consultationFee: new Decimal(500000),
        },
      ];

      (prisma.doctor.findMany as any).mockResolvedValue(mockDoctors);
      (prisma.doctor.count as any).mockResolvedValue(1);

      const result = await DoctorService.searchDoctors({
        q: 'John',
        specialtyId: 'specialty1',
        minRating: 4,
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockDoctors);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should handle empty search results', async () => {
      (prisma.doctor.findMany as any).mockResolvedValue([]);
      (prisma.doctor.count as any).mockResolvedValue(0);

      const result = await DoctorService.searchDoctors({
        q: 'nonexistent',
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getSearchFilters', () => {
    it('should return search filters', async () => {
      const mockSpecialties = [
        {
          id: 'specialty1',
          name: 'Tim mạch',
          icon: '❤️',
          _count: { doctors: 5 },
        },
      ];

      const mockCities = [
        { city: 'Hà Nội', count: 10 },
        { city: 'TP.HCM', count: 8 },
      ];

      const mockFeeRange = {
        _min: { consultationFee: new Decimal(200000) },
        _max: { consultationFee: new Decimal(800000) },
      };

      (prisma.specialty.findMany as any).mockResolvedValue(mockSpecialties);
      (prisma.$queryRaw as any).mockResolvedValue(mockCities);
      (prisma.doctor.aggregate as any).mockResolvedValue(mockFeeRange);

      const result = await DoctorService.getSearchFilters();

      expect(result.specialties).toEqual([
        {
          id: 'specialty1',
          name: 'Tim mạch',
          icon: '❤️',
          count: 5,
        },
      ]);
      expect(result.cities).toEqual(mockCities);
      expect(result.feeRange).toEqual({
        min: 200000,
        max: 800000,
      });
    });
  });

  describe('getDoctorStats', () => {
    it('should return doctor statistics', async () => {
      const mockAppointmentStats = [
        { status: 'CONFIRMED', _count: { status: 10 } },
        { status: 'COMPLETED', _count: { status: 25 } },
      ];

      const mockReviewStats = {
        _count: { id: 15 },
        _avg: { rating: 4.5 },
      };

      (prisma.appointment.groupBy as any).mockResolvedValue(mockAppointmentStats);
      (prisma.review.aggregate as any).mockResolvedValue(mockReviewStats);

      const result = await DoctorService.getDoctorStats('doctor1');

      expect(result).toEqual({
        appointments: {
          confirmed: 10,
          completed: 25,
        },
        reviews: {
          total: 15,
          averageRating: 4.5,
        },
      });
    });
  });

  describe('verifyDoctorLicense', () => {
    it('should verify doctor license successfully', async () => {
      const mockDoctor = {
        id: 'doctor1',
        licenseNumber: 'VN123456',
      };

      (prisma.doctor.findUnique as any).mockResolvedValue(mockDoctor);

      const result = await DoctorService.verifyDoctorLicense('user1', 'VN123456');

      expect(result.verified).toBe(true);
      expect(result.licenseNumber).toBe('VN123456');
    });

    it('should throw error if doctor not found', async () => {
      (prisma.doctor.findUnique as any).mockResolvedValue(null);

      await expect(DoctorService.verifyDoctorLicense('nonexistent', 'VN123456')).rejects.toThrow('Doctor not found');
    });

    it('should throw error if license number does not match', async () => {
      const mockDoctor = {
        id: 'doctor1',
        licenseNumber: 'VN123456',
      };

      (prisma.doctor.findUnique as any).mockResolvedValue(mockDoctor);

      await expect(DoctorService.verifyDoctorLicense('user1', 'VN789012')).rejects.toThrow('License number does not match');
    });

    it('should throw error if license verification fails', async () => {
      const mockDoctor = {
        id: 'doctor1',
        licenseNumber: 'ABC', // Invalid format - too short
      };

      (prisma.doctor.findUnique as any).mockResolvedValue(mockDoctor);

      await expect(DoctorService.verifyDoctorLicense('user1', 'ABC')).rejects.toThrow('License verification failed');
    });
  });
});
