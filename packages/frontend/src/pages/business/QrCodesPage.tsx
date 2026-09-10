import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { QrCode, Table, Business } from '../../types';
import { Modal } from '../../components/Modal';
import { QrModal } from '../../components/QrModal';
import { Plus, Trash2, Eye, QrCode as QrIcon } from 'lucide-react';

export const QrCodesPage: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  // View QR Modal
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/business/qr'), api.get('/business/tables'), api.get('/business')])
      .then(([qrRes, tblRes, bizRes]) => {
        setQrCodes(qrRes.data.data);
        setTables(tblRes.data.data);
        setBusiness(bizRes.data.data);
      })
      .catch((err) => console.error('Failed to load QR data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/business/qr', {
        table_id: selectedTableId || undefined,
        type: 'DTIPBOX',
      });
      setIsCreateModalOpen(false);
      setSelectedTableId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate QR code');
    }
  };

  const handleDelete = async (qr: QrCode) => {
    if (!confirm('Are you sure you want to revoke this QR code? Existing physical prints will stop working.')) return;
    try {
      await api.delete(`/business/qr/${qr.id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete QR code');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Digital Tip QR Codes</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Generate and print cryptographically secure QR codes for customers
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Generate New QR
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading QR codes...</div>
        ) : qrCodes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <QrIcon size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <div>No QR codes generated yet.</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Create a general business QR or individual table QR to start receiving tips.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Target Destination</th>
                  <th>Public Token</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                        {qr.table ? 'Table Specific' : 'General Business'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {qr.table?.name || business?.name || 'General Pool'}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'var(--bg-input)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {qr.public_token}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(qr.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedQr(qr)}
                          title="View & Print QR"
                        >
                          <Eye size={14} /> View / Print
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(qr)}
                          title="Revoke QR"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate QR Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate New Tip QR">
        <form onSubmit={handleCreateQr}>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="form-select"
            >
              <option value="">General Business QR (No Table)</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              General QR lets the customer select staff or table manually. Table QR pre-fills the table.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate QR
            </button>
          </div>
        </form>
      </Modal>

      {/* View / Download QR Modal */}
      {selectedQr && business && (
        <QrModal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          publicToken={selectedQr.public_token}
          businessName={business.name}
          tableName={selectedQr.table?.name}
        />
      )}
    </div>
  );
};
