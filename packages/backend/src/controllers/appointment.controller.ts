import type { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service.js';
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  AppointmentFiltersSchema,
  AvailableSlotsSchema,
  CancelAppointmentSchema,
  AppointmentIdSchema,
  PatientAppointmentsSchema,
  DoctorAppointmentsSchema
} from '../validators/appointment.validator.js';

export class AppointmentController {
  /**
   * Create a new appointment
   */
  static async createAppointment(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Only patients can create appointments
      if (user.role !== 'PATIENT') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Only patients can create appointments'
          }
        });
      }

      const validatedData = CreateAppointmentSchema.parse(req.body);

      // Get patient ID from user
      const patient = await AppointmentService.getPatientByUserId(user.sub);
      if (!patient) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Patient profile not found'
          }
        });
      }

      const appointment = await AppointmentService.createAppointment({
        ...validatedData,
        patientId: patient.id
      });

      res.status(201).json({
        message: 'Appointment created successfully',
        data: appointment
      });
    } catch (error: any) {
      console.error('Create appointment error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues
          }
        });
      }

      if (error.message.includes('not found') || 
          error.message.includes('does not work') ||
          error.message.includes('not available')) {
        return res.status(400).json({
          error: {
            code: 'BUSINESS_ERROR',
            message: error.message
          }
        });
      }

      if (error.message.includes('conflict') || 
          error.message.includes('already has an appointment')) {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: error.message
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create appointment'
        }
      });
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      const { id } = AppointmentIdSchema.parse(req.params);
      const appointment = await AppointmentService.getAppointmentById(id);

      // Check if user has access to this appointment
      const hasAccess = await AppointmentService.checkUserAccess(user, appointment);
      if (!hasAccess) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this appointment'
          }
        });
      }

      res.json({
        data: appointment
      });
    } catch (error: any) {
      console.error('Get appointment error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid appointment ID',
            issues: error.issues
          }
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get appointment'
        }
      });
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      const { id } = AppointmentIdSchema.parse(req.params);
      const validatedData = UpdateAppointmentSchema.parse(req.body);

      // Get appointment and check access
      const appointment = await AppointmentService.getAppointmentById(id);
      const hasAccess = await AppointmentService.checkUserAccess(user, appointment);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this appointment'
          }
        });
      }

      // Check if user can perform this update
      const canUpdate = await AppointmentService.checkUpdatePermission(user, appointment, validatedData);
      if (!canUpdate) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions for this update'
          }
        });
      }

      const updatedAppointment = await AppointmentService.updateAppointment(id, validatedData);

      res.json({
        message: 'Appointment updated successfully',
        data: updatedAppointment
      });
    } catch (error: any) {
      console.error('Update appointment error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues
          }
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({
          error: {
            code: 'BUSINESS_ERROR',
            message: error.message
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update appointment'
        }
      });
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      const { id } = AppointmentIdSchema.parse(req.params);
      const { reason } = CancelAppointmentSchema.parse(req.body);

      // Get appointment and check access
      const appointment = await AppointmentService.getAppointmentById(id);
      const hasAccess = await AppointmentService.checkUserAccess(user, appointment);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this appointment'
          }
        });
      }

      const cancelledAppointment = await AppointmentService.cancelAppointment(id, reason);

      res.json({
        message: 'Appointment cancelled successfully',
        data: cancelledAppointment
      });
    } catch (error: any) {
      console.error('Cancel appointment error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            issues: error.issues
          }
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      if (error.message.includes('already cancelled') || 
          error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          error: {
            code: 'BUSINESS_ERROR',
            message: error.message
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel appointment'
        }
      });
    }
  }

  /**
   * Confirm appointment (doctors only)
   */
  static async confirmAppointment(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Only doctors can confirm appointments
      if (user.role !== 'DOCTOR') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Only doctors can confirm appointments'
          }
        });
      }

      const { id } = AppointmentIdSchema.parse(req.params);

      // Check if doctor has access to this appointment
      const appointment = await AppointmentService.getAppointmentById(id);
      const doctor = await AppointmentService.getDoctorByUserId(user.sub);

      if (!doctor || appointment.doctorId !== doctor.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this appointment'
          }
        });
      }

      const confirmedAppointment = await AppointmentService.confirmAppointment(id);

      res.json({
        message: 'Appointment confirmed successfully',
        data: confirmedAppointment
      });
    } catch (error: any) {
      console.error('Confirm appointment error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid appointment ID',
            issues: error.issues
          }
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      if (error.message.includes('Only pending')) {
        return res.status(400).json({
          error: {
            code: 'BUSINESS_ERROR',
            message: error.message
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to confirm appointment'
        }
      });
    }
  }

  /**
   * Get patient appointments
   */
  static async getPatientAppointments(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Only patients can access their appointments
      if (user.role !== 'PATIENT') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Only patients can access patient appointments'
          }
        });
      }

      const { status, page, limit } = PatientAppointmentsSchema.parse(req.query);

      const patient = await AppointmentService.getPatientByUserId(user.sub);
      if (!patient) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Patient profile not found'
          }
        });
      }

      const result = await AppointmentService.getPatientAppointments(
        patient.id,
        status,
        page,
        limit
      );

      res.json(result);
    } catch (error: any) {
      console.error('Get patient appointments error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get patient appointments'
        }
      });
    }
  }

  /**
   * Get doctor appointments
   */
  static async getDoctorAppointments(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Only doctors can access their appointments
      if (user.role !== 'DOCTOR') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Only doctors can access doctor appointments'
          }
        });
      }

      const { status, dateFrom, dateTo, page, limit } = DoctorAppointmentsSchema.parse(req.query);

      const doctor = await AppointmentService.getDoctorByUserId(user.sub);
      if (!doctor) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Doctor profile not found'
          }
        });
      }

      const result = await AppointmentService.getDoctorAppointments(
        doctor.id,
        status,
        dateFrom,
        dateTo,
        page,
        limit
      );

      res.json(result);
    } catch (error: any) {
      console.error('Get doctor appointments error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get doctor appointments'
        }
      });
    }
  }

  /**
   * Get available time slots
   */
  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const { doctorId, date } = AvailableSlotsSchema.parse(req.query);

      const slots = await AppointmentService.getAvailableSlots(doctorId, date);

      res.json({
        data: slots,
        meta: {
          doctorId,
          date: date.toISOString().split('T')[0],
          totalSlots: slots.length
        }
      });
    } catch (error: any) {
      console.error('Get available slots error:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            issues: error.issues
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get available slots'
        }
      });
    }
  }
}
