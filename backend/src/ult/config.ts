import dotenv from 'dotenv';

dotenv.config();

/**
 * Reads and validates every environment variable the application needs.
 * A missing required variable stops the process immediately (fail fast on boot).
 */
// DB_PASSWORD is intentionally not here: an empty password is valid (e.g. a
// local XAMPP/MariaDB `root` account), so it is read separately and allowed to
// be blank.
const REQUIRED = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
] as const;

function readRequired(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    // eslint-disable-next-line no-console
    console.error(`[config] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

for (const name of REQUIRED) {
  readRequired(name);
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: readRequired('DB_HOST'),
    port: Number(readRequired('DB_PORT')),
    user: readRequired('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: readRequired('DB_NAME'),
  },
  jwt: {
    secret: readRequired('JWT_SECRET'),
    expiresIn: readRequired('JWT_EXPIRES_IN'),
  },
} as const;

export type Config = typeof config;
