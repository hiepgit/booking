import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';
import { requireAuth } from '../security/requireAuth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the appointment
 *         patientId:
 *           type: string
 *           description: ID of the patient
 *         doctorId:
 *           type: string
 *           description: ID of the doctor
 *         clinicId:
 *           type: string
 *           description: ID of the clinic (optional)
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *           description: Date of the appointment
 *         startTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Start time in HH:mm format
 *         endTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: End time in HH:mm format
 *         type:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           description: Type of appointment
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *           description: Current status of the appointment
 *         symptoms:
 *           type: string
 *           description: Patient's symptoms
 *         notes:
 *           type: string
 *           description: Additional notes
 *         meetingUrl:
 *           type: string
 *           description: URL for online consultations
 *         meetingId:
 *           type: string
 *           description: Meeting ID for online consultations
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateAppointment:
 *       type: object
 *       required:
 *         - doctorId
 *         - appointmentDate
 *         - startTime
 *         - endTime
 *       properties:
 *         doctorId:
 *           type: string
 *           description: ID of the doctor
 *         clinicId:
 *           type: string
 *           description: ID of the clinic (optional)
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *           description: Date of the appointment (must be in the future)
 *         startTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Start time in HH:mm format
 *         endTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: End time in HH:mm format
 *         type:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           default: OFFLINE
 *           description: Type of appointment
 *         symptoms:
 *           type: string
 *           maxLength: 1000
 *           description: Patient's symptoms
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Additional notes
 *     UpdateAppointment:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *           description: New status of the appointment
 *         symptoms:
 *           type: string
 *           maxLength: 1000
 *           description: Updated symptoms
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Updated notes
 *         meetingUrl:
 *           type: string
 *           format: uri
 *           description: Meeting URL for online consultations
 *         meetingId:
 *           type: string
 *           maxLength: 100
 *           description: Meeting ID for online consultations
 *     AvailableSlot:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           description: Start time of the slot
 *         endTime:
 *           type: string
 *           description: End time of the slot
 *         clinicId:
 *           type: string
 *           description: ID of the clinic
 *         clinicName:
 *           type: string
 *           description: Name of the clinic
 */

/**
 * @swagger
 * /appointments/available-slots:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get available time slots for a doctor
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date to check availability (must be in the future)
 *     responses:
 *       200:
 *         description: Available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AvailableSlot'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     doctorId:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     totalSlots:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 */
router.get('/available-slots', AppointmentController.getAvailableSlots);

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Create a new appointment (patients only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or business rule violation
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only patients can create appointments
 *       409:
 *         description: Appointment conflict
 */
router.post('/', requireAuth, AppointmentController.createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', requireAuth, AppointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Update appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Validation error or invalid status transition
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Appointment not found
 */
router.put('/:id', requireAuth, AppointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Cancel appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Cannot cancel appointment
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Appointment not found
 */
router.post('/:id/cancel', requireAuth, AppointmentController.cancelAppointment);

/**
 * @swagger
 * /appointments/{id}/confirm:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Confirm appointment (doctors only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *       400:
 *         description: Only pending appointments can be confirmed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can confirm appointments
 *       404:
 *         description: Appointment not found
 */
router.post('/:id/confirm', requireAuth, AppointmentController.confirmAppointment);

/**
 * @swagger
 * /appointments/patient/my:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get patient's appointments (patients only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by appointment status
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
 *         description: Patient's appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only patients can access patient appointments
 */
router.get('/patient/my', requireAuth, AppointmentController.getPatientAppointments);

/**
 * @swagger
 * /appointments/doctor/my:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get doctor's appointments (doctors only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by appointment status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter appointments to this date
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
 *         description: Doctor's appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can access doctor appointments
 */
router.get('/doctor/my', requireAuth, AppointmentController.getDoctorAppointments);



export default router;
