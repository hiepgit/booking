import { PrismaClient, Clinic, ClinicDoctor } from '@prisma/client';
import { z } from 'zod';
import { CacheService } from './cache.service.js';

const prisma = new PrismaClient();

// Validation schemas
export const createClinicSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Invalid email format'
  }).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  images: z.array(z.string().refine((val) => {
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format' })).optional().default([]),
  description: z.string().optional(),
});

export const updateClinicSchema = createClinicSchema.partial();

export const nearbyClinicSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(50).default(5), // km
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const clinicSearchSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  name: z.string().optional(),
  specialtyIds: z.array(z.string()).optional(), // Filter by services/specialties
  openNow: z.boolean().optional(), // Filter by currently open clinics
  operatingDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  operatingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:mm format
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['name', 'rating', 'distance', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const addDoctorToClinicSchema = z.object({
  doctorId: z.string().refine((val) => /^c[a-z0-9]{24}$/.test(val), {
    message: 'Invalid CUID format'
  }),
  workingDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
});

export const updateDoctorScheduleSchema = addDoctorToClinicSchema.partial().omit({ doctorId: true });

// Types
export type CreateClinicData = z.infer<typeof createClinicSchema>;
export type UpdateClinicData = z.infer<typeof updateClinicSchema>;
export type NearbyClinicQuery = z.infer<typeof nearbyClinicSchema>;
export type ClinicSearchQuery = z.infer<typeof clinicSearchSchema>;
export type AddDoctorToClinicData = z.infer<typeof addDoctorToClinicSchema>;
export type UpdateDoctorScheduleData = z.infer<typeof updateDoctorScheduleSchema>;

export interface ClinicWithDetails extends Clinic {
  doctorCount: number;
  specialties: Array<{
    id: string;
    name: string;
  }>;
  rating?: number;
  totalReviews?: number;
  distance?: number;
}

export interface ClinicWithDoctors extends Clinic {
  clinicDoctors: Array<ClinicDoctor & {
    doctor: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
        avatar: string | null;
      };
      specialty: {
        id: string;
        name: string;
      };
      averageRating: number;
      totalReviews: number;
      consultationFee: number;
    };
  }>;
}

export class ClinicService {
  // Create a new clinic
  static async createClinic(data: CreateClinicData): Promise<Clinic> {
    const validatedData = createClinicSchema.parse(data);

    // Validate time format
    if (validatedData.openTime >= validatedData.closeTime) {
      throw new Error('Open time must be before close time');
    }

    const clinic = await prisma.clinic.create({
      data: validatedData,
    });

    return clinic;
  }

