import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../security/requireAuth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Notification ID
 *         userId:
 *           type: string
 *           description: User ID
 *         type:
 *           type: string
 *           enum: [APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_REFUNDED, DOCTOR_AVAILABLE, DOCTOR_UNAVAILABLE, NEW_APPOINTMENT_REQUEST, SYSTEM_MAINTENANCE, SYSTEM_UPDATE, WELCOME, VERIFICATION_REMINDER, GENERAL]
 *           description: Notification type
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         data:
 *           type: object
 *           description: Additional notification data
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [IN_APP, EMAIL, SMS, PUSH]
 *           description: Delivery channels
 *         priority:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT]
 *           description: Notification priority
 *         isRead:
 *           type: boolean
 *           description: Read status
 *         isDelivered:
 *           type: boolean
 *           description: Delivery status
 *         scheduledFor:
 *           type: string
 *           format: date-time
 *           description: Scheduled delivery time
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Actual delivery time
 *         appointmentId:
 *           type: string
 *           description: Related appointment ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     NotificationPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Preference ID
 *         userId:
 *           type: string
 *           description: User ID
 *         type:
 *           type: string
 *           enum: [APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_REFUNDED, DOCTOR_AVAILABLE, DOCTOR_UNAVAILABLE, NEW_APPOINTMENT_REQUEST, SYSTEM_MAINTENANCE, SYSTEM_UPDATE, WELCOME, VERIFICATION_REMINDER, GENERAL]
 *           description: Notification type
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [IN_APP, EMAIL, SMS, PUSH]
 *           description: Preferred delivery channels
 *         enabled:
 *           type: boolean
 *           description: Whether notifications are enabled for this type
 *         reminderTiming:
 *           type: array
 *           items:
 *             type: integer
 *           description: Reminder timing in minutes before appointment
 *         quietHoursStart:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Quiet hours start time (HH:mm)
 *         quietHoursEnd:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Quiet hours end time (HH:mm)
 *         timezone:
 *           type: string
 *           description: User timezone
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get user notifications
 *     description: Get paginated list of user's notifications with optional filtering
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
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_REFUNDED, DOCTOR_AVAILABLE, DOCTOR_UNAVAILABLE, NEW_APPOINTMENT_REQUEST, SYSTEM_MAINTENANCE, SYSTEM_UPDATE, WELCOME, VERIFICATION_REMINDER, GENERAL]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
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
 */
router.get('/', requireAuth, NotificationController.getUserNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
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
 *                     count:
 *                       type: integer
 *                       description: Number of unread notifications
 *       401:
 *         description: Authentication required
 */
router.get('/unread-count', requireAuth, NotificationController.getUnreadCount);

/**
 * @swagger
 * /notifications/preferences:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get notification preferences
 *     description: Get user's notification preferences for all notification types
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationPreference'
 *       401:
 *         description: Authentication required
 */
router.get('/preferences', requireAuth, NotificationController.getPreferences);

/**
 * @swagger
 * /notifications/preferences:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Update notification preferences
 *     description: Update user's notification preferences for a specific notification type
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - channels
 *               - enabled
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_REFUNDED, DOCTOR_AVAILABLE, DOCTOR_UNAVAILABLE, NEW_APPOINTMENT_REQUEST, SYSTEM_MAINTENANCE, SYSTEM_UPDATE, WELCOME, VERIFICATION_REMINDER, GENERAL]
 *                 description: Notification type
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [IN_APP, EMAIL, SMS, PUSH]
 *                 description: Preferred delivery channels
 *               enabled:
 *                 type: boolean
 *                 description: Whether notifications are enabled for this type
 *               reminderTiming:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Reminder timing in minutes before appointment
 *               quietHoursStart:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Quiet hours start time (HH:mm)
 *               quietHoursEnd:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Quiet hours end time (HH:mm)
 *               timezone:
 *                 type: string
 *                 description: User timezone
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       400:
 *         description: Invalid preference data
 *       401:
 *         description: Authentication required
 */
router.put('/preferences', requireAuth, NotificationController.updatePreferences);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
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
 *                     updatedCount:
 *                       type: integer
 *                       description: Number of notifications marked as read
 *       401:
 *         description: Authentication required
 */
router.post('/mark-all-read', requireAuth, NotificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', requireAuth, NotificationController.markAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', requireAuth, NotificationController.deleteNotification);

// Admin routes
/**
 * @swagger
 * /notifications/admin/create:
 *   post:
 *     tags:
 *       - Notifications (Admin)
 *     summary: Create notification (Admin only)
 *     description: Create and send notifications to users (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Target user ID (optional - if not provided, sends to all users)
 *               type:
 *                 type: string
 *                 enum: [APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_REFUNDED, DOCTOR_AVAILABLE, DOCTOR_UNAVAILABLE, NEW_APPOINTMENT_REQUEST, SYSTEM_MAINTENANCE, SYSTEM_UPDATE, WELCOME, VERIFICATION_REMINDER, GENERAL]
 *                 description: Notification type
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Notification message
 *               data:
 *                 type: object
 *                 description: Additional notification data
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [IN_APP, EMAIL, SMS, PUSH]
 *                 description: Delivery channels
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *                 description: Notification priority
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *                 description: Schedule notification for later delivery
 *               appointmentId:
 *                 type: string
 *                 description: Related appointment ID
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Notification'
 *                     - type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                         notifications:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid notification data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post('/admin/create', requireAuth, NotificationController.createNotification);

/**
 * @swagger
 * /notifications/admin/statistics:
 *   get:
 *     tags:
 *       - Notifications (Admin)
 *     summary: Get notification statistics (Admin only)
 *     description: Get comprehensive notification statistics and analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       description: Total notifications sent
 *                     today:
 *                       type: integer
 *                       description: Notifications sent today
 *                     unread:
 *                       type: integer
 *                       description: Total unread notifications
 *                     delivered:
 *                       type: integer
 *                       description: Successfully delivered notifications
 *                     deliveryRate:
 *                       type: string
 *                       description: Delivery success rate percentage
 *                     typeDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           _count:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: integer
 *                     reminders:
 *                       type: object
 *                       properties:
 *                         sentToday:
 *                           type: integer
 *                         pendingToday:
 *                           type: integer
 *                         failedToday:
 *                           type: integer
 *                         scheduledReminders:
 *                           type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/admin/statistics', requireAuth, NotificationController.getStatistics);

/**
 * @swagger
 * /notifications/admin/templates:
 *   get:
 *     tags:
 *       - Notifications (Admin)
 *     summary: Get email templates (Admin only)
 *     description: Get all available email notification templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       channel:
 *                         type: string
 *                       language:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       htmlBody:
 *                         type: string
 *                       variables:
 *                         type: object
 *                       isActive:
 *                         type: boolean
 *                       version:
 *                         type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/admin/templates', requireAuth, NotificationController.getEmailTemplates);

export default router;
