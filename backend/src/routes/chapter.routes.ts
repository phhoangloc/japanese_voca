import { Router } from 'express';
import { chapterController } from '../controller/chapter.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Reads are public (the `home` reader site has no login); writes need a token.
router.get('/', chapterController.list);
router.get('/:id', chapterController.get);
router.post('/', authMiddleware, chapterController.create);
router.put('/:id', authMiddleware, chapterController.update);
router.delete('/:id', authMiddleware, chapterController.remove);

export default router;
