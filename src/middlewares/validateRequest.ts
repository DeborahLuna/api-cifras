import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function validateCreateSong(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { title, artist, key, chords } = req.body as Record<string, unknown>;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return next(new AppError('Field "title" is required and must be a non-empty string', 400));
  }
  if (!artist || typeof artist !== 'string' || artist.trim() === '') {
    return next(new AppError('Field "artist" is required and must be a non-empty string', 400));
  }
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return next(new AppError('Field "key" is required and must be a non-empty string', 400));
  }
  if (!chords || typeof chords !== 'string' || chords.trim() === '') {
    return next(new AppError('Field "chords" is required and must be a non-empty string', 400));
  }

  next();
}

export function validateUpdateSong(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const body = req.body as Record<string, unknown>;
  const allowed = ['title', 'artist', 'key', 'chords'];
  const fields = Object.keys(body);

  if (fields.length === 0) {
    return next(new AppError('At least one field must be provided for update', 400));
  }

  for (const field of fields) {
    if (!allowed.includes(field)) {
      return next(new AppError(`Field "${field}" is not allowed`, 400));
    }
    if (typeof body[field] !== 'string' || (body[field] as string).trim() === '') {
      return next(new AppError(`Field "${field}" must be a non-empty string`, 400));
    }
  }

  next();
}
