import { ApiError } from './api-error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accumulates field-level messages and throws a single 400 at the end. */
export class Validator {
  private readonly errors: Record<string, string> = {};

  requireString(field: string, value: unknown): string {
    if (typeof value !== 'string' || value.trim() === '') {
      this.errors[field] = `${field} is required`;
      return '';
    }
    return value.trim();
  }

  optionalString(field: string, value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string' || value.trim() === '') {
      this.errors[field] = `${field} must be a non-empty string`;
      return undefined;
    }
    return value.trim();
  }

  email(field: string, value: unknown): string {
    const str = this.requireString(field, value);
    if (str && !EMAIL_RE.test(str)) {
      this.errors[field] = `${field} must be a valid email`;
    }
    return str;
  }

  /** Non-negative integer; returns undefined when the value is absent. */
  optionalNonNegativeInt(field: string, value: unknown): number | undefined {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0) {
      this.errors[field] = `${field} must be an integer >= 0`;
      return undefined;
    }
    return num;
  }

  /** Required non-negative integer. */
  requireNonNegativeInt(field: string, value: unknown): number {
    if (value === undefined || value === null || value === '') {
      this.errors[field] = `${field} is required`;
      return 0;
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0) {
      this.errors[field] = `${field} must be an integer >= 0`;
      return 0;
    }
    return num;
  }

  /** Positive integer id; returns undefined when absent (unless `required`). */
  id(field: string, value: unknown, required: boolean): number | undefined {
    if (value === undefined || value === null) {
      if (required) this.errors[field] = `${field} is required`;
      return undefined;
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      this.errors[field] = `${field} must be a positive integer`;
      return undefined;
    }
    return num;
  }

  throwIfInvalid(): void {
    if (Object.keys(this.errors).length > 0) {
      throw ApiError.badRequest('Validation failed', this.errors);
    }
  }
}

/** Parse a route `:id` param into a positive integer or throw 400. */
export function parseIdParam(raw: string): number {
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) {
    throw ApiError.badRequest('id must be a positive integer');
  }
  return num;
}
