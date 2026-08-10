import { AppError } from "./error.ts";

export const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, `${field} is required`);
  }
  return value.trim();
};

export const optionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const str = String(value);
  return str.length === 0 ? undefined : str;
};

export const validateEmail = (value: unknown): string => {
  const email = requiredString(value, "email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, "A valid email is required");
  }
  return email;
};

export const requiredNumber = (value: unknown, field: string): number => {
  if (value === undefined || value === null || value === "") {
    throw new AppError(400, `${field} is required`);
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new AppError(400, `${field} must be a valid number`);
  }
  return num;
};

export const optionalNumber = (value: unknown, fallback: number): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

export const optionalEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T | undefined => {
  if (value === undefined || value === null) return undefined;
  const candidate = value as T;
  if (!allowed.includes(candidate)) {
    throw new AppError(400, `${field} is invalid`);
  }
  return candidate;
};