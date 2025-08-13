import { z } from "zod";
import type { UserRole } from "../types";

export const UserRoleSchema = z.enum(["PATIENT", "DOCTOR", "ADMIN"]).transform((v) => v as UserRole);

export const TokenPayloadSchema = z
  .object({
    sub: z.string().min(1),
    email: z.string().email(),
    role: UserRoleSchema,
    iat: z.number().optional(),
    exp: z.number().optional(),
  })
  .strict();

export const PagingQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(200).optional(),
  })
  .strict();

export const SpecialtySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export const ClinicSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .strict();

export const DoctorSchema = z
  .object({
    id: z.string().min(1),
    fullName: z.string().min(1),
    specialtyId: z.string().min(1),
    clinicId: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
  })
  .strict();

export const ScheduleSlotSchema = z
  .object({
    id: z.string().min(1),
    doctorId: z.string().min(1),
    startUtcIso: z.string().datetime({ offset: true }),
    endUtcIso: z.string().datetime({ offset: true }),
    isBooked: z.boolean(),
  })
  .strict();

export const AuthRegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(1),
    role: UserRoleSchema,
  })
  .strict();

export const AuthLoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const VerifyOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6),
  })
  .strict();

export const TokenPairSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  .strict();

export type TokenPayloadInput = z.input<typeof TokenPayloadSchema>;
export type TokenPayloadOutput = z.output<typeof TokenPayloadSchema>;


