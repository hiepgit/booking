import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { ReviewService } from '../services/review.service.js';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../libs/prisma.js';

const router = Router();

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Create a review
 *     description: Create a review for a doctor (patients only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - rating
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: Doctor ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or cannot review doctor
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only patients can create reviews
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { doctorId, rating, comment } = ReviewCreateSchema.parse(req.body);

    // Check if user is a patient
    if (req.user.role !== UserRole.PATIENT) {
      return res.status(403).json({
        error: {
          message: 'Only patients can create reviews',
          code: 'FORBIDDEN'
        }
      });
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (!patient) {
      return res.status(404).json({
        error: {
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        }
      });
    }

    const review = await ReviewService.createReview({
      patientId: patient.id,
      doctorId,
      rating,
      comment,
    });

    // Transform the response to flatten patient data
    const transformedReview = {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      patient: {
        id: patient.id,
        firstName: review.patient.user.firstName,
        lastName: review.patient.user.lastName,
        avatar: review.patient.user.avatar,
      },
      doctor: {
        id: review.doctorId
      }
    };

    res.status(201).json({
      message: 'Review created successfully',
      review: transformedReview,
    });
  } catch (err) {
    next(err);
  }
});

// Validation schemas
const ReviewCreateSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be at most 500 characters').optional(),
});

const ReviewUpdateSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  comment: z.string().max(500, 'Comment must be at most 500 characters').optional(),
});

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

/**
 * @openapi
 * /reviews/{id}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get review by ID
 *     description: Get detailed review information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({
      where: { id },
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
        },
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
      }
    });

    if (!review) {
      return res.status(404).json({
        error: {
          message: 'Review not found',
          code: 'REVIEW_NOT_FOUND'
        }
      });
    }

    // Transform the response to flatten patient data
    const transformedReview = {
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
        id: review.doctor.id,
        firstName: review.doctor.user.firstName,
        lastName: review.doctor.user.lastName,
        avatar: review.doctor.user.avatar,
        specialty: review.doctor.specialty?.name,
      }
    };

    res.json(transformedReview);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Update review
 *     description: Update a review (only by the patient who created it)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only update own reviews
 *       404:
 *         description: Review not found
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const data = ReviewUpdateSchema.parse(req.body);

    // Check if user is a patient
    if (req.user.role !== UserRole.PATIENT) {
      return res.status(403).json({
        error: {
          message: 'Only patients can update reviews',
          code: 'FORBIDDEN'
        }
      });
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (!patient) {
      return res.status(404).json({
        error: {
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        }
      });
    }

    const review = await ReviewService.updateReview(id, patient.id, data);
    
    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Delete review
 *     description: Delete a review (only by the patient who created it)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only delete own reviews
 *       404:
 *         description: Review not found
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    // Check if user is a patient
    if (req.user.role !== UserRole.PATIENT) {
      return res.status(403).json({
        error: {
          message: 'Only patients can delete reviews',
          code: 'FORBIDDEN'
        }
      });
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (!patient) {
      return res.status(404).json({
        error: {
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        }
      });
    }

    const result = await ReviewService.deleteReview(id, patient.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/my-reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Get current patient's reviews
 *     description: Get all reviews created by the authenticated patient
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only patients can access this endpoint
 */
router.get('/my-reviews', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { page, limit } = PaginationSchema.parse(req.query);

    // Check if user is a patient
    if (req.user.role !== UserRole.PATIENT) {
      return res.status(403).json({
        error: {
          message: 'Only patients can access this endpoint',
          code: 'FORBIDDEN'
        }
      });
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (!patient) {
      return res.status(404).json({
        error: {
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        }
      });
    }

    const result = await ReviewService.getPatientReviews(patient.id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/can-review/{doctorId}:
 *   get:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Check if patient can review doctor
 *     description: Check if the authenticated patient can review a specific doctor
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Review eligibility checked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only patients can access this endpoint
 */
router.get('/can-review/:doctorId', requireAuth, async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const userId = req.user.sub;

    // Check if user is a patient
    if (req.user.role !== UserRole.PATIENT) {
      return res.status(403).json({
        error: {
          message: 'Only patients can access this endpoint',
          code: 'FORBIDDEN'
        }
      });
    }

    // Get patient ID
    const patient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (!patient) {
      return res.status(404).json({
        error: {
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        }
      });
    }

    const result = await ReviewService.canPatientReviewDoctor(patient.id, doctorId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /reviews/recent:
 *   get:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Get recent reviews
 *     description: Get recent reviews across all doctors (admin only)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of reviews to return
 *     responses:
 *       200:
 *         description: Recent reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/recent', requireAuth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        error: {
          message: 'Admin access required',
          code: 'FORBIDDEN'
        }
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const reviews = await ReviewService.getRecentReviews(limit);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

export default router;
