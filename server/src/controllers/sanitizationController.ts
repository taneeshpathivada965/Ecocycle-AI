import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { SanitizationService } from '../services/sanitization/sanitizationService';
import { WalletService } from '../services/wallet/walletService';
import { NotFoundError } from '../utils/errors';

export class SanitizationController {
  static async getGuidance(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      const guidance = SanitizationService.getGuidance(device);
      const existing = await StorageService.getSanitization(deviceId);

      res.json({
        success: true,
        guidance,
        current_record: existing
      });
    } catch (err) {
      next(err);
    }
  }

  static async startSanitization(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      const { method = 'NIST_CLEAR', verification_type = 'GUIDED' } = req.body;

      const record = await StorageService.saveSanitization({
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
    } catch (err) {
      next(err);
    }
  }

  static async confirmSanitization(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      const { checklist_answers = {}, verification_type = 'USER_CONFIRMED' } = req.body;

      let record = await StorageService.getSanitization(deviceId);
      if (!record) {
        record = await StorageService.saveSanitization({
          device_id: deviceId,
          method: 'NIST_CLEAR',
          standard: 'NIST SP 800-88 Rev 1',
          status: 'IN_PROGRESS',
          verification_type,
          checklist_answers
        });
      }

      // Generate tamper-evident cryptographic certificate
      const { certificate, hash } = SanitizationService.generateCertificate(device, record);

      const confirmedRecord = await StorageService.saveSanitization({
        ...record,
        status: 'CONFIRMED',
        verification_type,
        confirmation_timestamp: new Date().toISOString(),
        certificate_hash: hash,
        checklist_answers
      });

      const savedCert = await StorageService.saveCertificate(certificate);

      // Award Eco-Credits for completing certified data sanitization
      const userId = device.user_id || req.user?.id || 'demo-user-ecocycle-001';
      const ecoTx = await WalletService.recordCircularAction(userId, 'SANITIZATION_VERIFIED', device);

      res.json({
        success: true,
        sanitization: confirmedRecord,
        certificate: savedCert,
        eco_reward: ecoTx
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSanitization(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const record = await StorageService.getSanitization(deviceId);
      if (!record) {
        throw new NotFoundError(`Sanitization record for device '${deviceId}' not found`);
      }

      const certificate = await StorageService.getCertificate(deviceId);

      res.json({
        success: true,
        sanitization: record,
        certificate
      });
    } catch (err) {
      next(err);
    }
  }
}
