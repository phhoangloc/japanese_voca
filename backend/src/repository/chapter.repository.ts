import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { Chapter } from '../types/entities';

const COLUMNS =
  'id, number, name, imageId, courseId, ' +
  'created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): Chapter {
  return {
    id: Number(row.id),
    number: Number(row.number),
    name: row.name,
    imageId: row.imageId === null ? null : Number(row.imageId),
    courseId: Number(row.courseId),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

interface ChapterWriteRow {
  number: number;
  name: string;
  imageId: number | null;
  courseId: number;
}

export const chapterRepository = {
  async findAll(): Promise<Chapter[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM chapter ORDER BY courseId DESC, number DESC, id DESC`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Chapter | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM chapter WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async exists(id: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM chapter WHERE id = ?',
      [id],
    );
    return rows.length > 0;
  },

  async create(data: ChapterWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO chapter (number, name, imageId, courseId) VALUES (?, ?, ?, ?)',
      [data.number, data.name, data.imageId, data.courseId],
    );
    return result.insertId;
  },

  async update(id: number, data: ChapterWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE chapter SET number = ?, name = ?, imageId = ?, courseId = ? WHERE id = ?',
      [data.number, data.name, data.imageId, data.courseId, id],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM chapter WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },
};
