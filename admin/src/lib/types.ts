/** Entity + input shapes mirroring the backend API (docs/spec/functional-design.md §2). */

export interface Admin {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  username: string;
  email: string;
  point: number;
  avatarId: number | null;
  adminId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: number;
  name: string;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminInput {
  username: string;
  email: string;
  password: string;
}
export interface UpdateAdminInput {
  username: string;
  email: string;
  /** Omit / empty => keep the stored password. */
  password?: string;
}

export interface CreateCustomerInput {
  username: string;
  email: string;
  password: string;
  point?: number;
  avatarId?: number | null;
  adminId: number;
}
export interface UpdateCustomerInput {
  username: string;
  email: string;
  password?: string;
  point?: number;
  avatarId?: number | null;
  adminId: number;
}

export interface CreateFileInput {
  name: string;
  detail?: string | null;
}
export type UpdateFileInput = CreateFileInput;

export interface Word {
  id: number;
  word: string;
  explain: string | null;
  imageId: number | null;
  soundId: number | null;
  readExplainId: number | null;
  chapterId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWordInput {
  word: string;
  explain?: string | null;
  imageId?: number | null;
  soundId?: number | null;
  readExplainId?: number | null;
  chapterId?: number | null;
}
export type UpdateWordInput = CreateWordInput;

export interface Course {
  id: number;
  name: string;
  imageId: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreateCourseInput {
  name: string;
  imageId?: number | null;
}
export type UpdateCourseInput = CreateCourseInput;

export interface Chapter {
  id: number;
  number: number;
  name: string;
  imageId: number | null;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateChapterInput {
  number: number;
  name: string;
  imageId?: number | null;
  courseId: number;
}
export type UpdateChapterInput = CreateChapterInput;

/** Error body returned by the backend. */
export interface ApiErrorBody {
  error: string;
  details?: Record<string, string>;
}

export type FieldErrors = Record<string, string>;
