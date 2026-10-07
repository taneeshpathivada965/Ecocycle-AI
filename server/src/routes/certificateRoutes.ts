import { Router } from 'express';
import { CertificateController } from '../controllers/certificateController';

const router = Router();

// Public verification endpoint
router.get('/:id', CertificateController.getCertificate);

export default router;
