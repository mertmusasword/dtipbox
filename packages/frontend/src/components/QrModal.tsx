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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>D-TIPBOX QR - ${businessName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 95vh;
              text-align: center;
              margin: 0;
            }
            .card {
              border: 2px solid #0f172a;
              border-radius: 24px;
              padding: 40px;
              width: 340px;
            }
            h1 { font-size: 26px; margin: 0 0 8px 0; color: #0f172a; }
            h2 { font-size: 18px; margin: 0 0 24px 0; color: #475569; font-weight: 500; }
            img { width: 280px; height: 280px; margin-bottom: 20px; }
            .badge {
              display: inline-block;
              background: #f1f5f9;
              color: #334155;
              padding: 6px 14px;
              border-radius: 999px;
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 16px;
            }
            .footer { font-size: 12px; color: #94a3b8; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${businessName}</h1>
            ${tableName ? `<div class="badge">${tableName}</div>` : ''}
            <h2>Leave a Tip</h2>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="footer">POWERED BY D-TIPBOX</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleDownloadPng}>
            <Download size={16} />
            Download PNG
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            Print / PDF
          </button>
          <a href={tipUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
            <ExternalLink size={16} />
            Open Link
          </a>
        </div>
      </div>
    </Modal>
  );
};
