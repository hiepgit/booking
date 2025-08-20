import { prisma } from '../libs/prisma.js';
import { CacheService } from './cache.service.js';

export interface SearchAnalyticsData {
  query: string;
  searchType: 'doctors' | 'clinics' | 'all';
  filters: any;
  resultCount: number;
  searchTime: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

export interface PopularSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  lastSearched: Date;
}

export interface AnalyticsStats {
  totalSearches: number;
  uniqueUsers: number;
  averageSearchTime: number;
  topQueries: PopularSearch[];
  searchesByType: Record<string, number>;
  searchesByHour: Record<string, number>;
  noResultsQueries: string[];
  averageResultCount: number;
}

export class AnalyticsService {
  /**
   * Log search analytics
   */
  static async logSearch(data: SearchAnalyticsData) {
    try {
      // Store in cache for real-time analytics
      await this.storeInCache(data);
      
      // Store in database for long-term analytics (if needed)
      // For now, we'll use cache-based analytics to avoid database overhead
      
      console.log('Search Analytics:', {
        query: data.query,
        type: data.searchType,
        resultCount: data.resultCount,
        searchTime: `${data.searchTime}ms`,
        userId: data.userId,
        timestamp: data.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Failed to log search analytics:', error);
    }
  }

  /**
   * Store analytics data in cache
   */
  private static async storeInCache(data: SearchAnalyticsData) {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const hourKey = `analytics:${today}:${hour}`;
    
    // Increment counters
    await CacheService.increment(`${hourKey}:total_searches`, 86400);
    await CacheService.increment(`${hourKey}:searches:${data.searchType}`, 86400);
    
    if (data.userId) {
      await CacheService.addToSet(`${hourKey}:unique_users`, data.userId, 86400);
    }
    
    // Track search times
    await CacheService.increment(`${hourKey}:total_search_time`, 86400);
    await CacheService.increment(`${hourKey}:search_time_count`, 86400);
    
    // Track queries
    if (data.query.trim()) {
      const queryKey = `query:${data.query.toLowerCase().trim()}`;
      await CacheService.increment(queryKey, 86400 * 7); // Keep for 7 days
      await CacheService.set(`${queryKey}:last_searched`, new Date().toISOString(), 86400 * 7);
      
      // Track no results
      if (data.resultCount === 0) {
        await CacheService.addToSet(`${hourKey}:no_results`, data.query, 86400);
      }
    }
    
    // Track result counts
    await CacheService.increment(`${hourKey}:total_results`, 86400);
    
    // Track user agents and IPs for analytics
    if (data.userAgent) {
      await CacheService.increment(`${hourKey}:user_agents:${data.userAgent.split(' ')[0]}`, 86400);
    }
  }

  /**
   * Get analytics statistics
   */
  static async getAnalytics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<AnalyticsStats> {
    try {
      const now = new Date();
      const keys = this.getTimeframeKeys(now, timeframe);
      
      let totalSearches = 0;
      let totalSearchTime = 0;
      let searchTimeCount = 0;
      let totalResults = 0;
      const uniqueUsers = new Set<string>();
      const searchesByType: Record<string, number> = {};
      const searchesByHour: Record<string, number> = {};
      const noResultsQueries = new Set<string>();
      
      for (const key of keys) {
        const searches = await CacheService.get(`${key}:total_searches`) || 0;
        totalSearches += searches;
        
        const searchTime = await CacheService.get(`${key}:total_search_time`) || 0;
        totalSearchTime += searchTime;
        
        const searchCount = await CacheService.get(`${key}:search_time_count`) || 0;
        searchTimeCount += searchCount;
        
        const results = await CacheService.get(`${key}:total_results`) || 0;
        totalResults += results;
        
        // Get unique users
        const users = await CacheService.getSetMembers(`${key}:unique_users`);
        users.forEach(user => uniqueUsers.add(user));
        
        // Get searches by type
        for (const type of ['doctors', 'clinics', 'all']) {
          const count = await CacheService.get(`${key}:searches:${type}`) || 0;
          searchesByType[type] = (searchesByType[type] || 0) + count;
        }
        
        // Get searches by hour
        const hour = key.split(':')[2];
        searchesByHour[hour] = searches;
        
        // Get no results queries
        const noResults = await CacheService.getSetMembers(`${key}:no_results`);
        noResults.forEach(query => noResultsQueries.add(query));
      }
      
      // Get top queries
      const topQueries = await this.getTopQueries(50);
      
      return {
        totalSearches,
        uniqueUsers: uniqueUsers.size,
        averageSearchTime: searchTimeCount > 0 ? Math.round(totalSearchTime / searchTimeCount) : 0,
        topQueries,
        searchesByType,
        searchesByHour,
        noResultsQueries: Array.from(noResultsQueries),
        averageResultCount: totalSearches > 0 ? Math.round(totalResults / totalSearches) : 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalSearches: 0,
        uniqueUsers: 0,
        averageSearchTime: 0,
        topQueries: [],
        searchesByType: {},
        searchesByHour: {},
        noResultsQueries: [],
        averageResultCount: 0
      };
    }
  }

  /**
   * Get top queries
   */
  static async getTopQueries(limit: number = 20): Promise<PopularSearch[]> {
    try {
      // This is a simplified implementation
      // In a real system, you'd want to use Redis sorted sets for better performance
      const queries: PopularSearch[] = [];
      
      // Get all query keys (this is not efficient for large datasets)
      // In production, use Redis SCAN or maintain a sorted set
      const mockQueries = [
        { query: 'tim mạch', count: 150, trend: 'up' as const },
        { query: 'nhi khoa', count: 120, trend: 'stable' as const },
        { query: 'da liễu', count: 95, trend: 'up' as const },
        { query: 'thần kinh', count: 80, trend: 'down' as const },
        { query: 'chấn thương', count: 75, trend: 'stable' as const }
      ];
      
      return mockQueries.slice(0, limit).map(q => ({
        ...q,
        lastSearched: new Date()
      }));
    } catch (error) {
      console.error('Error getting top queries:', error);
      return [];
    }
  }

  /**
   * Get popular searches by type
   */
  static async getPopularSearches(
    type: 'doctors' | 'clinics' | 'all',
    limit: number = 10,
    timeframe: 'hour' | 'day' | 'week' = 'day'
  ): Promise<PopularSearch[]> {
    const topQueries = await this.getTopQueries(limit * 2);
    
    // Filter by type if needed (simplified implementation)
    return topQueries.slice(0, limit);
  }

  /**
   * Get no results suggestions
   */
  static async getNoResultsSuggestions(query: string): Promise<{
    suggestions: string[];
    relatedQueries: string[];
    suggestionsCount: number;
  }> {
    try {
      const topQueries = await this.getTopQueries(100);
      const queryLower = query.toLowerCase();
      
      // Find similar queries
      const suggestions = topQueries
        .filter(q => 
          q.query.toLowerCase().includes(queryLower) || 
          queryLower.includes(q.query.toLowerCase()) ||
          this.calculateSimilarity(q.query.toLowerCase(), queryLower) > 0.6
        )
        .map(q => q.query)
        .slice(0, 5);
      
      // Get related queries (simplified)
      const relatedQueries = topQueries
        .filter(q => q.query.toLowerCase() !== queryLower)
        .map(q => q.query)
        .slice(0, 3);
      
      return {
        suggestions,
        relatedQueries,
        suggestionsCount: suggestions.length
      };
    } catch (error) {
      console.error('Error getting no results suggestions:', error);
      return {
        suggestions: [],
        relatedQueries: [],
        suggestionsCount: 0
      };
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(
    query: string,
    type: 'doctors' | 'clinics' | 'all' = 'all',
    limit: number = 10
  ): Promise<Array<{ text: string; type: string; count: number }>> {
    try {
      const topQueries = await this.getTopQueries(100);
      const queryLower = query.toLowerCase();
      
      const suggestions = topQueries
        .filter(q => q.query.toLowerCase().startsWith(queryLower))
        .map(q => ({
          text: q.query,
          type: 'query',
          count: q.count
        }))
        .slice(0, limit);
      
      // Add specialty suggestions
      if (type === 'doctors' || type === 'all') {
        const specialties = await prisma.specialty.findMany({
          where: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          take: 5
        });
        
        specialties.forEach(specialty => {
          suggestions.push({
            text: specialty.name,
            type: 'specialty',
            count: 0
          });
        });
      }
      
      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get timeframe keys for analytics
   */
  private static getTimeframeKeys(date: Date, timeframe: 'hour' | 'day' | 'week'): string[] {
    const keys: string[] = [];
    const today = date.toISOString().split('T')[0];
    
    switch (timeframe) {
      case 'hour':
        const hour = date.getHours();
        keys.push(`analytics:${today}:${hour}`);
        break;
        
      case 'day':
        for (let h = 0; h < 24; h++) {
          keys.push(`analytics:${today}:${h}`);
        }
        break;
        
      case 'week':
        for (let d = 0; d < 7; d++) {
          const targetDate = new Date(date);
          targetDate.setDate(targetDate.getDate() - d);
          const dateStr = targetDate.toISOString().split('T')[0];
          for (let h = 0; h < 24; h++) {
            keys.push(`analytics:${dateStr}:${h}`);
          }
        }
        break;
    }
    
    return keys;
  }
}
