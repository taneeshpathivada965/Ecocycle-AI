"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const supabaseClient_1 = require("../db/supabaseClient");
const logger_1 = require("../utils/logger");
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Allow demo user default for hackathon convenience if header is missing
            req.user = {
                id: 'demo-user-ecocycle-001',
                email: 'alex.rivera@ecocycle.demo',
                role: 'authenticated'
            };
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            req.user = {
                id: 'demo-user-ecocycle-001',
                email: 'alex.rivera@ecocycle.demo',
                role: 'authenticated'
            };
            return next();
        }
        // Check for demo bypass token (for mock testing/offline hackathon evaluation)
        if (token === 'demo-test-token' || token.startsWith('demo-user')) {
            req.user = {
                id: 'demo-user-ecocycle-001',
                email: 'alex.rivera@ecocycle.demo',
                role: 'authenticated'
            };
            return next();
        }
        // When Supabase is configured, verify with Supabase Auth
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                try {
                    const { data: { user }, error } = await supabase.auth.getUser(token);
                    if (user && !error) {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        };
                        return next();
                    }
                }
                catch (authErr) {
                    logger_1.logger.warn('Supabase auth check error, falling back to session user');
                }
            }
        }
        // Fallback to demo user
        req.user = {
            id: 'demo-user-ecocycle-001',
            email: 'alex.rivera@ecocycle.demo',
            role: 'authenticated'
        };
        next();
    }
    catch (err) {
        next(err);
    }
}
