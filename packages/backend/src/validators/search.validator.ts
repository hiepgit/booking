import { z } from 'zod';

// Enhanced Doctor Search Schema
export const AdvancedDoctorSearchSchema = z.object({
  // Text search
  q: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  symptoms: z.string().max(200, 'Symptoms description must be less than 200 characters').optional(),
  
  // Basic filters
  specialtyId: z.string().optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior']).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRating: z.coerce.number().min(0).max(5).optional(),
  available: z.coerce.boolean().optional(),
  
  // Price filters
  minFee: z.coerce.number().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  priceRange: z.enum(['budget', 'mid', 'premium']).optional(),
  
  // Location filters
  city: z.string().max(50, 'City name must be less than 50 characters').optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).optional(), // Radius in km
  
  // Advanced filters
  languages: z.array(z.string()).max(5, 'Maximum 5 languages allowed').optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  hasOnlineConsultation: z.coerce.boolean().optional(),
  
  // Pagination and sorting
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['relevance', 'rating', 'experience', 'fee', 'distance', 'availability']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).refine(
  (data) => {
    // If location-based sorting is requested, coordinates must be provided
    if (data.sortBy === 'distance' && (!data.latitude || !data.longitude)) {
      return false;
    }
    return true;
  },
  {
    message: 'Latitude and longitude are required for distance-based sorting',
    path: ['latitude', 'longitude']
  }
).refine(
  (data) => {
    // Validate rating range
    if (data.minRating && data.maxRating && data.minRating > data.maxRating) {
      return false;
    }
    return true;
  },
  {
    message: 'Minimum rating cannot be greater than maximum rating',
    path: ['minRating', 'maxRating']
  }
).refine(
  (data) => {
    // Validate fee range
    if (data.minFee && data.maxFee && data.minFee > data.maxFee) {
      return false;
    }
    return true;
  },
  {
    message: 'Minimum fee cannot be greater than maximum fee',
    path: ['minFee', 'maxFee']
  }
);

// Enhanced Clinic Search Schema
export const AdvancedClinicSearchSchema = z.object({
  // Text search
  q: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  services: z.array(z.string()).max(10, 'Maximum 10 services allowed').optional(),
  
  // Location filters
  city: z.string().max(50, 'City name must be less than 50 characters').optional(),
  district: z.string().max(50, 'District name must be less than 50 characters').optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.1).max(100).optional(),
  
  // Operating hours
  openNow: z.coerce.boolean().optional(),
  operatingDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  operatingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  
  // Accessibility and amenities
  hasParking: z.coerce.boolean().optional(),
  isAccessible: z.coerce.boolean().optional(),
  hasEmergency: z.coerce.boolean().optional(),
  
  // Pagination and sorting
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['relevance', 'distance', 'rating', 'name']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).refine(
  (data) => {
    // If location-based sorting is requested, coordinates must be provided
    if (data.sortBy === 'distance' && (!data.latitude || !data.longitude)) {
      return false;
    }
    return true;
  },
  {
    message: 'Latitude and longitude are required for distance-based sorting',
    path: ['latitude', 'longitude']
  }
).refine(
  (data) => {
    // If operating time is specified, day must be provided
    if (data.operatingTime && !data.operatingDay) {
      return false;
    }
    return true;
  },
  {
    message: 'Operating day is required when operating time is specified',
    path: ['operatingDay']
  }
);

// Search suggestions schema
export const SearchSuggestionsSchema = z.object({
  query: z.string().min(1).max(50, 'Query must be less than 50 characters'),
  type: z.enum(['doctors', 'clinics', 'specialties', 'symptoms']).default('doctors'),
  limit: z.coerce.number().int().positive().max(10).default(5)
});

// Search filters schema for getting available filter options
export const SearchFiltersSchema = z.object({
  type: z.enum(['doctors', 'clinics']).default('doctors'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(0.1).max(100).default(10)
  }).optional()
});

// Popular searches schema
export const PopularSearchesSchema = z.object({
  type: z.enum(['doctors', 'clinics', 'symptoms']).default('doctors'),
  limit: z.coerce.number().int().positive().max(20).default(10),
  timeframe: z.enum(['day', 'week', 'month']).default('week')
});

// Search analytics schema
export const SearchAnalyticsSchema = z.object({
  query: z.string().max(100),
  filters: z.record(z.string(), z.any()),
  resultCount: z.number().int().min(0),
  searchTime: z.number().positive(),
  userId: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

// Type exports
export type AdvancedDoctorSearchInput = z.input<typeof AdvancedDoctorSearchSchema>;
export type AdvancedDoctorSearchOutput = z.output<typeof AdvancedDoctorSearchSchema>;
export type AdvancedClinicSearchInput = z.input<typeof AdvancedClinicSearchSchema>;
export type AdvancedClinicSearchOutput = z.output<typeof AdvancedClinicSearchSchema>;
export type SearchSuggestionsInput = z.input<typeof SearchSuggestionsSchema>;
export type SearchFiltersInput = z.input<typeof SearchFiltersSchema>;
export type PopularSearchesInput = z.input<typeof PopularSearchesSchema>;
export type SearchAnalyticsInput = z.input<typeof SearchAnalyticsSchema>;
