import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from './config';

export interface TokenPayload {
  sub: number;
  username: string;
}

/** Sign an access token for an authenticated admin. */
export function sign(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

/** Verify a token and return its payload, or throw if invalid/expired. */
export function verify(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwt.secret);
  if (typeof decoded === 'string') {
    throw new Error('Unexpected token payload');
  }
  return { sub: Number(decoded.sub), username: String(decoded.username) };
}
