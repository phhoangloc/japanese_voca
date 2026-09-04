import { Router } from 'express';
import { adminController } from '../controller/admin.controller';

const router = Router();

router.get('/', adminController.list);
router.get('/:id', adminController.get);
router.post('/', adminController.create);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.remove);

export default router;
