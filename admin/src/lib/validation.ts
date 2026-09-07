import type { FieldErrors } from "./types";

/** Same basic pattern the backend uses (ult/validate.ts). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AdminFormValues {
  username: string;
  email: string;
  password: string;
}

export interface CustomerFormValues {
  username: string;
  email: string;
  password: string;
  point: string;
  adminId: string;
}

export interface FileFormValues {
  name: string;
  detail: string;
}

function requireText(errors: FieldErrors, field: string, value: string) {
  if (!value.trim()) errors[field] = `${field} is required`;
}

/** `isEdit` => password may be blank (keep current). */
export function validateAdmin(v: AdminFormValues, isEdit: boolean): FieldErrors {
  const errors: FieldErrors = {};
  requireText(errors, "username", v.username);
  requireText(errors, "email", v.email);
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim()))
    errors.email = "email must be a valid email";
  if (!isEdit) requireText(errors, "password", v.password);
  return errors;
}

export function validateCustomer(
  v: CustomerFormValues,
  isEdit: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  requireText(errors, "username", v.username);
  requireText(errors, "email", v.email);
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim()))
    errors.email = "email must be a valid email";
  if (!isEdit) requireText(errors, "password", v.password);

  if (v.point.trim() !== "") {
    const n = Number(v.point);
    if (!Number.isInteger(n) || n < 0)
      errors.point = "point must be an integer >= 0";
  }

  const adminId = Number(v.adminId);
  if (!v.adminId.trim() || !Number.isInteger(adminId) || adminId <= 0)
    errors.adminId = "adminId is required";

  return errors;
}

export function validateFile(v: FileFormValues): FieldErrors {
  const errors: FieldErrors = {};
  requireText(errors, "name", v.name);
  return errors;
}

export interface WordFormValues {
  word: string;
  explain: string;
}

export function validateWord(v: WordFormValues): FieldErrors {
  const errors: FieldErrors = {};
  requireText(errors, "word", v.word);
  return errors;
}

export interface CourseFormValues {
  name: string;
}

export function validateCourse(v: CourseFormValues): FieldErrors {
  const errors: FieldErrors = {};
  requireText(errors, "name", v.name);
  return errors;
}

export interface ChapterFormValues {
  number: string;
  name: string;
  courseId: string;
}

export function validateChapter(v: ChapterFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const n = Number(v.number);
  if (v.number.trim() === "" || !Number.isInteger(n) || n < 0)
    errors.number = "number must be an integer >= 0";
  requireText(errors, "name", v.name);
  const courseId = Number(v.courseId);
  if (!v.courseId.trim() || !Number.isInteger(courseId) || courseId <= 0)
    errors.courseId = "courseId is required";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
