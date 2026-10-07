import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      path: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode
    });

    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  }

  // Unhandled error
  logger.error(`Unexpected Server Error: ${err.message}`, err, {
    path: req.originalUrl,
    method: req.method
  });

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: isProduction
      ? 'An unexpected error occurred. Please try again later.'
      : err.message
  });
}
