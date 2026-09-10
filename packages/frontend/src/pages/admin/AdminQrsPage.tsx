import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { QrCode as QrIcon } from 'lucide-react';

export const AdminQrsPage: React.FC = () => {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/qr')
      .then((res) => setQrs(res.data.data.qrCodes))
      .catch((err) => console.error('Failed to load admin QRs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Global QR Code Registry</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Cryptographic QR tokens deployed across all tenant tables and venues
        </p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading QR registry...</div>
        ) : qrs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No QR codes registered yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Public Token</th>
                  <th>Type</th>
                  <th>Business Tenant</th>
                  <th>Bound Table</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {qrs.map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <code className="code-tag">{qr.public_token}</code>
                    </td>
                    <td>{qr.type}</td>
                    <td style={{ fontWeight: 600 }}>{qr.business?.name}</td>
                    <td>{qr.table ? qr.table.name : <span style={{ color: 'var(--text-muted)' }}>General Venue</span>}</td>
                    <td>
                      <span className={`badge ${qr.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {qr.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(qr.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
