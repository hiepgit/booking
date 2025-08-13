import { z } from "zod";
export declare const UserRoleSchema: z.ZodEffects<z.ZodEnum<["PATIENT", "DOCTOR", "ADMIN"]>, "PATIENT" | "DOCTOR" | "ADMIN", "PATIENT" | "DOCTOR" | "ADMIN">;
export declare const TokenPayloadSchema: z.ZodObject<{
    sub: z.ZodString;
    email: z.ZodString;
    role: z.ZodEffects<z.ZodEnum<["PATIENT", "DOCTOR", "ADMIN"]>, "PATIENT" | "DOCTOR" | "ADMIN", "PATIENT" | "DOCTOR" | "ADMIN">;
    iat: z.ZodOptional<z.ZodNumber>;
    exp: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    sub: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    iat?: number | undefined;
    exp?: number | undefined;
}, {
    sub: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    iat?: number | undefined;
    exp?: number | undefined;
}>;
export declare const PagingQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    page?: number | undefined;
    pageSize?: number | undefined;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const SpecialtySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    name: string;
    id: string;
    description?: string | undefined;
}, {
    name: string;
    id: string;
    description?: string | undefined;
}>;
export declare const ClinicSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    address: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    name: string;
    id: string;
    address: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    name: string;
    id: string;
    address: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
export declare const DoctorSchema: z.ZodObject<{
    id: z.ZodString;
    fullName: z.ZodString;
    specialtyId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    id: string;
    specialtyId: string;
    fullName: string;
    clinicId?: string | undefined;
    rating?: number | undefined;
}, {
    id: string;
    specialtyId: string;
    fullName: string;
    clinicId?: string | undefined;
    rating?: number | undefined;
}>;
export declare const ScheduleSlotSchema: z.ZodObject<{
    id: z.ZodString;
    doctorId: z.ZodString;
    startUtcIso: z.ZodString;
    endUtcIso: z.ZodString;
    isBooked: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    id: string;
    doctorId: string;
    startUtcIso: string;
    endUtcIso: string;
    isBooked: boolean;
}, {
    id: string;
    doctorId: string;
    startUtcIso: string;
    endUtcIso: string;
    isBooked: boolean;
}>;
export declare const AuthRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    role: z.ZodEffects<z.ZodEnum<["PATIENT", "DOCTOR", "ADMIN"]>, "PATIENT" | "DOCTOR" | "ADMIN", "PATIENT" | "DOCTOR" | "ADMIN">;
}, "strict", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    fullName: string;
}, {
    email: string;
    password: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
    fullName: string;
}>;
export declare const AuthLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const VerifyOtpSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    email: string;
    otp: string;
}, {
    email: string;
    otp: string;
}>;
export declare const TokenPairSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
}, "strict", z.ZodTypeAny, {
    accessToken: string;
    refreshToken: string;
}, {
    accessToken: string;
    refreshToken: string;
}>;
export type TokenPayloadInput = z.input<typeof TokenPayloadSchema>;
export type TokenPayloadOutput = z.output<typeof TokenPayloadSchema>;
