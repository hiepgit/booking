import { prisma } from '../libs/prisma.js';
import type { AppointmentStatus, AppointmentType } from '@prisma/client';

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  clinicId?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  symptoms?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  meetingUrl?: string;
  meetingId?: string;
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  clinicId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: Date;
  dateTo?: Date;
}

export class AppointmentService {
  /**
   * Create a new appointment
   */
  static async createAppointment(data: CreateAppointmentData) {
    // Validate doctor exists and is available
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: true }
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (!doctor.isAvailable) {
      throw new Error('Doctor is not available for appointments');
    }

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      include: { user: true }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Validate clinic if provided
    if (data.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: data.clinicId }
      });

      if (!clinic) {
        throw new Error('Clinic not found');
      }

      // Check if doctor works at this clinic
      const clinicDoctor = await prisma.clinicDoctor.findUnique({
        where: {
          clinicId_doctorId: {
            clinicId: data.clinicId,
            doctorId: data.doctorId
          }
        }
      });

      if (!clinicDoctor) {
        throw new Error('Doctor does not work at this clinic');
      }
    }

    // Check for appointment conflicts
    await this.checkAppointmentConflicts(data);

    // Find or create schedule slot
    const schedule = await this.findOrCreateScheduleSlot(data);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        clinicId: data.clinicId,
        scheduleId: schedule?.id,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        symptoms: data.symptoms,
        notes: data.notes,
        status: 'PENDING'
      },
      include: {
        patient: {
          include: { user: true }
        },
        doctor: {
          include: { 
            user: true,
            specialty: true
          }
        },
        clinic: true,
        schedule: true
      }
    });

    // Update schedule status if linked
    if (schedule) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { status: 'BUSY' }
      });
    }

    return appointment;
  }

  /**
   * Check for appointment conflicts
   */
  static async checkAppointmentConflicts(data: CreateAppointmentData) {
    const conflicts = await prisma.appointment.findMany({
      where: {
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } }
            ]
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      throw new Error('Doctor already has an appointment at this time');
    }

    // Check patient conflicts
    const patientConflicts = await prisma.appointment.findMany({
      where: {
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          }
        ]
      }
    });

    if (patientConflicts.length > 0) {
      throw new Error('Patient already has an appointment at this time');
    }
  }

  /**
   * Find or create schedule slot
   */
  static async findOrCreateScheduleSlot(data: CreateAppointmentData) {
    // Try to find existing available schedule
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        doctorId: data.doctorId,
        date: data.appointmentDate,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'AVAILABLE'
      }
    });

    if (existingSchedule) {
      return existingSchedule;
    }

    // Create new schedule slot if none exists
    try {
      const newSchedule = await prisma.schedule.create({
        data: {
          doctorId: data.doctorId,
          date: data.appointmentDate,
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'AVAILABLE'
        }
      });
      return newSchedule;
    } catch (error: any) {
      // If unique constraint fails, schedule already exists
      if (error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true }
        },
        doctor: {
          include: { 
            user: true,
            specialty: true
          }
        },
        clinic: true,
        schedule: true,
        payment: true,
        medicalRecord: true
      }
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  /**
   * Update appointment
   */
  static async updateAppointment(id: string, data: UpdateAppointmentData) {
    const appointment = await this.getAppointmentById(id);

    // Validate status transitions
    if (data.status) {
      this.validateStatusTransition(appointment.status, data.status);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: {
          include: { user: true }
        },
        doctor: {
          include: { 
            user: true,
            specialty: true
          }
        },
        clinic: true,
        schedule: true
      }
    });

    // Update schedule status if appointment is cancelled
    if (data.status === 'CANCELLED' && appointment.scheduleId) {
      await prisma.schedule.update({
        where: { id: appointment.scheduleId },
        data: { status: 'AVAILABLE' }
      });
    }

    return updatedAppointment;
  }

  /**
   * Validate status transitions
   */
  static validateStatusTransition(currentStatus: AppointmentStatus, newStatus: AppointmentStatus) {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Final state
      CANCELLED: [], // Final state
      NO_SHOW: [] // Final state
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Get appointments with filters and pagination
   */
  static async getAppointments(
    filters: AppointmentFilters = {},
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.clinicId) where.clinicId = filters.clinicId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    if (filters.dateFrom || filters.dateTo) {
      where.appointmentDate = {};
      if (filters.dateFrom) where.appointmentDate.gte = filters.dateFrom;
      if (filters.dateTo) where.appointmentDate.lte = filters.dateTo;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: { user: true }
          },
          doctor: {
            include: {
              user: true,
              specialty: true
            }
          },
          clinic: true,
          payment: true
        },
        orderBy: [
          { appointmentDate: 'desc' },
          { startTime: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where })
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get patient appointments
   */
  static async getPatientAppointments(
    patientId: string,
    status?: AppointmentStatus,
    page: number = 1,
    limit: number = 10
  ) {
    const filters: AppointmentFilters = { patientId };
    if (status) filters.status = status;

    return this.getAppointments(filters, page, limit);
  }

  /**
   * Get doctor appointments
   */
  static async getDoctorAppointments(
    doctorId: string,
    status?: AppointmentStatus,
    dateFrom?: Date,
    dateTo?: Date,
    page: number = 1,
    limit: number = 10
  ) {
    const filters: AppointmentFilters = { doctorId };
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    return this.getAppointments(filters, page, limit);
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, reason?: string) {
    const appointment = await this.getAppointmentById(id);

    if (appointment.status === 'CANCELLED') {
      throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === 'COMPLETED') {
      throw new Error('Cannot cancel completed appointment');
    }

    const updatedAppointment = await this.updateAppointment(id, {
      status: 'CANCELLED',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });

    return updatedAppointment;
  }

  /**
   * Confirm appointment
   */
  static async confirmAppointment(id: string) {
    const appointment = await this.getAppointmentById(id);

    if (appointment.status !== 'PENDING') {
      throw new Error('Only pending appointments can be confirmed');
    }

    return this.updateAppointment(id, { status: 'CONFIRMED' });
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  static async getAvailableSlots(doctorId: string, date: Date) {
    // Get doctor's working hours at clinics
    const clinicDoctors = await prisma.clinicDoctor.findMany({
      where: { doctorId },
      include: { clinic: true }
    });

    if (clinicDoctors.length === 0) {
      return [];
    }

    // Get existing appointments for the date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: date,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // Generate available slots based on working hours
    const availableSlots: Array<{
      startTime: string;
      endTime: string;
      clinicId: string;
      clinicName: string;
    }> = [];

    for (const clinicDoctor of clinicDoctors) {
      const workingStart = clinicDoctor.startTime;
      const workingEnd = clinicDoctor.endTime;

      // Generate 30-minute slots
      const slots = this.generateTimeSlots(workingStart, workingEnd, 30);

      for (const slot of slots) {
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt =>
          (slot.startTime >= apt.startTime && slot.startTime < apt.endTime) ||
          (slot.endTime > apt.startTime && slot.endTime <= apt.endTime)
        );

        if (!hasConflict) {
          availableSlots.push({
            ...slot,
            clinicId: clinicDoctor.clinicId,
            clinicName: clinicDoctor.clinic.name
          });
        }
      }
    }

    return availableSlots;
  }

  /**
   * Generate time slots
   */
  static generateTimeSlots(startTime: string, endTime: string, durationMinutes: number) {
    const slots: Array<{ startTime: string; endTime: string }> = [];

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Add duration
      currentMinute += durationMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }

      const slotEnd = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Check if slot end is within working hours
      if (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }
    }

    return slots;
  }

  /**
   * Get patient by user ID
   */
  static async getPatientByUserId(userId: string) {
    return prisma.patient.findUnique({
      where: { userId },
      include: { user: true }
    });
  }

  /**
   * Get doctor by user ID
   */
  static async getDoctorByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
      include: { user: true }
    });
  }

  /**
   * Check if user has access to appointment
   */
  static async checkUserAccess(user: any, appointment: any): Promise<boolean> {
    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role === 'PATIENT') {
      const patient = await this.getPatientByUserId(user.sub);
      return patient?.id === appointment.patientId;
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.getDoctorByUserId(user.sub);
      return doctor?.id === appointment.doctorId;
    }

    return false;
  }

  /**
   * Check update permissions
   */
  static async checkUpdatePermission(user: any, appointment: any, updateData: any): Promise<boolean> {
    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.getDoctorByUserId(user.sub);
      if (doctor?.id !== appointment.doctorId) {
        return false;
      }

      // Doctors can update status, notes, meeting info
      const allowedFields = ['status', 'notes', 'meetingUrl', 'meetingId'];
      const updateFields = Object.keys(updateData);
      return updateFields.every(field => allowedFields.includes(field));
    }

    if (user.role === 'PATIENT') {
      const patient = await this.getPatientByUserId(user.sub);
      if (patient?.id !== appointment.patientId) {
        return false;
      }

      // Patients can only update symptoms and notes, and only before appointment is confirmed
      if (appointment.status !== 'PENDING') {
        return false;
      }

      const allowedFields = ['symptoms', 'notes'];
      const updateFields = Object.keys(updateData);
      return updateFields.every(field => allowedFields.includes(field));
    }

    return false;
  }
}
