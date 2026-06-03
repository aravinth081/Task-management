"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let status = 'error';
    let message = 'Something went wrong';
    let errors = undefined;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    }
    else {
        // Log unexpected errors
        logger_1.logger.error('Unexpected error occurred', err);
    }
    // Handle specific Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        status = 'fail';
        message = 'Database request failed. Please check your inputs.';
    }
    res.status(statusCode).json({
        status,
        message,
        ...(errors !== undefined ? { errors } : {}),
        ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    });
};
exports.errorHandler = errorHandler;
