import { Router } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { DiagnosticController } from '../controllers/diagnosticController';
import { ValuationController } from '../controllers/valuationController';
import { DecisionController } from '../controllers/decisionController';
import { PartnerController } from '../controllers/partnerController';
import { SanitizationController } from '../controllers/sanitizationController';
import { CertificateController } from '../controllers/certificateController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Device CRUD
router.post('/', requireAuth, DeviceController.createDevice);
router.get('/', requireAuth, DeviceController.getDevices);
router.get('/:id', requireAuth, DeviceController.getDeviceById);
router.delete('/:id', requireAuth, DeviceController.deleteDevice);

// Module B: Diagnostics
router.post('/:id/diagnostics', requireAuth, DiagnosticController.runDiagnostics);
router.get('/:id/diagnostics', requireAuth, DiagnosticController.getDiagnostics);

// Module D: Dual-Pricing Valuation
router.post('/:id/valuation', requireAuth, ValuationController.calculateValuation);
router.get('/:id/valuation', requireAuth, ValuationController.getValuation);

// Module E: Conditional Routing Decision
router.post('/:id/decision', requireAuth, DecisionController.evaluateDecision);
router.get('/:id/decision', requireAuth, DecisionController.getDecision);

// Module F & G: Resale & Recycling Options
router.get('/:id/resale-options', requireAuth, PartnerController.getResaleOptions);
router.get('/:id/recycling-options', requireAuth, PartnerController.getRecyclingOptions);

// Module C: NIST SP 800-88 Data Sanitization
router.get('/:id/sanitization/guidance', requireAuth, SanitizationController.getGuidance);
router.post('/:id/sanitization/start', requireAuth, SanitizationController.startSanitization);
router.post('/:id/sanitization/confirm', requireAuth, SanitizationController.confirmSanitization);
router.get('/:id/sanitization', requireAuth, SanitizationController.getSanitization);

// Certificates
router.post('/:id/certificate', requireAuth, CertificateController.createCertificate);

export default router;
