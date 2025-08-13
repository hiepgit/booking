import type { TokenPayload, UserRole } from "../types/index.js";
export declare function isTokenPayload(value: unknown): value is TokenPayload;
export declare function assertTokenPayload(value: unknown): asserts value is TokenPayload;
export declare function isUserRole(value: unknown): value is UserRole;
export declare function hasAnyRole(value: unknown, roles: ReadonlyArray<UserRole>): value is TokenPayload;
