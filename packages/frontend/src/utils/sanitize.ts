/**
 * HTML Sanitization & Escaping Utility
 *
 * Mitigates DOM and Stored Cross-Site Scripting (XSS) by encoding
 * HTML metacharacters into their corresponding HTML character entities.
 */

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
