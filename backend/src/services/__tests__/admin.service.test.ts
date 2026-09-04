import { adminService } from '../admin.service';
import { adminRepository } from '../../repository/admin.repository';
import * as password from '../../ult/password';
import { Admin } from '../../types/entities';

jest.mock('../../repository/admin.repository');
jest.mock('../../ult/password');

const repo = adminRepository as jest.Mocked<typeof adminRepository>;
const pwd = password as jest.Mocked<typeof password>;

const stored: Admin = {
  id: 1,
  username: 'root',
  password: 'old-hash',
  email: 'root@example.com',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('adminService', () => {
  it('hashes the password on create and never returns it', async () => {
    pwd.hash.mockResolvedValue('new-hash');
    repo.create.mockResolvedValue(1);
    repo.findById.mockResolvedValue({ ...stored, password: 'new-hash' });

    const result = await adminService.create({
      username: 'root',
      password: 'plain',
      email: 'root@example.com',
    });

    expect(pwd.hash).toHaveBeenCalledWith('plain');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'new-hash' }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('re-hashes on update only when a new password is supplied', async () => {
    repo.findById.mockResolvedValue(stored);
    repo.update.mockResolvedValue(1);
    pwd.hash.mockResolvedValue('re-hash');

    await adminService.update(1, { username: 'root', email: 'root@example.com', password: 'x' });
    expect(repo.update).toHaveBeenLastCalledWith(1, expect.objectContaining({ password: 're-hash' }));

    pwd.hash.mockClear();
    await adminService.update(1, { username: 'root', email: 'root@example.com' });
    expect(pwd.hash).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ password: 'old-hash' }),
    );
  });

  it('rejects with 404 when updating a missing admin', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      adminService.update(99, { username: 'x', email: 'x@example.com' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects with 404 when deleting a missing admin', async () => {
    repo.remove.mockResolvedValue(0);
    await expect(adminService.remove(99)).rejects.toMatchObject({ status: 404 });
  });
});
