import { TokenPayloadSchema, UserRoleSchema } from "../schemas/index.js";
import type { TokenPayload, UserRole } from "../types/index.js";

export function isTokenPayload(value: unknown): value is TokenPayload {
  const parsed = TokenPayloadSchema.safeParse(value);
  return parsed.success;
}

export function assertTokenPayload(value: unknown): asserts value is TokenPayload {
  const parsed = TokenPayloadSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid token payload");
  }
}

export function isUserRole(value: unknown): value is UserRole {
  const parsed = UserRoleSchema.safeParse(value);
  return parsed.success;
}

export function hasAnyRole(value: unknown, roles: ReadonlyArray<UserRole>): value is TokenPayload {
  const parsed = TokenPayloadSchema.safeParse(value);
  if (!parsed.success) return false;
  return roles.includes(parsed.data.role);
}


