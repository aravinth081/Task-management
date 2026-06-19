import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let status = 'error';
  let message = 'Something went wrong';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  } else {
    // Log unexpected errors
    logger.error('Unexpected error occurred', err);
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
