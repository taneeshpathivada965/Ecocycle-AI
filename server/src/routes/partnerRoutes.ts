import { Router } from 'express';
import { PartnerController } from '../controllers/partnerController';

const router = Router();

router.get('/', PartnerController.getPartners);
router.get('/nearby', PartnerController.getNearbyPartners);

export default router;
