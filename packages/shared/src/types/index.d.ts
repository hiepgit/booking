export type UserId = string & {
    readonly __brand: "UserId";
};
export type EmailString = string & {
    readonly __brand: "EmailString";
};
export type PhoneString = string & {
    readonly __brand: "PhoneString";
};
export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";
export interface JwtTokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface TokenPayload {
    sub: UserId;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface PagingQuery {
    page?: number;
    pageSize?: number;
}
export interface PagingResult<TItem> {
    items: TItem[];
    totalItems: number;
    page: number;
    pageSize: number;
}
export interface Specialty {
    id: string;
    name: string;
    description?: string;
}
export interface Clinic {
    id: string;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
}
export interface Doctor {
    id: string;
    fullName: string;
    specialtyId: string;
    clinicId?: string;
    rating?: number;
}
export interface ScheduleSlot {
    id: string;
    doctorId: string;
    startUtcIso: string;
    endUtcIso: string;
    isBooked: boolean;
}
