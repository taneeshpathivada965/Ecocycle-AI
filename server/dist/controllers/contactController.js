"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContacts = getContacts;
exports.createContact = createContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
const crypto_1 = __importDefault(require("crypto"));
const supabaseClient_1 = require("../db/supabaseClient");
const inMemoryStore_1 = require("../db/inMemoryStore");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
async function getContacts(req, res, next) {
    try {
        const userId = req.user.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { data, error } = await supabase
                    .from('trusted_contacts')
                    .select('*')
                    .eq('user_id', userId)
                    .order('priority', { ascending: true });
                if (!error && data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        // In-memory fallback
        const contacts = Array.from(inMemoryStore_1.inMemoryDB.contacts.values())
            .filter((c) => c.user_id === userId)
            .sort((a, b) => a.priority - b.priority);
        return res.json({ status: 'success', data: contacts });
    }
    catch (err) {
        next(err);
    }
}
async function createContact(req, res, next) {
    try {
        const userId = req.user.id;
        const { name, relationship, phone, email, priority, is_primary } = req.body;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                if (is_primary) {
                    // Unset any previous primary contact
                    await supabase
                        .from('trusted_contacts')
                        .update({ is_primary: false })
                        .eq('user_id', userId);
                }
                const { data, error } = await supabase
                    .from('trusted_contacts')
                    .insert({
                    user_id: userId,
                    name,
                    relationship,
                    phone,
                    email,
                    priority: priority || 1,
                    is_primary: Boolean(is_primary)
                })
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Failed to create contact in Supabase', error);
                }
                else if (data) {
                    return res.status(201).json({ status: 'success', data });
                }
            }
        }
        // In-memory fallback
        if (is_primary) {
            for (const c of inMemoryStore_1.inMemoryDB.contacts.values()) {
                if (c.user_id === userId) {
                    c.is_primary = false;
                }
            }
        }
        const newContact = {
            id: crypto_1.default.randomUUID(),
            user_id: userId,
            name,
            relationship: relationship || 'Emergency Contact',
            phone: phone || '',
            email: email || '',
            priority: priority || 1,
            is_primary: Boolean(is_primary),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        inMemoryStore_1.inMemoryDB.contacts.set(newContact.id, newContact);
        return res.status(201).json({ status: 'success', data: newContact });
    }
    catch (err) {
        next(err);
    }
}
async function updateContact(req, res, next) {
    try {
        const userId = req.user.id;
        const contactId = req.params.id;
        const updates = req.body;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                if (updates.is_primary) {
                    await supabase
                        .from('trusted_contacts')
                        .update({ is_primary: false })
                        .eq('user_id', userId);
                }
                const { data, error } = await supabase
                    .from('trusted_contacts')
                    .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', contactId)
                    .eq('user_id', userId)
                    .select()
                    .single();
                if (error) {
                    logger_1.logger.error('Failed to update contact in Supabase', error);
                }
                else if (data) {
                    return res.json({ status: 'success', data });
                }
            }
        }
        const contact = inMemoryStore_1.inMemoryDB.contacts.get(contactId);
        if (!contact) {
            throw new errors_1.NotFoundError('Contact not found');
        }
        if (contact.user_id !== userId) {
            throw new errors_1.ForbiddenError('Unauthorized to modify this contact');
        }
        if (updates.is_primary) {
            for (const c of inMemoryStore_1.inMemoryDB.contacts.values()) {
                if (c.user_id === userId) {
                    c.is_primary = false;
                }
            }
        }
        const updatedContact = {
            ...contact,
            ...updates,
            updated_at: new Date().toISOString()
        };
        inMemoryStore_1.inMemoryDB.contacts.set(contactId, updatedContact);
        return res.json({ status: 'success', data: updatedContact });
    }
    catch (err) {
        next(err);
    }
}
async function deleteContact(req, res, next) {
    try {
        const userId = req.user.id;
        const contactId = req.params.id;
        if ((0, supabaseClient_1.isSupabaseConfigured)()) {
            const supabase = (0, supabaseClient_1.getSupabaseAdmin)();
            if (supabase) {
                const { error } = await supabase
                    .from('trusted_contacts')
                    .delete()
                    .eq('id', contactId)
                    .eq('user_id', userId);
                if (!error) {
                    return res.json({ status: 'success', message: 'Contact deleted successfully' });
                }
            }
        }
        const contact = inMemoryStore_1.inMemoryDB.contacts.get(contactId);
        if (!contact) {
            throw new errors_1.NotFoundError('Contact not found');
        }
        if (contact.user_id !== userId) {
            throw new errors_1.ForbiddenError('Unauthorized to delete this contact');
        }
        inMemoryStore_1.inMemoryDB.contacts.delete(contactId);
        return res.json({ status: 'success', message: 'Contact deleted successfully' });
    }
    catch (err) {
        next(err);
    }
}
