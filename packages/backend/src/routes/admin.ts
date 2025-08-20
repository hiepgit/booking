import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { SchedulerService } from '../services/scheduler.service.js';
import { CleanupService } from '../services/cleanup.service.js';

const router = Router();

/**
 * @swagger
 * /admin/cleanup/stats:
 *   get:
 *     summary: Get cleanup statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unverifiedUsersCount:
 *                   type: number
 *                 expiredOtpRequestsCount:
 *                   type: number
 *                 oldestUnverifiedUser:
 *                   type: string
 *                   format: date-time
 *                 nextCleanupTime:
 *                   type: string
 *                   format: date-time
 *                 schedulerRunning:
 *                   type: boolean
 */
router.get('/cleanup/stats', requireAuth, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: { message: 'Access denied. Admin role required.' } 
      });
    }

    const stats = await SchedulerService.getCleanupStats();
    
    res.json({
      ...stats,
      schedulerRunning: SchedulerService.isSchedulerRunning()
    });
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ 
      error: { message: 'Failed to get cleanup statistics' } 
    });
  }
});

/**
 * @swagger
 * /admin/cleanup/run:
 *   post:
 *     summary: Run cleanup task manually
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     unverifiedUsers:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: number
 *                         deletedUsers:
 *                           type: array
 *                           items:
 *                             type: string
 *                     expiredOtpRequests:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: number
 */
router.post('/cleanup/run', requireAuth, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: { message: 'Access denied. Admin role required.' } 
      });
    }

    console.log(`🧹 Manual cleanup triggered by admin: ${req.user.email}`);
    
    const results = await SchedulerService.runCleanupNow();
    
    res.json({
      message: 'Cleanup completed successfully',
      results
    });
  } catch (error) {
    console.error('Error running manual cleanup:', error);
    res.status(500).json({ 
      error: { message: 'Failed to run cleanup task' } 
    });
  }
});

/**
 * @swagger
 * /admin/cleanup/unverified-users:
 *   get:
 *     summary: Get list of unverified users that will be cleaned up
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unverified users
 */
router.get('/cleanup/unverified-users', requireAuth, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: { message: 'Access denied. Admin role required.' } 
      });
    }

    // This is a preview - don't actually delete
    const stats = await CleanupService.getCleanupStatistics();
    
    res.json({
      message: 'Preview of cleanup candidates',
      statistics: stats
    });
  } catch (error) {
    console.error('Error getting unverified users:', error);
    res.status(500).json({ 
      error: { message: 'Failed to get unverified users' } 
    });
  }
});

/**
 * @swagger
 * /admin/scheduler/status:
 *   get:
 *     summary: Get scheduler status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduler status
 */
router.get('/scheduler/status', requireAuth, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: { message: 'Access denied. Admin role required.' } 
      });
    }

    res.json({
      isRunning: SchedulerService.isSchedulerRunning(),
      nextCleanupTime: SchedulerService.getNextCleanupTime()
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ 
      error: { message: 'Failed to get scheduler status' } 
    });
  }
});

export { router as adminRoutes };
