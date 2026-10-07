import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { DiagnosticEngine } from '../services/diagnostics/diagnosticEngine';
import { NotFoundError } from '../utils/errors';

export class DiagnosticController {
  static async runDiagnostics(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device with ID '${deviceId}' not found`);
      }

      const input = req.body;
      const diagnosticsResult = DiagnosticEngine.runDiagnostic(device, input);

      const saved = await StorageService.saveDiagnostics(diagnosticsResult);

      res.status(201).json({
        success: true,
        diagnostics: saved
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDiagnostics(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const diagnostics = await StorageService.getDiagnostics(deviceId);
      if (!diagnostics) {
        throw new NotFoundError(`Diagnostics for device '${deviceId}' not found`);
      }

      res.json({
        success: true,
        diagnostics
      });
    } catch (err) {
      next(err);
    }
  }
}
