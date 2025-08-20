import { Router } from 'express';
import { requireAuth, requireRole } from '../security/requireAuth.js';
import { PerformanceMonitor } from '../middleware/performance.middleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceStats:
 *       type: object
 *       properties:
 *         totalRequests:
 *           type: integer
 *           description: Total number of requests
 *         averageResponseTime:
 *           type: integer
 *           description: Average response time in milliseconds
 *         slowRequests:
 *           type: integer
 *           description: Number of slow requests (>1000ms)
 *         errorRate:
 *           type: integer
 *           description: Error rate percentage
 *         cacheHitRate:
 *           type: integer
 *           description: Cache hit rate percentage
 *         topSlowEndpoints:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *               averageTime:
 *                 type: integer
 *               maxTime:
 *                 type: integer
 *               requestCount:
 *                 type: integer
 *     
 *     CacheStats:
 *       type: object
 *       properties:
 *         connected:
 *           type: boolean
 *           description: Whether cache is connected
 *         keyCount:
 *           type: integer
 *           description: Number of keys in cache
 *         memoryUsage:
 *           type: integer
 *           description: Memory usage in bytes
 */

/**
 * @swagger
 * /api/performance/stats:
 *   get:
 *     summary: Get performance statistics (Admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PerformanceStats'
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/stats', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const stats = PerformanceMonitor.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get performance stats error:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get performance statistics'
      }
    });
  }
});

/**
 * @swagger
 * /api/performance/cache:
 *   get:
 *     summary: Get cache statistics (Admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CacheStats'
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/cache', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const cacheStats = await PerformanceMonitor.getCacheStats();
    
    res.json({
      success: true,
      data: cacheStats
    });
  } catch (error: any) {
    console.error('Get cache stats error:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get cache statistics'
      }
    });
  }
});

/**
 * @swagger
 * /api/performance/metrics:
 *   get:
 *     summary: Get recent performance metrics (Admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of recent metrics to return
 *     responses:
 *       200:
 *         description: Recent performance metrics
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
 *                       endpoint:
 *                         type: string
 *                       method:
 *                         type: string
 *                       responseTime:
 *                         type: integer
 *                       statusCode:
 *                         type: integer
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       cacheHit:
 *                         type: boolean
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/metrics', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const metrics = PerformanceMonitor.getRecentMetrics(limit);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('Get performance metrics error:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get performance metrics'
      }
    });
  }
});

/**
 * @swagger
 * /api/performance/clear:
 *   post:
 *     summary: Clear performance metrics (Admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Access denied - Admin only
 */
router.post('/clear', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    PerformanceMonitor.clearMetrics();
    
    res.json({
      success: true,
      message: 'Performance metrics cleared successfully'
    });
  } catch (error: any) {
    console.error('Clear performance metrics error:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear performance metrics'
      }
    });
  }
});

export default router;
