import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { requireAuth } from '../security/requireAuth.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdvancedDoctorSearch:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           maxLength: 100
 *           description: Search query for doctor name, specialty, or biography
 *         symptoms:
 *           type: string
 *           maxLength: 200
 *           description: Search by symptoms or medical conditions
 *         specialtyId:
 *           type: string
 *           description: Filter by specialty ID
 *         experienceLevel:
 *           type: string
 *           enum: [junior, mid, senior]
 *           description: Experience level - junior (0-5 years), mid (5-10 years), senior (10+ years)
 *         minRating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Minimum rating filter
 *         maxRating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Maximum rating filter
 *         available:
 *           type: boolean
 *           description: Filter by availability status
 *         minFee:
 *           type: number
 *           minimum: 0
 *           description: Minimum consultation fee
 *         maxFee:
 *           type: number
 *           minimum: 0
 *           description: Maximum consultation fee
 *         priceRange:
 *           type: string
 *           enum: [budget, mid, premium]
 *           description: Predefined price ranges
 *         city:
 *           type: string
 *           maxLength: 50
 *           description: Filter by city
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude for location-based search
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude for location-based search
 *         radius:
 *           type: number
 *           minimum: 0.1
 *           maximum: 100
 *           default: 10
 *           description: Search radius in kilometers
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE]
 *           description: Filter by doctor gender
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Page number
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *           description: Number of results per page
 *         sortBy:
 *           type: string
 *           enum: [relevance, rating, experience, fee, distance, availability]
 *           default: relevance
 *           description: Sort criteria
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           description: Sort order
 *     AdvancedClinicSearch:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           maxLength: 100
 *           description: Search query for clinic name, address, or services
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           description: Filter by available services
 *         city:
 *           type: string
 *           maxLength: 50
 *           description: Filter by city
 *         district:
 *           type: string
 *           maxLength: 50
 *           description: Filter by district
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *           description: Latitude for location-based search
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *           description: Longitude for location-based search
 *         radius:
 *           type: number
 *           minimum: 0.1
 *           maximum: 100
 *           default: 10
 *           description: Search radius in kilometers
 *         openNow:
 *           type: boolean
 *           description: Filter by clinics currently open
 *         hasParking:
 *           type: boolean
 *           description: Filter by parking availability
 *         isAccessible:
 *           type: boolean
 *           description: Filter by wheelchair accessibility
 *         hasEmergency:
 *           type: boolean
 *           description: Filter by emergency services availability
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Page number
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *           description: Number of results per page
 *         sortBy:
 *           type: string
 *           enum: [relevance, distance, rating, name]
 *           default: relevance
 *           description: Sort criteria
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           description: Sort order
 *     SearchSuggestion:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [doctor, clinic, specialty, symptom]
 *           description: Type of suggestion
 *         id:
 *           type: string
 *           description: Entity ID (if applicable)
 *         name:
 *           type: string
 *           description: Display name
 *         icon:
 *           type: string
 *           description: Icon for display (if applicable)
 *         specialty:
 *           type: string
 *           description: Specialty name (for doctors)
 *         address:
 *           type: string
 *           description: Address (for clinics)
 *         doctorCount:
 *           type: integer
 *           description: Number of doctors (for specialties)
 */

/**
 * @swagger
 * /search/doctors/advanced:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Advanced doctor search with enhanced filtering
 *     description: Search doctors with comprehensive filters including location, experience, price range, and symptoms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search query for doctor name, specialty, or biography
 *       - in: query
 *         name: symptoms
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Search by symptoms or medical conditions
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *         description: Filter by specialty ID
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior]
 *         description: Experience level filter
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Maximum rating filter
 *       - in: query
 *         name: priceRange
 *         schema:
 *           type: string
 *           enum: [budget, mid, premium]
 *         description: Predefined price range
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE]
 *         description: Filter by doctor gender
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, rating, experience, fee, distance, availability]
 *           default: relevance
 *         description: Sort criteria
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
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Advanced search results with enhanced filtering
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
 *                 meta:
 *                   type: object
 *                   properties:
 *                     searchTime:
 *                       type: number
 *                       description: Search execution time in milliseconds
 *                     hasLocationFilter:
 *                       type: boolean
 *                     appliedFilters:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Authentication required
 */
