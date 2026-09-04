import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { Customer } from '../types/entities';

const COLUMNS =
  'id, username, password, email, point, avatarId, adminId, ' +
  'created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): Customer {
  return {
    id: Number(row.id),
    username: row.username,
    password: row.password,
    email: row.email,
    point: Number(row.point),
    avatarId: row.avatarId === null ? null : Number(row.avatarId),
    adminId: Number(row.adminId),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

interface CustomerWriteRow {
  username: string;
  password: string;
  email: string;
  point: number;
  avatarId: number | null;
  adminId: number;
}

export const customerRepository = {
  async findAll(): Promise<Customer[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM customer ORDER BY id`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Customer | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM customer WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async create(data: CustomerWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO customer (username, password, email, point, avatarId, adminId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.username, data.password, data.email, data.point, data.avatarId, data.adminId],
    );
    return result.insertId;
  },

  async update(id: number, data: CustomerWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE customer
         SET username = ?, password = ?, email = ?, point = ?, avatarId = ?, adminId = ?
       WHERE id = ?`,
      [data.username, data.password, data.email, data.point, data.avatarId, data.adminId, id],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM customer WHERE id = ?', [id]);
    return result.affectedRows;
  },
};
