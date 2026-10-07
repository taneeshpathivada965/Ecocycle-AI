import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { ValuationEngine } from '../services/valuation/valuationEngine';
import { NotFoundError } from '../utils/errors';

export class ValuationController {
  static async calculateValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device with ID '${deviceId}' not found`);
      }

      const diagnostics = await StorageService.getDiagnostics(deviceId);
      const currency = (req.body.currency as 'INR' | 'USD') || 'INR';

      const valuationResult = ValuationEngine.computeDualValuation(device, diagnostics, currency);

      const savedResale = await StorageService.saveValuation(valuationResult.resale_value);
      const savedScrap = await StorageService.saveValuation(valuationResult.scrap_value);

      res.status(201).json({
        success: true,
        valuation: {
          resale_value: savedResale,
          scrap_value: savedScrap,
          repair_cost_estimate: valuationResult.repair_cost_estimate
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const valuations = await StorageService.getValuations(deviceId);

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
    } catch (err) {
      next(err);
    }
  }
}
