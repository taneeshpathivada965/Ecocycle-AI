"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// Structured Logger that sanitizes sensitive data (JWTs, API keys, passwords)
exports.logger = {
    info: (message, meta) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...(meta ? sanitize(meta) : {})
        }));
    },
    warn: (message, meta) => {
        console.warn(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            ...(meta ? sanitize(meta) : {})
        }));
    },
    error: (message, error, meta) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            error: error instanceof Error ? error.message : String(error),
            ...(meta ? sanitize(meta) : {})
        }));
    }
};
function sanitize(obj) {
    const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'key', 'apiKey', 'apikey', 'gemini_api_key'];
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitize(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
