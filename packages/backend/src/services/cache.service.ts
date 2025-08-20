import Redis from 'ioredis';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export class CacheService {
  private static redis: Redis | null = null;
  private static isConnected = false;

  /**
   * Initialize Redis connection
   */
  static async initialize() {
    try {
      if (env.REDIS_URL) {
        this.redis = new Redis(env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
          this.isConnected = true;
        });

        this.redis.on('error', (error) => {
          console.error('❌ Redis connection error:', error);
          this.isConnected = false;
        });

        this.redis.on('close', () => {
          console.log('🔌 Redis connection closed');
          this.isConnected = false;
        });

        await this.redis.connect();
      } else {
        console.log('⚠️ Redis URL not configured, caching disabled');
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if cache is available
   */
  static isAvailable(): boolean {
    return this.redis !== null && this.isConnected;
  }

  /**
   * Generate cache key
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${Buffer.from(paramString).toString('base64')}`;
  }

  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const cached = await this.redis!.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  static async set(key: string, data: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.redis!.setex(key, ttlSeconds, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  static async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.redis!.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.redis!.keys(pattern);
      if (keys.length > 0) {
        await this.redis!.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Get or set cached data
   */
  static async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch data
    const data = await fetchFunction();
    
    // Cache the result
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  /**
   * Increment counter
   */
  static async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const result = await this.redis!.incr(key);
      if (ttlSeconds && result === 1) {
        await this.redis!.expire(key, ttlSeconds);
      }
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Add to set
   */
  static async addToSet(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.redis!.sadd(key, value);
      if (ttlSeconds) {
        await this.redis!.expire(key, ttlSeconds);
      }
      return true;
    } catch (error) {
      console.error('Cache add to set error:', error);
      return false;
    }
  }

  /**
   * Get set members
   */
  static async getSetMembers(key: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      return await this.redis!.smembers(key);
    } catch (error) {
      console.error('Cache get set members error:', error);
      return [];
    }
  }

  /**
   * Close Redis connection
   */
  static async close() {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    if (!this.isAvailable()) {
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 0
      };
    }

    try {
      const info = await this.redis!.info('memory');
      const keyCount = await this.redis!.dbsize();
      
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        connected: this.isConnected,
        keyCount,
        memoryUsage
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 0
      };
    }
  }
}
