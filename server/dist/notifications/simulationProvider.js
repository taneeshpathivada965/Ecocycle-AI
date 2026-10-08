"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveWebhookNotificationProvider = exports.SimulationNotificationProvider = void 0;
exports.getNotificationProvider = getNotificationProvider;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
class SimulationNotificationProvider {
    name = 'simulation';
    async send(payload) {
        const mapsLink = payload.location
            ? `https://maps.google.com/?q=${payload.location.latitude},${payload.location.longitude}`
            : 'Location unavailable';
        const defaultMessage = `[EMERGENCY SENSE ALERT] Emergency detected for your contact! Severity: ${payload.riskLevel} (${payload.riskScore}/100). Event: ${payload.incidentType}. Location: ${mapsLink}. Please check on them immediately.`;
        const message = payload.customMessage || defaultMessage;
        logger_1.logger.info('SIMULATED EMERGENCY NOTIFICATION DISPATCHED', {
            recipient: payload.contactName,
            channel: payload.channel,
            phone: payload.contactPhone,
            email: payload.contactEmail,
            incidentId: payload.incidentId
        });
        return {
            id: crypto_1.default.randomUUID(),
            incidentId: payload.incidentId,
            contactId: payload.contactId,
            contactName: payload.contactName,
            channel: payload.channel,
            status: 'SIMULATED',
            message,
            sentAt: new Date().toISOString()
        };
    }
}
exports.SimulationNotificationProvider = SimulationNotificationProvider;
class LiveWebhookNotificationProvider {
    name = 'webhook';
    async send(payload) {
        const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
        const message = payload.customMessage || `Emergency Alert: ${payload.incidentType} (${payload.riskLevel})`;
        if (!webhookUrl) {
            return {
                id: crypto_1.default.randomUUID(),
                incidentId: payload.incidentId,
                contactId: payload.contactId,
                contactName: payload.contactName,
                channel: payload.channel,
                status: 'FAILED',
                message,
                sentAt: new Date().toISOString(),
                error: 'No webhook endpoint configured'
            };
        }
        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(`Webhook returned status ${res.status}`);
            }
            return {
                id: crypto_1.default.randomUUID(),
                incidentId: payload.incidentId,
                contactId: payload.contactId,
                contactName: payload.contactName,
                channel: payload.channel,
                status: 'SENT',
                message,
                sentAt: new Date().toISOString()
            };
        }
        catch (err) {
            return {
                id: crypto_1.default.randomUUID(),
                incidentId: payload.incidentId,
                contactId: payload.contactId,
                contactName: payload.contactName,
                channel: payload.channel,
                status: 'FAILED',
                message,
                sentAt: new Date().toISOString(),
                error: err.message
            };
        }
    }
}
exports.LiveWebhookNotificationProvider = LiveWebhookNotificationProvider;
function getNotificationProvider() {
    const providerType = (process.env.NOTIFICATION_PROVIDER || 'simulation').toLowerCase();
    if (providerType === 'webhook') {
        return new LiveWebhookNotificationProvider();
    }
    return new SimulationNotificationProvider();
}
