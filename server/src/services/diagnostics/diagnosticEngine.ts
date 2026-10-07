import { DiagnosticRecord, Device } from '../../db/storage';
import { DiagnosticSourceEnum } from '../../validators/schemas';
import { z } from 'zod';

export interface DiagnosticInput {
  battery_health?: number;
  battery_cycles?: number;
  display_status?: string;
  touch_status?: string;
  storage_status?: string;
  processor_status?: string;
  charging_status?: string;
  camera_status?: string;
  speaker_status?: string;
  source?: z.infer<typeof DiagnosticSourceEnum>;
}

export class DiagnosticEngine {
  /**
   * Run automated diagnostic assessment based on device category, age, condition, and telemetry
   */
  static runDiagnostic(device: Device, telemetryInput?: DiagnosticInput): Omit<DiagnosticRecord, 'id' | 'created_at'> {
    const isDead = device.working_status === 'DEAD' || device.condition === 'DEAD' || device.condition === 'BROKEN';
    const isPartiallyWorking = device.working_status === 'PARTIALLY_WORKING' || device.condition === 'C';
    const age = device.estimated_age_years || 2;

    // Determine realistic battery health based on age decay curve
    let batteryHealth: number;
    let batteryCycles: number;

    if (telemetryInput?.battery_health !== undefined) {
      batteryHealth = telemetryInput.battery_health;
      batteryCycles = telemetryInput.battery_cycles ?? Math.round(age * 280);
    } else if (isDead) {
      batteryHealth = 12;
      batteryCycles = Math.round(age * 360 + 400);
    } else if (isPartiallyWorking) {
      batteryHealth = Math.max(55, Math.round(85 - age * 8));
      batteryCycles = Math.round(age * 310);
    } else {
      batteryHealth = Math.max(78, Math.round(100 - age * 5.5));
      batteryCycles = Math.round(age * 220);
    }

    // Determine subsystem statuses
    let displayStatus = telemetryInput?.display_status;
    let touchStatus = telemetryInput?.touch_status;
    let storageStatus = telemetryInput?.storage_status;
    let processorStatus = telemetryInput?.processor_status;
    let chargingStatus = telemetryInput?.charging_status;
    let cameraStatus = telemetryInput?.camera_status;
    let speakerStatus = telemetryInput?.speaker_status;

    if (!displayStatus) {
      displayStatus = isDead ? 'DAMAGED_BLACK_SCREEN' : isPartiallyWorking ? 'MICRO_CRACKED_WORKING' : 'VERIFIED_CALIBRATED';
    }
    if (!touchStatus) {
      touchStatus = isDead ? 'DIGITIZER_UNRESPONSIVE' : isPartiallyWorking ? 'PARTIAL_DEAD_ZONES' : 'OPTIMAL_MULTI_TOUCH';
    }
    if (!storageStatus) {
      storageStatus = isDead ? 'NAND_DEGRADED' : 'SMART_HEALTH_NORMAL';
    }
    if (!processorStatus) {
      processorStatus = isDead ? 'THERMAL_THROTTLED_FAIL' : 'CLOCK_FREQUENCY_STABLE';
    }
    if (!chargingStatus) {
      chargingStatus = isDead ? 'PORT_CORRODED' : 'FAST_CHARGE_DETECTED';
    }
    if (!cameraStatus) {
      cameraStatus = isDead ? 'SENSOR_FAULT' : 'OPTICAL_FOCUS_CLEAR';
    }
    if (!speakerStatus) {
      speakerStatus = isDead ? 'COIL_MUTED' : 'STEREO_AUDIO_CLEAR';
    }

    // Calculate weighted condition score
    let score = 0;
    if (isDead) {
      score = Math.floor(Math.random() * 15 + 10); // 10 - 25
    } else if (isPartiallyWorking) {
      score = Math.floor(Math.random() * 20 + 48); // 48 - 68
    } else {
      score = Math.min(98, Math.floor(82 + (batteryHealth / 100) * 16)); // 82 - 98
    }

    const source = telemetryInput?.source || (isDead ? 'AI_ESTIMATED' : 'SIMULATED');

    return {
      device_id: device.id,
      battery_health: batteryHealth,
      battery_cycles: batteryCycles,
      display_status: displayStatus,
      touch_status: touchStatus,
      storage_status: storageStatus,
      processor_status: processorStatus,
      charging_status: chargingStatus,
      camera_status: cameraStatus,
      speaker_status: speakerStatus,
      overall_score: score,
      confidence: 0.92,
      source: source
    };
  }
}
