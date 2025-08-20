import { prisma } from '../libs/prisma.js';
import { UserRole, Gender } from '@prisma/client';

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  phone?: string;
}

export interface PatientProfileData {
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  insuranceNumber?: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export class UserService {
  /**
   * Get user profile with role-specific data
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            bloodType: true,
            allergies: true,
            emergencyContact: true,
            insuranceNumber: true,
          }
        },
        doctor: {
          select: {
            id: true,
            licenseNumber: true,
            specialtyId: true,
            experience: true,
            biography: true,
            consultationFee: true,
            averageRating: true,
            totalReviews: true,
            isAvailable: true,
            specialty: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, data: UserProfileData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        isVerified: true,
        updatedAt: true,
      }
    });

    return user;
  }

  /**
   * Update patient-specific profile data
   */
  static async updatePatientProfile(userId: string, data: PatientProfileData) {
    // First check if user is a patient
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, patient: { select: { id: true } } }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.PATIENT) {
      throw new Error('User is not a patient');
    }

    // Create patient record if it doesn't exist
    if (!user.patient) {
      await prisma.patient.create({
        data: {
          userId,
          ...data,
        }
      });
    } else {
      await prisma.patient.update({
        where: { userId },
        data: {
          ...data,
        }
      });
    }

    // Return updated profile
    return this.getUserProfile(userId);
  }

  /**
   * Calculate profile completion status
   */
  static async getProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        phone: true,
        role: true,
        patient: {
          select: {
            bloodType: true,
            allergies: true,
            emergencyContact: true,
            insuranceNumber: true,
          }
        },
        doctor: {
          select: {
            licenseNumber: true,
            specialtyId: true,
            experience: true,
            biography: true,
            consultationFee: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const requiredFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'];
    const missingFields: string[] = [];

    // Check basic profile fields
    requiredFields.forEach(field => {
      if (!user[field as keyof typeof user]) {
        missingFields.push(field);
      }
    });

    // Check role-specific fields
    if (user.role === UserRole.PATIENT && user.patient) {
      const patientRequiredFields = ['bloodType', 'emergencyContact'];
      patientRequiredFields.forEach(field => {
        if (!user.patient![field as keyof typeof user.patient]) {
          missingFields.push(`patient.${field}`);
        }
      });
    } else if (user.role === UserRole.DOCTOR && user.doctor) {
      const doctorRequiredFields = ['licenseNumber', 'specialtyId', 'experience', 'biography', 'consultationFee'];
      doctorRequiredFields.forEach(field => {
        if (!user.doctor![field as keyof typeof user.doctor]) {
          missingFields.push(`doctor.${field}`);
        }
      });
    }

    const totalFields = requiredFields.length + (user.role === UserRole.PATIENT ? 2 : user.role === UserRole.DOCTOR ? 5 : 0);
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return {
      isComplete: missingFields.length === 0,
      completionPercentage,
      missingFields,
    };
  }

  /**
   * Search users by name or email (for admin purposes)
   */
  static async searchUsers(query: string, role?: UserRole, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' as const } },
            { lastName: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ]
        },
        role ? { role } : {},
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        isActive: true,
      }
    });

    return user;
  }

  /**
   * Reactivate user account
   */
  static async reactivateUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        isActive: true,
      }
    });

    return user;
  }

  /**
   * Get user by ID with password hash
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        isActive: true,
      }
    });

    return user;
  }

  /**
   * Update user password
   */
  static async updateUserPassword(userId: string, passwordHash: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        updatedAt: true,
      }
    });

    return user;
  }
}
