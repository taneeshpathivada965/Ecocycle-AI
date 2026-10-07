import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, WalletController.getWallet);
router.get('/transactions', requireAuth, WalletController.getTransactions);
router.post('/action', requireAuth, WalletController.recordAction);

export default router;
