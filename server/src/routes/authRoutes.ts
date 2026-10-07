import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, AuthController.getMe);
router.post('/profile', requireAuth, AuthController.updateProfile);
router.post('/demo-login', AuthController.demoLogin);

export default router;
