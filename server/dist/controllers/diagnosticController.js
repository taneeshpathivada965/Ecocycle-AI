"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticController = void 0;
const storage_1 = require("../db/storage");
const diagnosticEngine_1 = require("../services/diagnostics/diagnosticEngine");
const errors_1 = require("../utils/errors");
class DiagnosticController {
    static async runDiagnostics(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device with ID '${deviceId}' not found`);
            }
            const input = req.body;
            const diagnosticsResult = diagnosticEngine_1.DiagnosticEngine.runDiagnostic(device, input);
            const saved = await storage_1.StorageService.saveDiagnostics(diagnosticsResult);
            res.status(201).json({
                success: true,
                diagnostics: saved
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDiagnostics(req, res, next) {
        try {
            const deviceId = req.params.id;
            const diagnostics = await storage_1.StorageService.getDiagnostics(deviceId);
            if (!diagnostics) {
                throw new errors_1.NotFoundError(`Diagnostics for device '${deviceId}' not found`);
            }
            res.json({
                success: true,
                diagnostics
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DiagnosticController = DiagnosticController;
