"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const geminiService_1 = require("../services/ai/geminiService");
class AiController {
    static async identifyDevice(req, res, next) {
        try {
            const { image, filename, hint } = req.body;
            const result = await geminiService_1.GeminiService.identifyDevice({
                imageBase64: image,
                filename,
                hintText: hint
            });
            res.json({
                success: true,
                identification: result
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AiController = AiController;
