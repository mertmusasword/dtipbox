import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import { 
  Download, 
  Printer, 
  ExternalLink, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Trash2, 
  Upload,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../i18n';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicToken: string;
  businessName: string;
  tableName?: string | null;
  businessLogo?: string | null;
}

interface ThemePreset {
  id: string;
  nameTr: string;
  nameEn: string;
  fg: string;
  bg: string;
  dot: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { id: 'slate', nameTr: 'Klasik Slate', nameEn: 'Classic Slate', fg: '#0f172a', bg: '#ffffff', dot: '#0f172a' },
  { id: 'emerald', nameTr: 'Zümrüt Luxe', nameEn: 'Emerald Luxe', fg: '#064e3b', bg: '#f0fdf4', dot: '#10b981' },
  { id: 'amber', nameTr: 'Kehribar Gold', nameEn: 'Amber Gold', fg: '#78350f', bg: '#fffbeb', dot: '#f59e0b' },
  { id: 'blue', nameTr: 'Gece Mavisi', nameEn: 'Midnight Blue', fg: '#0c4a6e', bg: '#f0f9ff', dot: '#0284c7' },
  { id: 'crimson', nameTr: 'Kadife Bordo', nameEn: 'Velvet Crimson', fg: '#881337', bg: '#fff1f2', dot: '#f43f5e' },
  { id: 'dark', nameTr: 'Derin Kontrast', nameEn: 'Dark Contrast', fg: '#ffffff', bg: '#090d16', dot: '#334155' },
];

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  publicToken,
  businessName,
  tableName,
  businessLogo,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const [tableLabel, setTableLabel] = useState<string>('');
  const [frameText, setFrameText] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [activeTheme, setActiveTheme] = useState<string>('slate');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tipUrl = `${window.location.origin}/tip/${publicToken}`;

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTableLabel(tableName || businessName || '');
      setFrameText(isTr ? 'BAHŞİŞ & DEĞERLENDİRME İÇİN OKUTUN' : 'SCAN TO TIP & REVIEW');
      setFgColor('#0f172a');
      setBgColor('#ffffff');
      setActiveTheme('slate');
      setLogoDataUrl(businessLogo || '');
      setCopied(false);
    }
  }, [isOpen, tableName, businessName, businessLogo, isTr]);

  // High-Resolution 300 DPI Canvas Rendering
  useEffect(() => {
    if (!isOpen || !publicToken) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000;
    const height = 1260;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle Outer Card Border
    ctx.strokeStyle = fgColor + '18';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Top Business Name
    ctx.fillStyle = fgColor;
    ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(businessName.toUpperCase(), width / 2, 95);

    // Top Table / Area Badge
    if (tableLabel && tableLabel.trim().toUpperCase() !== businessName.trim().toUpperCase()) {
      ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const badgeText = tableLabel.toUpperCase();
      const textMetrics = ctx.measureText(badgeText);
      const badgeW = textMetrics.width + 50;
      const badgeH = 52;
      const badgeX = (width - badgeW) / 2;
      const badgeY = 125;

      // Rounded Badge
      ctx.fillStyle = fgColor + '15';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 26);
      ctx.fill();

      ctx.fillStyle = fgColor;
      ctx.fillText(badgeText, width / 2, badgeY + 37);
    }

    // Generate QR Code on Offscreen Canvas with Error Correction 'H' (allows 30% logo occlusion)
    const qrCanvas = document.createElement('canvas');
    const qrSize = 720;
    const qrYOffset = 210;

    QRCode.toCanvas(
      qrCanvas,
      tipUrl,
      {
        width: qrSize,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (err) {
          console.error('QR rendering error:', err);
          return;
        }

        // Draw QR
        const qrX = (width - qrSize) / 2;
        ctx.drawImage(qrCanvas, qrX, qrYOffset);

        // Center Logo overlay if provided
        const finishDrawing = () => {
          // Bottom CTA Banner
          if (frameText) {
            ctx.fillStyle = fgColor;
            ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(frameText.toUpperCase(), width / 2, qrYOffset + qrSize + 85);
          }

          // Powered by Naponi Footer
          ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = fgColor + '80';
          ctx.fillText('POWERED BY NAPONI', width / 2, height - 70);

          // Update Data URL for preview & download
          try {
            const generatedUrl = canvas.toDataURL('image/png');
            setDataUrl(generatedUrl);
          } catch (e) {
            console.error('Failed to export canvas to data URL:', e);
          }
        };

        if (logoDataUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoBoxSize = 160;
            const centerX = width / 2;
            const centerY = qrYOffset + qrSize / 2;

            // White/Bg Circular Cutout with shadow for readability
            ctx.save();
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoBoxSize / 2 + 12, 0, Math.PI * 2);
            ctx.fill();

            // Circular clip for logo
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoBoxSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              img,
              centerX - logoBoxSize / 2,
              centerY - logoBoxSize / 2,
              logoBoxSize,
              logoBoxSize
            );
            ctx.restore();

            finishDrawing();
          };
          img.onerror = () => {
            finishDrawing();
          };
          img.src = logoDataUrl;
        } else {
          finishDrawing();
        }
      }
    );
  }, [isOpen, publicToken, tipUrl, businessName, tableLabel, frameText, fgColor, bgColor, logoDataUrl]);

  // Preset Theme Selector
  const handleSelectTheme = (preset: ThemePreset) => {
    setActiveTheme(preset.id);
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  // Custom Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Copy Tip URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(tipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Ultra HD PNG
  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const fileName = `naponi-qr-${(tableName || businessName).toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    a.download = fileName;
    a.click();
  };

  // Printable HTML Document for Table Tent Stand
  const generatePrintableHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Naponi QR - ${businessName}${tableName ? ` (${tableName})` : ''}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 95vh;
            margin: 0;
            background: #ffffff;
            color: #0f172a;
          }
          .table-stand-card {
            border: 2px dashed #cbd5e1;
            border-radius: 28px;
            padding: 24px;
            width: 420px;
            text-align: center;
            background: #ffffff;
          }
          .table-stand-card img {
            width: 100%;
            height: auto;
            border-radius: 18px;
            display: block;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          .cut-instructions {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 14px;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="table-stand-card">
          <img src="${dataUrl}" alt="Naponi QR Stand" />
          <div class="cut-instructions">✂ KESİM ÇİZGİSİNDEN KESİP MASA STANDINA VEYA AKRİLİK PLEKSİYE YERLEŞTİRİNİZ</div>
        </div>
      </body>
    </html>
  `;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      ${generatePrintableHtml()}
      <script>
        window.onload = function() {
          window.print();
          window.close();
        };
      </script>
    `);
    printWindow.document.close();
  };

  const handleDownloadPdf = () => {
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) return;
    pdfWindow.document.write(`
      ${generatePrintableHtml()}
      <script>
        window.onload = function() {
          document.title = "naponi-qr-${tableName ? tableName.toLowerCase().replace(/\\s+/g, '-') : 'stand'}.pdf";
          window.print();
        };
      </script>
    `);
    pdfWindow.document.close();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isTr ? 'QR Tasarım & Baskı Stüdyosu' : 'QR Design & Print Studio'}
      maxWidth="880px"
    >
      {/* Hidden Render Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="qr-studio-grid">
        {/* Left Side: Customization Controls */}
        <div className="qr-studio-controls">
          
          {/* Section 1: Color Themes */}
          <div className="qr-studio-section">
            <div className="qr-studio-section-title">
              <Palette size={15} />
              {isTr ? 'Renk & Tasarım Teması' : 'Color & Design Theme'}
            </div>
            
            <div className="qr-theme-picker">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`qr-theme-btn ${activeTheme === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectTheme(p)}
                >
                  <span className="qr-theme-dot" style={{ background: p.dot }} />
                  <span>{isTr ? p.nameTr : p.nameEn}</span>
                </button>
              ))}
            </div>

            <div className="qr-custom-colors">
              <div className="qr-color-field">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => {
                    setFgColor(e.target.value);
                    setActiveTheme('custom');
                  }}
                  id="qr-fg-color"
                />
                <label htmlFor="qr-fg-color">{isTr ? 'QR Deseni' : 'QR Pattern'}</label>
              </div>

              <div className="qr-color-field">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    setActiveTheme('custom');
                  }}
                  id="qr-bg-color"
                />
                <label htmlFor="qr-bg-color">{isTr ? 'Kart Zemini' : 'Background'}</label>
              </div>
            </div>
          </div>

          {/* Section 2: Labels & Text */}
          <div className="qr-studio-section">
            <div className="qr-studio-section-title">
              <Type size={15} />
              {isTr ? 'Metin & Masa Bilgisi' : 'Text & Table Info'}
            </div>

            <div className="form-group mb-2">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                {isTr ? 'Masa / Bölüm Başlığı' : 'Table / Area Label'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isTr ? 'Örn: MASA 04, BİSTRO 2' : 'e.g. TABLE 04, BAR'}
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                {isTr ? 'Alt Yönlendirme (Call to Action)' : 'Bottom Call to Action'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isTr ? 'Örn: BAHŞİŞ BIRAKIN & DEĞERLENDİRİN' : 'e.g. SCAN TO TIP & REVIEW'}
                value={frameText}
                onChange={(e) => setFrameText(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Brand Logo */}
          <div className="qr-studio-section">
            <div className="qr-studio-section-title">
              <ImageIcon size={15} />
              {isTr ? 'Marka / İşletme Logosu' : 'Brand / Business Logo'}
            </div>

            <div className="qr-logo-box">
              <div className="qr-logo-preview">
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="Logo preview" />
                ) : (
                  <Sparkles size={20} color="#94a3b8" />
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} />
                  {logoDataUrl ? (isTr ? 'Değiştir' : 'Change') : (isTr ? 'Logo Yükle' : 'Upload Logo')}
                </button>
                {logoDataUrl && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    onClick={() => setLogoDataUrl('')}
                  >
                    <Trash2 size={13} />
                    {isTr ? 'Kaldır' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Live Table Stand Card Preview & Actions */}
        <div className="qr-preview-wrapper">
          <div
            className="qr-display-canvas-card"
            style={{
              backgroundColor: bgColor,
              color: fgColor,
              border: `1px solid ${fgColor}25`,
            }}
          >
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Live QR Preview"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                {isTr ? 'QR Üretiliyor...' : 'Generating QR...'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="qr-action-grid">
            <button
              type="button"
              className="btn btn-primary btn-sm btn-full"
              onClick={handleDownloadPng}
              disabled={!dataUrl}
            >
              <Download size={14} />
              {isTr ? 'HD PNG İndir (300 DPI)' : 'Download HD PNG (300 DPI)'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              disabled={!dataUrl}
            >
              <Printer size={14} />
              {isTr ? 'Yazdır' : 'Print'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              disabled={!dataUrl}
            >
              <Download size={14} />
              PDF
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? (isTr ? 'Kopyalandı!' : 'Copied!') : (isTr ? 'Linki Kopyala' : 'Copy Link')}
            </button>

            <a
              href={tipUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={14} />
              {isTr ? 'Test Et' : 'Open Link'}
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
