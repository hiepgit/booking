import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { SpecialtyService } from '../services/specialty.service.js';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation schemas
const SpecialtySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  icon: z.string().url('Icon must be a valid URL').optional(),
});

const SpecialtyUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().url().optional(),
});

const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

const SearchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN'
      }
    });
  }
  next();
};

/**
 * @openapi
 * /specialties:
 *   get:
 *     tags:
 *       - Specialties
 *     summary: Get all specialties
 *     description: Get list of all medical specialties with doctor counts
 *     responses:
 *       200:
 *         description: Specialties retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const specialties = await SpecialtyService.getAllSpecialties();
    res.json(specialties);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/popular:
 *   get:
 *     tags:
 *       - Specialties
 *     summary: Get popular specialties
 *     description: Get most popular specialties by doctor count
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Number of specialties to return
 *     responses:
 *       200:
 *         description: Popular specialties retrieved successfully
 */
router.get('/popular', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const specialties = await SpecialtyService.getPopularSpecialties(limit);
    res.json(specialties);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/search:
 *   get:
 *     tags:
 *       - Specialties
 *     summary: Search specialties
 *     description: Search specialties by name or description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = SearchSchema.parse(req.query);
    const specialties = await SpecialtyService.searchSpecialties(q);
    res.json(specialties);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties:
 *   post:
 *     tags:
 *       - Specialties
 *     security:
 *       - bearerAuth: []
 *     summary: Create specialty
 *     description: Create a new medical specialty (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               icon:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Specialty created successfully
 *       400:
 *         description: Validation error or specialty already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = SpecialtySchema.parse(req.body);
    const specialty = await SpecialtyService.createSpecialty(data);
    
    res.status(201).json({
      message: 'Specialty created successfully',
      specialty,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/{id}:
 *   get:
 *     tags:
 *       - Specialties
 *     summary: Get specialty by ID
 *     description: Get detailed specialty information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     responses:
 *       200:
 *         description: Specialty retrieved successfully
 *       404:
 *         description: Specialty not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const specialty = await SpecialtyService.getSpecialtyById(id);
    res.json(specialty);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/{id}:
 *   put:
 *     tags:
 *       - Specialties
 *     security:
 *       - bearerAuth: []
 *     summary: Update specialty
 *     description: Update specialty information (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               icon:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Specialty updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Specialty not found
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = SpecialtyUpdateSchema.parse(req.body);
    
    const specialty = await SpecialtyService.updateSpecialty(id, data);
    res.json({
      message: 'Specialty updated successfully',
      specialty,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/{id}:
 *   delete:
 *     tags:
 *       - Specialties
 *     security:
 *       - bearerAuth: []
 *     summary: Delete specialty
 *     description: Delete a specialty (admin only, only if no doctors are associated)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
 *     responses:
 *       200:
 *         description: Specialty deleted successfully
 *       400:
 *         description: Cannot delete specialty with associated doctors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Specialty not found
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await SpecialtyService.deleteSpecialty(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /specialties/{id}/doctors:
 *   get:
 *     tags:
 *       - Specialties
 *     summary: Get doctors by specialty
 *     description: Get all doctors in a specific specialty
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialty ID
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
 *         description: Doctors retrieved successfully
 *       404:
 *         description: Specialty not found
 */
router.get('/:id/doctors', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = PaginationSchema.parse(req.query);
    
    const result = await SpecialtyService.getDoctorsBySpecialty(id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
