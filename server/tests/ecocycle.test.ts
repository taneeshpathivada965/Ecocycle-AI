import { describe, it, expect } from 'vitest';
import { DecisionEngine } from '../src/services/routing/decisionEngine';
import { ValuationEngine } from '../src/services/valuation/valuationEngine';
import { SanitizationService } from '../src/services/sanitization/sanitizationService';
import { PartnerService } from '../src/services/marketplace/partnerService';
import { Device, DiagnosticRecord } from '../src/db/storage';

describe('EcoCycle AI Core Decision & Routing Engine', () => {
  const baseDevice: Device = {
    id: 'test-device-001',
    user_id: 'user-001',
    category: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    condition: 'A',
    working_status: 'WORKING',
    identification_confidence: 0.95,
    estimated_age_years: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  it('correctly classifies a healthy working smartphone as RESALE', () => {
    const diag: DiagnosticRecord = {
      id: 'diag-001',
      device_id: baseDevice.id,
      battery_health: 92,
      battery_cycles: 210,
      display_status: 'PERFECT',
      touch_status: 'OPTIMAL',
      storage_status: 'HEALTHY',
      processor_status: 'STABLE',
      charging_status: 'NORMAL',
      camera_status: 'CLEAR',
      speaker_status: 'CLEAR',
      overall_score: 92,
      confidence: 0.95,
      source: 'DEVICE_VERIFIED',
      created_at: new Date().toISOString()
    };

    const valuation = ValuationEngine.computeDualValuation(baseDevice, diag, 'INR');
    expect(valuation.resale_value.amount).toBeGreaterThan(valuation.scrap_value.amount);

    const decision = DecisionEngine.evaluateRoute(baseDevice, diag, valuation);
    expect(decision.recommended_route).toBe('RESALE');
    expect(decision.condition_score).toBeGreaterThanOrEqual(70);
  });

  it('correctly classifies a repairable laptop as REPAIR', () => {
    const repairableLaptop: Device = {
      ...baseDevice,
      category: 'laptop',
      brand: 'Apple',
      model: 'MacBook Air M1',
      condition: 'C',
      working_status: 'PARTIALLY_WORKING',
      estimated_age_years: 2.5
    };

    const diag: DiagnosticRecord = {
      id: 'diag-002',
      device_id: repairableLaptop.id,
      battery_health: 74,
      battery_cycles: 420,
      display_status: 'CRACKED_WORKING',
      touch_status: 'KEYBOARD_OK',
      storage_status: 'HEALTHY',
      processor_status: 'STABLE',
      charging_status: 'NORMAL',
      camera_status: 'CLEAR',
      speaker_status: 'CLEAR',
      overall_score: 58,
      confidence: 0.90,
      source: 'BROWSER_TESTED',
      created_at: new Date().toISOString()
    };

    const valuation = ValuationEngine.computeDualValuation(repairableLaptop, diag, 'INR');
    expect(valuation.repair_cost_estimate).toBeGreaterThan(0);

    const decision = DecisionEngine.evaluateRoute(repairableLaptop, diag, valuation);
    expect(decision.recommended_route).toBe('REPAIR');
    expect(decision.repairability_score).toBeGreaterThanOrEqual(50);
  });

  it('correctly classifies a dead/water-damaged phone as RECYCLE', () => {
    const deadDevice: Device = {
      ...baseDevice,
      condition: 'DEAD',
      working_status: 'DEAD',
      estimated_age_years: 5.0
    };

    const diag: DiagnosticRecord = {
      id: 'diag-003',
      device_id: deadDevice.id,
      battery_health: 10,
      battery_cycles: 900,
      display_status: 'DAMAGED_BLACK',
      touch_status: 'UNRESPONSIVE',
      storage_status: 'DEGRADED',
      processor_status: 'FAIL',
      charging_status: 'CORRODED',
      camera_status: 'FAULT',
      speaker_status: 'MUTED',
      overall_score: 18,
      confidence: 0.95,
      source: 'AI_ESTIMATED',
      created_at: new Date().toISOString()
    };

    const valuation = ValuationEngine.computeDualValuation(deadDevice, diag, 'INR');
    const decision = DecisionEngine.evaluateRoute(deadDevice, diag, valuation);

    expect(decision.recommended_route).toBe('RECYCLE');
    expect(decision.condition_score).toBeLessThan(35);
  });
});

describe('Valuation & Scrap Material Recovery', () => {
  it('calculates non-zero precious metal recovery for scrap smartphones', () => {
    const phone: Device = {
      id: 'scrap-001',
      user_id: 'u-1',
      category: 'smartphone',
      brand: 'Samsung',
      model: 'Galaxy S8',
      condition: 'DEAD',
      working_status: 'DEAD',
      identification_confidence: 0.9,
      estimated_age_years: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const val = ValuationEngine.computeDualValuation(phone, null, 'INR');
    expect(val.scrap_value.amount).toBeGreaterThanOrEqual(400);
    expect(val.scrap_value.explanation).toContain('Gold');
    expect(val.scrap_value.explanation).toContain('Copper');
  });

  it('formats valuations properly in USD when requested', () => {
    const phone: Device = {
      id: 'phone-usd',
      user_id: 'u-1',
      category: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 14',
      condition: 'A',
      working_status: 'WORKING',
      identification_confidence: 0.95,
      estimated_age_years: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const val = ValuationEngine.computeDualValuation(phone, null, 'USD');
    expect(val.resale_value.currency).toBe('USD');
    expect(val.scrap_value.currency).toBe('USD');
    expect(val.resale_value.amount).toBeGreaterThan(100);
  });
});

describe('Cryptographic Data Sanitization', () => {
  it('generates SHA-256 certificate for completed sanitization', () => {
    const device: Device = {
      id: 'san-dev-1',
      user_id: 'u-1',
      category: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 12',
      condition: 'A',
      working_status: 'WORKING',
      identification_confidence: 0.95,
      estimated_age_years: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const guidance = SanitizationService.getGuidance(device);
    expect(guidance.standard).toContain('NIST SP 800-88');
    expect(guidance.steps.length).toBeGreaterThan(0);

    const { certificate, hash } = SanitizationService.generateCertificate(device, {
      id: 'rec-1',
      device_id: device.id,
      method: 'NIST_CLEAR',
      standard: 'NIST SP 800-88 Rev 1',
      status: 'CONFIRMED',
      verification_type: 'USER_CONFIRMED',
      checklist_answers: {},
      created_at: new Date().toISOString()
    });

    expect(certificate.certificate_number).toMatch(/^ECO-NIST-/);
    expect(hash).toHaveLength(64); // Valid SHA-256 hex string length
    expect(certificate.certificate_hash).toBe(hash);
  });
});

describe('Partner Distance & Haversine Calculations', () => {
  it('correctly calculates Haversine distance between coordinates', () => {
    // Distance between Bengaluru (12.9716, 77.5946) and Koramangala (12.9352, 77.6245) is ~5.2 km
    const dist = PartnerService.calculateDistanceKm(12.9716, 77.5946, 12.9352, 77.6245);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(7);
  });
});
