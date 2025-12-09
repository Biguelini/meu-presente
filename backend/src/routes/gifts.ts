import { Router } from 'express';
import { giftController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = Router();


router.use(authMiddleware);


router.put('/:id', giftController.update);
router.delete('/:id', giftController.delete);

export default router;
