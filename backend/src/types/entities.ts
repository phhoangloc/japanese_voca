/** Row shapes as returned by the repository layer (camelCase, DB timestamps mapped). */

export interface Admin {
  id: number;
  username: string;
  password: string;
  email: string;
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

export interface Customer {
  id: number;
  username: string;
  password: string;
  email: string;
  point: number;
  avatarId: number | null;
  adminId: number;
  createdAt: string;
  updatedAt: string;
}

/** Same entities without the password field - the only shape sent to clients. */
export type PublicAdmin = Omit<Admin, 'password'>;
export type PublicCustomer = Omit<Customer, 'password'>;

export type CreateAdminInput = { username: string; password: string; email: string };
export type UpdateAdminInput = { username: string; password?: string; email: string };

export type CreateFileInput = { name: string; detail?: string | null };
export type UpdateFileInput = { name: string; detail?: string | null };

export type CreateCustomerInput = {
  username: string;
  password: string;
  email: string;
  point?: number;
  avatarId?: number | null;
  adminId: number;
};
export type UpdateCustomerInput = {
  username: string;
  password?: string;
  email: string;
  point?: number;
  avatarId?: number | null;
  adminId: number;
};
