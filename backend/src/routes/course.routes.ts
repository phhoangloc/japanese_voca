import { Router } from 'express';
import { courseController } from '../controller/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Reads are public (the `home` reader site has no login); writes need a token.
router.get('/', courseController.list);
router.get('/:id', courseController.get);
router.post('/', authMiddleware, courseController.create);
router.put('/:id', authMiddleware, courseController.update);
router.delete('/:id', authMiddleware, courseController.remove);

export default router;
