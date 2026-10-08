"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const storage_1 = require("../../db/storage");
class WalletService {
    /**
     * Reward user for completing circular economy actions
     */
    static async recordCircularAction(userId, actionType, device) {
        const category = (device?.category || 'smartphone').toLowerCase();
        let credits = 50;
        let co2Kg = 1.5;
        let ewasteKg = 0.2;
        let description = 'EcoCycle Environmental Reward';
        if (actionType === 'DEVICE_SCANNED') {
            credits = 50;
            co2Kg = 0.5;
            ewasteKg = 0;
            description = `AI Diagnostic scan completed for ${device?.brand || 'device'} ${device?.model || ''}`;
        }
        else if (actionType === 'SANITIZATION_VERIFIED') {
            credits = 200;
            co2Kg = 8.0;
            ewasteKg = 0;
            description = `NIST SP 800-88 cryptographic sanitization certificate issued for ${device?.brand} ${device?.model}`;
        }
        else if (actionType === 'RESALE_COMPLETED') {
            credits = category === 'laptop' ? 750 : 500;
            co2Kg = category === 'laptop' ? 180.0 : 64.0;
            ewasteKg = category === 'laptop' ? 2.1 : 0.25;
            description = `Device lifecycle extended via Circular Resale (${device?.brand} ${device?.model})`;
        }
        else if (actionType === 'REPAIR_INITIATED') {
            credits = category === 'laptop' ? 600 : 400;
            co2Kg = category === 'laptop' ? 140.0 : 45.0;
            ewasteKg = category === 'laptop' ? 1.9 : 0.22;
            description = `Refurbishment scheduled to restore ${device?.brand} ${device?.model}`;
        }
        else if (actionType === 'RECYCLING_COMPLETED') {
            credits = category === 'laptop' ? 450 : 300;
            co2Kg = category === 'laptop' ? 48.0 : 18.5;
            ewasteKg = category === 'laptop' ? 2.2 : 0.24;
            description = `Hazard-free certified metallurgical recycling completed (${device?.brand} ${device?.model})`;
        }
        return await storage_1.StorageService.addEcoTransaction(userId, {
            device_id: device?.id || null,
            transaction_type: actionType,
            credits,
            co2_saved_kg: co2Kg,
            ewaste_diverted_kg: ewasteKg,
            description
        });
    }
    static async getWalletSummary(userId) {
        const wallet = await storage_1.StorageService.getWallet(userId);
        const transactions = await storage_1.StorageService.getTransactions(userId);
        const devices = await storage_1.StorageService.getDevices(userId);
        const certCount = transactions.filter(t => t.transaction_type === 'SANITIZATION_VERIFIED').length;
        const circularScore = Math.min(100, Math.round(50 + (wallet.balance / 50)));
        return {
            wallet,
            transactions,
            stats: {
                devices_processed: devices.length,
                certificates_generated: certCount,
                circular_score: circularScore
            }
        };
    }
}
exports.WalletService = WalletService;
