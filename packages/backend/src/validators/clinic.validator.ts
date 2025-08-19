import { z } from 'zod';

// Base clinic validation schemas
export const clinicNameSchema = z.string()
  .min(1, 'Clinic name is required')
  .max(255, 'Clinic name must be less than 255 characters');

export const clinicAddressSchema = z.string()
  .min(1, 'Address is required')
  .max(500, 'Address must be less than 500 characters');

export const clinicPhoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/, 'Invalid phone number format');

export const clinicEmailSchema = z.string()
  .email('Invalid email format')
  .optional();

export const coordinateSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
});

export const timeSchema = z.string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format');

export const workingHoursSchema = z.object({
  openTime: timeSchema,
  closeTime: timeSchema,
}).refine(
  (data) => data.openTime < data.closeTime,
  {
    message: 'Open time must be before close time',
    path: ['closeTime'],
  }
);

export const clinicImagesSchema = z.array(z.string().url('Invalid image URL'))
  .max(10, 'Maximum 10 images allowed')
  .optional()
  .default([]);

export const clinicDescriptionSchema = z.string()
  .max(1000, 'Description must be less than 1000 characters')
  .optional();

// Main clinic schemas
export const createClinicSchema = z.object({
  name: clinicNameSchema,
  address: clinicAddressSchema,
  phone: clinicPhoneSchema,
  email: clinicEmailSchema,
  latitude: coordinateSchema.shape.latitude,
  longitude: coordinateSchema.shape.longitude,
  openTime: timeSchema,
  closeTime: timeSchema,
  images: clinicImagesSchema,
  description: clinicDescriptionSchema,
}).refine(
  (data) => {
    if (data.openTime && data.closeTime) {
      return data.openTime < data.closeTime;
    }
    return true;
  },
  {
    message: 'Open time must be before close time',
    path: ['closeTime'],
  }
).refine(
  (data) => {
    // If one coordinate is provided, both must be provided
    const hasLat = data.latitude !== undefined;
    const hasLng = data.longitude !== undefined;
    return hasLat === hasLng;
  },
  {
    message: 'Both latitude and longitude must be provided together',
    path: ['longitude'],
  }
);

export const updateClinicSchema = createClinicSchema.partial();

// Search and filter schemas
export const nearbyClinicQuerySchema = z.object({
  lat: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  radius: z.number()
    .min(0.1, 'Radius must be at least 0.1 km')
    .max(50, 'Radius cannot exceed 50 km')
    .default(5),
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
});

export const clinicSearchQuerySchema = z.object({
  city: z.string()
    .min(1, 'City name cannot be empty')
    .max(100, 'City name must be less than 100 characters')
    .optional(),
  district: z.string()
    .min(1, 'District name cannot be empty')
    .max(100, 'District name must be less than 100 characters')
    .optional(),
  name: z.string()
    .min(1, 'Clinic name cannot be empty')
    .max(255, 'Clinic name must be less than 255 characters')
    .optional(),
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
});

// Clinic-Doctor relationship schemas
export const workingDaysSchema = z.array(
  z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
).min(1, 'At least one working day must be selected')
  .max(7, 'Cannot have more than 7 working days');

export const doctorScheduleSchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: 'Start time must be before end time',
    path: ['endTime'],
  }
);

export const addDoctorToClinicSchema = z.object({
  doctorId: z.string().cuid('Invalid doctor ID'),
  workingDays: workingDaysSchema,
  startTime: timeSchema,
  endTime: timeSchema,
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: 'Start time must be before end time',
    path: ['endTime'],
  }
);

export const updateDoctorScheduleSchema = z.object({
  workingDays: workingDaysSchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.startTime < data.endTime;
    }
    return true;
  },
  {
    message: 'Start time must be before end time',
    path: ['endTime'],
  }
);

// Parameter validation schemas
export const clinicIdParamSchema = z.object({
  id: z.string().cuid('Invalid clinic ID'),
});

export const clinicDoctorParamsSchema = z.object({
  clinicId: z.string().cuid('Invalid clinic ID'),
  doctorId: z.string().cuid('Invalid doctor ID'),
});

export const paginationQuerySchema = z.object({
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .pipe(z.number().int().min(1)),
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 10)
    .pipe(z.number().int().min(1).max(50)),
});

// Type exports
export type CreateClinicData = z.infer<typeof createClinicSchema>;
export type UpdateClinicData = z.infer<typeof updateClinicSchema>;
export type NearbyClinicQuery = z.infer<typeof nearbyClinicQuerySchema>;
export type ClinicSearchQuery = z.infer<typeof clinicSearchQuerySchema>;
export type AddDoctorToClinicData = z.infer<typeof addDoctorToClinicSchema>;
export type UpdateDoctorScheduleData = z.infer<typeof updateDoctorScheduleSchema>;
export type ClinicIdParam = z.infer<typeof clinicIdParamSchema>;
export type ClinicDoctorParams = z.infer<typeof clinicDoctorParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