router.get('/doctors/advanced', requireAuth, SearchController.searchDoctorsAdvanced);

/**
 * @swagger
 * /search/clinics/advanced:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Advanced clinic search with enhanced filtering
 *     description: Search clinics with comprehensive filters including location, services, and operating hours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for clinic name, address, or services
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers
 *       - in: query
 *         name: openNow
 *         schema:
 *           type: boolean
 *         description: Filter by clinics currently open
 *       - in: query
 *         name: hasParking
 *         schema:
 *           type: boolean
 *         description: Filter by parking availability
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, distance, rating, name]
 *         description: Sort criteria
 *     responses:
 *       200:
 *         description: Advanced clinic search results
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Authentication required
 */
router.get('/clinics/advanced', requireAuth, SearchController.searchClinicsAdvanced);

/**
 * @swagger
 * /search/suggestions:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Get search suggestions for autocomplete
 *     description: Get autocomplete suggestions for doctors, clinics, specialties, or symptoms
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         description: Search query for suggestions
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [doctors, clinics, specialties, symptoms]
 *           default: doctors
 *         description: Type of suggestions to return
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: Maximum number of suggestions
 *     responses:
 *       200:
 *         description: Search suggestions
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
 *                     $ref: '#/components/schemas/SearchSuggestion'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                     type:
 *                       type: string
 *                     count:
 *                       type: integer
 *       400:
 *         description: Invalid suggestion parameters
 */
router.get('/suggestions', SearchController.getSearchSuggestions);

/**
 * @swagger
 * /search/filters:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Get available search filters
 *     description: Get available filter options for doctors or clinics search
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [doctors, clinics]
 *           default: doctors
 *         description: Type of filters to return
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based filters
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based filters
 *     responses:
 *       200:
 *         description: Available search filters
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
 *                     specialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                     experienceLevels:
 *                       type: array
 *                       items:
 *                         type: object
 *                     priceRanges:
 *                       type: array
 *                       items:
 *                         type: object
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid filter parameters
 */
router.get('/filters', SearchController.getSearchFilters);

/**
 * @swagger
 * /search/popular:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Get popular searches
 *     description: Get trending and popular search queries
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [doctors, clinics, symptoms]
 *           default: doctors
 *         description: Type of popular searches
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Maximum number of results
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Timeframe for popular searches
 *     responses:
 *       200:
 *         description: Popular searches
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
 *                       query:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       trend:
 *                         type: string
 *                         enum: [up, down, stable]
 */
router.get('/popular', SearchController.getPopularSearches);

/**
 * @swagger
 * /search/analytics:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Get search analytics (Admin only)
 *     description: Get comprehensive search analytics and performance metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search analytics data
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
 *                     totalSearches:
 *                       type: integer
 *                     uniqueUsers:
 *                       type: integer
 *                     averageSearchTime:
 *                       type: number
 *                     topQueries:
 *                       type: array
 *                       items:
 *                         type: object
 *                     searchTrends:
 *                       type: object
 *                     performanceMetrics:
 *                       type: object
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/analytics', requireAuth, SearchController.getSearchAnalytics);

/**
 * @swagger
 * /search/no-results-suggestions:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Get suggestions for queries with no results
 *     description: Get helpful suggestions when a search query returns no results
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Original search query that returned no results
 *     responses:
 *       200:
 *         description: Suggestions for improving search
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
 *                       type:
 *                         type: string
 *                         enum: [specialty, popular, tip]
 *                       suggestion:
 *                         type: string
 *                       data:
 *                         type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     originalQuery:
 *                       type: string
 *                     suggestionsCount:
 *                       type: integer
 *       400:
 *         description: Query parameter is required
 */
router.get('/no-results-suggestions', SearchController.getNoResultsSuggestions);

/**
 * @swagger
 * /search/all:
 *   get:
 *     tags:
 *       - Advanced Search
 *     summary: Search across all entities
 *     description: Search across doctors, clinics, and specialties simultaneously
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: Maximum results per category
 *     responses:
 *       200:
 *         description: Search results across all entities
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
 *                     doctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     clinics:
 *                       type: array
 *                       items:
 *                         type: object
 *                     specialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                     totalResults:
 *                       type: integer
 *       400:
 *         description: Query parameter is required
 */
router.get('/all', SearchController.searchAll);

export default router;
