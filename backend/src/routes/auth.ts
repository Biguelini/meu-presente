import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/index.js';

const router = Router();


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);


router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
