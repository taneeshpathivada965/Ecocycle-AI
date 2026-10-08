"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const supabaseClient_1 = require("../db/supabaseClient");
const inMemoryStore_1 = require("../db/inMemoryStore");
const logger_1 = require("../utils/logger");
async function getProfile(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                if (!error && data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        // Fallback in-memory
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        return res.json({ status: 'success', data: profile });
    }
    catch (err) {
        next(err);
    }
}
async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const updates = req.body;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('profiles')
                    .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', userId)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Failed to update profile in Supabase', error);
                }
                else if (data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        // Update in-memory
        const profile = inMemoryStore_1.inMemoryDB.getOrCreateProfile(userId);
        const updated = {
            ...profile,
            ...updates,
            updated_at: new Date().toISOString()
        };
        inMemoryStore_1.inMemoryDB.profiles.set(userId, updated);
        return res.json({ status: 'success', data: updated });
    }
    catch (err) {
        next(err);
    }
}
