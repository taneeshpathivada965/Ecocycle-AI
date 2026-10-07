import { Device, DiagnosticRecord, ValuationRecord } from '../../db/storage';

export interface DualValuationResult {
  resale_value: Omit<ValuationRecord, 'id' | 'created_at'>;
  scrap_value: Omit<ValuationRecord, 'id' | 'created_at'>;
  repair_cost_estimate: number;
}

// Base brand benchmark valuations in INR (baseline new or mint)
const BRAND_BASELINES_INR: Record<string, number> = {
  apple: 75000,
  samsung: 62000,
  google: 52000,
  oneplus: 38000,
  xiaomi: 22000,
  dell: 65000,
  lenovo: 58000,
  hp: 55000,
  asus: 60000,
  sony: 45000,
  other: 20000
};

// Material recovery scrap benchmarks per category (in grams)
const MATERIAL_RECOVERY_PROFILES: Record<string, { gold_mg: number; silver_mg: number; copper_g: number; aluminum_g: number; lithium_g: number; base_scrap_inr: number }> = {
  smartphone: { gold_mg: 24, silver_mg: 250, copper_g: 14, aluminum_g: 22, lithium_g: 3.5, base_scrap_inr: 450 },
  laptop: { gold_mg: 180, silver_mg: 1200, copper_g: 220, aluminum_g: 450, lithium_g: 24, base_scrap_inr: 1650 },
  tablet: { gold_mg: 60, silver_mg: 450, copper_g: 45, aluminum_g: 120, lithium_g: 12, base_scrap_inr: 750 },
  desktop: { gold_mg: 320, silver_mg: 2400, copper_g: 580, aluminum_g: 1200, lithium_g: 0, base_scrap_inr: 2800 },
  monitor: { gold_mg: 40, silver_mg: 300, copper_g: 180, aluminum_g: 350, lithium_g: 0, base_scrap_inr: 650 },
  smartwatch: { gold_mg: 12, silver_mg: 80, copper_g: 6, aluminum_g: 15, lithium_g: 1.2, base_scrap_inr: 250 },
  gaming_console: { gold_mg: 210, silver_mg: 1400, copper_g: 320, aluminum_g: 400, lithium_g: 0, base_scrap_inr: 1850 },
  other: { gold_mg: 30, silver_mg: 200, copper_g: 50, aluminum_g: 100, lithium_g: 2, base_scrap_inr: 350 }
};

const USD_TO_INR_RATE = 84.0;

