import { Request, Response, NextFunction } from 'express';
import { StorageService, Device } from '../db/storage';
import { DiagnosticEngine } from '../services/diagnostics/diagnosticEngine';
import { ValuationEngine } from '../services/valuation/valuationEngine';
import { DecisionEngine } from '../services/routing/decisionEngine';
import { PartnerService } from '../services/marketplace/partnerService';

export class DemoController {
  static async loadScenario(req: Request, res: Response, next: NextFunction) {
    try {
      const scenarioId = req.params.scenarioId;
      const userId = req.user?.id || 'demo-user-ecocycle-001';

      let devicePreset: Omit<Device, 'id' | 'created_at' | 'updated_at'>;

      if (scenarioId === '1' || scenarioId === 'resale') {
        // Scenario 1: Premium Working Smartphone -> RESALE
        devicePreset = {
          user_id: userId,
          category: 'smartphone',
          brand: 'Apple',
          model: 'iPhone 14 Pro Max',
          generation: '2022',
          image_url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600',
          condition: 'A',
          repairability: 'High',
          working_status: 'WORKING',
          identification_confidence: 0.96,
          estimated_age_years: 1.5,
          storage_capacity: '256GB',
          ram_capacity: '6GB',
          user_notes: 'Flawless condition, always kept in MagSafe case with tempered glass screen protector.'
        };
      } else if (scenarioId === '2' || scenarioId === 'repair') {
        // Scenario 2: Damaged but Repairable Laptop -> REPAIR
        devicePreset = {
          user_id: userId,
          category: 'laptop',
          brand: 'Apple',
          model: 'MacBook Air (M1, 2020)',
          generation: '2020',
          image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600',
          condition: 'C',
          repairability: 'Moderate',
          working_status: 'PARTIALLY_WORKING',
          identification_confidence: 0.92,
          estimated_age_years: 3.2,
          storage_capacity: '512GB SSD',
          ram_capacity: '16GB Unified',
          user_notes: 'Cracked Retina LCD glass panel after accidental drop, but logic board boots, trackpad responds, and external monitor displays 4K output normally.'
        };
      } else {
        // Scenario 3: Dead/Severely Damaged Smartphone -> RECYCLE
        devicePreset = {
          user_id: userId,
          category: 'smartphone',
          brand: 'Samsung',
          model: 'Galaxy S9',
          generation: '2018',
          image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
          condition: 'DEAD',
          repairability: 'Low',
          working_status: 'DEAD',
          identification_confidence: 0.94,
          estimated_age_years: 6.0,
          storage_capacity: '64GB',
          ram_capacity: '4GB',
          user_notes: 'Severe water corrosion, cracked rear glass, swollen battery hazard, does not draw current when connected to USB multimeter.'
        };
      }

      // Create device in storage
      const device = await StorageService.createDevice(devicePreset);

      // Run diagnostics
      const diagData = DiagnosticEngine.runDiagnostic(device, {
        source: scenarioId === '1' ? 'DEVICE_VERIFIED' : scenarioId === '2' ? 'BROWSER_TESTED' : 'AI_ESTIMATED'
      });
      const diagnostics = await StorageService.saveDiagnostics(diagData);

      // Run dual valuation
      const userProfile = await StorageService.getProfile(userId);
      const currency = userProfile?.preferred_currency || 'INR';
      const dualValuation = ValuationEngine.computeDualValuation(device, diagnostics, currency);
      await StorageService.saveValuation(dualValuation.resale_value);
      await StorageService.saveValuation(dualValuation.scrap_value);

      // Run deterministic routing decision
      const decisionData = DecisionEngine.evaluateRoute(device, diagnostics, dualValuation);
      const decision = await StorageService.saveDecision(decisionData);

      // Match verified circular economy partners
      const targetValue = decision.recommended_route === 'RESALE'
        ? dualValuation.resale_value.amount
        : dualValuation.scrap_value.amount;

      const matches = await PartnerService.matchPartners(device, decision.recommended_route, undefined, targetValue);
      await StorageService.saveMatches(device.id, matches);

      res.status(201).json({
        success: true,
        scenario: {
          id: scenarioId,
          name: scenarioId === '1' ? 'Premium Working Smartphone (RESALE)' : scenarioId === '2' ? 'Damaged Repairable Laptop (REPAIR)' : 'Dead / Scrap Smartphone (RECYCLE)',
          device,
          diagnostics,
          valuation: dualValuation,
          decision,
          matches
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async seedScenarios(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        scenarios: [
          {
            id: '1',
            route: 'RESALE',
            title: 'Demo 1: Premium Working Smartphone',
            device: 'Apple iPhone 14 Pro Max',
            condition: 'Grade A - Fully Operational',
            expectedRoute: 'RESALE'
          },
          {
            id: '2',
            route: 'REPAIR',
            title: 'Demo 2: Damaged but Repairable Laptop',
            device: 'Apple MacBook Air (M1, 2020)',
            condition: 'Grade C - Cracked Screen, Working Motherboard',
            expectedRoute: 'REPAIR'
          },
          {
            id: '3',
            route: 'RECYCLE',
            title: 'Demo 3: Dead / Severely Damaged Smartphone',
            device: 'Samsung Galaxy S9',
            condition: 'Dead / Water Damaged / Swollen Battery',
            expectedRoute: 'RECYCLE'
          }
        ]
      });
    } catch (err) {
      next(err);
    }
  }
}
