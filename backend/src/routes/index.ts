import { Router } from 'express';
import authRoutes from './auth.js';
import listRoutes from './lists.js';
import giftRoutes from './gifts.js';
import publicRoutes from './public.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/lists', listRoutes);
router.use('/gifts', giftRoutes);
router.use('/public', publicRoutes);


router.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'API Meu Presente funcionando!',
    timestamp: new Date().toISOString() 
  });
});

export default router;
