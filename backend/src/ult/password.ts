import bcrypt from 'bcrypt';

const COST = 10;

/** Hash a plain-text password for storage. */
export function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

/** Compare a plain-text password against a stored bcrypt hash. */
export function compare(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
