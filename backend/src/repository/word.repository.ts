import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../ult/db';
import { Word } from '../types/entities';

// `explain` is a reserved word in MySQL - always backtick it.
const COLUMNS =
  'id, word, `explain`, imageId, soundId, readExplainId, chapterId, ' +
  'created_at AS createdAt, updated_at AS updatedAt';

function mapRow(row: RowDataPacket): Word {
  return {
    id: Number(row.id),
    word: row.word,
    explain: row.explain ?? null,
    imageId: row.imageId === null ? null : Number(row.imageId),
    soundId: row.soundId === null ? null : Number(row.soundId),
    readExplainId: row.readExplainId === null ? null : Number(row.readExplainId),
    chapterId: row.chapterId === null ? null : Number(row.chapterId),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

interface WordWriteRow {
  word: string;
  explain: string | null;
  imageId: number | null;
  soundId: number | null;
  readExplainId: number | null;
  chapterId: number | null;
}

export const wordRepository = {
  async findAll(): Promise<Word[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM word ORDER BY id`,
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<Word | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM word WHERE id = ?`,
      [id],
    );
    return rows.length ? mapRow(rows[0]) : null;
  },

  async create(data: WordWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO word (word, \`explain\`, imageId, soundId, readExplainId, chapterId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.word,
        data.explain,
        data.imageId,
        data.soundId,
        data.readExplainId,
        data.chapterId,
      ],
    );
    return result.insertId;
  },

  async update(id: number, data: WordWriteRow): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE word
         SET word = ?, \`explain\` = ?, imageId = ?, soundId = ?, readExplainId = ?, chapterId = ?
       WHERE id = ?`,
      [
        data.word,
        data.explain,
        data.imageId,
        data.soundId,
        data.readExplainId,
        data.chapterId,
        id,
      ],
    );
    return result.affectedRows;
  },

  async remove(id: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM word WHERE id = ?',
      [id],
    );
    return result.affectedRows;
  },
};