  // Get clinic by ID
  static async getClinicById(id: string): Promise<ClinicWithDetails | null> {
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        clinicDoctors: {
          include: {
            doctor: {
              include: {
                specialty: true,
                reviews: true,
              },
            },
          },
        },
      },
    });

    if (!clinic) {
      return null;
    }

    // Calculate aggregated data
    const doctorCount = clinic.clinicDoctors.length;
    const specialties = Array.from(
      new Map(
        clinic.clinicDoctors.map(cd => [
          cd.doctor.specialty.id,
          { id: cd.doctor.specialty.id, name: cd.doctor.specialty.name }
        ])
      ).values()
    );

    // Calculate average rating from all doctors
    const allReviews = clinic.clinicDoctors.flatMap(cd => cd.doctor.reviews);
    const rating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : undefined;
    const totalReviews = allReviews.length;

    const { clinicDoctors, ...clinicData } = clinic;

    return {
      ...clinicData,
      doctorCount,
      specialties,
      rating: rating ? Math.round(rating * 10) / 10 : undefined,
      totalReviews,
    };
  }

  // Update clinic
  static async updateClinic(id: string, data: UpdateClinicData): Promise<Clinic> {
    const validatedData = updateClinicSchema.parse(data);

    // Validate time format if both times are provided
    if (validatedData.openTime && validatedData.closeTime) {
      if (validatedData.openTime >= validatedData.closeTime) {
        throw new Error('Open time must be before close time');
      }
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data: validatedData,
    });

    return clinic;
  }

  // Delete clinic
  static async deleteClinic(id: string): Promise<void> {
    await prisma.clinic.delete({
      where: { id },
    });
  }

  // Search nearby clinics
  static async searchNearbyClinics(query: NearbyClinicQuery) {
    const { lat, lng, radius, page, limit } = nearbyClinicSchema.parse(query);
    const offset = (page - 1) * limit;

    // Using Haversine formula for distance calculation
    // Note: This is a simplified version. In production, you might want to use PostGIS
    const clinics = await prisma.$queryRaw<Array<Clinic & { distance: number }>>`
      SELECT *,
        (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * 
        sin(radians(latitude)))) AS distance
      FROM clinics
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance <= ${radius}
      ORDER BY distance
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count for pagination
    const totalResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM (
        SELECT *,
          (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * 
          sin(radians(latitude)))) AS distance
        FROM clinics
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance <= ${radius}
      ) as filtered_clinics
    `;

    const total = Number(totalResult[0]?.count || 0);

    // Enhance clinics with additional data
    const enhancedClinics = await Promise.all(
      clinics.map(async (clinic) => {
        const clinicWithDetails = await this.getClinicById(clinic.id);
        return {
          ...clinicWithDetails,
          distance: Math.round(clinic.distance * 10) / 10, // Round to 1 decimal place
        };
      })
    );

    return {
      data: enhancedClinics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Search clinics by text and location with enhanced filters
  static async searchClinics(query: ClinicSearchQuery) {
    const {
      city,
      district,
      name,
      specialtyIds,
      openNow,
      operatingDay,
      operatingTime,
      minRating,
      maxRating,
      sortBy,
      sortOrder,
      page,
      limit
    } = clinicSearchSchema.parse(query);

    const offset = (page - 1) * limit;
    const where: any = {};

    // Text search
    if (name) {
      where.OR = [
        { name: { contains: name, mode: 'insensitive' } },
        { description: { contains: name, mode: 'insensitive' } }
      ];
    }

    // Location filters
    if (city || district) {
      const addressFilters = [];
      if (city) addressFilters.push(city);
      if (district) addressFilters.push(district);

      where.address = {
        contains: addressFilters.join(' '),
        mode: 'insensitive',
      };
    }

    // Services/Specialties filter
    if (specialtyIds && specialtyIds.length > 0) {
      where.clinicDoctors = {
        some: {
          doctor: {
            specialtyId: {
              in: specialtyIds
            }
          }
        }
      };
    }

    // Operating day filter - find clinics with doctors working on specific day
    if (operatingDay) {
      where.clinicDoctors = {
        some: {
          ...(where.clinicDoctors?.some || {}),
          workingDays: {
            has: operatingDay
          }
        }
      };
    }

    // Operating hours filters
    if (openNow) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      where.AND = [
        { openTime: { lte: currentTime } },
        { closeTime: { gte: currentTime } }
      ];
    }

    if (operatingTime) {
      where.AND = [
        ...(where.AND || []),
        { openTime: { lte: operatingTime } },
        { closeTime: { gte: operatingTime } }
      ];
    }

    // Build orderBy clause
    let orderBy: any = { name: 'asc' };
    if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'rating') {
      // We'll sort by average rating of doctors in the clinic
      orderBy = { createdAt: 'desc' }; // Fallback, will be handled in post-processing
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        include: {
          clinicDoctors: {
            include: {
              doctor: {
                include: {
                  specialty: true,
                  reviews: true,
                },
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy,
      }),
      prisma.clinic.count({ where }),
    ]);

    // Enhance clinics with additional data and apply rating filters
    let enhancedClinics = await Promise.all(
      clinics.map(async (clinic) => {
        const clinicWithDetails = await this.getClinicById(clinic.id);
        return clinicWithDetails;
      })
    );

    // Filter by rating if specified
    if (minRating !== undefined || maxRating !== undefined) {
      enhancedClinics = enhancedClinics.filter(clinic => {
        if (!clinic) return false;
        const rating = clinic.rating || 0;
        if (minRating !== undefined && rating < minRating) return false;
        if (maxRating !== undefined && rating > maxRating) return false;
        return true;
      });
    }

    // Sort by rating if requested
    if (sortBy === 'rating') {
      enhancedClinics.sort((a, b) => {
        const ratingA = a?.rating || 0;
        const ratingB = b?.rating || 0;
        return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
      });
    }

    return {
      data: enhancedClinics.filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get available filters for clinic search
  static async getSearchFilters() {
    const cacheKey = 'clinic:search:filters';

    return await CacheService.getOrSet(
      cacheKey,
      async () => {
        const [specialties, cities, operatingHours] = await Promise.all([
      // Get all specialties available in clinics
      prisma.specialty.findMany({
        where: {
          doctors: {
            some: {
              clinicDoctors: {
                some: {}
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          icon: true,
          _count: {
            select: {
              doctors: {
                where: {
                  clinicDoctors: {
                    some: {}
                  }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),

      // Get unique cities from clinic addresses
      prisma.$queryRaw`
        SELECT DISTINCT
          TRIM(SPLIT_PART(address, ',', -1)) as city,
          COUNT(*)::int as count
        FROM "clinics"
        GROUP BY city
        ORDER BY count DESC, city ASC
        LIMIT 20
      `,

      // Get common operating hours
      prisma.clinic.groupBy({
        by: ['openTime', 'closeTime'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

        return {
          specialties: specialties.map(specialty => ({
            id: specialty.id,
            name: specialty.name,
            icon: specialty.icon,
            count: specialty._count.doctors
          })),
          cities: cities as Array<{ city: string; count: number }>,
          operatingHours: operatingHours.map(hours => ({
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            count: hours._count.id
          }))
        };
      },
      600 // Cache for 10 minutes
    );
  }

  // Get all clinics with pagination
  static async getAllClinics(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.clinic.count(),
    ]);

    // Enhance clinics with additional data
    const enhancedClinics = await Promise.all(
      clinics.map(clinic => this.getClinicById(clinic.id))
    );

    return {
      data: enhancedClinics.filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Add doctor to clinic
  static async addDoctorToClinic(clinicId: string, data: AddDoctorToClinicData): Promise<ClinicDoctor> {
    const validatedData = addDoctorToClinicSchema.parse(data);

    // Validate time format
    if (validatedData.startTime >= validatedData.endTime) {
      throw new Error('Start time must be before end time');
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: validatedData.doctorId },
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check if association already exists
    const existingAssociation = await prisma.clinicDoctor.findUnique({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId: validatedData.doctorId,
        },
      },
    });

    if (existingAssociation) {
      throw new Error('Doctor is already associated with this clinic');
    }

    const clinicDoctor = await prisma.clinicDoctor.create({
      data: {
        clinicId,
        ...validatedData,
      },
    });

    return clinicDoctor;
  }

  // Remove doctor from clinic
  static async removeDoctorFromClinic(clinicId: string, doctorId: string): Promise<void> {
    const clinicDoctor = await prisma.clinicDoctor.findUnique({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId,
        },
      },
    });

    if (!clinicDoctor) {
      throw new Error('Doctor is not associated with this clinic');
    }

    await prisma.clinicDoctor.delete({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId,
        },
      },
    });
  }

  // Update doctor schedule at clinic
  static async updateDoctorScheduleAtClinic(
    clinicId: string, 
    doctorId: string, 
    data: UpdateDoctorScheduleData
  ): Promise<ClinicDoctor> {
    const validatedData = updateDoctorScheduleSchema.parse(data);

    // Validate time format if both times are provided
    if (validatedData.startTime && validatedData.endTime) {
      if (validatedData.startTime >= validatedData.endTime) {
        throw new Error('Start time must be before end time');
      }
    }

    const clinicDoctor = await prisma.clinicDoctor.findUnique({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId,
        },
      },
    });

    if (!clinicDoctor) {
      throw new Error('Doctor is not associated with this clinic');
    }

    const updatedClinicDoctor = await prisma.clinicDoctor.update({
      where: {
        clinicId_doctorId: {
          clinicId,
          doctorId,
        },
      },
      data: validatedData,
    });

    return updatedClinicDoctor;
  }

  // Get doctors at a clinic
  static async getDoctorsAtClinic(clinicId: string): Promise<ClinicWithDoctors | null> {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        clinicDoctors: {
          include: {
            doctor: {
              select: {
                id: true,
                averageRating: true,
                totalReviews: true,
                consultationFee: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                specialty: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!clinic) {
      return null;
    }

    // Transform the result to match ClinicWithDoctors type
    const transformedClinic: ClinicWithDoctors = {
      ...clinic,
      clinicDoctors: clinic.clinicDoctors.map(cd => ({
        ...cd,
        doctor: {
          ...cd.doctor,
          consultationFee: Number(cd.doctor.consultationFee), // Convert Decimal to number
        },
      })),
    };

    return transformedClinic;
  }
}
