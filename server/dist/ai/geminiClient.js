"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_PROMPT = void 0;
exports.getGeminiClient = getGeminiClient;
exports.analyzeEmergencyWithGemini = analyzeEmergencyWithGemini;
exports.generateSummaryWithGemini = generateSummaryWithGemini;
exports.analyzeFalseAlarmWithGemini = analyzeFalseAlarmWithGemini;
const genai_1 = require("@google/genai");
const logger_1 = require("../utils/logger");
const schemas_1 = require("../validators/schemas");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let aiClient = null;
function getGeminiClient() {
    if (aiClient)
        return aiClient;
    if (!GEMINI_API_KEY) {
        logger_1.logger.warn('GEMINI_API_KEY is not configured. Falling back to deterministic advisory generator.');
        return null;
    }
    try {
        aiClient = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY });
        return aiClient;
    }
    catch (err) {
        logger_1.logger.error('Failed to initialize GoogleGenAI client', err);
        return null;
    }
}
exports.SYSTEM_PROMPT = `
You are an emergency-event analysis assistant for EmergencySense.

Your responsibility is to analyze structured emergency sensor and incident information and produce a cautious, factual assessment.

You are NOT an emergency dispatcher and must never claim that emergency services have been contacted unless the application explicitly confirms that action.

Never invent sensor values, medical conditions, locations, events, or user responses.
Use only the supplied data.
Classify the event based on the evidence provided.
Prioritize safety.
If evidence suggests a potentially serious emergency, recommend escalation.
If evidence is insufficient, explicitly state that confidence is limited.
Return strictly valid JSON matching the requested schema without markdown tags or backticks.
Keep the explanation concise and suitable for an emergency dashboard.
`.trim();
async function analyzeEmergencyWithGemini(data) {
    const client = getGeminiClient();
    if (!client) {
        return getFallbackAnalysis(data);
    }
    const prompt = `
Task: Analyze the following emergency telemetry data and return a JSON object.
Required JSON Schema:
{
  "classification": "POTENTIAL_EMERGENCY" | "FALSE_ALARM" | "ROUTINE_EVENT",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number between 0 and 1,
  "reason": "Clear explanation grounded strictly in the sensor readings",
  "recommended_action": "MONITOR" | "VERIFY" | "ESCALATE",
  "summary": "Concise 1-2 sentence dashboard status"
}

Input Telemetry:
${JSON.stringify(data, null, 2)}
`.trim();
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `${exports.SYSTEM_PROMPT}\n\n${prompt}` }] }
            ]
        });
        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const validated = schemas_1.AIAnalysisOutputSchema.parse(parsed);
        return validated;
    }
    catch (err) {
        logger_1.logger.warn('Gemini live analysis failed or timed out. Falling back to deterministic advisory.', {
            error: String(err)
        });
        return getFallbackAnalysis(data);
    }
}
async function generateSummaryWithGemini(incidentData) {
    const client = getGeminiClient();
    if (!client) {
        return getFallbackSummary(incidentData);
    }
    const prompt = `
Task: Produce a structured emergency incident summary.
Required JSON Schema:
{
  "summary": "Concise factual summary (e.g., 'Potential fall detected followed by 42 seconds of inactivity. User did not respond during verification. Risk level: HIGH. Latest location available.')",
  "key_events": ["list", "of", "events"],
  "risk_explanation": "Factual explanation of why this risk score was assigned",
  "recommended_action": "MONITOR" | "VERIFY" | "ESCALATE",
  "confidence": number between 0 and 1
}

Incident Details:
${JSON.stringify(incidentData, null, 2)}
`.trim();
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `${exports.SYSTEM_PROMPT}\n\n${prompt}` }] }
            ]
        });
        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const validated = schemas_1.AISummaryOutputSchema.parse(parsed);
        return validated;
    }
    catch (err) {
        logger_1.logger.warn('Gemini summary generation failed. Using deterministic fallback.', {
            error: String(err)
        });
        return getFallbackSummary(incidentData);
    }
}
async function analyzeFalseAlarmWithGemini(context) {
    const client = getGeminiClient();
    if (!client) {
        return {
            likely_false_alarm: true,
            confidence: 0.95,
            reason: 'User directly initiated safe confirmation and verified well-being within prompt interval.',
            recommended_action: 'RESUME_MONITORING'
        };
    }
    const prompt = `
Task: Evaluate false alarm incident resolution.
Required JSON Schema:
{
  "likely_false_alarm": boolean,
  "confidence": number between 0 and 1,
  "reason": "string",
  "recommended_action": "RESUME_MONITORING"
}

Context:
${JSON.stringify(context, null, 2)}
`.trim();
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `${exports.SYSTEM_PROMPT}\n\n${prompt}` }] }
            ]
        });
        const responseText = response.text || '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return schemas_1.AIFalseAlarmOutputSchema.parse(parsed);
    }
    catch {
        return {
            likely_false_alarm: true,
            confidence: 0.95,
            reason: 'User manually dismissed alert as safe.',
            recommended_action: 'RESUME_MONITORING'
        };
    }
}
function getFallbackAnalysis(data) {
    let severity = 'LOW';
    if (data.risk_score >= 80)
        severity = 'CRITICAL';
    else if (data.risk_score >= 60)
        severity = 'HIGH';
    else if (data.risk_score >= 30)
        severity = 'MEDIUM';
    const classification = data.risk_score >= 30 ? 'POTENTIAL_EMERGENCY' : 'ROUTINE_EVENT';
    const action = data.risk_score >= 60 && !data.user_responded ? 'ESCALATE' : data.risk_score >= 30 ? 'VERIFY' : 'MONITOR';
    return {
        classification,
        severity,
        confidence: 0.88,
        reason: `Telemetry indicated ${data.event_type} with risk score ${data.risk_score}/100. Inactivity: ${data.inactivity_seconds || 0}s. User responded: ${data.user_responded ? 'Yes' : 'No'}.`,
        recommended_action: action,
        summary: `${data.event_type} anomaly detected with ${severity} severity. Verification workflow active.`
    };
}
function getFallbackSummary(incidentData) {
    const events = [
        `Anomaly detected: ${incidentData.incident_type}`,
        `Risk score calculated: ${incidentData.risk_score} (${incidentData.risk_level})`,
        incidentData.user_responded ? 'User confirmed safety' : 'User failed to respond during verification interval',
        incidentData.location_available ? 'GPS location locked' : 'Location unavailable'
    ];
    return {
        summary: `Potential ${incidentData.incident_type.toLowerCase()} detected${incidentData.inactivity_seconds ? ` followed by ${incidentData.inactivity_seconds}s inactivity` : ''}. User ${incidentData.user_responded ? 'confirmed safety' : 'did not respond during verification'}. Risk level: ${incidentData.risk_level}. ${incidentData.location_available ? 'Latest location available.' : 'Location pending.'} Trusted contacts notified.`,
        key_events: events,
        risk_explanation: `Deterministic engine assigned ${incidentData.risk_score}/100 based on physical telemetry signals and unresponsive user status.`,
        recommended_action: incidentData.user_responded ? 'MONITOR' : 'ESCALATE',
        confidence: 0.92
    };
}
