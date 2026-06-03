import { Router } from 'express';
import { SongController } from '../controllers/song.controller';
import { SongService } from '../services/song.service';
import { SongRepository } from '../repositories/song.repository';
import { validateCreateSong, validateUpdateSong } from '../middlewares/validateRequest';
import pool from '../config/database';

const router = Router();

const repository = new SongRepository(pool);
const service = new SongService(repository);
const controller = new SongController(service);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateCreateSong, controller.create);
router.put('/:id', validateUpdateSong, controller.update);
router.delete('/:id', controller.delete);

export default router;
