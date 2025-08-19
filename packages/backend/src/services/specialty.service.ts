import { prisma } from '../libs/prisma.js';

export interface SpecialtyData {
  name: string;
  description?: string;
  icon?: string;
}

export class SpecialtyService {
  /**
   * Get all specialties
   */
  static async getAllSpecialties() {
    const specialties = await prisma.specialty.findMany({
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

    return specialties.map(specialty => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      icon: specialty.icon,
      doctorCount: specialty._count.doctors,
    }));
  }

  /**
   * Get specialty by ID
   */
  static async getSpecialtyById(id: string) {
    const specialty = await prisma.specialty.findUnique({
      where: { id },
      include: {
        _count: {
          select: { doctors: true }
        }
      }
    });

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      icon: specialty.icon,
      doctorCount: specialty._count.doctors,
    };
  }

  /**
   * Create new specialty
   */
  static async createSpecialty(data: SpecialtyData) {
    // Check if specialty name already exists
    const existingSpecialty = await prisma.specialty.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } }
    });

    if (existingSpecialty) {
      throw new Error('Specialty name already exists');
    }

    const specialty = await prisma.specialty.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
      }
    });

    return specialty;
  }

  /**
   * Update specialty
   */
  static async updateSpecialty(id: string, data: Partial<SpecialtyData>) {
    // Check if specialty exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { id }
    });

    if (!existingSpecialty) {
      throw new Error('Specialty not found');
    }

    // If updating name, check for duplicates
    if (data.name && data.name !== existingSpecialty.name) {
      const duplicateName = await prisma.specialty.findFirst({
        where: { 
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicateName) {
        throw new Error('Specialty name already exists');
      }
    }

    const updatedSpecialty = await prisma.specialty.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
      }
    });

    return updatedSpecialty;
  }

  /**
   * Delete specialty
   */
  static async deleteSpecialty(id: string) {
    // Check if specialty exists
    const specialty = await prisma.specialty.findUnique({
      where: { id },
      include: {
        _count: {
          select: { doctors: true }
        }
      }
    });

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    // Check if specialty has doctors
    if (specialty._count.doctors > 0) {
      throw new Error('Cannot delete specialty with associated doctors');
    }

    await prisma.specialty.delete({
      where: { id }
    });

    return { message: 'Specialty deleted successfully' };
  }

  /**
   * Get doctors by specialty
   */
  static async getDoctorsBySpecialty(specialtyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Check if specialty exists
    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId }
    });

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: { specialtyId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          clinicDoctors: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                }
              }
            },
            take: 1, // Just get the first clinic
          }
        },
        orderBy: { averageRating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where: { specialtyId } }),
    ]);

    return {
      specialty: {
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        icon: specialty.icon,
      },
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Search specialties
   */
  static async searchSpecialties(query: string) {
    const specialties = await prisma.specialty.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
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

    return specialties.map(specialty => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      icon: specialty.icon,
      doctorCount: specialty._count.doctors,
    }));
  }

  /**
   * Get popular specialties (by doctor count)
   */
  static async getPopularSpecialties(limit = 10) {
    const specialties = await prisma.specialty.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        _count: {
          select: { doctors: true }
        }
      },
      orderBy: {
        doctors: { _count: 'desc' }
      },
      take: limit,
    });

    return specialties.map(specialty => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description,
      icon: specialty.icon,
      doctorCount: specialty._count.doctors,
    }));
  }
}
