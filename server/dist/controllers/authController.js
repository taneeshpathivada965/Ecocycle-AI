"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const storage_1 = require("../db/storage");
class AuthController {
    static async getMe(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            let profile = await storage_1.StorageService.getProfile(userId);
            if (!profile) {
                profile = await storage_1.StorageService.upsertProfile({
                    id: userId,
                    full_name: req.user?.email ? req.user.email.split('@')[0] : 'EcoCycle User',
                    preferred_currency: 'INR'
                });
            }
            const wallet = await storage_1.StorageService.getWallet(userId);
            res.json({
                success: true,
                user: {
                    id: userId,
                    email: req.user?.email || 'user@ecocycle.demo',
                    profile,
                    wallet
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const { full_name, avatar_url, preferred_currency } = req.body;
            const updated = await storage_1.StorageService.upsertProfile({
                id: userId,
                full_name,
                avatar_url,
                preferred_currency
            });
            res.json({
                success: true,
                profile: updated
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async demoLogin(req, res, next) {
        try {
            const demoUserId = 'demo-user-ecocycle-001';
            const profile = await storage_1.StorageService.getProfile(demoUserId);
            const wallet = await storage_1.StorageService.getWallet(demoUserId);
            res.json({
                success: true,
                token: 'demo-user-ecocycle-001',
                user: {
                    id: demoUserId,
                    email: 'alex.rivera@ecocycle.demo',
                    profile,
                    wallet
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
