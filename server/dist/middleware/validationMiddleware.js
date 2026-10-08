"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors
                    .map((e) => `${e.path.join('.') || 'body'}: ${e.message}`)
                    .join(', ');
                next(new errors_1.BadRequestError(`Validation error: ${message}`));
            }
            else {
                next(error);
            }
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors
                    .map((e) => `${e.path.join('.') || 'query'}: ${e.message}`)
                    .join(', ');
                next(new errors_1.BadRequestError(`Query validation error: ${message}`));
            }
            else {
                next(error);
            }
        }
    };
}
