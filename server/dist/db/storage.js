"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.memoryStorage = void 0;
const supabaseClient_1 = require("./supabaseClient");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
// In-Memory store container
class MemoryStorage {
    profiles = new Map();
    devices = new Map();
    diagnostics = new Map();
    valuations = new Map();
    decisions = new Map();
    partners = new Map();
    matches = new Map();
    sanitizationRecords = new Map();
    certificates = new Map();
    wallets = new Map();
    transactions = new Map();
    constructor() {
        this.seedPartners();
        this.seedDemoUser();
    }
    seedDemoUser() {
        const demoUserId = 'demo-user-ecocycle-001';
        this.profiles.set(demoUserId, {
            id: demoUserId,
            full_name: 'Alex Rivera (Eco Pioneer)',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            preferred_currency: 'INR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        const walletId = 'demo-wallet-001';
        this.wallets.set(demoUserId, {
            id: walletId,
            user_id: demoUserId,
            balance: 1450,
            total_co2_saved_kg: 52.4,
            total_ewaste_diverted_kg: 9.8,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        this.transactions.set('tx-demo-1', {
            id: 'tx-demo-1',
            wallet_id: walletId,
            transaction_type: 'DEVICE_SCANNED',
            credits: 50,
            co2_saved_kg: 0,
            ewaste_diverted_kg: 0,
            description: 'Welcome Bonus: First device scanned on EcoCycle AI',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        });
        this.transactions.set('tx-demo-2', {
            id: 'tx-demo-2',
            wallet_id: walletId,
            transaction_type: 'SANITIZATION_VERIFIED',
            credits: 300,
            co2_saved_kg: 14.2,
            ewaste_diverted_kg: 1.8,
            description: 'NIST SP 800-88 Sanitization completed for ThinkPad T480',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        });
        this.transactions.set('tx-demo-3', {
            id: 'tx-demo-3',
            wallet_id: walletId,
            transaction_type: 'RESALE_COMPLETED',
            credits: 1100,
            co2_saved_kg: 38.2,
            ewaste_diverted_kg: 8.0,
            description: 'Device routed to Certified Circular Marketplace',
            created_at: new Date(Date.now() - 86400000).toISOString()
        });
    }
    seedPartners() {
        const seedData = [
            {
                name: 'GreenTech Certified E-Waste Recycler',
                partner_type: 'RECYCLER',
                description: 'R2v3 & e-Stewards certified facility with 98.4% precious metal hydrometallurgical recovery.',
                latitude: 12.9716,
                longitude: 77.5946,
                address: 'Plot 42, Electronic City Phase 1',
                city: 'Bengaluru',
                country: 'India',
                phone: '+91 80 4123 9081',
                email: 'intake@greentech-ewaste.org',
                website: 'https://greentech-ewaste.org',
                certified: true,
                certification_standard: 'R2v3 / ISO 14001',
                supported_categories: ['smartphone', 'laptop', 'tablet', 'desktop', 'monitor'],
                active: true,
                rating: 4.9
            },
            {
                name: 'Cashify Direct Trade-In Hub',
                partner_type: 'MARKETPLACE',
                description: 'Instant verified trade-in payouts with free doorstep physical evaluation and pickup.',
                latitude: 12.9352,
                longitude: 77.6245,
                address: '100 Feet Road, Koramangala',
                city: 'Bengaluru',
                country: 'India',
                phone: '+91 80 6789 1234',
                email: 'partners@cashify-trade.demo',
                website: 'https://cashify.demo',
                certified: true,
                certification_standard: 'ISO 9001 Refurbished',
                supported_categories: ['smartphone', 'laptop', 'tablet', 'smartwatch'],
                active: true,
                rating: 4.8
            },
            {
                name: 'CircularTech Component Refurbishers',
                partner_type: 'REFURBISHER',
                description: 'Specialists in micro-soldering, display glass delamination, and battery health restoration.',
                latitude: 12.9784,
                longitude: 77.6408,
                address: 'Indiranagar 12th Main',
                city: 'Bengaluru',
                country: 'India',
                phone: '+91 80 2520 4455',
                email: 'lab@circulartech.demo',
                website: 'https://circulartech.demo',
                certified: true,
                certification_standard: 'IPC-A-610 Certified',
                supported_categories: ['laptop', 'smartphone', 'gaming_console', 'desktop'],
                active: true,
                rating: 4.7
            },
            {
                name: 'E-Cycle Community Drop-Off Station',
                partner_type: 'DROP_OFF',
                description: 'Zero-landfill municipal e-waste collection bin with sealed lithium-ion containment safely monitored.',
                latitude: 12.9279,
                longitude: 77.6271,
                address: 'BTM Layout 2nd Stage, Near Water Tank',
                city: 'Bengaluru',
                country: 'India',
                phone: '+91 80 2668 1122',
                email: 'dropoff@ecycle-karnataka.gov.in',
                website: 'https://ecycle.gov.demo',
                certified: true,
                certification_standard: 'CPCB Authorized',
                supported_categories: ['smartphone', 'smartwatch', 'other', 'tablet'],
                active: true,
                rating: 4.6
            },
            {
                name: 'EcoRecycle Gold & Metal Refinery',
                partner_type: 'RECYCLER',
                description: 'State-of-the-art closed loop refinery extracting gold, copper, silver, and palladium from dead circuit boards.',
                latitude: 19.0760,
                longitude: 72.8777,
                address: 'MIDC Industrial Area, Andheri East',
                city: 'Mumbai',
                country: 'India',
                phone: '+91 22 2830 5500',
                email: 'intake@ecorecycle-mumbai.demo',
                website: 'https://ecorecycle-mumbai.demo',
                certified: true,
                certification_standard: 'e-Stewards / R2v3',
                supported_categories: ['smartphone', 'laptop', 'desktop', 'monitor', 'gaming_console'],
                active: true,
                rating: 4.9
            },
            {
                name: 'RenewGadget Delhi Circular Hub',
                partner_type: 'REFURBISHER',
                description: 'Enterprise IT refurbishing center, memory upgrades, and warranty-backed consumer resale.',
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'Nehru Place IT Market',
                city: 'New Delhi',
                country: 'India',
                phone: '+91 11 4160 8890',
                email: 'support@renewgadget.demo',
                website: 'https://renewgadget.demo',
                certified: true,
                certification_standard: 'ISO 14001 / BIS Certified',
                supported_categories: ['laptop', 'desktop', 'smartphone', 'monitor'],
                active: true,
                rating: 4.8
            }
        ];
        seedData.forEach((p, idx) => {
            const id = `partner-00${idx + 1}`;
            this.partners.set(id, {
                ...p,
                id,
                created_at: new Date().toISOString()
            });
        });
    }
}
exports.memoryStorage = new MemoryStorage();
// Storage Service Wrapper
class StorageService {
    // Profiles
    static async getProfile(userId) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('profiles').select('*').eq('id', userId).single();
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase profile fetch fallback to memory');
            }
        }
        return exports.memoryStorage.profiles.get(userId) || null;
    }
    static async upsertProfile(profile) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        const now = new Date().toISOString();
        const updated = {
            id: profile.id,
            full_name: profile.full_name || 'EcoCycle User',
            avatar_url: profile.avatar_url || null,
            preferred_currency: profile.preferred_currency || 'INR',
            created_at: profile.created_at || now,
            updated_at: now
        };
        if (admin) {
            try {
                const { data, error } = await admin.from('profiles').upsert(updated).select().single();
                if (data && !error) {
                    exports.memoryStorage.profiles.set(profile.id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase upsertProfile fallback to memory');
            }
        }
        exports.memoryStorage.profiles.set(profile.id, updated);
        return updated;
    }
    // Devices
    static async getDevices(userId) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('devices').select('*').eq('user_id', userId).order('created_at', { ascending: false });
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getDevices fallback to memory');
            }
        }
        return Array.from(exports.memoryStorage.devices.values())
            .filter(d => d.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    static async getDeviceById(id) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('devices').select('*').eq('id', id).single();
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getDeviceById fallback to memory');
            }
        }
        return exports.memoryStorage.devices.get(id) || null;
    }
    static async createDevice(deviceData) {
        const id = deviceData.id || crypto_1.default.randomUUID();
        const now = new Date().toISOString();
        const device = {
            ...deviceData,
            id,
            created_at: now,
            updated_at: now
        };
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('devices').insert(device).select().single();
                if (data && !error) {
                    exports.memoryStorage.devices.set(id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase createDevice fallback to memory');
            }
        }
        exports.memoryStorage.devices.set(id, device);
        return device;
    }
    static async updateDevice(id, updates) {
        const existing = await this.getDeviceById(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updated_at: new Date().toISOString()
        };
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('devices').update(updated).eq('id', id).select().single();
                if (data && !error) {
                    exports.memoryStorage.devices.set(id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase updateDevice fallback to memory');
            }
        }
        exports.memoryStorage.devices.set(id, updated);
        return updated;
    }
    static async deleteDevice(id) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                await admin.from('devices').delete().eq('id', id);
            }
            catch (e) {
                logger_1.logger.warn('Supabase deleteDevice error');
            }
        }
        return exports.memoryStorage.devices.delete(id);
    }
    // Diagnostics
    static async saveDiagnostics(diag) {
        const id = diag.id || crypto_1.default.randomUUID();
        const record = {
            ...diag,
            id,
            created_at: new Date().toISOString()
        };
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('diagnostics').insert(record).select().single();
                if (data && !error) {
                    exports.memoryStorage.diagnostics.set(id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase saveDiagnostics fallback');
            }
        }
        exports.memoryStorage.diagnostics.set(id, record);
        return record;
    }
    static async getDiagnostics(deviceId) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('diagnostics').select('*').eq('device_id', deviceId).order('created_at', { ascending: false }).limit(1).single();
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getDiagnostics fallback');
            }
        }
        const list = Array.from(exports.memoryStorage.diagnostics.values())
            .filter(d => d.device_id === deviceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list[0] || null;
    }
    // Valuations
    static async saveValuation(val) {
        const id = val.id || crypto_1.default.randomUUID();
        const record = {
            ...val,
            id,
            created_at: new Date().toISOString()
        };
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('valuations').insert(record).select().single();
                if (data && !error) {
                    exports.memoryStorage.valuations.set(id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase saveValuation fallback');
            }
        }
        exports.memoryStorage.valuations.set(id, record);
        return record;
    }
    static async getValuations(deviceId) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('valuations').select('*').eq('device_id', deviceId).order('created_at', { ascending: false });
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getValuations fallback');
            }
        }
        return Array.from(exports.memoryStorage.valuations.values()).filter(v => v.device_id === deviceId);
    }
    // Decisions
    static async saveDecision(dec) {
        const id = dec.id || crypto_1.default.randomUUID();
        const record = {
            ...dec,
            id,
            created_at: new Date().toISOString()
        };
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('decisions').insert(record).select().single();
                if (data && !error) {
                    exports.memoryStorage.decisions.set(id, data);
                    return data;
                }
            }
            catch (e) {
                logger_1.logger.warn('Supabase saveDecision fallback');
            }
        }
        exports.memoryStorage.decisions.set(id, record);
        return record;
    }
    static async getDecision(deviceId) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                const { data, error } = await admin.from('decisions').select('*').eq('device_id', deviceId).order('created_at', { ascending: false }).limit(1).single();
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getDecision fallback');
            }
        }
        const list = Array.from(exports.memoryStorage.decisions.values())
            .filter(d => d.device_id === deviceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list[0] || null;
    }
    // Partners
    static async getPartners(filters) {
        const admin = (0, supabaseClient_1.getSupabaseAdmin)();
        if (admin) {
            try {
                let q = admin.from('partners').select('*').eq('active', true);
                if (filters?.type)
                    q = q.eq('partner_type', filters.type);
                const { data, error } = await q;
                if (data && !error)
                    return data;
            }
            catch (e) {
                logger_1.logger.warn('Supabase getPartners fallback');
            }
        }
        let results = Array.from(exports.memoryStorage.partners.values()).filter(p => p.active);
        if (filters?.type) {
            results = results.filter(p => p.partner_type === filters.type);
        }
        if (filters?.category) {
            results = results.filter(p => p.supported_categories.includes(filters.category));
        }
        return results;
    }
    static async getPartnerById(id) {
        return exports.memoryStorage.partners.get(id) || null;
    }
    // Matches
    static async saveMatches(deviceId, matches) {
        const saved = [];
        for (const m of matches) {
            const id = crypto_1.default.randomUUID();
            const rec = {
                ...m,
                id,
                created_at: new Date().toISOString()
            };
            exports.memoryStorage.matches.set(id, rec);
            saved.push(rec);
        }
        return saved;
    }
    static async getMatches(deviceId) {
        return Array.from(exports.memoryStorage.matches.values())
            .filter(m => m.device_id === deviceId)
            .map(m => ({
            ...m,
            partner: exports.memoryStorage.partners.get(m.partner_id)
        }));
    }
    // Sanitization
    static async saveSanitization(record) {
        const id = record.id || crypto_1.default.randomUUID();
        const saved = {
            ...record,
            id,
            created_at: new Date().toISOString()
        };
        exports.memoryStorage.sanitizationRecords.set(id, saved);
        return saved;
    }
    static async getSanitization(deviceId) {
        const list = Array.from(exports.memoryStorage.sanitizationRecords.values())
            .filter(s => s.device_id === deviceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list[0] || null;
    }
    // Certificates
    static async saveCertificate(cert) {
        const id = cert.id || crypto_1.default.randomUUID();
        const saved = {
            ...cert,
            id,
            issued_at: new Date().toISOString()
        };
        exports.memoryStorage.certificates.set(id, saved);
        exports.memoryStorage.certificates.set(cert.certificate_number, saved);
        return saved;
    }
    static async getCertificate(idOrNumber) {
        const byId = exports.memoryStorage.certificates.get(idOrNumber);
        if (byId)
            return byId;
        const found = Array.from(exports.memoryStorage.certificates.values()).find(c => c.id === idOrNumber || c.certificate_number === idOrNumber || c.device_id === idOrNumber);
        return found || null;
    }
    // Eco Wallet
    static async getWallet(userId) {
        let wallet = exports.memoryStorage.wallets.get(userId);
        if (!wallet) {
            wallet = {
                id: crypto_1.default.randomUUID(),
                user_id: userId,
                balance: 100,
                total_co2_saved_kg: 0,
                total_ewaste_diverted_kg: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            exports.memoryStorage.wallets.set(userId, wallet);
        }
        return wallet;
    }
    static async addEcoTransaction(userId, tx) {
        const wallet = await this.getWallet(userId);
        wallet.balance += tx.credits;
        wallet.total_co2_saved_kg = Number((wallet.total_co2_saved_kg + tx.co2_saved_kg).toFixed(2));
        wallet.total_ewaste_diverted_kg = Number((wallet.total_ewaste_diverted_kg + tx.ewaste_diverted_kg).toFixed(2));
        wallet.updated_at = new Date().toISOString();
        exports.memoryStorage.wallets.set(userId, wallet);
        const txId = crypto_1.default.randomUUID();
        const record = {
            id: txId,
            wallet_id: wallet.id,
            device_id: tx.device_id || null,
            transaction_type: tx.transaction_type,
            credits: tx.credits,
            co2_saved_kg: tx.co2_saved_kg,
            ewaste_diverted_kg: tx.ewaste_diverted_kg,
            description: tx.description || 'EcoCycle Action Reward',
            created_at: new Date().toISOString()
        };
        exports.memoryStorage.transactions.set(txId, record);
        return record;
    }
    static async getTransactions(userId) {
        const wallet = await this.getWallet(userId);
        return Array.from(exports.memoryStorage.transactions.values())
            .filter(t => t.wallet_id === wallet.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
}
exports.StorageService = StorageService;
