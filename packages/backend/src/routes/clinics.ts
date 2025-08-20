import { Router } from 'express';
import { ClinicController } from '../controllers/clinic.controller.js';
import { requireAuth, requireRole } from '../security/requireAuth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Clinic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the clinic
 *         name:
 *           type: string
 *           description: Name of the clinic
 *         address:
 *           type: string
 *           description: Full address of the clinic
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email address
 *         latitude:
 *           type: number
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           description: Longitude coordinate
 *         openTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Opening time in HH:mm format
 *         closeTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Closing time in HH:mm format
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Array of image URLs
 *         description:
 *           type: string
 *           description: Description of the clinic
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ClinicWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Clinic'
 *         - type: object
 *           properties:
 *             doctorCount:
 *               type: integer
 *               description: Number of doctors at this clinic
 *             specialties:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *             rating:
 *               type: number
 *               description: Average rating from all doctors
 *             totalReviews:
 *               type: integer
 *               description: Total number of reviews
 *             distance:
 *               type: number
 *               description: Distance in kilometers (for nearby search)
 *     
 *     CreateClinicRequest:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
 *         - openTime
 *         - closeTime
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *         address:
 *           type: string
 *           minLength: 1
 *         phone:
 *           type: string
 *           minLength: 1
 *         email:
 *           type: string
 *           format: email
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         openTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         closeTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         description:
 *           type: string
 *     
 *     AddDoctorToClinicRequest:
 *       type: object
 *       required:
 *         - doctorId
 *         - workingDays
 *         - startTime
 *         - endTime
 *       properties:
 *         doctorId:
 *           type: string
 *         workingDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *         startTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         endTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 */

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     summary: Get all clinics with pagination
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of clinics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClinicWithDetails'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *   post:
 *     summary: Create a new clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClinicRequest'
 *     responses:
 *       201:
 *         description: Clinic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Clinic'
 */
router.get('/', requireAuth, ClinicController.getAllClinics);
router.post('/', requireAuth, requireRole(['ADMIN']), ClinicController.createClinic);

/**
 * @swagger
 * /api/clinics/nearby:
 *   get:
 *     summary: Search for nearby clinics
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 0.1
 *           maximum: 50
 *           default: 5
 *         description: Search radius in kilometers
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of nearby clinics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClinicWithDetails'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/nearby', requireAuth, ClinicController.searchNearbyClinics);

/**
 * @swagger
 * /api/clinics/search/filters:
 *   get:
 *     summary: Get available search filters for clinics
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available search filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     specialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     operatingHours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           openTime:
 *                             type: string
 *                           closeTime:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/search/filters', requireAuth, ClinicController.getSearchFilters);

/**
 * @swagger
 * /api/clinics/search:
 *   get:
 *     summary: Search clinics by text and location
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name to filter by
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: District name to filter by
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Clinic name to search for
 *       - in: query
 *         name: specialtyIds
 *         schema:
 *           type: string
 *         description: Comma-separated specialty IDs to filter by services
 *       - in: query
 *         name: openNow
 *         schema:
 *           type: boolean
 *         description: Filter by clinics currently open
 *       - in: query
 *         name: operatingDay
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *         description: Filter by operating day
 *       - in: query
 *         name: operatingTime
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Filter by operating time (HH:mm format)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Maximum rating filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rating, distance, relevance]
 *           default: relevance
 *         description: Sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of matching clinics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClinicWithDetails'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/search', requireAuth, ClinicController.searchClinics);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     summary: Get clinic by ID
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *     responses:
 *       200:
 *         description: Clinic details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ClinicWithDetails'
 *       404:
 *         description: Clinic not found
 *   put:
 *     summary: Update clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClinicRequest'
 *     responses:
 *       200:
 *         description: Clinic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Clinic'
 *       404:
 *         description: Clinic not found
 *   delete:
 *     summary: Delete clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *     responses:
 *       200:
 *         description: Clinic deleted successfully
 *       404:
 *         description: Clinic not found
 */
router.get('/:id', requireAuth, ClinicController.getClinicById);
router.put('/:id', requireAuth, requireRole(['ADMIN']), ClinicController.updateClinic);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), ClinicController.deleteClinic);

/**
 * @swagger
 * /api/clinics/{id}/doctors:
 *   get:
 *     summary: Get all doctors at a clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *     responses:
 *       200:
 *         description: List of doctors at the clinic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     clinicDoctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           workingDays:
 *                             type: array
 *                             items:
 *                               type: string
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                                   avatar:
 *                                     type: string
 *                               specialty:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                               averageRating:
 *                                 type: number
 *                               totalReviews:
 *                                 type: integer
 *                               consultationFee:
 *                                 type: number
 *       404:
 *         description: Clinic not found
 *   post:
 *     summary: Add a doctor to the clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDoctorToClinicRequest'
 *     responses:
 *       201:
 *         description: Doctor added to clinic successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     clinicId:
 *                       type: string
 *                     doctorId:
 *                       type: string
 *                     workingDays:
 *                       type: array
 *                       items:
 *                         type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *       404:
 *         description: Clinic or doctor not found
 *       409:
 *         description: Doctor already associated with clinic
 */
router.get('/:id/doctors', requireAuth, ClinicController.getDoctorsAtClinic);
router.post('/:id/doctors', requireAuth, requireRole(['ADMIN', 'DOCTOR']), ClinicController.addDoctorToClinic);

/**
 * @swagger
 * /api/clinics/{clinicId}/doctors/{doctorId}:
 *   put:
 *     summary: Update doctor schedule at clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *       - in: path
 *         name: doctorId
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
 *             properties:
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *     responses:
 *       200:
 *         description: Doctor schedule updated successfully
 *       404:
 *         description: Clinic or doctor association not found
 *   delete:
 *     summary: Remove doctor from clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic ID
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor removed from clinic successfully
 *       404:
 *         description: Doctor association not found
 */
router.put('/:clinicId/doctors/:doctorId', requireAuth, requireRole(['ADMIN', 'DOCTOR']), ClinicController.updateDoctorScheduleAtClinic);
router.delete('/:clinicId/doctors/:doctorId', requireAuth, requireRole(['ADMIN', 'DOCTOR']), ClinicController.removeDoctorFromClinic);

export default router;
