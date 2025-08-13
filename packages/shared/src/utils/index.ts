export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function assertNonEmptyString(value: unknown, fieldName = "value"): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}


