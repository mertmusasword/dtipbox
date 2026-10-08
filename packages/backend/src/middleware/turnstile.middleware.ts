import { Request, Response, NextFunction } from 'express';
import { verifyTurnstileToken } from '../utils/turnstile';

interface RequireTurnstileOptions {
  /** Authenticated requests (req.user set by an earlier middleware) skip the CAPTCHA entirely. */
  skipIfAuthenticated?: boolean;
}

/**
 * Express middleware enforcing Cloudflare Turnstile on public form endpoints.
 *
 * Behavior (identical to the previous inline implementations):
 *  - Production: a missing `turnstileToken` is rejected with 400.
 *  - Any provided token is verified with Cloudflare; failure is rejected with 403.
 *  - Honeypot-filled submissions are passed through untouched so the route handler can
 *    return its silent fake-success response (bots get no signal, nothing is persisted).
 *
 * Must run after the body is parsed (and after auth middleware when `skipIfAuthenticated` is used).
 */
export const requireTurnstile =
  (options: RequireTurnstileOptions = {}) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.skipIfAuthenticated && (req as any).user) {
        return next();
      }

      if (req.body?.website_url_hp || req.body?._hp) {
        return next();
      }

      const token: string | undefined = req.body?.turnstileToken;

      if (process.env.NODE_ENV === 'production' && !token) {
        return res.status(400).json({
          success: false,
          error: 'Güvenlik doğrulaması zorunludur. Lütfen sayfayı yenileyip tekrar deneyiniz.',
        });
      }

      if (token) {
        const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
        const result = await verifyTurnstileToken(token, ipAddress);
        if (!result.success) {
          return res.status(403).json({
            success: false,
            error: 'Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyiniz.',
          });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
