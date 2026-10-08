"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationController = void 0;
const storage_1 = require("../db/storage");
const sanitizationService_1 = require("../services/sanitization/sanitizationService");
const walletService_1 = require("../services/wallet/walletService");
const errors_1 = require("../utils/errors");
class SanitizationController {
    static async getGuidance(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            const guidance = sanitizationService_1.SanitizationService.getGuidance(device);
            const existing = await storage_1.StorageService.getSanitization(deviceId);
            res.json({
                success: true,
                guidance,
                current_record: existing
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async startSanitization(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            const { method = 'NIST_CLEAR', verification_type = 'GUIDED' } = req.body;
            const record = await storage_1.StorageService.saveSanitization({
                device_id: deviceId,
                method,
                standard: 'NIST SP 800-88 Rev 1',
                status: 'IN_PROGRESS',
                verification_type,
                checklist_answers: {}
            });
            res.status(201).json({
                success: true,
                sanitization: record
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async confirmSanitization(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            const { checklist_answers = {}, verification_type = 'USER_CONFIRMED' } = req.body;
            let record = await storage_1.StorageService.getSanitization(deviceId);
            if (!record) {
                record = await storage_1.StorageService.saveSanitization({
                    device_id: deviceId,
                    method: 'NIST_CLEAR',
                    standard: 'NIST SP 800-88 Rev 1',
                    status: 'IN_PROGRESS',
                    verification_type,
                    checklist_answers
                });
            }
            // Generate tamper-evident cryptographic certificate
            const { certificate, hash } = sanitizationService_1.SanitizationService.generateCertificate(device, record);
            const confirmedRecord = await storage_1.StorageService.saveSanitization({
                ...record,
                status: 'CONFIRMED',
                verification_type,
                confirmation_timestamp: new Date().toISOString(),
                certificate_hash: hash,
                checklist_answers
            });
            const savedCert = await storage_1.StorageService.saveCertificate(certificate);
            // Award Eco-Credits for completing certified data sanitization
            const userId = device.user_id || req.user?.id || 'demo-user-ecocycle-001';
            const ecoTx = await walletService_1.WalletService.recordCircularAction(userId, 'SANITIZATION_VERIFIED', device);
            res.json({
                success: true,
                sanitization: confirmedRecord,
                certificate: savedCert,
                eco_reward: ecoTx
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getSanitization(req, res, next) {
        try {
            const deviceId = req.params.id;
            const record = await storage_1.StorageService.getSanitization(deviceId);
            if (!record) {
                throw new errors_1.NotFoundError(`Sanitization record for device '${deviceId}' not found`);
            }
            const certificate = await storage_1.StorageService.getCertificate(deviceId);
            res.json({
                success: true,
                sanitization: record,
                certificate
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SanitizationController = SanitizationController;
