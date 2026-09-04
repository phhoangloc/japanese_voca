import { adminRepository } from '../repository/admin.repository';
import { ApiError } from '../ult/api-error';
import { compare } from '../ult/password';
import { sign } from '../ult/jwt';

export const authService = {
  /**
   * Validate admin credentials and return a signed access token.
   * Any failure yields the same 401 so callers cannot probe valid usernames.
   */
  async login(username: string, password: string): Promise<{ token: string }> {
    const admin = await adminRepository.findByUsername(username);
    if (!admin) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const ok = await compare(password, admin.password);
    if (!ok) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = sign({ sub: admin.id, username: admin.username });
    return { token };
  },
};
