import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.isProd
    ? 'Internal server error'
    : err.message || 'Internal server error';

  // Log error using structured logger
  logger.error(err.message || 'Unhandled Express Error', 'EXPRESS_ERROR', {
    method: req.method,
    path: req.path,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.isDev && { stack: err.stack }),
  });
}

/**
 * Create an HTTP error with a status code.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
