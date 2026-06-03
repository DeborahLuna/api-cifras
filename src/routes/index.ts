import { Router } from 'express';
import songRoutes from './song.routes';

const router = Router();

router.use('/songs', songRoutes);

export default router;
