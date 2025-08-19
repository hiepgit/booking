import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpecialtyService } from '../services/specialty.service.js';
import { prisma } from '../libs/prisma.js';

// Mock Prisma
vi.mock('../libs/prisma.js', () => ({
  prisma: {
    specialty: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    doctor: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('SpecialtyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSpecialties', () => {
    it('should return all specialties with doctor counts', async () => {
      const mockSpecialties = [
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          _count: { doctors: 5 },
        },
        {
          id: 'specialty2',
          name: 'Thần kinh',
          description: 'Chuyên khoa về hệ thần kinh',
          icon: '🧠',
          _count: { doctors: 3 },
        },
      ];

      (prisma.specialty.findMany as any).mockResolvedValue(mockSpecialties);

      const result = await SpecialtyService.getAllSpecialties();

      expect(result).toEqual([
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          doctorCount: 5,
        },
        {
          id: 'specialty2',
          name: 'Thần kinh',
          description: 'Chuyên khoa về hệ thần kinh',
          icon: '🧠',
          doctorCount: 3,
        },
      ]);

      expect(prisma.specialty.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          _count: {
            select: { doctors: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    });
  });

  describe('getSpecialtyById', () => {
    it('should return specialty by ID', async () => {
      const mockSpecialty = {
        id: 'specialty1',
        name: 'Tim mạch',
        description: 'Chuyên khoa về tim và mạch máu',
        icon: '❤️',
        _count: { doctors: 5 },
      };

      (prisma.specialty.findUnique as any).mockResolvedValue(mockSpecialty);

      const result = await SpecialtyService.getSpecialtyById('specialty1');

      expect(result).toEqual({
        id: 'specialty1',
        name: 'Tim mạch',
        description: 'Chuyên khoa về tim và mạch máu',
        icon: '❤️',
        doctorCount: 5,
      });

      expect(prisma.specialty.findUnique).toHaveBeenCalledWith({
        where: { id: 'specialty1' },
        include: {
          _count: {
            select: { doctors: true }
          }
        }
      });
    });

    it('should throw error if specialty not found', async () => {
      (prisma.specialty.findUnique as any).mockResolvedValue(null);

      await expect(SpecialtyService.getSpecialtyById('nonexistent')).rejects.toThrow('Specialty not found');
    });
  });

  describe('createSpecialty', () => {
    it('should create new specialty successfully', async () => {
      const newSpecialtyData = {
        name: 'Nhi khoa',
        description: 'Chuyên khoa về trẻ em',
        icon: '👶',
      };

      const createdSpecialty = {
        id: 'specialty3',
        ...newSpecialtyData,
      };

      (prisma.specialty.findFirst as any).mockResolvedValue(null); // No existing specialty
      (prisma.specialty.create as any).mockResolvedValue(createdSpecialty);

      const result = await SpecialtyService.createSpecialty(newSpecialtyData);

      expect(result).toEqual(createdSpecialty);
      expect(prisma.specialty.create).toHaveBeenCalledWith({
        data: newSpecialtyData,
      });
    });

    it('should throw error if specialty name already exists', async () => {
      const existingSpecialty = {
        id: 'specialty1',
        name: 'Tim mạch',
      };

      (prisma.specialty.findFirst as any).mockResolvedValue(existingSpecialty);

      await expect(SpecialtyService.createSpecialty({
        name: 'Tim mạch',
        description: 'Duplicate specialty',
      })).rejects.toThrow('Specialty name already exists');
    });
  });

  describe('updateSpecialty', () => {
    it('should update specialty successfully', async () => {
      const existingSpecialty = {
        id: 'specialty1',
        name: 'Tim mạch',
        description: 'Old description',
      };

      const updateData = {
        description: 'Updated description',
      };

      const updatedSpecialty = {
        ...existingSpecialty,
        ...updateData,
      };

      (prisma.specialty.findUnique as any).mockResolvedValue(existingSpecialty);
      (prisma.specialty.update as any).mockResolvedValue(updatedSpecialty);

      const result = await SpecialtyService.updateSpecialty('specialty1', updateData);

      expect(result).toEqual(updatedSpecialty);
      expect(prisma.specialty.update).toHaveBeenCalledWith({
        where: { id: 'specialty1' },
        data: updateData,
      });
    });

    it('should throw error if specialty not found', async () => {
      (prisma.specialty.findUnique as any).mockResolvedValue(null);

      await expect(SpecialtyService.updateSpecialty('nonexistent', {})).rejects.toThrow('Specialty not found');
    });

    it('should throw error if updated name already exists', async () => {
      const existingSpecialty = {
        id: 'specialty1',
        name: 'Tim mạch',
      };

      const duplicateSpecialty = {
        id: 'specialty2',
        name: 'Thần kinh',
      };

      (prisma.specialty.findUnique as any).mockResolvedValue(existingSpecialty);
      (prisma.specialty.findFirst as any).mockResolvedValue(duplicateSpecialty);

      await expect(SpecialtyService.updateSpecialty('specialty1', {
        name: 'Thần kinh',
      })).rejects.toThrow('Specialty name already exists');
    });
  });

  describe('deleteSpecialty', () => {
    it('should delete specialty successfully', async () => {
      const specialty = {
        id: 'specialty1',
        name: 'Tim mạch',
        _count: { doctors: 0 },
      };

      (prisma.specialty.findUnique as any).mockResolvedValue(specialty);
      (prisma.specialty.delete as any).mockResolvedValue(specialty);

      const result = await SpecialtyService.deleteSpecialty('specialty1');

      expect(result).toEqual({ message: 'Specialty deleted successfully' });
      expect(prisma.specialty.delete).toHaveBeenCalledWith({
        where: { id: 'specialty1' },
      });
    });

    it('should throw error if specialty not found', async () => {
      (prisma.specialty.findUnique as any).mockResolvedValue(null);

      await expect(SpecialtyService.deleteSpecialty('nonexistent')).rejects.toThrow('Specialty not found');
    });

    it('should throw error if specialty has associated doctors', async () => {
      const specialty = {
        id: 'specialty1',
        name: 'Tim mạch',
        _count: { doctors: 5 },
      };

      (prisma.specialty.findUnique as any).mockResolvedValue(specialty);

      await expect(SpecialtyService.deleteSpecialty('specialty1')).rejects.toThrow('Cannot delete specialty with associated doctors');
    });
  });

  describe('getDoctorsBySpecialty', () => {
    it('should return doctors by specialty', async () => {
      const specialty = {
        id: 'specialty1',
        name: 'Tim mạch',
        description: 'Chuyên khoa về tim và mạch máu',
        icon: '❤️',
      };

      const mockDoctors = [
        {
          id: 'doctor1',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
          clinicDoctors: [],
        },
      ];

      (prisma.specialty.findUnique as any).mockResolvedValue(specialty);
      (prisma.doctor.findMany as any).mockResolvedValue(mockDoctors);
      (prisma.doctor.count as any).mockResolvedValue(1);

      const result = await SpecialtyService.getDoctorsBySpecialty('specialty1', 1, 10);

      expect(result.specialty).toEqual(specialty);
      expect(result.doctors).toEqual(mockDoctors);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should throw error if specialty not found', async () => {
      (prisma.specialty.findUnique as any).mockResolvedValue(null);

      await expect(SpecialtyService.getDoctorsBySpecialty('nonexistent')).rejects.toThrow('Specialty not found');
    });
  });

  describe('searchSpecialties', () => {
    it('should search specialties by name and description', async () => {
      const mockSpecialties = [
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          _count: { doctors: 5 },
        },
      ];

      (prisma.specialty.findMany as any).mockResolvedValue(mockSpecialties);

      const result = await SpecialtyService.searchSpecialties('tim');

      expect(result).toEqual([
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          doctorCount: 5,
        },
      ]);

      expect(prisma.specialty.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'tim', mode: 'insensitive' } },
            { description: { contains: 'tim', mode: 'insensitive' } },
          ]
        },
        select: expect.any(Object),
        orderBy: { name: 'asc' }
      });
    });
  });

  describe('getPopularSpecialties', () => {
    it('should return popular specialties by doctor count', async () => {
      const mockSpecialties = [
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          _count: { doctors: 10 },
        },
        {
          id: 'specialty2',
          name: 'Thần kinh',
          description: 'Chuyên khoa về hệ thần kinh',
          icon: '🧠',
          _count: { doctors: 8 },
        },
      ];

      (prisma.specialty.findMany as any).mockResolvedValue(mockSpecialties);

      const result = await SpecialtyService.getPopularSpecialties(5);

      expect(result).toEqual([
        {
          id: 'specialty1',
          name: 'Tim mạch',
          description: 'Chuyên khoa về tim và mạch máu',
          icon: '❤️',
          doctorCount: 10,
        },
        {
          id: 'specialty2',
          name: 'Thần kinh',
          description: 'Chuyên khoa về hệ thần kinh',
          icon: '🧠',
          doctorCount: 8,
        },
      ]);

      expect(prisma.specialty.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
        orderBy: {
          doctors: { _count: 'desc' }
        },
        take: 5,
      });
    });
  });
});
