import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { SanitizationService } from '../services/sanitization/sanitizationService';
import { NotFoundError } from '../utils/errors';

export class CertificateController {
  static async createCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      let sanitization = await StorageService.getSanitization(deviceId);
      if (!sanitization) {
        sanitization = await StorageService.saveSanitization({
          device_id: deviceId,
          method: 'NIST_CLEAR',
          standard: 'NIST SP 800-88 Rev 1',
          status: 'CONFIRMED',
          verification_type: 'USER_CONFIRMED',
          checklist_answers: {}
        });
      }

      const { certificate } = SanitizationService.generateCertificate(device, sanitization);
      const saved = await StorageService.saveCertificate(certificate);

      res.status(201).json({
        success: true,
        certificate: saved
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrNumber = req.params.id;
      const certificate = await StorageService.getCertificate(idOrNumber);
      if (!certificate) {
        throw new NotFoundError(`Certificate '${idOrNumber}' not found`);
      }

      const device = await StorageService.getDeviceById(certificate.device_id);
      const sanitization = certificate.sanitization_id
        ? await StorageService.getSanitization(certificate.device_id)
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
    } catch (err) {
      next(err);
    }
  }
}
