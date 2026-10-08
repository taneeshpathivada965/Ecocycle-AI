"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseAdmin = getSupabaseAdmin;
exports.getSupabaseUserClient = getSupabaseUserClient;
exports.isSupabaseConfigured = isSupabaseConfigured;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("../utils/logger");
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
let adminClient = null;
function getSupabaseAdmin() {
    if (adminClient)
        return adminClient;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        logger_1.logger.warn('Supabase URL or SERVICE_ROLE_KEY missing. Admin operations will fallback to in-memory store.');
        return null;
    }
    try {
        adminClient = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        return adminClient;
    }
    catch (err) {
        logger_1.logger.error('Failed to initialize Supabase Admin client', err);
        return null;
    }
}
function getSupabaseUserClient(accessToken) {
    if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
        return null;
    }
    const key = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
    try {
        return (0, supabase_js_1.createClient)(SUPABASE_URL, key, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to create user scoped Supabase client', err);
        return null;
    }
}
function isSupabaseConfigured() {
    return Boolean(SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY));
}
