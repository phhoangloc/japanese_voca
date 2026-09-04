import { authService } from '../auth.service';
import { adminRepository } from '../../repository/admin.repository';
import * as password from '../../ult/password';
import { verify } from '../../ult/jwt';
import { ApiError } from '../../ult/api-error';
import { Admin } from '../../types/entities';

jest.mock('../../repository/admin.repository');
jest.mock('../../ult/password');

const repo = adminRepository as jest.Mocked<typeof adminRepository>;
const pwd = password as jest.Mocked<typeof password>;

const admin: Admin = {
  id: 7,
  username: 'root',
  password: 'stored-hash',
  email: 'root@example.com',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('authService.login', () => {
  it('returns a verifiable token on valid credentials', async () => {
    repo.findByUsername.mockResolvedValue(admin);
    pwd.compare.mockResolvedValue(true);

    const { token } = await authService.login('root', 'secret');

    expect(typeof token).toBe('string');
    const payload = verify(token);
    expect(payload).toMatchObject({ sub: 7, username: 'root' });
    expect(pwd.compare).toHaveBeenCalledWith('secret', 'stored-hash');
  });

  it('rejects with 401 when the password does not match', async () => {
    repo.findByUsername.mockResolvedValue(admin);
    pwd.compare.mockResolvedValue(false);

    await expect(authService.login('root', 'wrong')).rejects.toMatchObject({
      status: 401,
    });
  });

  it('rejects with 401 when the username is unknown', async () => {
    repo.findByUsername.mockResolvedValue(null);

    await expect(authService.login('ghost', 'secret')).rejects.toBeInstanceOf(ApiError);
    expect(pwd.compare).not.toHaveBeenCalled();
  });
});
