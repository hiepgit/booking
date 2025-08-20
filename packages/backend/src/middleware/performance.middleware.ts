import type { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service.js';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  cacheHit?: boolean;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Keep last 1000 metrics in memory

  /**
   * Middleware to track performance metrics
   */
  static trackPerformance() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const originalSend = res.send;

      // Override res.send to capture response time
      res.send = function(body: any) {
        const responseTime = Date.now() - startTime;
        
        // Log performance metric
        PerformanceMonitor.logMetric({
          endpoint: req.path,
          method: req.method,
          responseTime,
          statusCode: res.statusCode,
          timestamp: new Date(),
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          cacheHit: res.get('X-Cache-Hit') === 'true'
        });

        // Call original send
        return originalSend.call(this, body);
      };

      next();
    };
  }

  /**
   * Log performance metric
   */
  static logMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests
    if (metric.responseTime > 1000) {
      console.warn(`🐌 Slow request detected: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }

    // Store in cache for analytics
    this.storeMetricInCache(metric);
  }

  /**
   * Store metric in cache for analytics
   */
  static async storeMetricInCache(metric: PerformanceMetrics) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const hourKey = `metrics:${today}:${new Date().getHours()}`;
      
      // Increment counters
      await CacheService.increment(`${hourKey}:requests`, 86400); // 24 hour TTL
      await CacheService.increment(`${hourKey}:total_time:${Math.floor(metric.responseTime / 100) * 100}`, 86400);
      
      if (metric.responseTime > 1000) {
        await CacheService.increment(`${hourKey}:slow_requests`, 86400);
      }

      if (metric.statusCode >= 400) {
        await CacheService.increment(`${hourKey}:errors`, 86400);
      }

      if (metric.cacheHit) {
        await CacheService.increment(`${hourKey}:cache_hits`, 86400);
      }

      // Track endpoint performance
      await CacheService.increment(`endpoint:${metric.endpoint}:requests`, 86400);
      await CacheService.increment(`endpoint:${metric.endpoint}:total_time`, 86400);
    } catch (error) {
      console.error('Error storing performance metric:', error);
    }
  }

  /**
   * Get performance statistics
   */
  static getStats() {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        cacheHitRate: 0,
        topSlowEndpoints: []
      };
    }

    const totalRequests = this.metrics.length;
    const totalResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = Math.round(totalResponseTime / totalRequests);
    const slowRequests = this.metrics.filter(m => m.responseTime > 1000).length;
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length;
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;

    // Group by endpoint for slow endpoint analysis
    const endpointStats = this.metrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = { count: 0, totalTime: 0, maxTime: 0 };
      }
      acc[key].count++;
      acc[key].totalTime += metric.responseTime;
      acc[key].maxTime = Math.max(acc[key].maxTime, metric.responseTime);
      return acc;
    }, {} as Record<string, { count: number; totalTime: number; maxTime: number }>);

    const topSlowEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: Math.round(stats.totalTime / stats.count),
        maxTime: stats.maxTime,
        requestCount: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime,
      slowRequests,
      errorRate: Math.round((errorRequests / totalRequests) * 100),
      cacheHitRate: Math.round((cacheHits / totalRequests) * 100),
      topSlowEndpoints
    };
  }

  /**
   * Get recent metrics
   */
  static getRecentMetrics(limit: number = 50) {
    return this.metrics.slice(-limit).reverse();
  }

  /**
   * Clear metrics
   */
  static clearMetrics() {
    this.metrics = [];
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    return await CacheService.getStats();
  }
}

/**
 * Middleware to add cache hit header
 */
export function cacheHitMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // This will be set by cache service when cache is hit
    res.locals.cacheHit = false;
    next();
  };
}

/**
 * Helper to mark cache hit
 */
export function markCacheHit(res: Response) {
  res.set('X-Cache-Hit', 'true');
  res.locals.cacheHit = true;
}

/**
 * Helper to mark cache miss
 */
export function markCacheMiss(res: Response) {
  res.set('X-Cache-Hit', 'false');
  res.locals.cacheHit = false;
}
