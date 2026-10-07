import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { DecisionEngine } from '../services/routing/decisionEngine';
import { ValuationEngine } from '../services/valuation/valuationEngine';
import { PartnerService } from '../services/marketplace/partnerService';
import { NotFoundError } from '../utils/errors';

export class DecisionController {
  static async evaluateDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device with ID '${deviceId}' not found`);
      }

      const diagnostics = await StorageService.getDiagnostics(deviceId);
      const userProfile = await StorageService.getProfile(device.user_id);
      const currency = userProfile?.preferred_currency || 'INR';

      // Ensure dual valuation exists
      const dualValuation = ValuationEngine.computeDualValuation(device, diagnostics, currency);
      await StorageService.saveValuation(dualValuation.resale_value);
      await StorageService.saveValuation(dualValuation.scrap_value);

      // Evaluate routing decision
      const decisionData = DecisionEngine.evaluateRoute(device, diagnostics, dualValuation);
      const savedDecision = await StorageService.saveDecision(decisionData);

      // Automatically generate matched partners for the recommended route
      const userCoords = req.body.coordinates; // { latitude, longitude } optional
      const targetValue = decisionData.recommended_route === 'RESALE'
        ? dualValuation.resale_value.amount
        : dualValuation.scrap_value.amount;

      const matches = await PartnerService.matchPartners(
        device,
        decisionData.recommended_route,
        userCoords,
        targetValue
      );
      await StorageService.saveMatches(deviceId, matches);

      res.status(201).json({
        success: true,
        decision: savedDecision,
        matches
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const decision = await StorageService.getDecision(deviceId);
      if (!decision) {
        throw new NotFoundError(`Decision for device '${deviceId}' not found`);
      }

      const matches = await StorageService.getMatches(deviceId);

      res.json({
        success: true,
        decision,
        matches
      });
    } catch (err) {
      next(err);
    }
  }
}
