import { prisma } from '../libs/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { CacheService } from './cache.service.js';
import { AnalyticsService } from './analytics.service.js';

export interface AdvancedDoctorSearchFilters {
  // Text search
  q?: string; // Search query for name, specialty, biography
  symptoms?: string; // Search by symptoms/conditions
  
  // Basic filters
  specialtyId?: string;
  experienceLevel?: 'junior' | 'mid' | 'senior'; // 0-5, 5-10, 10+ years
  minRating?: number;
  maxRating?: number;
  available?: boolean;
  
  // Price filters
  minFee?: number;
  maxFee?: number;
  priceRange?: 'budget' | 'mid' | 'premium'; // Predefined ranges
  
  // Location filters
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  
  // Advanced filters
  languages?: string[]; // Spoken languages
  gender?: 'MALE' | 'FEMALE';
  hasOnlineConsultation?: boolean;
  
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'rating' | 'experience' | 'fee' | 'distance' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

export interface AdvancedClinicSearchFilters {
  // Text search
  q?: string; // Search query for name, address, services
  services?: string[]; // Available services
  
  // Location filters
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  
  // Operating hours
  openNow?: boolean;
  operatingDay?: string;
  operatingTime?: string;
  operatingHours?: {
    day: string;
    time: string;
  };

  // Accessibility and amenities
  hasParking?: boolean;
  isAccessible?: boolean;
  hasEmergency?: boolean;
  
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchAnalytics {
  query: string;
  filters: any;
  resultCount: number;
  searchTime: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

export class SearchService {
  /**
   * Advanced doctor search with full-text search and relevance scoring
   */
  static async searchDoctorsAdvanced(filters: AdvancedDoctorSearchFilters) {
    const startTime = Date.now();

    const {
      q,
      symptoms,
      specialtyId,
      experienceLevel,
      minRating = 0,
      maxRating = 5,
      available,
      minFee,
      maxFee,
      priceRange,
      city,
      latitude,
      longitude,
      radius,
      languages,
      gender,
      hasOnlineConsultation,
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = filters;

    // Generate cache key for this search
    const cacheKey = CacheService.generateKey('doctor:search', filters);

    // Try to get from cache first (cache for 5 minutes for search results)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isAvailable: available !== undefined ? available : undefined,
      averageRating: {
        gte: minRating,
        lte: maxRating
      }
    };

    // Experience level mapping
    if (experienceLevel) {
      const experienceMap = {
        junior: { gte: 0, lt: 5 },
        mid: { gte: 5, lt: 10 },
        senior: { gte: 10 }
      };
      where.experience = experienceMap[experienceLevel];
    }

    // Price filtering
    if (priceRange) {
      const priceRanges = {
        budget: { lte: new Decimal(300000) }, // <= 300k VND
        mid: { gte: new Decimal(300000), lte: new Decimal(600000) }, // 300k-600k VND
        premium: { gte: new Decimal(600000) } // >= 600k VND
      };
      where.consultationFee = priceRanges[priceRange];
    } else {
      where.consultationFee = {
        ...(minFee ? { gte: new Decimal(minFee) } : {}),
        ...(maxFee ? { lte: new Decimal(maxFee) } : {}),
      };
    }

    // Specialty filter
    if (specialtyId) {
      where.specialtyId = specialtyId;
    }

    // Gender filter
    if (gender) {
      where.user = {
        ...where.user,
        gender: gender
      };
    }

    // Full-text search
    if (q) {
      where.OR = [
        // Search in user name
        {
          user: {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ]
          }
        },
        // Search in biography
        { biography: { contains: q, mode: 'insensitive' } },
        // Search in specialty name
        {
          specialty: {
            name: { contains: q, mode: 'insensitive' }
          }
        }
      ];
    }

    // Symptoms-based search (map to specialties)
    if (symptoms) {
      const symptomSpecialtyMap = await this.getSymptomSpecialtyMapping(symptoms);
      if (symptomSpecialtyMap.length > 0) {
        where.specialtyId = {
          in: symptomSpecialtyMap
        };
      }
    }

    // City filter (search in clinic addresses)
    if (city) {
      where.clinicDoctors = {
        some: {
          clinic: {
            address: { contains: city, mode: 'insensitive' }
          }
        }
      };
    }

    // Clean up undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { averageRating: sortOrder };
        break;
      case 'experience':
        orderBy = { experience: sortOrder };
        break;
      case 'fee':
        orderBy = { consultationFee: sortOrder };
        break;
      case 'availability':
        orderBy = { isAvailable: sortOrder };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use a combination of rating and review count
        orderBy = [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
          { experience: 'desc' }
        ];
        break;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              gender: true,
              address: true,
            }
          },
          specialty: {
            select: {
              id: true,
              name: true,
              icon: true,
              description: true,
            }
          },
          clinicDoctors: {
            include: {
              clinic: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  latitude: true,
                  longitude: true,
                  openTime: true,
                  closeTime: true,
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ]);

