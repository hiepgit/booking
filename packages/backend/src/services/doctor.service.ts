import { prisma } from '../libs/prisma.js';
import { UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface DoctorRegistrationData {
  userId: string;
  licenseNumber: string;
  specialtyId: string;
  experience: number;
  biography?: string;
  consultationFee: number;
}

export interface DoctorProfileData {
  licenseNumber?: string;
  specialtyId?: string;
  experience?: number;
  biography?: string;
  consultationFee?: number;
  isAvailable?: boolean;
}

export interface DoctorSearchFilters {
  q?: string; // Search query for name
  specialtyId?: string;
  city?: string;
  minRating?: number;
  available?: boolean;
  minFee?: number;
  maxFee?: number;
  experience?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'fee' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export class DoctorService {
  /**
   * Register a new doctor
   */
  static async registerDoctor(data: DoctorRegistrationData) {
    // Check if user exists and is not already a doctor
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { doctor: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.doctor) {
      throw new Error('User is already registered as a doctor');
    }

    // Check if license number is already taken
    const existingDoctor = await prisma.doctor.findUnique({
      where: { licenseNumber: data.licenseNumber }
    });

    if (existingDoctor) {
      throw new Error('License number already exists');
    }

    // Check if specialty exists
    const specialty = await prisma.specialty.findUnique({
      where: { id: data.specialtyId }
    });

    if (!specialty) {
      throw new Error('Specialty not found');
    }

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: data.userId,
        licenseNumber: data.licenseNumber,
        specialtyId: data.specialtyId,
        experience: data.experience,
        biography: data.biography,
        consultationFee: new Decimal(data.consultationFee),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          }
        },
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          }
        }
      }
    });

    // Update user role to DOCTOR
    await prisma.user.update({
      where: { id: data.userId },
      data: { role: UserRole.DOCTOR }
    });

    return doctor;
  }

  /**
   * Get doctor profile by user ID
   */
  static async getDoctorProfile(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            isVerified: true,
            createdAt: true,
          }
        },
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          }
        },
        clinicDoctors: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                latitude: true,
                longitude: true,
                openTime: true,
                closeTime: true,
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            patient: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Latest 5 reviews
        }
      }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return doctor;
  }

  /**
   * Get doctor profile by doctor ID
   */
  static async getDoctorById(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
          }
        },
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          }
        },
        clinicDoctors: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                latitude: true,
                longitude: true,
                openTime: true,
                closeTime: true,
              }
            }
          }
        }
      }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return doctor;
  }

  /**
   * Update doctor profile
   */
  static async updateDoctorProfile(userId: string, data: DoctorProfileData) {
    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId }
    });

    if (!existingDoctor) {
      throw new Error('Doctor not found');
    }

    // If updating license number, check for duplicates
    if (data.licenseNumber && data.licenseNumber !== existingDoctor.licenseNumber) {
      const duplicateLicense = await prisma.doctor.findUnique({
        where: { licenseNumber: data.licenseNumber }
      });

      if (duplicateLicense) {
        throw new Error('License number already exists');
      }
    }

    // If updating specialty, check if it exists
    if (data.specialtyId) {
      const specialty = await prisma.specialty.findUnique({
        where: { id: data.specialtyId }
      });

      if (!specialty) {
        throw new Error('Specialty not found');
      }
    }

    // Update doctor profile
    const updateData: any = { ...data };
    if (data.consultationFee !== undefined) {
      updateData.consultationFee = new Decimal(data.consultationFee);
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          }
        },
        specialty: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          }
        }
      }
    });

    return updatedDoctor;
  }

  /**
   * Verify doctor license
   */
  static async verifyDoctorLicense(userId: string, licenseNumber: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (doctor.licenseNumber !== licenseNumber) {
      throw new Error('License number does not match');
    }

    // In a real application, this would integrate with a medical board API
    // For now, we'll simulate verification
    const isValid = await this.validateLicenseWithMedicalBoard(licenseNumber);

    if (!isValid) {
      throw new Error('License verification failed');
    }

    // Update doctor as verified (you might want to add a verified field to the schema)
    return {
      verified: true,
      licenseNumber,
      verifiedAt: new Date(),
    };
  }

  /**
   * Search doctors with filters
   */
  static async searchDoctors(filters: DoctorSearchFilters) {
    const {
      q,
      specialtyId,
      city,
      minRating = 0,
      available,
      minFee,
      maxFee,
      experience,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isAvailable: available !== undefined ? available : undefined,
      averageRating: minRating > 0 ? { gte: minRating } : undefined,
      experience: experience ? { gte: experience } : undefined,
      consultationFee: {
        ...(minFee ? { gte: new Decimal(minFee) } : {}),
        ...(maxFee ? { lte: new Decimal(maxFee) } : {}),
      },
      specialtyId: specialtyId || undefined,
    };

    // Add text search
    if (q) {
      where.user = {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ]
      };
    }

    // Add city filter (search in clinic addresses)
    if (city) {
      where.clinicDoctors = {
        some: {
          clinic: {
            address: { contains: city, mode: 'insensitive' }
          }
        }
      };
    }

    // Clean up undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { averageRating: sortOrder };
        break;
      case 'experience':
        orderBy = { experience: sortOrder };
        break;
      case 'fee':
        orderBy = { consultationFee: sortOrder };
        break;
      case 'name':
        orderBy = { user: { firstName: sortOrder } };
        break;
      default:
        orderBy = { averageRating: 'desc' };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          specialty: {
            select: {
              id: true,
              name: true,
              icon: true,
            }
          },
          clinicDoctors: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                }
              }
            },
            take: 1, // Just get the first clinic for preview
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);

    return {
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Get available filters for doctor search
   */
  static async getSearchFilters() {
    const [specialties, cities, feeRange] = await Promise.all([
      // Get all specialties with doctor count
      prisma.specialty.findMany({
        select: {
          id: true,
          name: true,
          icon: true,
          _count: {
            select: { doctors: true }
          }
        },
        orderBy: { name: 'asc' }
      }),

      // Get unique cities from clinic addresses
      prisma.$queryRaw`
        SELECT DISTINCT 
          TRIM(SPLIT_PART(address, ',', -1)) as city,
          COUNT(*) as count
        FROM clinics c
        INNER JOIN clinic_doctors cd ON c.id = cd.clinic_id
        GROUP BY city
        ORDER BY count DESC, city ASC
        LIMIT 20
      `,

      // Get fee range
      prisma.doctor.aggregate({
        _min: { consultationFee: true },
        _max: { consultationFee: true },
      })
    ]);

    return {
      specialties: specialties.map(s => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        count: s._count.doctors,
      })),
      cities,
      feeRange: {
        min: feeRange._min.consultationFee?.toNumber() || 0,
        max: feeRange._max.consultationFee?.toNumber() || 0,
      }
    };
  }

  /**
   * Get doctor statistics
   */
  static async getDoctorStats(doctorId: string) {
    const [appointmentStats, reviewStats] = await Promise.all([
      prisma.appointment.groupBy({
        by: ['status'],
        where: { doctorId },
        _count: { status: true },
      }),
      prisma.review.aggregate({
        where: { doctorId },
        _count: { id: true },
        _avg: { rating: true },
      })
    ]);

    return {
      appointments: appointmentStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      reviews: {
        total: reviewStats._count.id,
        averageRating: reviewStats._avg.rating || 0,
      }
    };
  }

  /**
   * Simulate license validation with medical board
   * In production, this would call an external API
   */
  private static async validateLicenseWithMedicalBoard(licenseNumber: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation: license should be alphanumeric and 6-12 characters
    const licenseRegex = /^[A-Z0-9]{6,12}$/;
    return licenseRegex.test(licenseNumber);
  }
}
