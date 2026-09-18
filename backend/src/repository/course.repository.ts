import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { Course } from '../types/entities';

const COLUMNS =
  'id, name, imageId, created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): Course {
  return {
    id: Number(row.id),
    name: row.name,
    imageId: row.imageId === null ? null : Number(row.imageId),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export const courseRepository = {
  async findAll(): Promise<Course[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM course ORDER BY id DESC`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Course | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM course WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async exists(id: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM course WHERE id = ?',
      [id],
    );
    return rows.length > 0;
  },

  async create(data: { name: string; imageId: number | null }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO course (name, imageId) VALUES (?, ?)',
      [data.name, data.imageId],
    );
    return result.insertId;
  },

  async update(
    id: number,
    data: { name: string; imageId: number | null },
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE course SET name = ?, imageId = ? WHERE id = ?',
      [data.name, data.imageId, id],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM course WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },
};
