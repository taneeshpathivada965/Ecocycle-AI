"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuationController = void 0;
const storage_1 = require("../db/storage");
const valuationEngine_1 = require("../services/valuation/valuationEngine");
const errors_1 = require("../utils/errors");
class ValuationController {
    static async calculateValuation(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device with ID '${deviceId}' not found`);
            }
            const diagnostics = await storage_1.StorageService.getDiagnostics(deviceId);
            const currency = req.body.currency || 'INR';
            const valuationResult = valuationEngine_1.ValuationEngine.computeDualValuation(device, diagnostics, currency);
            const savedResale = await storage_1.StorageService.saveValuation(valuationResult.resale_value);
            const savedScrap = await storage_1.StorageService.saveValuation(valuationResult.scrap_value);
            res.status(201).json({
                success: true,
                valuation: {
                    resale_value: savedResale,
                    scrap_value: savedScrap,
                    repair_cost_estimate: valuationResult.repair_cost_estimate
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getValuation(req, res, next) {
        try {
            const deviceId = req.params.id;
            const valuations = await storage_1.StorageService.getValuations(deviceId);
            const resale = valuations.find(v => v.valuation_type === 'RESALE');
            const scrap = valuations.find(v => v.valuation_type === 'SCRAP');
            res.json({
                success: true,
                valuation: {
                    resale_value: resale || null,
                    scrap_value: scrap || null,
                    all: valuations
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ValuationController = ValuationController;
