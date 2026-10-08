"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionController = void 0;
const storage_1 = require("../db/storage");
const decisionEngine_1 = require("../services/routing/decisionEngine");
const valuationEngine_1 = require("../services/valuation/valuationEngine");
const partnerService_1 = require("../services/marketplace/partnerService");
const errors_1 = require("../utils/errors");
class DecisionController {
    static async evaluateDecision(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device with ID '${deviceId}' not found`);
            }
            const diagnostics = await storage_1.StorageService.getDiagnostics(deviceId);
            const userProfile = await storage_1.StorageService.getProfile(device.user_id);
            const currency = userProfile?.preferred_currency || 'INR';
            // Ensure dual valuation exists
            const dualValuation = valuationEngine_1.ValuationEngine.computeDualValuation(device, diagnostics, currency);
            await storage_1.StorageService.saveValuation(dualValuation.resale_value);
            await storage_1.StorageService.saveValuation(dualValuation.scrap_value);
            // Evaluate routing decision
            const decisionData = decisionEngine_1.DecisionEngine.evaluateRoute(device, diagnostics, dualValuation);
            const savedDecision = await storage_1.StorageService.saveDecision(decisionData);
            // Automatically generate matched partners for the recommended route
            const userCoords = req.body.coordinates; // { latitude, longitude } optional
            const targetValue = decisionData.recommended_route === 'RESALE'
                ? dualValuation.resale_value.amount
                : dualValuation.scrap_value.amount;
            const matches = await partnerService_1.PartnerService.matchPartners(device, decisionData.recommended_route, userCoords, targetValue);
            await storage_1.StorageService.saveMatches(deviceId, matches);
            res.status(201).json({
                success: true,
                decision: savedDecision,
                matches
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDecision(req, res, next) {
        try {
            const deviceId = req.params.id;
            const decision = await storage_1.StorageService.getDecision(deviceId);
            if (!decision) {
                throw new errors_1.NotFoundError(`Decision for device '${deviceId}' not found`);
            }
            const matches = await storage_1.StorageService.getMatches(deviceId);
            res.json({
                success: true,
                decision,
                matches
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DecisionController = DecisionController;
