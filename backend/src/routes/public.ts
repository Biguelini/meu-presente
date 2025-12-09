import { Router } from 'express';
import { publicController } from '../controllers/index.js';

const router = Router();


router.get('/lists/:slug', publicController.getListBySlug);
router.get('/global/:hashId', publicController.getGlobalByHash);
router.post('/gifts/:id/mark-bought', publicController.markAsBought);

export default router;
