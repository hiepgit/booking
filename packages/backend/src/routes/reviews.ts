import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { ReviewService } from '../services/review.service.js';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../libs/prisma.js';

const router = Router();

// Validation schemas
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

    res.json(review);
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
