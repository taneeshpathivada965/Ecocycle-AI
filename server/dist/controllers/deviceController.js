"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const storage_1 = require("../db/storage");
const schemas_1 = require("../validators/schemas");
const errors_1 = require("../utils/errors");
const walletService_1 = require("../services/wallet/walletService");
class DeviceController {
    static async createDevice(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const parsed = schemas_1.DeviceCreateSchema.parse({
                ...req.body,
                user_id: userId
            });
            const device = await storage_1.StorageService.createDevice(parsed);
            // Reward user with eco-credits for scanning
            await walletService_1.WalletService.recordCircularAction(userId, 'DEVICE_SCANNED', device);
            res.status(201).json({
                success: true,
                device
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDevices(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const devices = await storage_1.StorageService.getDevices(userId);
            // Hydrate with latest decision and valuation summary
            const hydrated = await Promise.all(devices.map(async (d) => {
                const decision = await storage_1.StorageService.getDecision(d.id);
                const diagnostics = await storage_1.StorageService.getDiagnostics(d.id);
                const valuations = await storage_1.StorageService.getValuations(d.id);
                const sanitization = await storage_1.StorageService.getSanitization(d.id);
                return {
                    ...d,
                    decision,
                    diagnostics,
                    valuations,
                    sanitization
                };
            }));
            res.json({
                success: true,
                devices: hydrated
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDeviceById(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device with ID '${deviceId}' not found`);
            }
            const diagnostics = await storage_1.StorageService.getDiagnostics(deviceId);
            const valuations = await storage_1.StorageService.getValuations(deviceId);
            const decision = await storage_1.StorageService.getDecision(deviceId);
            const matches = await storage_1.StorageService.getMatches(deviceId);
            const sanitization = await storage_1.StorageService.getSanitization(deviceId);
            const certificate = await storage_1.StorageService.getCertificate(deviceId);
            res.json({
                success: true,
                device: {
                    ...device,
                    diagnostics,
                    valuations,
                    decision,
                    matches,
                    sanitization,
                    certificate
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteDevice(req, res, next) {
        try {
            const deviceId = req.params.id;
            const existing = await storage_1.StorageService.getDeviceById(deviceId);
            if (!existing) {
                throw new errors_1.NotFoundError(`Device with ID '${deviceId}' not found`);
            }
            await storage_1.StorageService.deleteDevice(deviceId);
            res.json({
                success: true,
                message: 'Device deleted successfully'
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DeviceController = DeviceController;
