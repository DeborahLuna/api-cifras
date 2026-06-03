import { Request, Response, NextFunction } from 'express';
import { SongService } from '../services/song.service';
import { CreateSongDTO, UpdateSongDTO } from '../types/song';

export class SongController {
  constructor(private readonly service: SongService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const songs = await this.service.getAllSongs();
      res.status(200).json(songs);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id parameter' });
        return;
      }
      const song = await this.service.getSongById(id);
      res.status(200).json(song);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as CreateSongDTO;
      const song = await this.service.createSong(data);
      res.status(201).json(song);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id parameter' });
        return;
      }
      const data = req.body as UpdateSongDTO;
      const song = await this.service.updateSong(id, data);
      res.status(200).json(song);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id parameter' });
        return;
      }
      await this.service.deleteSong(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
