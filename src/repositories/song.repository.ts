import { Pool } from 'pg';
import { Song, CreateSongDTO, UpdateSongDTO } from '../types/song';
import { SongModel } from '../models/song.model';

export class SongRepository {
  constructor(private readonly db: Pool) {}

  async findAll(): Promise<Song[]> {
    const result = await this.db.query(
      'SELECT * FROM songs ORDER BY created_at DESC'
    );
    return result.rows.map(SongModel.fromRow);
  }

  async findById(id: number): Promise<Song | null> {
    const result = await this.db.query(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return SongModel.fromRow(result.rows[0]);
  }

  async create(data: CreateSongDTO): Promise<Song> {
    const result = await this.db.query(
      `INSERT INTO songs (title, artist, key, chords)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.title, data.artist, data.key, data.chords]
    );
    return SongModel.fromRow(result.rows[0]);
  }

  async update(id: number, data: UpdateSongDTO): Promise<Song | null> {
    const fields = Object.keys(data) as (keyof UpdateSongDTO)[];
    if (fields.length === 0) return this.findById(id);

    const setClauses = fields.map((field, i) => `${field} = $${i + 1}`);
    const values = fields.map((field) => data[field]);

    const result = await this.db.query(
      `UPDATE songs
       SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${fields.length + 1}
       RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) return null;
    return SongModel.fromRow(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM songs WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
