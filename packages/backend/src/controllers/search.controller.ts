import type { Request, Response } from 'express';
import { SearchService } from '../services/search.service.js';
import {
  AdvancedDoctorSearchSchema,
  AdvancedClinicSearchSchema,
  SearchSuggestionsSchema,
  SearchFiltersSchema,
  PopularSearchesSchema
} from '../validators/search.validator.js';

export class SearchController {
  /**
   * Advanced doctor search with enhanced filtering
   */
  static async searchDoctorsAdvanced(req: Request, res: Response) {
    try {
      const validatedQuery = AdvancedDoctorSearchSchema.parse(req.query);
      
      const result = await SearchService.searchDoctorsAdvanced(validatedQuery);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('Advanced doctor search error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            issues: error.issues
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search doctors'
        }
      });
    }
  }

  /**
   * Advanced clinic search with enhanced filtering
   */
  static async searchClinicsAdvanced(req: Request, res: Response) {
    try {
      const validatedQuery = AdvancedClinicSearchSchema.parse(req.query);
      
      const result = await SearchService.searchClinicsAdvanced(validatedQuery);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('Advanced clinic search error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            issues: error.issues
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search clinics'
        }
      });
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(req: Request, res: Response) {
    try {
      const { query, type, limit } = SearchSuggestionsSchema.parse(req.query);
      
      const suggestions = await SearchService.getSearchSuggestions(query, type, limit);
      
      res.json({
        success: true,
        data: suggestions,
        meta: {
          query,
          type,
          count: suggestions.length
        }
      });
    } catch (error: any) {
      console.error('Search suggestions error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid suggestion parameters',
            issues: error.issues
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get search suggestions'
        }
      });
    }
  }

  /**
   * Get available search filters
   */
  static async getSearchFilters(req: Request, res: Response) {
    try {
      const { type, location } = SearchFiltersSchema.parse(req.query);
      
      const filters = await SearchService.getSearchFilters(type, location);
      
      res.json({
        success: true,
        data: filters,
        meta: {
          type,
          hasLocationFilter: !!location
        }
      });
    } catch (error: any) {
      console.error('Search filters error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid filter parameters',
            issues: error.issues
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get search filters'
        }
      });
    }
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(req: Request, res: Response) {
    try {
      const { type, limit, timeframe } = PopularSearchesSchema.parse(req.query);
      
      const popularSearches = await SearchService.getPopularSearches(type, limit, timeframe);
      
      res.json({
        success: true,
        data: popularSearches,
        meta: {
          type,
          timeframe,
          count: popularSearches.length
        }
      });
    } catch (error: any) {
      console.error('Popular searches error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid popular searches parameters',
            issues: error.issues
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get popular searches'
        }
      });
    }
  }

  /**
   * Get search analytics (admin only)
   */
  static async getSearchAnalytics(req: Request, res: Response) {
    try {
      const user = req.user;
      
      // Check if user is admin
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        });
      }

      const timeframe = (req.query.timeframe as 'hour' | 'day' | 'week') || 'day';
      const analytics = await SearchService.getSearchAnalytics(timeframe);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Search analytics error:', error);
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get search analytics'
        }
      });
    }
  }

  /**
   * Get "no results" suggestions
   */
  static async getNoResultsSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter is required'
          }
        });
      }

      const suggestions = await SearchService.getNoResultsSuggestions(query as string);
      
      res.json({
        success: true,
        data: suggestions,
        meta: {
          originalQuery: query,
          suggestionsCount: suggestions.suggestionsCount
        }
      });
    } catch (error: any) {
      console.error('No results suggestions error:', error);
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get suggestions'
        }
      });
    }
  }

  /**
   * Search across all entities (doctors, clinics, specialties)
   */
  static async searchAll(req: Request, res: Response) {
    try {
      const { q, limit = 5 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter is required'
          }
        });
      }

      const results = await SearchService.searchAll(q as string, Number(limit));
      
      res.json({
        success: true,
        data: results,
        meta: {
          query: q,
          totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        }
      });
    } catch (error: any) {
      console.error('Search all error:', error);
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to perform search'
        }
      });
    }
  }
}
