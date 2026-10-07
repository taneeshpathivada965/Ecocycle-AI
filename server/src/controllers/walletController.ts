import { Request, Response, NextFunction } from 'express';
import { WalletService } from '../services/wallet/walletService';
import { StorageService } from '../db/storage';

export class WalletController {
  static async getWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const summary = await WalletService.getWalletSummary(userId);

      res.json({
        success: true,
        ...summary
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const transactions = await StorageService.getTransactions(userId);

      res.json({
        success: true,
        transactions
      });
    } catch (err) {
      next(err);
    }
  }

  static async recordAction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const { action_type, device_id } = req.body;

      const device = device_id ? await StorageService.getDeviceById(device_id) : null;
      const transaction = await WalletService.recordCircularAction(userId, action_type, device);

      const wallet = await StorageService.getWallet(userId);

      res.status(201).json({
        success: true,
        transaction,
        wallet
      });
    } catch (err) {
      next(err);
    }
  }
}
