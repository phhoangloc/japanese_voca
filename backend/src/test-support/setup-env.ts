/**
 * Provides the environment variables that src/ult/config.ts requires so that
 * unit tests can import the application modules without a real .env file.
 * Runs before any test module is loaded (jest `setupFiles`).
 */
process.env.PORT = process.env.PORT ?? '3000';
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '3306';
process.env.DB_USER = process.env.DB_USER ?? 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'test';
process.env.DB_NAME = process.env.DB_NAME ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-value-for-unit-tests';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
