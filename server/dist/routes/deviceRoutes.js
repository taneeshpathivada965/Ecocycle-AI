"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceController_1 = require("../controllers/deviceController");
const diagnosticController_1 = require("../controllers/diagnosticController");
const valuationController_1 = require("../controllers/valuationController");
const decisionController_1 = require("../controllers/decisionController");
const partnerController_1 = require("../controllers/partnerController");
const sanitizationController_1 = require("../controllers/sanitizationController");
const certificateController_1 = require("../controllers/certificateController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Device CRUD
router.post('/', authMiddleware_1.requireAuth, deviceController_1.DeviceController.createDevice);
router.get('/', authMiddleware_1.requireAuth, deviceController_1.DeviceController.getDevices);
router.get('/:id', authMiddleware_1.requireAuth, deviceController_1.DeviceController.getDeviceById);
router.delete('/:id', authMiddleware_1.requireAuth, deviceController_1.DeviceController.deleteDevice);
// Module B: Diagnostics
router.post('/:id/diagnostics', authMiddleware_1.requireAuth, diagnosticController_1.DiagnosticController.runDiagnostics);
router.get('/:id/diagnostics', authMiddleware_1.requireAuth, diagnosticController_1.DiagnosticController.getDiagnostics);
// Module D: Dual-Pricing Valuation
router.post('/:id/valuation', authMiddleware_1.requireAuth, valuationController_1.ValuationController.calculateValuation);
router.get('/:id/valuation', authMiddleware_1.requireAuth, valuationController_1.ValuationController.getValuation);
// Module E: Conditional Routing Decision
router.post('/:id/decision', authMiddleware_1.requireAuth, decisionController_1.DecisionController.evaluateDecision);
router.get('/:id/decision', authMiddleware_1.requireAuth, decisionController_1.DecisionController.getDecision);
// Module F & G: Resale & Recycling Options
router.get('/:id/resale-options', authMiddleware_1.requireAuth, partnerController_1.PartnerController.getResaleOptions);
router.get('/:id/recycling-options', authMiddleware_1.requireAuth, partnerController_1.PartnerController.getRecyclingOptions);
// Module C: NIST SP 800-88 Data Sanitization
router.get('/:id/sanitization/guidance', authMiddleware_1.requireAuth, sanitizationController_1.SanitizationController.getGuidance);
router.post('/:id/sanitization/start', authMiddleware_1.requireAuth, sanitizationController_1.SanitizationController.startSanitization);
router.post('/:id/sanitization/confirm', authMiddleware_1.requireAuth, sanitizationController_1.SanitizationController.confirmSanitization);
router.get('/:id/sanitization', authMiddleware_1.requireAuth, sanitizationController_1.SanitizationController.getSanitization);
// Certificates
router.post('/:id/certificate', authMiddleware_1.requireAuth, certificateController_1.CertificateController.createCertificate);
exports.default = router;
