"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerController = void 0;
const storage_1 = require("../db/storage");
const partnerService_1 = require("../services/marketplace/partnerService");
const errors_1 = require("../utils/errors");
class PartnerController {
    static async getPartners(req, res, next) {
        try {
            const type = req.query.type;
            const category = req.query.category;
            const partners = await storage_1.StorageService.getPartners({ type, category });
            res.json({
                success: true,
                partners
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getNearbyPartners(req, res, next) {
        try {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            const type = req.query.type;
            const partners = await storage_1.StorageService.getPartners({ type });
            const sorted = partners.map(p => {
                const distance = (!isNaN(lat) && !isNaN(lng))
                    ? partnerService_1.PartnerService.calculateDistanceKm(lat, lng, p.latitude, p.longitude)
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
        }
        catch (err) {
            next(err);
        }
    }
    static async getResaleOptions(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            const valuations = await storage_1.StorageService.getValuations(deviceId);
            const resaleVal = valuations.find(v => v.valuation_type === 'RESALE')?.amount || 0;
            const matches = await partnerService_1.PartnerService.matchPartners(device, 'RESALE', undefined, resaleVal);
            res.json({
                success: true,
                options: matches
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getRecyclingOptions(req, res, next) {
        try {
            const deviceId = req.params.id;
            const device = await storage_1.StorageService.getDeviceById(deviceId);
            if (!device) {
                throw new errors_1.NotFoundError(`Device '${deviceId}' not found`);
            }
            const valuations = await storage_1.StorageService.getValuations(deviceId);
            const scrapVal = valuations.find(v => v.valuation_type === 'SCRAP')?.amount || 0;
            const matches = await partnerService_1.PartnerService.matchPartners(device, 'RECYCLE', undefined, scrapVal);
            res.json({
                success: true,
                options: matches
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PartnerController = PartnerController;
