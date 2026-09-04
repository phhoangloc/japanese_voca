import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { FileRecord } from '../types/entities';

const COLUMNS = 'id, name, detail, created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): FileRecord {
  return {
    id: Number(row.id),
    name: row.name,
    detail: row.detail ?? null,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export const fileRepository = {
  async findAll(): Promise<FileRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM file ORDER BY id`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<FileRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM file WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async exists(id: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT 1 FROM file WHERE id = ?', [id]);
    return rows.length > 0;
  },

  async create(data: { name: string; detail: string | null }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO file (name, detail) VALUES (?, ?)',
      [data.name, data.detail],
    );
    return result.insertId;
  },

  async update(id: number, data: { name: string; detail: string | null }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE file SET name = ?, detail = ? WHERE id = ?',
      [data.name, data.detail, id],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM file WHERE id = ?', [id]);
    return result.affectedRows;
  },
};
