import { adminRepository } from '../repository/admin.repository';
import { ApiError } from '../ult/api-error';
import { hash } from '../ult/password';
import {
  Admin,
  CreateAdminInput,
  PublicAdmin,
  UpdateAdminInput,
} from '../types/entities';

function toPublic(admin: Admin): PublicAdmin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = admin;
  return rest;
}

export const adminService = {
  async list(): Promise<PublicAdmin[]> {
    const admins = await adminRepository.findAll();
    return admins.map(toPublic);
  },

  async getById(id: number): Promise<PublicAdmin> {
    const admin = await adminRepository.findById(id);
    if (!admin) throw ApiError.notFound('Admin not found');
    return toPublic(admin);
  },

  async create(input: CreateAdminInput): Promise<PublicAdmin> {
    const hashed = await hash(input.password);
    const id = await adminRepository.create({
      username: input.username,
      password: hashed,
      email: input.email,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateAdminInput): Promise<PublicAdmin> {
    const existing = await adminRepository.findById(id);
    if (!existing) throw ApiError.notFound('Admin not found');

    // Re-hash only when a new password is supplied; otherwise keep the stored one.
    const password = input.password ? await hash(input.password) : existing.password;

    await adminRepository.update(id, {
      username: input.username,
      password,
      email: input.email,
    });
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const affected = await adminRepository.remove(id);
    if (affected === 0) throw ApiError.notFound('Admin not found');
  },
};
