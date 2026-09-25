import { describe, it, expect } from 'vitest';
import { storageService } from '../services/storage.service';
import fs from 'fs';
import path from 'path';

describe('Storage & Media Service (Cloudflare R2 / Local Storage)', () => {
  // A tiny 1x1 pixel valid WebP base64 image
  const sample1x1Webp = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaQAA3AA/v39gAAAAA==';

  it('should initialize storage service with valid status indicator', () => {
    const isConfigured = storageService.isConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });

  it('should upload a Base64 WebP image and return a valid access URL', async () => {
    const result = await storageService.uploadBase64(sample1x1Webp, 'menu');

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.mimeType).toBe('image/webp');
    expect(result.key).toContain('menu/');

    if (result.storage === 'local') {
      // If local storage was used, verify file exists in filesystem
      const uploadsDir = path.resolve(__dirname, '../../uploads');
      const expectedPath = path.join(uploadsDir, result.key);
      expect(fs.existsSync(expectedPath)).toBe(true);
      expect(result.url).toContain('/uploads/menu/');
    } else {
      expect(result.url.startsWith('https://') || result.url.startsWith('http://')).toBe(true);
    }
  });

  it('should upload a binary Buffer and return a valid storage result', async () => {
    const buffer = Buffer.from('fake-svg-content-<svg></svg>', 'utf-8');
    const result = await storageService.uploadBuffer(buffer, 'image/svg+xml', 'logos', 'test-logo');

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.mimeType).toBe('image/svg+xml');
    expect(result.key).toContain('logos/test-logo');
  });

  it('should reject invalid base64 payloads with clear error', async () => {
    await expect(storageService.uploadBase64('invalid-string-not-data-uri', 'general')).rejects.toThrow(
      'Invalid Base64 Data URI format.'
    );
  });

  it('should reject unsupported mime types', async () => {
    const buffer = Buffer.from('console.log("bad")', 'utf-8');
    await expect(storageService.uploadBuffer(buffer, 'application/javascript', 'general')).rejects.toThrow(
      'Unsupported image format'
    );
  });

  it('should return existing URLs directly without re-uploading', async () => {
    const existingCdnUrl = 'https://media.naponi.com/menu/item-123.webp';
    const result = await storageService.uploadBase64(existingCdnUrl, 'menu');
    expect(result.url).toBe(existingCdnUrl);
  });

  it('should strictly reject malicious SVGs containing executable script tags (XSS)', async () => {
    const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert("pwned")</script></svg>', 'utf-8');
    await expect(storageService.uploadBuffer(maliciousSvg, 'image/svg+xml', 'logos', 'xss-script')).rejects.toThrow(
      'SVG contains executable script tags'
    );
  });

  it('should strictly reject malicious SVGs containing onload or onerror event handlers', async () => {
    const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(\'/api/steal\')"></svg>', 'utf-8');
    await expect(storageService.uploadBuffer(maliciousSvg, 'image/svg+xml', 'logos', 'xss-handler')).rejects.toThrow(
      'SVG contains executable event handlers'
    );
  });

  it('should strictly reject malicious SVGs containing foreignObject or javascript URIs', async () => {
    const foreignObjectSvg = Buffer.from('<svg><foreignObject><iframe src="https://evil.com"></iframe></foreignObject></svg>', 'utf-8');
    await expect(storageService.uploadBuffer(foreignObjectSvg, 'image/svg+xml', 'logos', 'xss-foreign')).rejects.toThrow(
      'SVG contains prohibited HTML or external object elements'
    );

    const javascriptUriSvg = Buffer.from('<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>', 'utf-8');
    await expect(storageService.uploadBuffer(javascriptUriSvg, 'image/svg+xml', 'logos', 'xss-js-uri')).rejects.toThrow(
      'SVG contains unsafe javascript URI references'
    );
  });

  it('should strictly reject SVGs containing DOCTYPE entity injections (XXE)', async () => {
    const xxeSvg = Buffer.from('<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>', 'utf-8');
    await expect(storageService.uploadBuffer(xxeSvg, 'image/svg+xml', 'logos', 'xxe-test')).rejects.toThrow(
      'SVG contains prohibited DOCTYPE or ENTITY definitions'
    );
  });
});
