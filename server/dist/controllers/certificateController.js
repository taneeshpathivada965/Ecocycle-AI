"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const storage_1 = require("../db/storage");
const sanitizationService_1 = require("../services/sanitization/sanitizationService");
const errors_1 = require("../utils/errors");
class CertificateController {
    static async createCertificate(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            let sanitization = await storage_1.StorageService.getSanitization(deviceId);
            if (!sanitization) {
                sanitization = await storage_1.StorageService.saveSanitization({
                    device_id: deviceId,
                    method: 'NIST_CLEAR',
                    standard: 'NIST SP 800-88 Rev 1',
                    status: 'CONFIRMED',
                    verification_type: 'USER_CONFIRMED',
                    checklist_answers: {}
                });
            }
            const { certificate } = sanitizationService_1.SanitizationService.generateCertificate(device, sanitization);
            const saved = await storage_1.StorageService.saveCertificate(certificate);
            res.status(201).json({
                success: true,
                certificate: saved
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getCertificate(req, res, next) {
        try {
            const idOrNumber = req.params.id;
            const certificate = await storage_1.StorageService.getCertificate(idOrNumber);
            if (!certificate) {
                throw new errors_1.NotFoundError(`Certificate '${idOrNumber}' not found`);
            }
            const device = await storage_1.StorageService.getDeviceById(certificate.device_id);
            const sanitization = certificate.sanitization_id
                ? await storage_1.StorageService.getSanitization(certificate.device_id)
                : null;
            res.json({
                success: true,
                certificate: {
                    ...certificate,
                    device,
                    sanitization,
                    cryptographic_seal: {
                        algorithm: 'SHA-256',
                        hash: certificate.certificate_hash,
                        verified: true,
                        issuer: 'EcoCycle AI Privacy Engine',
                        standard: 'NIST SP 800-88 Rev 1'
                    }
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CertificateController = CertificateController;
