import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import { Download, Printer, ExternalLink } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicToken: string;
  businessName: string;
  tableName?: string | null;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  publicToken,
  businessName,
  tableName,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const tipUrl = `${window.location.origin}/tip/${publicToken}`;

  useEffect(() => {
    if (isOpen && publicToken) {
      QRCode.toDataURL(tipUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, publicToken, tipUrl]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `dtipbox-qr-${tableName ? tableName.toLowerCase().replace(/\s+/g, '-') : 'business'}.png`;
    a.click();
  };

  const generatePrintableHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>D-TIPBOX QR - ${businessName}${tableName ? ` (${tableName})` : ''}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 85vh;
            text-align: center;
            margin: 0;
            background: #ffffff;
            color: #0f172a;
          }
          .card {
            border: 2px solid #0f172a;
            border-radius: 28px;
            padding: 48px 36px;
            width: 360px;
            box-sizing: border-box;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          }
          h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 10px 0;
            letter-spacing: -0.02em;
          }
          .badge {
            display: inline-block;
            background: #f1f5f9;
            color: #334155;
            padding: 6px 16px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
          }
          h2 {
            font-size: 19px;
            margin: 0 0 24px 0;
            color: #64748b;
            font-weight: 600;
          }
          .qr-img {
            width: 250px;
            height: 250px;
            display: block;
            margin: 0 auto 24px auto;
          }
          .instructions {
            font-size: 13px;
            color: #0f172a;
            font-weight: 700;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
          }
          .footer {
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 0.08em;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${businessName}</h1>
          ${tableName ? `<div class="badge">${tableName}</div>` : ''}
          <h2>Scan & Leave a Tip</h2>
          <img class="qr-img" src="${dataUrl}" alt="QR Code" />
          <div class="instructions">SCAN WITH PHONE CAMERA</div>
          <div class="footer">POWERED BY D-TIPBOX</div>
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
          document.title = "dtipbox-qr-${tableName ? tableName.toLowerCase().replace(/\\s+/g, '-') : 'business'}.pdf";
          window.print();
        };
      </script>
    `);
    pdfWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Details">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Printable Preview Card */}
        <div
          ref={printRef}
          style={{
            background: '#ffffff',
            color: '#0f172a',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '340px',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            {businessName}
          </div>
          {tableName && (
            <div
              style={{
                display: 'inline-block',
                background: '#f1f5f9',
                color: '#475569',
                padding: '0.2rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}
            >
              {tableName}
            </div>
          )}
          <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, marginBottom: '1.25rem' }}>
            Leave a Tip
          </div>

          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Tip QR Code"
              style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto 1.25rem auto' }}
            />
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Generating QR...
            </div>
          )}

          <div style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 700 }}>
            SCAN WITH CAMERA TO TIP
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadPng}>
            <Download size={14} />
            PNG
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadPdf}>
            <Download size={14} />
            PDF
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            Print
          </button>
          <a href={tipUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
            <ExternalLink size={14} />
            Open Link
          </a>
        </div>
      </div>
    </Modal>
  );
};
