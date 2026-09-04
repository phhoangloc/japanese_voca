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

/** Error body returned by the backend. */
export interface ApiErrorBody {
  error: string;
  details?: Record<string, string>;
}

export type FieldErrors = Record<string, string>;
