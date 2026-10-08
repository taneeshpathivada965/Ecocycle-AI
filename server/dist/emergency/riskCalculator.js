"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyRiskEngine = void 0;
class EmergencyRiskEngine {
    /**
     * Deterministic emergency risk calculation engine.
     * Primary safety mechanism based on rule weights.
     */
    static calculate(signals) {
        let rawScore = 0;
        const breakdown = [];
        // 1. Impact detected (+35)
        const isImpact = signals.impactDetected || (signals.sensorValues?.impact ?? 0) >= 0.7;
        if (isImpact) {
            rawScore += 35;
            breakdown.push({
                rule: 'IMPACT_DETECTED',
                points: 35,
                description: 'Significant physical impact or sudden spike detected'
            });
        }
        // 2. Sudden movement change (+20)
        const isSuddenMovement = signals.suddenMovementChange || (signals.sensorValues?.movement_change ?? 0) >= 0.65;
        if (isSuddenMovement) {
            rawScore += 20;
            breakdown.push({
                rule: 'SUDDEN_MOVEMENT_CHANGE',
                points: 20,
                description: 'Rapid velocity or violent acceleration pattern transition'
            });
        }
        // 3. Device orientation change (+15)
        const isOrientation = signals.deviceOrientationChange || (signals.sensorValues?.orientation_change ?? 0) >= 0.6;
        if (isOrientation) {
            rawScore += 15;
            breakdown.push({
                rule: 'DEVICE_ORIENTATION_CHANGE',
                points: 15,
                description: 'Sudden flat-drop or violent tilt shift detected'
            });
        }
        // 4. Prolonged inactivity (+20)
        const isInactivity = signals.prolongedInactivity || (signals.sensorValues?.inactivity_seconds ?? 0) >= 25;
        if (isInactivity) {
            rawScore += 20;
            breakdown.push({
                rule: 'PROLONGED_INACTIVITY',
                points: 20,
                description: 'No subsequent physical motion recorded after event'
            });
        }
        // 5. No user response (+30)
        if (signals.noUserResponse) {
            rawScore += 30;
            breakdown.push({
                rule: 'NO_USER_RESPONSE',
                points: 30,
                description: 'User failed to respond to verification prompt within timeout window'
            });
        }
        // 6. Location available (+5)
        if (signals.locationAvailable) {
            rawScore += 5;
            breakdown.push({
                rule: 'LOCATION_AVAILABLE',
                points: 5,
                description: 'Precise GPS telemetry captured for emergency responder dispatch'
            });
        }
        // 7. Repeated suspicious signals (+15)
        if (signals.repeatedSuspiciousSignals) {
            rawScore += 15;
            breakdown.push({
                rule: 'REPEATED_SUSPICIOUS_SIGNALS',
                points: 15,
                description: 'Multiple anomalous sensor clusters observed within 60s window'
            });
        }
        // Sensitivity Adjustment
        const sensitivity = signals.sensitivity || 'MEDIUM';
        if (sensitivity === 'HIGH') {
            rawScore += 10;
            breakdown.push({
                rule: 'HIGH_SENSITIVITY_PROFILE',
                points: 10,
                description: 'Elevated sensitivity profile active'
            });
        }
        else if (sensitivity === 'LOW') {
            rawScore = Math.max(0, rawScore - 10);
            breakdown.push({
                rule: 'LOW_SENSITIVITY_PROFILE',
                points: -10,
                description: 'Conservative sensitivity profile applied'
            });
        }
        // Normalize final score between 0 and 100
        const normalizedScore = Math.min(100, Math.max(0, rawScore));
        // Determine Risk Level
        let level = 'LOW';
        if (normalizedScore >= 80) {
            level = 'CRITICAL';
        }
        else if (normalizedScore >= 60) {
            level = 'HIGH';
        }
        else if (normalizedScore >= 30) {
            level = 'MEDIUM';
        }
        else {
            level = 'LOW';
        }
        return {
            score: normalizedScore,
            level,
            breakdown,
            requiresVerification: normalizedScore >= 30 && !signals.noUserResponse,
            requiresImmediateEscalation: normalizedScore >= 60 && Boolean(signals.noUserResponse)
        };
    }
    static classifyLevel(score) {
        if (score >= 80)
            return 'CRITICAL';
        if (score >= 60)
            return 'HIGH';
        if (score >= 30)
            return 'MEDIUM';
        return 'LOW';
    }
}
exports.EmergencyRiskEngine = EmergencyRiskEngine;
