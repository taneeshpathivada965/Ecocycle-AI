import { Router } from 'express';
import { AiController } from '../controllers/aiController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/identify-device', requireAuth, AiController.identifyDevice);

export default router;
