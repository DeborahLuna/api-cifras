import { Song } from '../types/song';

export class SongModel {
  static fromRow(row: Record<string, unknown>): Song {
    return {
      id: row.id as number,
      title: row.title as string,
      artist: row.artist as string,
      key: row.key as string,
      chords: row.chords as string,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date,
    };
  }
}
