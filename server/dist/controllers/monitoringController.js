"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonitoring = startMonitoring;
exports.stopMonitoring = stopMonitoring;
exports.getMonitoringStatus = getMonitoringStatus;
exports.ingestSignal = ingestSignal;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../db/supabaseClient");
const inMemoryStore_1 = require("../db/inMemoryStore");
async function startMonitoring(req, res, next) {
    try {
        const userId = req.user.id;
        const { latitude, longitude, accuracy } = req.body;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                // End any active sessions first
                await supabase
                    .from('monitoring_sessions')
                    .update({ status: 'STOPPED', ended_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .eq('status', 'ACTIVE');
                // Create new session
                const { data: session, error } = await supabase
                    .from('monitoring_sessions')
                    .insert({
                    user_id: userId,
                    status: 'ACTIVE',
                    started_at: new Date().toISOString(),
                    last_signal_at: new Date().toISOString()
                })
                    .select()
                    .single();
                // Update profile monitoring_enabled
                await supabase
                    .from('profiles')
                    .update({ monitoring_enabled: true, location_enabled: Boolean(latitude && longitude) })
                    .eq('id', userId);
                if (!error && session) {
                    return res.json({
                        status: 'success',
                        message: 'Monitoring session initiated',
                        data: session
                    });
                }
            }
        }
        // In-memory fallback
        for (const session of inMemoryStore_1.inMemoryDB.sessions.values()) {
            if (session.user_id === userId && session.status === 'ACTIVE') {
                session.status = 'STOPPED';
                session.ended_at = new Date().toISOString();
            }
        }
        const newSession = {
            id: crypto_1.default.randomUUID(),
            user_id: userId,
            started_at: new Date().toISOString(),
            ended_at: null,
            status: 'ACTIVE',
            last_signal_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        inMemoryStore_1.inMemoryDB.sessions.set(newSession.id, newSession);
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        profile.monitoring_enabled = true;
        profile.location_enabled = Boolean(latitude && longitude);
        return res.json({
            status: 'success',
            message: 'Monitoring session initiated',
            data: newSession
        });
    }
    catch (err) {
        next(err);
    }
}
async function stopMonitoring(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                await supabase
                    .from('monitoring_sessions')
                    .update({ status: 'STOPPED', ended_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .eq('status', 'ACTIVE');
                await supabase
                    .from('profiles')
                    .update({ monitoring_enabled: false })
                    .eq('id', userId);
                return res.json({
                    status: 'success',
                    message: 'Monitoring session terminated'
                });
            }
        }
        // In-memory fallback
        for (const session of inMemoryStore_1.inMemoryDB.sessions.values()) {
            if (session.user_id === userId && session.status === 'ACTIVE') {
                session.status = 'STOPPED';
                session.ended_at = new Date().toISOString();
            }
        }
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        profile.monitoring_enabled = false;
        return res.json({
            status: 'success',
            message: 'Monitoring session terminated'
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMonitoringStatus(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data: session } = await supabase
                    .from('monitoring_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('status', 'ACTIVE')
                    .order('started_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('monitoring_enabled, location_enabled, detection_sensitivity, verification_timeout_seconds')
                    .eq('id', userId)
                    .single();
                return res.json({
                    status: 'success',
                    data: {
                        isActive: Boolean(session),
                        activeSession: session || null,
                        monitoringEnabled: profile?.monitoring_enabled ?? false,
                        locationEnabled: profile?.location_enabled ?? false,
                        sensitivity: profile?.detection_sensitivity ?? 'MEDIUM',
                        verificationTimeout: profile?.verification_timeout_seconds ?? 30,
                        systemHealth: 'OPERATIONAL',
                        lastHeartbeat: session?.last_signal_at || new Date().toISOString()
                    }
                });
            }
        }
        // In-memory fallback
        const activeSession = Array.from(inMemoryStore_1.inMemoryDB.sessions.values()).find((s) => s.user_id === userId && s.status === 'ACTIVE');
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        return res.json({
            status: 'success',
            data: {
                isActive: Boolean(activeSession),
                activeSession: activeSession || null,
                monitoringEnabled: profile.monitoring_enabled,
                locationEnabled: profile.location_enabled,
                sensitivity: profile.detection_sensitivity,
                verificationTimeout: profile.verification_timeout_seconds,
                systemHealth: 'OPERATIONAL',
                lastHeartbeat: activeSession?.last_signal_at || new Date().toISOString()
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function ingestSignal(req, res, next) {
    try {
        const userId = req.user.id;
        const now = new Date().toISOString();
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                await supabase
                    .from('monitoring_sessions')
                    .update({ last_signal_at: now })
                    .eq('user_id', userId)
                    .eq('status', 'ACTIVE');
                return res.json({ status: 'success', receivedAt: now });
            }
        }
        for (const session of inMemoryStore_1.inMemoryDB.sessions.values()) {
            if (session.user_id === userId && session.status === 'ACTIVE') {
                session.last_signal_at = now;
            }
        }
        return res.json({ status: 'success', receivedAt: now });
    }
    catch (err) {
        next(err);
    }
}
