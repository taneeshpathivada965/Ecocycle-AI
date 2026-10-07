import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { DeviceCreateSchema } from '../validators/schemas';
import { NotFoundError } from '../utils/errors';
import { WalletService } from '../services/wallet/walletService';

export class DeviceController {
  static async createDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const parsed = DeviceCreateSchema.parse({
        ...req.body,
        user_id: userId
      });

      const device = await StorageService.createDevice(parsed);

      // Reward user with eco-credits for scanning
      await WalletService.recordCircularAction(userId, 'DEVICE_SCANNED', device);

      res.status(201).json({
        success: true,
        device
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const devices = await StorageService.getDevices(userId);

      // Hydrate with latest decision and valuation summary
      const hydrated = await Promise.all(
        devices.map(async d => {
          const decision = await StorageService.getDecision(d.id);
          const diagnostics = await StorageService.getDiagnostics(d.id);
          const valuations = await StorageService.getValuations(d.id);
          const sanitization = await StorageService.getSanitization(d.id);
          return {
            ...d,
            decision,
            diagnostics,
            valuations,
            sanitization
          };
        })
      );

      res.json({
        success: true,
        devices: hydrated
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device with ID '${deviceId}' not found`);
      }

      const diagnostics = await StorageService.getDiagnostics(deviceId);
      const valuations = await StorageService.getValuations(deviceId);
      const decision = await StorageService.getDecision(deviceId);
      const matches = await StorageService.getMatches(deviceId);
      const sanitization = await StorageService.getSanitization(deviceId);
      const certificate = await StorageService.getCertificate(deviceId);

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
    } catch (err) {
      next(err);
    }
  }

  static async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const existing = await StorageService.getDeviceById(deviceId);
      if (!existing) {
        throw new NotFoundError(`Device with ID '${deviceId}' not found`);
      }

      await StorageService.deleteDevice(deviceId);
      res.json({
        success: true,
        message: 'Device deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}
