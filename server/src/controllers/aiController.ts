import { Request, Response, NextFunction } from 'express';
import { GeminiService } from '../services/ai/geminiService';

export class AiController {
  static async identifyDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const { image, filename, hint } = req.body;

      const result = await GeminiService.identifyDevice({
        imageBase64: image,
        filename,
        hintText: hint
      });

      res.json({
        success: true,
        identification: result
      });
    } catch (err) {
      next(err);
    }
  }
}
