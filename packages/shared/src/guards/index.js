import { TokenPayloadSchema, UserRoleSchema } from "../schemas/index.js";
export function isTokenPayload(value) {
    const parsed = TokenPayloadSchema.safeParse(value);
    return parsed.success;
}
export function assertTokenPayload(value) {
    const parsed = TokenPayloadSchema.safeParse(value);
    if (!parsed.success) {
        throw new Error("Invalid token payload");
    }
}
export function isUserRole(value) {
    const parsed = UserRoleSchema.safeParse(value);
    return parsed.success;
}
export function hasAnyRole(value, roles) {
    const parsed = TokenPayloadSchema.safeParse(value);
    if (!parsed.success)
        return false;
    return roles.includes(parsed.data.role);
}
