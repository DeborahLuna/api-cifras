export interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  chords: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSongDTO {
  title: string;
  artist: string;
  key: string;
  chords: string;
}

export interface UpdateSongDTO {
  title?: string;
  artist?: string;
  key?: string;
  chords?: string;
}
