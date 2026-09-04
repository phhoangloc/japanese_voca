import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { Admin } from '../types/entities';

const COLUMNS =
  'id, username, password, email, created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): Admin {
  return {
    id: Number(row.id),
    username: row.username,
    password: row.password,
    email: row.email,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export const adminRepository = {
  async findAll(): Promise<Admin[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM admin ORDER BY id`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Admin | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM admin WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async findByUsername(username: string): Promise<Admin | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM admin WHERE username = ?`,
      [username],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async create(data: { username: string; password: string; email: string }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO admin (username, password, email) VALUES (?, ?, ?)',
      [data.username, data.password, data.email],
    );
    return result.insertId;
  },

  async update(
    id: number,
    data: { username: string; password: string; email: string },
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE admin SET username = ?, password = ?, email = ? WHERE id = ?',
      [data.username, data.password, data.email, id],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM admin WHERE id = ?', [id]);
    return result.affectedRows;
  },
};
