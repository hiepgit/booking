import { z } from 'zod';

// Enum schemas
export const AppointmentStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED', 
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

export const AppointmentTypeSchema = z.enum(['ONLINE', 'OFFLINE']);

// Time validation helper
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const TimeSchema = z.string().regex(timeRegex, 'Invalid time format (HH:mm)');

// Date validation helper
const FutureDateSchema = z.date().refine(
  (date) => date > new Date(),
  'Appointment date must be in the future'
);

// Create appointment schema
export const CreateAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  clinicId: z.string().optional(),
  appointmentDate: z.string().datetime().transform((str) => new Date(str)).pipe(FutureDateSchema),
  startTime: TimeSchema,
  endTime: TimeSchema,
  type: AppointmentTypeSchema.default('OFFLINE'),
  symptoms: z.string().max(1000, 'Symptoms must be less than 1000 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
}).refine(
  (data) => {
    // Validate that endTime is after startTime
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return endTotalMinutes > startTotalMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
).refine(
  (data) => {
    // Validate appointment duration (minimum 15 minutes, maximum 4 hours)
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    return durationMinutes >= 15 && durationMinutes <= 240;
  },
  {
    message: 'Appointment duration must be between 15 minutes and 4 hours',
    path: ['endTime']
  }
);

// Update appointment schema
export const UpdateAppointmentSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  symptoms: z.string().max(1000, 'Symptoms must be less than 1000 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  meetingUrl: z.string().url('Invalid meeting URL').optional(),
  meetingId: z.string().max(100, 'Meeting ID must be less than 100 characters').optional()
});

// Query filters schema
export const AppointmentFiltersSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  type: AppointmentTypeSchema.optional(),
  dateFrom: z.string().datetime().transform((str) => new Date(str)).optional(),
  dateTo: z.string().datetime().transform((str) => new Date(str)).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

// Available slots query schema
export const AvailableSlotsSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().datetime().transform((str) => new Date(str)).pipe(FutureDateSchema)
});

// Cancel appointment schema
export const CancelAppointmentSchema = z.object({
  reason: z.string().max(500, 'Cancellation reason must be less than 500 characters').optional()
});

// ID parameter schema
export const AppointmentIdSchema = z.object({
  id: z.string().min(1, 'Appointment ID is required')
});

// Patient appointments query schema
export const PatientAppointmentsSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

// Doctor appointments query schema  
export const DoctorAppointmentsSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  dateFrom: z.string().datetime().transform((str) => new Date(str)).optional(),
  dateTo: z.string().datetime().transform((str) => new Date(str)).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});

// Type exports
export type CreateAppointmentInput = z.input<typeof CreateAppointmentSchema>;
export type CreateAppointmentOutput = z.output<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.input<typeof UpdateAppointmentSchema>;
export type AppointmentFiltersInput = z.input<typeof AppointmentFiltersSchema>;
export type AvailableSlotsInput = z.input<typeof AvailableSlotsSchema>;
export type CancelAppointmentInput = z.input<typeof CancelAppointmentSchema>;
