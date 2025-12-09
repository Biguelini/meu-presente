import { Router } from 'express';
import { listController, giftController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = Router();


router.use(authMiddleware);


router.get('/global', listController.getGlobal);
router.patch('/global/gifts/reorder', giftController.reorderGlobal);


router.get('/', listController.getAll);
router.post('/', listController.create);
router.get('/:id', listController.getById);
router.put('/:id', listController.update);
router.delete('/:id', listController.delete);


router.post('/:listaId/gifts', giftController.create);
router.patch('/:listaId/gifts/reorder', giftController.reorderList);

export default router;
