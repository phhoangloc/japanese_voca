import { customerService } from '../customer.service';
import { adminRepository } from '../../repository/admin.repository';
import { customerRepository } from '../../repository/customer.repository';
import { fileRepository } from '../../repository/file.repository';
import * as password from '../../ult/password';
import { Admin, Customer } from '../../types/entities';

jest.mock('../../repository/admin.repository');
jest.mock('../../repository/customer.repository');
jest.mock('../../repository/file.repository');
jest.mock('../../ult/password');

const admins = adminRepository as jest.Mocked<typeof adminRepository>;
const customers = customerRepository as jest.Mocked<typeof customerRepository>;
const files = fileRepository as jest.Mocked<typeof fileRepository>;
const pwd = password as jest.Mocked<typeof password>;

const admin: Admin = {
  id: 1,
  username: 'root',
  password: 'h',
  email: 'root@example.com',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

const customerRow: Customer = {
  id: 5,
  username: 'alice',
  password: 'stored-hash',
  email: 'alice@example.com',
  point: 10,
  avatarId: null,
  adminId: 1,
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

const baseInput = {
  username: 'alice',
  password: 'plain',
  email: 'alice@example.com',
  adminId: 1,
};

describe('customerService.create', () => {
  it('hashes the password, defaults point, and strips the password from the result', async () => {
    admins.findById.mockResolvedValue(admin);
    pwd.hash.mockResolvedValue('hashed');
    customers.create.mockResolvedValue(5);
    customers.findById.mockResolvedValue(customerRow);

    const result = await customerService.create(baseInput);

    expect(pwd.hash).toHaveBeenCalledWith('plain');
    expect(customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed', point: 0, avatarId: null, adminId: 1 }),
    );
    expect(result).not.toHaveProperty('password');
    expect(result).toMatchObject({ id: 5, username: 'alice' });
  });

  it('rejects with 400 when adminId does not exist', async () => {
    admins.findById.mockResolvedValue(null);

    await expect(customerService.create(baseInput)).rejects.toMatchObject({ status: 400 });
    expect(customers.create).not.toHaveBeenCalled();
  });

  it('rejects with 400 when avatarId does not reference a file', async () => {
    admins.findById.mockResolvedValue(admin);
    files.exists.mockResolvedValue(false);

    await expect(
      customerService.create({ ...baseInput, avatarId: 99 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('customerService.getById', () => {
  it('rejects with 404 when the customer is missing', async () => {
    customers.findById.mockResolvedValue(null);
    await expect(customerService.getById(123)).rejects.toMatchObject({ status: 404 });
  });
});
