"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
class DecisionEngine {
    /**
     * Evaluates device condition, diagnostic findings, and dual valuation
     * to deterministically classify into RESALE, REPAIR, or RECYCLE.
     */
    static evaluateRoute(device, diagnostics, valuation) {
        const isDead = device.working_status === 'DEAD' || device.condition === 'DEAD';
        const isBroken = device.condition === 'BROKEN';
        const conditionScore = diagnostics ? diagnostics.overall_score : (isDead ? 15 : isBroken ? 35 : 85);
        // Compute repairability score (0 - 100)
        let repairabilityScore = 75;
        const category = (device.category || 'smartphone').toLowerCase();
        if (category === 'desktop')
            repairabilityScore = 90;
        else if (category === 'laptop')
            repairabilityScore = 78;
        else if (category === 'smartphone')
            repairabilityScore = 65;
        else if (category === 'smartwatch')
            repairabilityScore = 35; // glued enclosures
        if (isDead) {
            repairabilityScore = 20;
        }
        const resaleVal = valuation.resale_value.amount;
        const scrapVal = valuation.scrap_value.amount;
        const repairCost = valuation.repair_cost_estimate;
        let route;
        let alternativeRoute = null;
        let explanation;
        // Decision Logic
        if (isDead || conditionScore < 35 || (resaleVal <= scrapVal && repairCost >= resaleVal)) {
            route = 'RECYCLE';
            alternativeRoute = null;
            explanation = `Device has severe hardware failure or non-operational status with diagnostic score of ${conditionScore}/100. Restoring it is uneconomical relative to potential market yield. Certified metallurgical recycling recovers precious materials and prevents landfill toxins.`;
        }
        else if ((device.condition === 'C' || device.working_status === 'PARTIALLY_WORKING' || isBroken || conditionScore < 72) &&
            repairabilityScore >= 50) {
            route = 'REPAIR';
            alternativeRoute = 'RECYCLE';
            explanation = `Device has repairable defects (diagnostic score: ${conditionScore}/100, repairability: ${repairabilityScore}/100). Upfront component servicing estimated at ${valuation.resale_value.currency} ${repairCost} restores full hardware functionality, preserving product lifespan over raw recycling.`;
        }
        else {
            route = 'RESALE';
            alternativeRoute = conditionScore < 85 ? 'REPAIR' : null;
            explanation = `Device is operational with a strong health score of ${conditionScore}/100. Secondary circular market demand yields ${valuation.resale_value.currency} ${resaleVal}, far superior to scrap reclamation (${valuation.resale_value.currency} ${scrapVal}). Resale directly extends product lifecycle and avoids new manufacturing CO2 emissions.`;
        }
        return {
            device_id: device.id,
            recommended_route: route,
            condition_score: conditionScore,
            repairability_score: repairabilityScore,
            resale_value: resaleVal,
            scrap_value: scrapVal,
            repair_cost_estimate: repairCost,
            explanation: explanation,
            alternative_route: alternativeRoute
        };
    }
}
exports.DecisionEngine = DecisionEngine;
