import { SongRepository } from '../repositories/song.repository';
import { Song, CreateSongDTO, UpdateSongDTO } from '../types/song';
import { AppError } from '../middlewares/errorHandler';

export class SongService {
  constructor(private readonly repository: SongRepository) {}

  async getAllSongs(): Promise<Song[]> {
    return this.repository.findAll();
  }

  async getSongById(id: number): Promise<Song> {
    const song = await this.repository.findById(id);
    if (!song) {
      throw new AppError(`Song with id ${id} not found`, 404);
    }
    return song;
  }

  async createSong(data: CreateSongDTO): Promise<Song> {
    return this.repository.create(data);
  }

  async updateSong(id: number, data: UpdateSongDTO): Promise<Song> {
    const song = await this.repository.findById(id);
    if (!song) {
      throw new AppError(`Song with id ${id} not found`, 404);
    }
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new AppError(`Failed to update song with id ${id}`, 500);
    }
    return updated;
  }

  async deleteSong(id: number): Promise<void> {
    const song = await this.repository.findById(id);
    if (!song) {
      throw new AppError(`Song with id ${id} not found`, 404);
    }
    await this.repository.delete(id);
  }
}
