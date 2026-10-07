import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';

export class AuthController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      let profile = await StorageService.getProfile(userId);
      if (!profile) {
        profile = await StorageService.upsertProfile({
          id: userId,
          full_name: req.user?.email ? req.user.email.split('@')[0] : 'EcoCycle User',
          preferred_currency: 'INR'
        });
      }
      const wallet = await StorageService.getWallet(userId);

      res.json({
        success: true,
        user: {
          id: userId,
          email: req.user?.email || 'user@ecocycle.demo',
          profile,
          wallet
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user-ecocycle-001';
      const { full_name, avatar_url, preferred_currency } = req.body;

      const updated = await StorageService.upsertProfile({
        id: userId,
        full_name,
        avatar_url,
        preferred_currency
      });

      res.json({
        success: true,
        profile: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const demoUserId = 'demo-user-ecocycle-001';
      const profile = await StorageService.getProfile(demoUserId);
      const wallet = await StorageService.getWallet(demoUserId);

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
    } catch (err) {
      next(err);
    }
  }
}
