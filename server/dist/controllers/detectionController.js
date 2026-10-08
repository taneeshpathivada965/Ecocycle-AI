"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordDetectionEvent = recordDetectionEvent;
exports.simulateScenario = simulateScenario;
exports.getRecentDetectionEvents = getRecentDetectionEvents;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../db/supabaseClient");
const inMemoryStore_1 = require("../db/inMemoryStore");
const riskCalculator_1 = require("../emergency/riskCalculator");
async function recordDetectionEvent(req, res, next) {
    try {
        const userId = req.user.id;
        const { monitoring_session_id, event_type, sensor_data, latitude, longitude, location_accuracy } = req.body;
        // Get user profile for sensitivity & verification timeout
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        const sensitivity = profile.detection_sensitivity;
        const timeoutSeconds = profile.verification_timeout_seconds || 30;
        // Evaluate risk deterministically
        const signals = {
            impactDetected: sensor_data.impact >= 0.7,
            suddenMovementChange: sensor_data.movement_change >= 0.65,
            deviceOrientationChange: sensor_data.orientation_change >= 0.6,
            prolongedInactivity: sensor_data.inactivity_seconds >= 25,
            locationAvailable: Boolean(latitude && longitude),
            sensorValues: sensor_data,
            sensitivity
        };
        const evaluation = riskCalculator_1.EmergencyRiskEngine.calculate(signals);
        let eventRecord = {
            id: crypto_1.default.randomUUID(),
            user_id: userId,
            monitoring_session_id,
            event_type,
            sensor_data,
            latitude,
            longitude,
            location_accuracy,
            detected_at: new Date().toISOString(),
            risk_score: evaluation.score,
            risk_level: evaluation.level,
            created_at: new Date().toISOString()
        };
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('detection_events')
                    .insert({
                    user_id: userId,
                    monitoring_session_id,
                    event_type,
                    sensor_data,
                    latitude,
                    longitude,
                    location_accuracy,
                    risk_score: evaluation.score,
                    risk_level: evaluation.level
                })
                    .select()
                    .single();
                if (!error && data) {
                    eventRecord = data;
                }
            }
        }
        else {
            inMemoryStore_1.inMemoryDB.events.set(eventRecord.id, eventRecord);
        }
        let createdIncident = null;
        // If score >= 30, automatically create an emergency incident pending verification
        if (evaluation.requiresVerification) {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + timeoutSeconds * 1000).toISOString();
            createdIncident = {
                id: crypto_1.default.randomUUID(),
                user_id: userId,
                detection_event_id: eventRecord.id,
                incident_type: event_type,
                status: 'PENDING_VERIFICATION',
                risk_score: evaluation.score,
                risk_level: evaluation.level,
                latitude,
                longitude,
                location_accuracy,
                detected_at: now.toISOString(),
                verification_started_at: now.toISOString(),
                verification_expires_at: expiresAt,
                escalated_at: null,
                resolved_at: null,
                resolution_reason: null,
                ai_summary: null,
                created_at: now.toISOString(),
                updated_at: now.toISOString()
            };
            if ((0, supabaseClient_1.isSupabaseConfigured)()) {
                const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
                if (supabase) {
                    const { data } = await supabase
                        .from('emergency_incidents')
                        .insert({
                        user_id: userId,
                        detection_event_id: eventRecord.id,
                        incident_type: event_type,
                        status: 'PENDING_VERIFICATION',
                        risk_score: evaluation.score,
                        risk_level: evaluation.level,
                        latitude,
                        longitude,
                        location_accuracy,
                        verification_started_at: now.toISOString(),
                        verification_expires_at: expiresAt
                    })
                        .select()
                        .single();
                    if (data)
                        createdIncident = data;
                }
            }
            else {
                inMemoryStore_1.inMemoryDB.incidents.set(createdIncident.id, createdIncident);
            }
        }
        return res.json({
            status: 'success',
            data: {
                event: eventRecord,
                evaluation,
                incident: createdIncident
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function simulateScenario(req, res, next) {
    try {
        const userId = req.user.id;
        const { scenario, latitude, longitude, location_accuracy } = req.body;
        let event_type = scenario;
        let sensor_data = {};
        switch (scenario) {
            case 'FALL':
                event_type = 'FALL';
                sensor_data = {
                    impact: 0.88,
                    movement_change: 0.82,
                    orientation_change: 0.76,
                    inactivity_seconds: 35,
                    acceleration_magnitude: 24.5,
                    simulation_mode: true
                };
                break;
            case 'HEAVY_IMPACT':
                event_type = 'HEAVY_IMPACT';
                sensor_data = {
                    impact: 0.96,
                    movement_change: 0.91,
                    orientation_change: 0.85,
                    inactivity_seconds: 15,
                    acceleration_magnitude: 38.2,
                    simulation_mode: true
                };
                break;
            case 'PROLONGED_INACTIVITY':
                event_type = 'PROLONGED_INACTIVITY';
                sensor_data = {
                    impact: 0.1,
                    movement_change: 0.05,
                    orientation_change: 0.1,
                    inactivity_seconds: 120,
                    acceleration_magnitude: 0.2,
                    simulation_mode: true
                };
                break;
            case 'CRITICAL_EMERGENCY':
                event_type = 'CRITICAL_EMERGENCY';
                sensor_data = {
                    impact: 0.98,
                    movement_change: 0.95,
                    orientation_change: 0.9,
                    inactivity_seconds: 45,
                    acceleration_magnitude: 42.0,
                    repeated_spikes: true,
                    simulation_mode: true
                };
                break;
            case 'FALSE_ALARM':
                event_type = 'FALSE_ALARM_STUMBLE';
                sensor_data = {
                    impact: 0.45,
                    movement_change: 0.4,
                    orientation_change: 0.35,
                    inactivity_seconds: 2,
                    acceleration_magnitude: 14.1,
                    simulation_mode: true
                };
                break;
            case 'NORMAL_ACTIVITY':
            default:
                event_type = 'NORMAL_ACTIVITY';
                sensor_data = {
                    impact: 0.05,
                    movement_change: 0.1,
                    orientation_change: 0.05,
                    inactivity_seconds: 0,
                    acceleration_magnitude: 9.8,
                    simulation_mode: true
                };
                break;
        }
        // Reuse detection recording pipeline
        req.body = {
            event_type,
            sensor_data,
            latitude: latitude ?? 37.7749,
            longitude: longitude ?? -122.4194,
            location_accuracy: location_accuracy ?? 5
        };
        return recordDetectionEvent(req, res, next);
    }
    catch (err) {
        next(err);
    }
}
async function getRecentDetectionEvents(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data } = await supabase
                    .from('detection_events')
                    .select('*')
                    .eq('user_id', userId)
                    .order('detected_at', { ascending: false })
                    .limit(20);
                if (data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        const events = Array.from(inMemoryStore_1.inMemoryDB.events.values())
            .filter((e) => e.user_id === userId)
            .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())
            .slice(0, 20);
        return res.json({ status: 'success', data: events });
    }
    catch (err) {
        next(err);
    }
}
