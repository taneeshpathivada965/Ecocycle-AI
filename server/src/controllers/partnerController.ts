import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../db/storage';
import { PartnerService } from '../services/marketplace/partnerService';
import { NotFoundError } from '../utils/errors';

export class PartnerController {
  static async getPartners(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;
      const partners = await StorageService.getPartners({ type, category });

      res.json({
        success: true,
        partners
      });
    } catch (err) {
      next(err);
    }
  }

  static async getNearbyPartners(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const type = req.query.type as string | undefined;

      const partners = await StorageService.getPartners({ type });

      const sorted = partners.map(p => {
        const distance = (!isNaN(lat) && !isNaN(lng))
          ? PartnerService.calculateDistanceKm(lat, lng, p.latitude, p.longitude)
          : Number((Math.random() * 5 + 1).toFixed(1));
        return {
          ...p,
          distance_km: distance
        };
      }).sort((a, b) => a.distance_km - b.distance_km);

      res.json({
        success: true,
        partners: sorted
      });
    } catch (err) {
      next(err);
    }
  }

  static async getResaleOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      const valuations = await StorageService.getValuations(deviceId);
      const resaleVal = valuations.find(v => v.valuation_type === 'RESALE')?.amount || 0;

      const matches = await PartnerService.matchPartners(device, 'RESALE', undefined, resaleVal);

      res.json({
        success: true,
        options: matches
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecyclingOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id;
      const device = await StorageService.getDeviceById(deviceId);
      if (!device) {
        throw new NotFoundError(`Device '${deviceId}' not found`);
      }

      const valuations = await StorageService.getValuations(deviceId);
      const scrapVal = valuations.find(v => v.valuation_type === 'SCRAP')?.amount || 0;

      const matches = await PartnerService.matchPartners(device, 'RECYCLE', undefined, scrapVal);

      res.json({
        success: true,
        options: matches
      });
    } catch (err) {
      next(err);
    }
  }
}
