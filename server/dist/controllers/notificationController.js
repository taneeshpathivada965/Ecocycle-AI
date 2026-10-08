"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.getNotificationsByIncident = getNotificationsByIncident;
const inMemoryStore_1 = require("../db/inMemoryStore");
const supabaseClient_1 = require("../db/supabaseClient");
const simulationProvider_1 = require("../notifications/simulationProvider");
const errors_1 = require("../utils/errors");
async function sendNotification(req, res, next) {
    try {
        const userId = req.user.id;
        const { incident_id, channel, custom_message } = req.body;
        const contacts = Array.from(inMemoryStore_1.inMemoryDB.contacts.values()).filter((c) => c.user_id === userId);
        if (contacts.length === 0) {
            throw new errors_1.NotFoundError('No trusted contacts registered');
        }
        const provider = (0, simulationProvider_1.getNotificationProvider)();
        const results = [];
        for (const contact of contacts) {
            const res = await provider.send({
                incidentId: incident_id,
                contactId: contact.id,
                contactName: contact.name,
                contactPhone: contact.phone,
                contactEmail: contact.email,
                channel: channel || 'SIMULATED',
                incidentType: 'MANUAL_ALERT',
                riskLevel: 'HIGH',
                riskScore: 75,
                customMessage: custom_message
            });
            const record = {
                id: res.id,
                incident_id,
                trusted_contact_id: contact.id,
                contact_name: contact.name,
                channel: channel || 'SIMULATED',
                status: res.status,
                message: res.message,
                sent_at: res.sentAt,
                created_at: new Date().toISOString()
            };
            inMemoryStore_1.inMemoryDB.notifications.set(record.id, record);
            results.push(record);
        }
        return res.json({ status: 'success', data: results });
    }
    catch (err) {
        next(err);
    }
}
async function getNotificationsByIncident(req, res, next) {
    try {
        const incidentId = req.params.incidentId;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data } = await supabase
                    .from('incident_notifications')
                    .select('*, trusted_contacts(*)')
                    .eq('incident_id', incidentId);
                if (data)
                    return res.json({ status: 'success', data });
            }
        }
        const notifications = Array.from(inMemoryStore_1.inMemoryDB.notifications.values()).filter((n) => n.incident_id === incidentId);
        return res.json({ status: 'success', data: notifications });
    }
    catch (err) {
        next(err);
    }
}
