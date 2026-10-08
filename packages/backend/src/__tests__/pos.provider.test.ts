import { describe, it, expect } from 'vitest';
import posRoutes from '../routes/pos.routes';

describe('Deprecated POS Route Layer (HTTP 410 Gone)', () => {
  it('should return HTTP 410 Gone with informative message for legacy POS endpoints', () => {
    let capturedStatus = 0;
    let capturedJson: any = null;

    const mockReq: any = { method: 'GET', url: '/providers' };
    const mockRes: any = {
      status: (code: number) => {
        capturedStatus = code;
        return {
          json: (data: any) => {
            capturedJson = data;
          },
        };
      },
    };

    (posRoutes as any)(mockReq, mockRes, () => {});

    expect(capturedStatus).toBe(410);
    expect(capturedJson.success).toBe(false);
    expect(capturedJson.error).toContain('permanently deprecated');
    expect(capturedJson.error).toContain('HTTP 410 Gone');
  });

  it('should also reject POST requests with HTTP 410 Gone', () => {
    let capturedStatus = 0;
    let capturedJson: any = null;

    const mockReq: any = { method: 'POST', url: '/sync' };
    const mockRes: any = {
      status: (code: number) => {
        capturedStatus = code;
        return {
          json: (data: any) => {
            capturedJson = data;
          },
        };
      },
    };

    (posRoutes as any)(mockReq, mockRes, () => {});

    expect(capturedStatus).toBe(410);
    expect(capturedJson.success).toBe(false);
  });
});