export class ValuationEngine {
  /**
   * Compute Resale Value, Scrap Value, and Repair Cost
   */
  static computeDualValuation(
    device: Device,
    diagnostics?: DiagnosticRecord | null,
    preferredCurrency: 'INR' | 'USD' = 'INR'
  ): DualValuationResult {
    const brandKey = (device.brand || 'other').toLowerCase();
    const baseline = BRAND_BASELINES_INR[brandKey] || BRAND_BASELINES_INR.other;
    const age = Math.max(0.5, device.estimated_age_years || 2);
    const category = (device.category || 'smartphone').toLowerCase();

    // 1. Age depreciation curve (roughly 22% annual depreciation for electronics)
    const ageMultiplier = Math.max(0.08, Math.pow(0.78, age));

    // 2. Condition multiplier
    let conditionMultiplier = 0.85;
    if (device.condition === 'A') conditionMultiplier = 1.0;
    else if (device.condition === 'B') conditionMultiplier = 0.82;
    else if (device.condition === 'C') conditionMultiplier = 0.55;
    else if (device.condition === 'BROKEN' || device.condition === 'DEAD' || device.working_status === 'DEAD') conditionMultiplier = 0.08;

    // 3. Diagnostic health factor
    const healthScore = diagnostics ? diagnostics.overall_score : (conditionMultiplier * 100);
    const diagnosticMultiplier = Math.max(0.1, healthScore / 100);

    // Compute Resale Value in INR
    let resaleInr = Math.round(baseline * ageMultiplier * conditionMultiplier * diagnosticMultiplier);
    
    // Dead devices have negligible resale market value
    if (device.working_status === 'DEAD' || device.condition === 'DEAD') {
      resaleInr = Math.min(resaleInr, 1200);
    }

    // Compute estimated repair cost if repairable
    let repairCostInr = 0;
    if (device.condition === 'C' || device.condition === 'BROKEN' || (diagnostics && diagnostics.overall_score < 70 && diagnostics.overall_score >= 35)) {
      if (category === 'laptop') {
        repairCostInr = Math.round(baseline * 0.18 + 2500); // Display/battery refurbishment
      } else if (category === 'smartphone') {
        repairCostInr = Math.round(baseline * 0.14 + 1200);
      } else {
        repairCostInr = Math.round(baseline * 0.12 + 1000);
      }
    }

    // 4. Scrap Material Recovery Valuation
    const materialProfile = MATERIAL_RECOVERY_PROFILES[category] || MATERIAL_RECOVERY_PROFILES.other;
    // Material commodity market price model:
    // Gold ~ 7,500 INR/gram (7.5 INR/mg)
    // Silver ~ 92 INR/gram (0.092 INR/mg)
    // Copper ~ 800 INR/kg (0.8 INR/gram)
    // Aluminum ~ 220 INR/kg (0.22 INR/gram)
    // Lithium ~ 1500 INR/kg (1.5 INR/gram)
    const goldValue = (materialProfile.gold_mg * 7.5);
    const silverValue = (materialProfile.silver_mg * 0.092);
    const copperValue = (materialProfile.copper_g * 0.8);
    const aluminumValue = (materialProfile.aluminum_g * 0.22);
    const lithiumValue = (materialProfile.lithium_g * 1.5);

    const extractedMetalValue = Math.round(goldValue + silverValue + copperValue + aluminumValue + lithiumValue);
    const scrapInr = Math.max(materialProfile.base_scrap_inr, extractedMetalValue);

    // Convert to target currency
    const rate = preferredCurrency === 'USD' ? (1 / USD_TO_INR_RATE) : 1;
    const resaleFinal = Number((resaleInr * rate).toFixed(preferredCurrency === 'USD' ? 2 : 0));
    const scrapFinal = Number((scrapInr * rate).toFixed(preferredCurrency === 'USD' ? 2 : 0));
    const repairCostFinal = Number((repairCostInr * rate).toFixed(preferredCurrency === 'USD' ? 2 : 0));

    const resaleExplanation = resaleFinal > scrapFinal * 2
      ? `High secondary market demand for ${device.brand} ${device.model}. Refurbishers and direct buyers value the operational silicon, camera optics, and display assembly.`
      : `Depreciated market appeal due to age (${age} yrs) or severe cosmetic/hardware degradation. Resale yield is constrained.`;

    const scrapExplanation = `Material extraction recovery estimate: contains ~${materialProfile.gold_mg}mg Gold, ~${materialProfile.silver_mg}mg Silver, ~${materialProfile.copper_g}g Copper, and ~${materialProfile.aluminum_g}g Aluminum recoverability at R2v3 smelting standard.`;

    return {
      resale_value: {
        device_id: device.id,
        valuation_type: 'RESALE',
        amount: Math.max(0, resaleFinal),
        currency: preferredCurrency,
        confidence: 0.89,
        explanation: resaleExplanation,
        source: 'SECONDARY_MARKET_INDEX'
      },
      scrap_value: {
        device_id: device.id,
        valuation_type: 'SCRAP',
        amount: Math.max(10, scrapFinal),
        currency: preferredCurrency,
        confidence: 0.94,
        explanation: scrapExplanation,
        source: 'COMMODITY_METALS_INDEX'
      },
      repair_cost_estimate: repairCostFinal
    };
  }
}
