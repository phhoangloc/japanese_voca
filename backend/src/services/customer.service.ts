import { adminRepository } from '../repository/admin.repository';
import { customerRepository } from '../repository/customer.repository';
import { fileRepository } from '../repository/file.repository';
import { ApiError } from '../ult/api-error';
import { hash } from '../ult/password';
import {
  CreateCustomerInput,
  Customer,
  PublicCustomer,
  UpdateCustomerInput,
} from '../types/entities';

function toPublic(customer: Customer): PublicCustomer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = customer;
  return rest;
}

async function assertReferences(adminId: number, avatarId: number | null | undefined): Promise<void> {
  const admin = await adminRepository.findById(adminId);
  if (!admin) throw ApiError.badRequest(`adminId ${adminId} does not reference an existing admin`);

  if (avatarId !== undefined && avatarId !== null) {
    const fileExists = await fileRepository.exists(avatarId);
    if (!fileExists) {
      throw ApiError.badRequest(`avatarId ${avatarId} does not reference an existing file`);
    }
  }
}

export const customerService = {
  async list(): Promise<PublicCustomer[]> {
    const customers = await customerRepository.findAll();
    return customers.map(toPublic);
  },

  async getById(id: number): Promise<PublicCustomer> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    return toPublic(customer);
  },

  async create(input: CreateCustomerInput): Promise<PublicCustomer> {
    await assertReferences(input.adminId, input.avatarId);

    const hashed = await hash(input.password);
    const id = await customerRepository.create({
      username: input.username,
      password: hashed,
      email: input.email,
      point: input.point ?? 0,
      avatarId: input.avatarId ?? null,
      adminId: input.adminId,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateCustomerInput): Promise<PublicCustomer> {
    const existing = await customerRepository.findById(id);
    if (!existing) throw ApiError.notFound('Customer not found');

    await assertReferences(input.adminId, input.avatarId);

    const password = input.password ? await hash(input.password) : existing.password;

    await customerRepository.update(id, {
      username: input.username,
      password,
      email: input.email,
      point: input.point ?? existing.point,
      avatarId: input.avatarId ?? null,
      adminId: input.adminId,
    });
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const affected = await customerRepository.remove(id);
    if (affected === 0) throw ApiError.notFound('Customer not found');
  },
};
