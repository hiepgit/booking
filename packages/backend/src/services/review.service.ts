import { prisma } from '../libs/prisma.js';

export interface ReviewData {
  patientId: string;
  doctorId: string;
  rating: number;
  comment?: string;
}

export interface ReviewFilters {
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(data: ReviewData) {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check if patient has already reviewed this doctor
    const existingReview = await prisma.review.findUnique({
      where: {
        patientId_doctorId: {
          patientId: data.patientId,
          doctorId: data.doctorId,
        }
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this doctor');
    }

    // Check if patient has had an appointment with this doctor
    const hasAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        status: 'COMPLETED',
      }
    });

    if (!hasAppointment) {
      throw new Error('You can only review doctors you have had appointments with');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
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
      }
    });

    // Update doctor's average rating and total reviews
    await this.updateDoctorRating(data.doctorId);

    return review;
  }

  /**
   * Get reviews for a doctor
   */
  static async getDoctorReviews(doctorId: string, filters: ReviewFilters = {}) {
    const {
      rating,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      doctorId,
      ...(rating ? { rating } : {}),
    };

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: sortOrder };
        break;
      case 'date':
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total, ratingStats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      this.getDoctorRatingStats(doctorId),
    ]);

    // Transform reviews to flatten patient data
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      patient: {
        id: review.patient.id,
        firstName: review.patient.user.firstName,
        lastName: review.patient.user.lastName,
        avatar: review.patient.user.avatar,
      },
      doctor: {
        id: review.doctorId
      }
    }));

    return {
      data: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: ratingStats,
    };
  }

  /**
   * Update a review
   */
  static async updateReview(reviewId: string, patientId: string, data: { rating?: number; comment?: string }) {
    // Check if review exists and belongs to the patient
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.patientId !== patientId) {
      throw new Error('You can only update your own reviews');
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
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
      }
    });

    // Update doctor's average rating if rating changed
    if (data.rating !== undefined) {
      await this.updateDoctorRating(review.doctorId);
    }

    return updatedReview;
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string, patientId: string) {
    // Check if review exists and belongs to the patient
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.patientId !== patientId) {
      throw new Error('You can only delete your own reviews');
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update doctor's average rating
    await this.updateDoctorRating(review.doctorId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get rating statistics for a doctor
   */
  static async getDoctorRatingStats(doctorId: string) {
    const [ratingDistribution, averageRating] = await Promise.all([
      prisma.review.groupBy({
        by: ['rating'],
        where: { doctorId },
        _count: { rating: true },
        orderBy: { rating: 'desc' },
      }),
      prisma.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: { id: true },
      })
    ]);

    // Create rating distribution object
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return {
      averageRating: averageRating._avg.rating || 0,
      totalReviews: averageRating._count.id,
      distribution,
    };
  }

  /**
   * Get patient's reviews
   */
  static async getPatientReviews(patientId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { patientId },
        include: {
          doctor: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              },
              specialty: {
                select: {
                  name: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { patientId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Check if patient can review doctor
   */
  static async canPatientReviewDoctor(patientId: string, doctorId: string) {
    // Check if patient has already reviewed this doctor
    const existingReview = await prisma.review.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId,
        }
      }
    });

    if (existingReview) {
      return {
        canReview: false,
        reason: 'Already reviewed',
        existingReview,
      };
    }

    // Check if patient has had a completed appointment with this doctor
    const completedAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        doctorId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!completedAppointment) {
      return {
        canReview: false,
        reason: 'No completed appointments',
      };
    }

    return {
      canReview: true,
      lastAppointment: completedAppointment,
    };
  }

  /**
   * Update doctor's average rating and total reviews
   */
  private static async updateDoctorRating(doctorId: string) {
    const stats = await prisma.review.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      }
    });
  }

  /**
   * Get recent reviews across all doctors (for admin dashboard)
   */
  static async getRecentReviews(limit = 10) {
    const reviews = await prisma.review.findMany({
      include: {
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
        },
        doctor: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            specialty: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return reviews;
  }
}