    // Calculate distances if location provided
    let doctorsWithDistance = doctors;
    if (latitude && longitude) {
      doctorsWithDistance = doctors.map(doctor => ({
        ...doctor,
        clinicDoctors: doctor.clinicDoctors.map(cd => ({
          ...cd,
          clinic: {
            ...cd.clinic,
            distance: cd.clinic.latitude && cd.clinic.longitude ? this.calculateDistance(
              latitude,
              longitude,
              cd.clinic.latitude,
              cd.clinic.longitude
            ) : 999
          }
        }))
      })) as any;

      // Filter by radius if specified
      if (radius) {
        doctorsWithDistance = doctorsWithDistance.filter((doctor: any) =>
          doctor.clinicDoctors.some((cd: any) => cd.clinic.distance <= radius)
        );
      }

      // Sort by distance if requested
      if (sortBy === 'distance') {
        doctorsWithDistance.sort((a: any, b: any) => {
          const distanceA = Math.min(...a.clinicDoctors.map((cd: any) => cd.clinic.distance));
          const distanceB = Math.min(...b.clinicDoctors.map((cd: any) => cd.clinic.distance));
          return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
        });
      }
    }

    const searchTime = Date.now() - startTime;

    // Log search analytics
    await AnalyticsService.logSearch({
      query: q || symptoms || '',
      searchType: 'doctors',
      filters,
      resultCount: total,
      searchTime,
      timestamp: new Date()
    });

    const result = {
      data: doctorsWithDistance,
      pagination: {
        page,
        limit,
        total: doctorsWithDistance.length,
        totalPages: Math.ceil(doctorsWithDistance.length / limit),
      },
      meta: {
        searchTime,
        hasLocationFilter: !!(latitude && longitude),
        appliedFilters: this.getAppliedFilters(filters)
      }
    };

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Map symptoms to relevant specialties
   */
  static async getSymptomSpecialtyMapping(symptoms: string): Promise<string[]> {
    const symptomMap: Record<string, string[]> = {
      // Cardiovascular symptoms
      'chest pain': ['Tim mạch'],
      'heart': ['Tim mạch'],
      'blood pressure': ['Tim mạch'],
      'hypertension': ['Tim mạch'],
      
      // Neurological symptoms
      'headache': ['Thần kinh'],
      'migraine': ['Thần kinh'],
      'seizure': ['Thần kinh'],
      'stroke': ['Thần kinh'],
      'memory': ['Thần kinh'],
      
      // Orthopedic symptoms
      'bone': ['Chấn thương chỉnh hình'],
      'joint': ['Chấn thương chỉnh hình'],
      'fracture': ['Chấn thương chỉnh hình'],
      'back pain': ['Chấn thương chỉnh hình'],
      
      // Dermatological symptoms
      'skin': ['Da liễu'],
      'rash': ['Da liễu'],
      'acne': ['Da liễu'],
      'eczema': ['Da liễu'],
      
      // Pediatric symptoms
      'child': ['Nhi khoa'],
      'baby': ['Nhi khoa'],
      'infant': ['Nhi khoa'],
      
      // General internal medicine
      'fever': ['Nội tổng hợp'],
      'fatigue': ['Nội tổng hợp'],
      'weight loss': ['Nội tổng hợp'],
    };

    const lowerSymptoms = symptoms.toLowerCase();
    const matchedSpecialties: string[] = [];

    for (const [symptom, specialties] of Object.entries(symptomMap)) {
      if (lowerSymptoms.includes(symptom)) {
        matchedSpecialties.push(...specialties);
      }
    }

    // Get specialty IDs
    if (matchedSpecialties.length > 0) {
      const specialtyRecords = await prisma.specialty.findMany({
        where: {
          name: { in: matchedSpecialties }
        },
        select: { id: true }
      });
      return specialtyRecords.map(s => s.id);
    }

    return [];
  }

