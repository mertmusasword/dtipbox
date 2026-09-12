import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: any;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    if (env.isProd && level === 'debug') {
      return false; // Suppress debug in production
    }
    return true;
  }

  private write(level: LogLevel, message: string, context?: string, meta?: LogMeta) {
    if (!this.shouldLog(level)) return;

    const timestamp = this.formatTimestamp();

    if (env.isProd) {
      // In production, emit single-line structured JSON
      const jsonPayload = {
        timestamp,
        level,
        context: context || 'app',
        message,
        ...(meta ? { meta } : {}),
      };
      const serialized = JSON.stringify(jsonPayload);
      if (level === 'error') {
        console.error(serialized);
      } else if (level === 'warn') {
        console.warn(serialized);
      } else {
        console.log(serialized);
      }
    } else {
      // In development, emit human-readable colored logs
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        reset: '\x1b[0m',
        dim: '\x1b[2m',
        bold: '\x1b[1m',
      };

      const color = colors[level] || colors.reset;
      const ctxBadge = context ? ` \x1b[35m[${context}]\x1b[0m` : '';
      const metaStr = meta && Object.keys(meta).length > 0 ? ` ${colors.dim}${JSON.stringify(meta)}${colors.reset}` : '';

      const formatted = `${colors.dim}${timestamp.split('T')[1].slice(0, 8)}${colors.reset} ${color}${colors.bold}[${level.toUpperCase().padEnd(5)}]${colors.reset}${ctxBadge} ${message}${metaStr}`;

      if (level === 'error') {
        console.error(formatted);
      } else if (level === 'warn') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  debug(message: string, context?: string, meta?: LogMeta) {
    this.write('debug', message, context, meta);
  }

  info(message: string, context?: string, meta?: LogMeta) {
    this.write('info', message, context, meta);
  }

  warn(message: string, context?: string, meta?: LogMeta) {
    this.write('warn', message, context, meta);
  }

  error(message: string, context?: string, meta?: LogMeta) {
    this.write('error', message, context, meta);
  }
}

export const logger = new Logger();

/**
 * Express HTTP Request Logging Middleware
 * Logs incoming requests with method, path, response status, and duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.originalUrl || req.url;

  // Skip noisy static asset / favicon polling in logs
  if (path.startsWith('/assets') || path === '/favicon.ico') {
    return next();
  }

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    const meta = {
      method: req.method,
      path,
      statusCode,
      durationMs: `${durationMs}ms`,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown',
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${path} -> ${statusCode} (${durationMs}ms)`, 'HTTP', meta);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${path} -> ${statusCode} (${durationMs}ms)`, 'HTTP', meta);
    } else {
      logger.info(`HTTP ${req.method} ${path} -> ${statusCode} (${durationMs}ms)`, 'HTTP', meta);
    }
  });

  next();
}
