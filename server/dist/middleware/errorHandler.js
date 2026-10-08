"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    if (err instanceof errors_1.AppError) {
        logger_1.logger.warn(`Operational Error: ${err.message}`, {
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
    logger_1.logger.error(`Unexpected Server Error: ${err.message}`, err, {
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