  /**
   * Get applied filters for meta information
   */
  static getAppliedFilters(filters: AdvancedDoctorSearchFilters) {
    const applied: string[] = [];
    
    if (filters.q) applied.push('text_search');
    if (filters.symptoms) applied.push('symptoms');
    if (filters.specialtyId) applied.push('specialty');
    if (filters.experienceLevel) applied.push('experience_level');
    if (filters.minRating || filters.maxRating) applied.push('rating');
    if (filters.minFee || filters.maxFee || filters.priceRange) applied.push('price');
    if (filters.city) applied.push('city');
    if (filters.latitude && filters.longitude) applied.push('location');
    if (filters.radius) applied.push('radius');
    if (filters.gender) applied.push('gender');
    if (filters.available !== undefined) applied.push('availability');
    
    return applied;
  }

  /**
   * Log search analytics for optimization
   */
  static async logSearchAnalytics(analytics: SearchAnalytics) {
    try {
      await AnalyticsService.logSearch({
        query: analytics.query,
        searchType: 'doctors', // Default to doctors, will be updated per search type
        filters: analytics.filters,
        resultCount: analytics.resultCount,
        searchTime: analytics.searchTime,
        userId: analytics.userId,
        userAgent: analytics.userAgent,
        ip: analytics.ip,
        timestamp: analytics.timestamp
      });
    } catch (error) {
      console.error('Failed to log search analytics:', error);
    }
  }

