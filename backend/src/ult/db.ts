import mysql from 'mysql2/promise';
import { config } from './config';

/**
 * Single shared connection pool. Every repository imports this pool and issues
 * parameterized queries through it. No ORM is used anywhere in the project.
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
});
