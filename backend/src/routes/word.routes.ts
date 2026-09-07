import { Router } from 'express';
import { wordController } from '../controller/word.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Reads are public (the login-less `home` site studies words as flashcards);
// writes need a token.
router.get('/', wordController.list);
router.get('/:id', wordController.get);
router.post('/', authMiddleware, wordController.create);
router.put('/:id', authMiddleware, wordController.update);
router.delete('/:id', authMiddleware, wordController.remove);

export default router;
