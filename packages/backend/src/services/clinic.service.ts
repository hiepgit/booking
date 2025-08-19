import { PrismaClient, Clinic, ClinicDoctor } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createClinicSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  images: z.array(z.string().url()).optional().default([]),
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
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const addDoctorToClinicSchema = z.object({
  doctorId: z.string().cuid(),
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

  // Search clinics by text and location
  static async searchClinics(query: ClinicSearchQuery) {
    const { city, district, name, page, limit } = clinicSearchSchema.parse(query);
    const offset = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (city || district) {
      const addressFilters = [];
      if (city) addressFilters.push(city);
      if (district) addressFilters.push(district);
      
      where.address = {
        contains: addressFilters.join(' '),
        mode: 'insensitive',
      };
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.clinic.count({ where }),
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
              include: {
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

    return clinic;
  }
}
