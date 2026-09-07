import { Router } from 'express';
import { fileController } from '../controller/file.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadSingle } from '../ult/upload';

const router = Router();

// Reads are public (uploaded bytes are already served openly at /upload/*, and
// the `home` reader site resolves cover images without a login); writes need a token.
router.get('/', fileController.list);
router.get('/:id', fileController.get);
router.post('/', authMiddleware, uploadSingle, fileController.create);
router.put('/:id', authMiddleware, fileController.update);
router.delete('/:id', authMiddleware, fileController.remove);

export default router;
