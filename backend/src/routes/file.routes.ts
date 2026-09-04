import { Router } from 'express';
import { fileController } from '../controller/file.controller';

const router = Router();

router.get('/', fileController.list);
router.get('/:id', fileController.get);
router.post('/', fileController.create);
router.put('/:id', fileController.update);
router.delete('/:id', fileController.remove);

export default router;
