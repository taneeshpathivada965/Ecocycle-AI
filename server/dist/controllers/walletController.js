"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const walletService_1 = require("../services/wallet/walletService");
const storage_1 = require("../db/storage");
class WalletController {
    static async getWallet(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const summary = await walletService_1.WalletService.getWalletSummary(userId);
            res.json({
                success: true,
                ...summary
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getTransactions(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const transactions = await storage_1.StorageService.getTransactions(userId);
            res.json({
                success: true,
                transactions
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordAction(req, res, next) {
        try {
            const userId = req.user?.id || 'demo-user-ecocycle-001';
            const { action_type, device_id } = req.body;
            const device = device_id ? await storage_1.StorageService.getDeviceById(device_id) : null;
            const transaction = await walletService_1.WalletService.recordCircularAction(userId, action_type, device);
            const wallet = await storage_1.StorageService.getWallet(userId);
            res.status(201).json({
                success: true,
                transaction,
                wallet
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.WalletController = WalletController;
