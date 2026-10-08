"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmergency = createEmergency;
exports.getEmergencyById = getEmergencyById;
exports.confirmSafe = confirmSafe;
exports.cancelEmergency = cancelEmergency;
exports.escalateEmergency = escalateEmergency;
exports.getEmergencyHistory = getEmergencyHistory;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../db/supabaseClient");
const inMemoryStore_1 = require("../db/inMemoryStore");
const riskCalculator_1 = require("../emergency/riskCalculator");
const geminiClient_1 = require("../ai/geminiClient");
const simulationProvider_1 = require("../notifications/simulationProvider");
const errors_1 = require("../utils/errors");
async function createEmergency(req, res, next) {
    try {
        const userId = req.user.id;
        const { incident_type, detection_event_id, risk_score, risk_level, latitude, longitude, location_accuracy, timeout_seconds } = req.body;
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        const duration = timeout_seconds || profile.verification_timeout_seconds || 30;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration * 1000).toISOString();
        const score = risk_score ?? 85;
        const level = risk_level ?? riskCalculator_1.EmergencyRiskEngine.classifyLevel(score);
        let incident = {
            id: crypto_1.default.randomUUID(),
            user_id: userId,
            detection_event_id: detection_event_id || null,
            incident_type: incident_type || 'MANUAL_SOS',
            status: 'PENDING_VERIFICATION',
            risk_score: score,
            risk_level: level,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            location_accuracy: location_accuracy ?? null,
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
                const { data, error } = await supabase
                    .from('emergency_incidents')
                    .insert({
                    user_id: userId,
                    detection_event_id: detection_event_id || null,
                    incident_type: incident.incident_type,
                    status: incident.status,
                    risk_score: incident.risk_score,
                    risk_level: incident.risk_level,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                    location_accuracy: incident.location_accuracy,
                    verification_started_at: incident.verification_started_at,
                    verification_expires_at: incident.verification_expires_at
                })
                    .select()
                    .single();
                if (!error && data) {
                    incident = data;
                }
            }
        }
        else {
            inMemoryStore_1.inMemoryDB.incidents.set(incident.id, incident);
        }
        return res.status(201).json({ status: 'success', data: incident });
    }
    catch (err) {
        next(err);
    }
}
async function getEmergencyById(req, res, next) {
    try {
        const userId = req.user.id;
        const incidentId = req.params.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data: incident } = await supabase
                    .from('emergency_incidents')
                    .select('*, detection_events(*), incident_notifications(*, trusted_contacts(*))')
                    .eq('id', incidentId)
                    .eq('user_id', userId)
                    .single();
                if (incident) {
                    return res.json({ status: 'success', data: incident });
                }
            }
        }
        const incident = inMemoryStore_1.inMemoryDB.incidents.get(incidentId);
        if (!incident) {
            throw new errors_1.NotFoundError('Emergency incident not found');
        }
        if (incident.user_id !== userId) {
            throw new errors_1.ForbiddenError('Unauthorized access to this incident');
        }
        // Attach in-memory related records
        const detectionEvent = incident.detection_event_id
            ? inMemoryStore_1.inMemoryDB.events.get(incident.detection_event_id)
            : null;
        const notifications = Array.from(inMemoryStore_1.inMemoryDB.notifications.values()).filter((n) => n.incident_id === incidentId);
        return res.json({
            status: 'success',
            data: {
                ...incident,
                detection_event: detectionEvent,
                notifications
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function confirmSafe(req, res, next) {
    try {
        const userId = req.user.id;
        const incidentId = req.params.id;
        const reason = req.body.reason || 'User confirmed "I am safe" during verification prompt';
        const incident = inMemoryStore_1.inMemoryDB.incidents.get(incidentId);
        if (!incident && !(0, supabaseClient_1.isSupabaseConfigured)()) {
            throw new errors_1.NotFoundError('Emergency incident not found');
        }
        const now = new Date().toISOString();
        const resolutionReason = `Resolved safe: ${reason}`;
        // Generate false alarm AI insight
        const falseAlarmAnalysis = await (0, geminiClient_1.analyzeFalseAlarmWithGemini)({
            incident_type: incident?.incident_type || 'ACCIDENT',
            user_action: 'CONFIRM_SAFE',
            resolution_time_seconds: 12
        });
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('emergency_incidents')
                    .update({
                    status: 'RESOLVED_SAFE',
                    resolved_at: now,
                    resolution_reason: resolutionReason,
                    ai_summary: `False alarm verified. ${falseAlarmAnalysis.reason}`,
                    updated_at: now
                })
                    .eq('id', incidentId)
                    .eq('user_id', userId)
                    .select()
                    .single();
                if (!error && data) {
                    return res.json({ status: 'success', data, falseAlarmAnalysis });
                }
            }
        }
        if (incident) {
            incident.status = 'RESOLVED_SAFE';
            incident.resolved_at = now;
            incident.resolution_reason = resolutionReason;
            incident.ai_summary = `False alarm verified. ${falseAlarmAnalysis.reason}`;
            incident.updated_at = now;
            inMemoryStore_1.inMemoryDB.incidents.set(incidentId, incident);
            return res.json({ status: 'success', data: incident, falseAlarmAnalysis });
        }
        throw new errors_1.NotFoundError('Incident not found');
    }
    catch (err) {
        next(err);
    }
}
async function cancelEmergency(req, res, next) {
    try {
        const userId = req.user.id;
        const incidentId = req.params.id;
        const reason = req.body.reason || 'User cancelled alert';
        const now = new Date().toISOString();
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('emergency_incidents')
                    .update({
                    status: 'CANCELLED',
                    resolved_at: now,
                    resolution_reason: reason,
                    updated_at: now
                })
                    .eq('id', incidentId)
                    .eq('user_id', userId)
                    .select()
                    .single();
                if (!error && data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        const incident = inMemoryStore_1.inMemoryDB.incidents.get(incidentId);
        if (!incident) {
            throw new errors_1.NotFoundError('Incident not found');
        }
        if (incident.user_id !== userId) {
            throw new errors_1.ForbiddenError('Unauthorized');
        }
        incident.status = 'CANCELLED';
        incident.resolved_at = now;
        incident.resolution_reason = reason;
        incident.updated_at = now;
        inMemoryStore_1.inMemoryDB.incidents.set(incidentId, incident);
        return res.json({ status: 'success', data: incident });
    }
    catch (err) {
        next(err);
    }
}
async function escalateEmergency(req, res, next) {
    try {
        const userId = req.user.id;
        const incidentId = req.params.id;
        const { latitude, longitude, accuracy, reason } = req.body;
        const now = new Date().toISOString();
        let incident = inMemoryStore_1.inMemoryDB.incidents.get(incidentId);
        // Fetch contacts for notifications
        let contacts = Array.from(inMemoryStore_1.inMemoryDB.contacts.values()).filter((c) => c.user_id === userId);
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data: dbIncident } = await supabase
                    .from('emergency_incidents')
                    .select('*')
                    .eq('id', incidentId)
                    .eq('user_id', userId)
                    .single();
                const { data: dbContacts } = await supabase
                    .from('trusted_contacts')
                    .select('*')
                    .eq('user_id', userId)
                    .order('priority', { ascending: true });
                if (dbIncident)
                    incident = dbIncident;
                if (dbContacts && dbContacts.length > 0)
                    contacts = dbContacts;
            }
        }
        if (!incident) {
            throw new errors_1.NotFoundError('Incident not found');
        }
        // Elevate risk score because user did not respond (+30 rule)
        const escalatedScore = Math.min(100, Math.max(incident.risk_score + 15, 85));
        const escalatedLevel = riskCalculator_1.EmergencyRiskEngine.classifyLevel(escalatedScore);
        const locLat = latitude ?? incident.latitude ?? 37.7749;
        const locLng = longitude ?? incident.longitude ?? -122.4194;
        // Generate AI Summary with Gemini
        const aiSummaryResult = await (0, geminiClient_1.generateSummaryWithGemini)({
            incident_type: incident.incident_type,
            risk_score: escalatedScore,
            risk_level: escalatedLevel,
            location_available: Boolean(locLat && locLng),
            user_responded: false
        });
        // Dispatch notifications to trusted contacts
        const provider = (0, simulationProvider_1.getNotificationProvider)();
        const dispatchedNotifications = [];
        for (const contact of contacts) {
            const notifResult = await provider.send({
                incidentId,
                contactId: contact.id,
                contactName: contact.name,
                contactPhone: contact.phone,
                contactEmail: contact.email,
                channel: 'SIMULATED',
                incidentType: incident.incident_type,
                riskLevel: escalatedLevel,
                riskScore: escalatedScore,
                location: locLat && locLng ? { latitude: locLat, longitude: locLng, accuracy } : undefined,
                customMessage: `[EMERGENCY SENSE ALERT] Automatic escalation! ${contact.name}, ${incident.incident_type} was detected and your contact did not respond. Risk: ${escalatedLevel} (${escalatedScore}/100). Location: https://maps.google.com/?q=${locLat},${locLng}`
            });
            const notifRecord = {
                id: notifResult.id,
                incident_id: incidentId,
                trusted_contact_id: contact.id,
                contact_name: contact.name,
                channel: 'SIMULATED',
                status: notifResult.status,
                message: notifResult.message,
                sent_at: notifResult.sentAt,
                error_message: notifResult.error,
                created_at: now
            };
            dispatchedNotifications.push(notifRecord);
            if ((0, supabaseClient_1.isSupabaseConfigured)()) {
                const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
                if (supabase) {
                    await supabase.from('incident_notifications').insert({
                        id: notifRecord.id,
                        incident_id: incidentId,
                        trusted_contact_id: contact.id,
                        channel: notifRecord.channel,
                        status: notifRecord.status,
                        message: notifRecord.message,
                        sent_at: notifRecord.sent_at,
                        error_message: notifRecord.error_message
                    });
                }
            }
            else {
                inMemoryStore_1.inMemoryDB.notifications.set(notifRecord.id, notifRecord);
            }
        }
        // Update incident state
        incident.status = 'ESCALATED';
        incident.escalated_at = now;
        incident.risk_score = escalatedScore;
        incident.risk_level = escalatedLevel;
        incident.latitude = locLat;
        incident.longitude = locLng;
        incident.location_accuracy = accuracy ?? 5;
        incident.resolution_reason = reason || 'Automatic escalation: Verification countdown elapsed without response';
        incident.ai_summary = aiSummaryResult.summary;
        incident.updated_at = now;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                await supabase
                    .from('emergency_incidents')
                    .update({
                    status: 'ESCALATED',
                    escalated_at: now,
                    risk_score: escalatedScore,
                    risk_level: escalatedLevel,
                    latitude: locLat,
                    longitude: locLng,
                    location_accuracy: accuracy ?? 5,
                    resolution_reason: incident.resolution_reason,
                    ai_summary: incident.ai_summary,
                    updated_at: now
                })
                    .eq('id', incidentId);
            }
        }
        else {
            inMemoryStore_1.inMemoryDB.incidents.set(incidentId, incident);
        }
        return res.json({
            status: 'success',
            data: {
                incident,
                aiSummary: aiSummaryResult,
                notifications: dispatchedNotifications
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getEmergencyHistory(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('emergency_incidents')
                    .select('*, incident_notifications(*)')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (!error && data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        const incidents = Array.from(inMemoryStore_1.inMemoryDB.incidents.values())
            .filter((i) => i.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((inc) => ({
            ...inc,
            incident_notifications: Array.from(inMemoryStore_1.inMemoryDB.notifications.values()).filter((n) => n.incident_id === inc.id)
        }));
        return res.json({ status: 'success', data: incidents });
    }
    catch (err) {
        next(err);
    }
}
