import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../ult/api-error';
import { verify } from '../ult/jwt';

/**
 * Guards every protected route. Expects `Authorization: Bearer <jwt>`, verifies
 * the token and attaches `req.admin`. Any problem results in a 401.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verify(token);
    req.admin = { id: payload.sub, username: payload.username };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
