import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { DoctorService } from '../services/doctor.service.js';
import { ReviewService } from '../services/review.service.js';
import { prisma } from '../libs/prisma.js';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const DoctorRegistrationSchema = z.object({
  licenseNumber: z.string().min(6, 'License number must be at least 6 characters').max(12, 'License number must be at most 12 characters'),
  specialtyId: z.string().cuid('Invalid specialty ID'),
  experience: z.number().int().min(0, 'Experience must be non-negative').max(50, 'Experience cannot exceed 50 years'),
  biography: z.string().max(1000, 'Biography must be at most 1000 characters').optional(),
  consultationFee: z.number().positive('Consultation fee must be positive'),
});

const DoctorUpdateSchema = z.object({
  licenseNumber: z.string().min(6).max(12).optional(),
  specialtyId: z.string().cuid().optional(),
  experience: z.number().int().min(0).max(50).optional(),
  biography: z.string().max(1000).optional(),
  consultationFee: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

const DoctorSearchSchema = z.object({
  q: z.string().optional(),
  specialtyId: z.string().cuid().optional(),
  city: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  available: z.boolean().optional(),
  minFee: z.number().min(0).optional(),
  maxFee: z.number().min(0).optional(),
  experience: z.number().int().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['rating', 'experience', 'fee', 'name']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const LicenseVerificationSchema = z.object({
  licenseNumber: z.string().min(6).max(12),
});

const ReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be at most 500 characters').optional(),
});

const ReviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});

const ReviewFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['rating', 'date']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * @openapi
 * /doctors/register:
 *   post:
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     summary: Register as a doctor
 *     description: Register current user as a doctor with professional information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenseNumber
 *               - specialtyId
 *               - experience
 *               - consultationFee
 *             properties:
 *               licenseNumber:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 12
 *               specialtyId:
 *                 type: string
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 50
 *               biography:
 *                 type: string
 *                 maxLength: 1000
 *               consultationFee:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Validation error or user already registered as doctor
 *       401:
 *         description: Unauthorized
 */
router.post('/register', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const data = DoctorRegistrationSchema.parse(req.body);
    
    const doctor = await DoctorService.registerDoctor({
      userId,
      ...data,
    });

    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/profile:
 *   get:
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     summary: Get current doctor profile
 *     description: Get complete doctor profile for authenticated user
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const doctor = await DoctorService.getDoctorProfile(userId);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/profile:
 *   put:
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     summary: Update doctor profile
 *     description: Update doctor professional information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseNumber:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 12
 *               specialtyId:
 *                 type: string
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 50
 *               biography:
 *                 type: string
 *                 maxLength: 1000
 *               consultationFee:
 *                 type: number
 *                 minimum: 0
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Doctor profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const data = DoctorUpdateSchema.parse(req.body);
    
    const doctor = await DoctorService.updateDoctorProfile(userId, data);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/verify-license:
 *   post:
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     summary: Verify doctor license
 *     description: Verify doctor license with medical board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenseNumber
 *             properties:
 *               licenseNumber:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 12
 *     responses:
 *       200:
 *         description: License verified successfully
 *       400:
 *         description: License verification failed
 *       401:
 *         description: Unauthorized
 */
router.post('/verify-license', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { licenseNumber } = LicenseVerificationSchema.parse(req.body);
    
    const result = await DoctorService.verifyDoctorLicense(userId, licenseNumber);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get all doctors
 *     description: Get paginated list of all doctors
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, experience, fee, name]
 *           default: rating
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'rating', sortOrder = 'desc' } = req.query;
    
    const filters = DoctorSearchSchema.parse({
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder
    });
    
    const result = await DoctorService.searchDoctors(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/search:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Search doctors
 *     description: Search and filter doctors with various criteria
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for doctor name
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *         description: Filter by specialty ID
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: minFee
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum consultation fee
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum consultation fee
 *       - in: query
 *         name: experience
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum years of experience
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, experience, fee, name]
 *           default: rating
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get('/search', async (req, res, next) => {
  try {
    const filters = DoctorSearchSchema.parse(req.query);
    const result = await DoctorService.searchDoctors(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/filters:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get search filters
 *     description: Get available filters for doctor search
 *     responses:
 *       200:
 *         description: Filters retrieved successfully
 */
router.get('/filters', async (req, res, next) => {
  try {
    const filters = await DoctorService.getSearchFilters();
    res.json(filters);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/{id}:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get doctor by ID
 *     description: Get detailed doctor information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *       404:
 *         description: Doctor not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorService.getDoctorById(id);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/{id}/stats:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get doctor statistics
 *     description: Get appointment and review statistics for a doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       404:
 *         description: Doctor not found
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await DoctorService.getDoctorStats(id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/{id}/reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get doctor reviews
 *     description: Get reviews for a specific doctor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, date]
 *           default: date
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Doctor not found
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filters = ReviewFiltersSchema.parse(req.query);
    const result = await ReviewService.getDoctorReviews(id, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /doctors/{id}/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     summary: Create doctor review
 *     description: Create a review for a doctor (patients only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
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
router.post('/:id/reviews', requireAuth, async (req, res, next) => {
  try {
    const { id: doctorId } = req.params;
    const userId = req.user.sub;
    const { rating, comment } = ReviewSchema.parse(req.body);

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

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
