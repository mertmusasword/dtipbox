/**
 * CSV Export & Sanitization Utility
 *
 * Implements RFC 4180 compliance, UTF-8 BOM encoding for seamless Excel rendering
 * across international and Turkish characters, and formula injection mitigation (CWE-1236).
 */

/**
 * Sanitize a CSV cell value to neutralize spreadsheet formula injection (CWE-1236)
 * and properly escape quotes according to RFC 4180.
 *
 * If a cell begins with formula characters (=, +, -, @, \t, \r),
 * prepends a single quote (') so spreadsheet applications (Excel, Calc)
 * treat it as literal string content rather than an executable command or DDE formula.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // Neutralize formula injection triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports data to a CSV file and triggers browser download using Blob and ObjectURL.
 * Includes UTF-8 Byte Order Mark (\uFEFF) to ensure Microsoft Excel correctly detects
 * UTF-8 encoding on Windows and displays non-ASCII characters (e.g. ç, ğ, ı, ö, ş, ü).
 *
 * @param filename Name of the download file (e.g. 'export.csv')
 * @param headers Array of column header titles
 * @param rows Array of data rows containing cell values
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const headerLine = headers.map(sanitizeCsvCell).join(',');
  const rowLines = rows.map((r) => r.map(sanitizeCsvCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
