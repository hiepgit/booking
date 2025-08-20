import { Request, Response } from 'express';
import { ClinicService } from '../services/clinic.service.js';
import { z } from 'zod';

// Request validation schemas
const idParamSchema = z.object({
  id: z.string().cuid('Invalid clinic ID'),
});

const doctorIdParamSchema = z.object({
  clinicId: z.string().cuid('Invalid clinic ID'),
  doctorId: z.string().cuid('Invalid doctor ID'),
});

const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

const nearbyQuerySchema = z.object({
  lat: z.string().transform(val => parseFloat(val)),
  lng: z.string().transform(val => parseFloat(val)),
  radius: z.string().optional().transform(val => val ? parseFloat(val) : 5),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

const searchQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  name: z.string().optional(),
  specialtyIds: z.string().optional().transform(val => val ? val.split(',') : undefined),
  openNow: z.string().optional().transform(val => val === 'true'),
  operatingDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  operatingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  sortBy: z.enum(['name', 'rating', 'distance', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
});

export class ClinicController {
  // Create a new clinic
  static async createClinic(req: Request, res: Response) {
    try {
      const clinic = await ClinicService.createClinic(req.body);
      
      res.status(201).json({
        message: 'Clinic created successfully',
        data: clinic,
      });
    } catch (error: any) {
      console.error('Create clinic error:', error);
      
      if (error.message.includes('time')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create clinic',
        },
      });
    }
  }

  // Get clinic by ID
  static async getClinicById(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      
      const clinic = await ClinicService.getClinicById(id);
      
      if (!clinic) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          },
        });
      }
      
      res.json({
        data: clinic,
      });
    } catch (error: any) {
      console.error('Get clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid clinic ID',
            issues: error.issues,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get clinic',
        },
      });
    }
  }

  // Update clinic
  static async updateClinic(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      
      const clinic = await ClinicService.updateClinic(id, req.body);
      
      res.json({
        message: 'Clinic updated successfully',
        data: clinic,
      });
    } catch (error: any) {
      console.error('Update clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues,
          },
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          },
        });
      }
      
      if (error.message.includes('time')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update clinic',
        },
      });
    }
  }

  // Delete clinic
  static async deleteClinic(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params);
      
      await ClinicService.deleteClinic(id);
      
      res.json({
        message: 'Clinic deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid clinic ID',
            issues: error.issues,
          },
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete clinic',
        },
      });
    }
  }

  // Get all clinics with pagination
  static async getAllClinics(req: Request, res: Response) {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      
      const result = await ClinicService.getAllClinics(page, limit);
      
      res.json(result);
    } catch (error: any) {
      console.error('Get all clinics error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get clinics',
        },
      });
    }
  }

  // Search nearby clinics
  static async searchNearbyClinics(req: Request, res: Response) {
    try {
      const query = nearbyQuerySchema.parse(req.query);
      
      const result = await ClinicService.searchNearbyClinics(query);
      
      res.json(result);
    } catch (error: any) {
      console.error('Search nearby clinics error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search nearby clinics',
        },
      });
    }
  }

  // Search clinics by text and location
  static async searchClinics(req: Request, res: Response) {
    try {
      const query = searchQuerySchema.parse(req.query);
      
      const result = await ClinicService.searchClinics(query);
      
      res.json(result);
    } catch (error: any) {
      console.error('Search clinics error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search clinics',
        },
      });
    }
  }

  // Get clinic search filters
  static async getSearchFilters(req: Request, res: Response) {
    try {
      const filters = await ClinicService.getSearchFilters();

      res.json({
        success: true,
        data: filters
      });
    } catch (error: any) {
      console.error('Get clinic search filters error:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get search filters',
        },
      });
    }
  }

  // Add doctor to clinic
  static async addDoctorToClinic(req: Request, res: Response) {
    try {
      const { id: clinicId } = idParamSchema.parse(req.params);
      
      const clinicDoctor = await ClinicService.addDoctorToClinic(clinicId, req.body);
      
      res.status(201).json({
        message: 'Doctor added to clinic successfully',
        data: clinicDoctor,
      });
    } catch (error: any) {
      console.error('Add doctor to clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues,
          },
        });
      }
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      if (error.message.includes('already associated')) {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: error.message,
          },
        });
      }
      
      if (error.message.includes('time')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add doctor to clinic',
        },
      });
    }
  }

  // Remove doctor from clinic
  static async removeDoctorFromClinic(req: Request, res: Response) {
    try {
      const { clinicId, doctorId } = doctorIdParamSchema.parse(req.params);
      
      await ClinicService.removeDoctorFromClinic(clinicId, doctorId);
      
      res.json({
        message: 'Doctor removed from clinic successfully',
      });
    } catch (error: any) {
      console.error('Remove doctor from clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
            issues: error.issues,
          },
        });
      }
      
      if (error.message.includes('not associated')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to remove doctor from clinic',
        },
      });
    }
  }

  // Update doctor schedule at clinic
  static async updateDoctorScheduleAtClinic(req: Request, res: Response) {
    try {
      const { clinicId, doctorId } = doctorIdParamSchema.parse(req.params);
      
      const clinicDoctor = await ClinicService.updateDoctorScheduleAtClinic(
        clinicId, 
        doctorId, 
        req.body
      );
      
      res.json({
        message: 'Doctor schedule updated successfully',
        data: clinicDoctor,
      });
    } catch (error: any) {
      console.error('Update doctor schedule error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues,
          },
        });
      }
      
      if (error.message.includes('not associated')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      if (error.message.includes('time')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update doctor schedule',
        },
      });
    }
  }

  // Get doctors at a clinic
  static async getDoctorsAtClinic(req: Request, res: Response) {
    try {
      const { id: clinicId } = idParamSchema.parse(req.params);
      
      const clinic = await ClinicService.getDoctorsAtClinic(clinicId);
      
      if (!clinic) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Clinic not found',
          },
        });
      }
      
      res.json({
        data: clinic,
      });
    } catch (error: any) {
      console.error('Get doctors at clinic error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid clinic ID',
            issues: error.issues,
          },
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get doctors at clinic',
        },
      });
    }
  }
}