  /**
   * Advanced clinic search with enhanced filtering
   */
  static async searchClinicsAdvanced(filters: AdvancedClinicSearchFilters) {
    const startTime = Date.now();

    // Generate cache key for this search
    const cacheKey = CacheService.generateKey('clinic:search', filters);

    // Try to get from cache first (cache for 5 minutes for search results)
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const {
      q,
      services,
      city,
      district,
      latitude,
      longitude,
      radius,
      openNow,
      operatingDay,
      operatingTime,
      hasParking,
      isAccessible,
      hasEmergency,
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Text search
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Location filters
    if (city) {
      where.address = {
        ...where.address,
        contains: city,
        mode: 'insensitive'
      };
    }

    if (district) {
      where.address = {
        ...where.address,
        contains: district,
        mode: 'insensitive'
      };
    }

    // Operating hours filter
    if (openNow) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      where.AND = [
        { openTime: { lte: currentTime } },
        { closeTime: { gte: currentTime } }
      ];
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        include: {
          clinicDoctors: {
            include: {
              doctor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  },
                  specialty: {
                    select: {
                      name: true,
                      icon: true
                    }
                  }
                }
              }
            },
            take: 3 // Show first 3 doctors
          }
        },
        orderBy: sortBy === 'name' ? { name: sortOrder } : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.clinic.count({ where }),
    ]);

    // Calculate distances if location provided
    let clinicsWithDistance = clinics;
    if (latitude && longitude) {
      clinicsWithDistance = clinics.map(clinic => ({
        ...clinic,
        distance: clinic.latitude && clinic.longitude ? this.calculateDistance(
          latitude,
          longitude,
          clinic.latitude,
          clinic.longitude
        ) : 999
      })) as any;

      // Filter by radius if specified
      if (radius) {
        clinicsWithDistance = clinicsWithDistance.filter((clinic: any) => clinic.distance <= radius);
      }

      // Sort by distance if requested
      if (sortBy === 'distance') {
        clinicsWithDistance.sort((a: any, b: any) => {
          return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
        });
      }
    }

    const searchTime = Date.now() - startTime;

    const result = {
      data: clinicsWithDistance,
      pagination: {
        page,
        limit,
        total: clinicsWithDistance.length,
        totalPages: Math.ceil(clinicsWithDistance.length / limit),
      },
      meta: {
        searchTime,
        hasLocationFilter: !!(latitude && longitude),
        appliedFilters: this.getAppliedClinicFilters(filters)
      }
    };

    // Log search analytics
    await AnalyticsService.logSearch({
      query: q || '',
      searchType: 'clinics',
      filters,
      resultCount: clinicsWithDistance.length,
      searchTime,
      timestamp: new Date()
    });

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get applied clinic filters for meta information
   */
  static getAppliedClinicFilters(filters: AdvancedClinicSearchFilters) {
    const applied: string[] = [];

    if (filters.q) applied.push('text_search');
    if (filters.services?.length) applied.push('services');
    if (filters.city) applied.push('city');
    if (filters.district) applied.push('district');
    if (filters.latitude && filters.longitude) applied.push('location');
    if (filters.radius) applied.push('radius');
    if (filters.openNow) applied.push('open_now');
    if (filters.operatingDay && filters.operatingTime) applied.push('operating_hours');
    if (filters.hasParking) applied.push('parking');
    if (filters.isAccessible) applied.push('accessibility');
    if (filters.hasEmergency) applied.push('emergency');

    return applied;
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(query: string, type: string, limit: number) {
    return await AnalyticsService.getSearchSuggestions(
      query,
      type as 'doctors' | 'clinics' | 'all',
      limit
    );
  }

  /**
   * Get available search filters
   */
  static async getSearchFilters(type: string, location?: { latitude: number; longitude: number; radius: number }) {
    const filters: any = {};

    if (type === 'doctors') {
      const [specialties, experienceLevels, priceRanges, cities] = await Promise.all([
        // Specialties with doctor count
        prisma.specialty.findMany({
          select: {
            id: true,
            name: true,
            icon: true,
            _count: {
              select: { doctors: true }
            }
          },
          orderBy: { name: 'asc' }
        }),

        // Experience level distribution
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN experience < 5 THEN 'junior'
              WHEN experience < 10 THEN 'mid'
              ELSE 'senior'
            END as level,
            COUNT(*)::int as count
          FROM doctors
          WHERE "isAvailable" = true
          GROUP BY level
          ORDER BY level
        `,

        // Price range distribution
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN "consultationFee" <= 300000 THEN 'budget'
              WHEN "consultationFee" <= 600000 THEN 'mid'
              ELSE 'premium'
            END as range,
            COUNT(*)::int as count,
            MIN("consultationFee")::int as min_fee,
            MAX("consultationFee")::int as max_fee
          FROM doctors
          WHERE "isAvailable" = true
          GROUP BY range
          ORDER BY min_fee
        `,

        // Cities from clinic addresses
        prisma.$queryRaw`
          SELECT DISTINCT
            TRIM(SPLIT_PART(address, ',', -1)) as city,
            COUNT(DISTINCT cd."doctorId")::int as doctor_count
          FROM clinics c
          INNER JOIN clinic_doctors cd ON c.id = cd."clinicId"
          INNER JOIN doctors d ON cd."doctorId" = d.id
          WHERE d."isAvailable" = true
          GROUP BY city
          ORDER BY doctor_count DESC, city ASC
          LIMIT 20
        `
      ]);

      filters.specialties = specialties;
      filters.experienceLevels = experienceLevels;
      filters.priceRanges = priceRanges;
      filters.cities = cities;
      filters.languages = ['Vietnamese', 'English', 'French', 'Japanese']; // Predefined list
      filters.genders = [
        { value: 'MALE', label: 'Male', count: await this.getGenderCount('MALE') },
        { value: 'FEMALE', label: 'Female', count: await this.getGenderCount('FEMALE') }
      ];
    }

    if (type === 'clinics') {
      const [cities, districts, services] = await Promise.all([
        // Cities from clinic addresses
        prisma.$queryRaw`
          SELECT DISTINCT
            TRIM(SPLIT_PART(address, ',', -1)) as city,
            COUNT(*)::int as count
          FROM clinics
          GROUP BY city
          ORDER BY count DESC, city ASC
          LIMIT 20
        `,

        // Districts from clinic addresses
        prisma.$queryRaw`
          SELECT DISTINCT
            TRIM(SPLIT_PART(address, ',', -2)) as district,
            COUNT(*)::int as count
          FROM clinics
          GROUP BY district
          ORDER BY count DESC, district ASC
          LIMIT 30
        `,

        // Available services (predefined list)
        Promise.resolve([
          'Emergency Care', 'Laboratory', 'Radiology', 'Pharmacy',
          'Surgery', 'Maternity', 'Pediatrics', 'Cardiology',
          'Neurology', 'Orthopedics', 'Dermatology', 'Ophthalmology'
        ])
      ]);

      filters.cities = cities;
      filters.districts = districts;
      filters.services = services.map(service => ({ name: service, available: true }));
      filters.amenities = [
        { name: 'Parking', key: 'hasParking' },
        { name: 'Wheelchair Accessible', key: 'isAccessible' },
        { name: 'Emergency Services', key: 'hasEmergency' }
      ];
    }

    return filters;
  }

  /**
   * Get gender count for doctors
   */
  static async getGenderCount(gender: 'MALE' | 'FEMALE'): Promise<number> {
    return prisma.doctor.count({
      where: {
        isAvailable: true,
        user: { gender }
      }
    });
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(type: string, limit: number, timeframe: string) {
    return await AnalyticsService.getPopularSearches(
      type as 'doctors' | 'clinics' | 'all',
      limit,
      timeframe as 'hour' | 'day' | 'week'
    );
  }

  /**
   * Get search analytics (admin only)
   */
  static async getSearchAnalytics(timeframe: 'hour' | 'day' | 'week' = 'day') {
    return await AnalyticsService.getAnalytics(timeframe);
  }

  /**
   * Get suggestions for "no results" queries
   */
  static async getNoResultsSuggestions(query: string) {
    return await AnalyticsService.getNoResultsSuggestions(query);
  }

  /**
   * Search across all entities
   */
  static async searchAll(query: string, limit: number) {
    const [doctors, clinics, specialties] = await Promise.all([
      // Search doctors
      prisma.doctor.findMany({
        where: {
          OR: [
            {
              user: {
                OR: [
                  { firstName: { contains: query, mode: 'insensitive' } },
                  { lastName: { contains: query, mode: 'insensitive' } }
                ]
              }
            },
            { biography: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          specialty: {
            select: {
              name: true,
              icon: true
            }
          }
        },
        take: limit
      }),

      // Search clinics
      prisma.clinic.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true
        },
        take: limit
      }),

      // Search specialties
      prisma.specialty.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          icon: true,
          description: true,
          _count: {
            select: { doctors: true }
          }
        },
        take: limit
      })
    ]);

    return {
      doctors,
      clinics,
      specialties
    };
  }
}
