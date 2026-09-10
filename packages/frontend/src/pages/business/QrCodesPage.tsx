import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { QrCode, Table, Business } from '../../types';
import { Modal } from '../../components/Modal';
import { QrModal } from '../../components/QrModal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { Plus, Trash2, Eye, QrCode as QrIcon } from 'lucide-react';

export const QrCodesPage: React.FC = () => {
  const { showToast } = useToast();
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.get('/business/qr'), api.get('/business/tables'), api.get('/business')])
      .then(([qrRes, tblRes, bizRes]) => {
        setQrCodes(qrRes.data.data);
        setTables(tblRes.data.data);
        setBusiness(bizRes.data.data);
      })
      .catch(() => setError('Failed to load QR code data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/business/qr', {
        table_id: selectedTableId || undefined,
        type: 'DTIPBOX',
      });
      setIsCreateModalOpen(false);
      setSelectedTableId('');
      showToast('New QR code generated');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to generate QR code', 'error');
    }
  };

  const handleDelete = async (qr: QrCode) => {
    if (!confirm('Are you sure you want to revoke this QR code? Existing physical prints will stop working.')) return;
    try {
      await api.delete(`/business/qr/${qr.id}`);
      showToast('QR code revoked');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete QR code', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Tip QR Codes</h1>
          <p className="page-subtitle mb-0">
            Generate and print cryptographically secure QR codes for customers
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Generate New QR
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingState compact message="Loading QR codes..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : qrCodes.length === 0 ? (
          <EmptyState
            icon={<QrIcon size={28} />}
            title="No QR codes generated yet"
            description="Create a general business QR or individual table QR to start receiving tips."
            action={
              <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} /> Generate First QR
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Target Destination</th>
                  <th>Public Token</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                        {qr.table ? 'Table Specific' : 'General'}
                      </span>
                    </td>
                    <td className="font-bold">
                      {qr.table?.name || business?.name || 'General Pool'}
                    </td>
                    <td>
                      <code className="code-tag">{qr.public_token}</code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(qr.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedQr(qr)}
                          title="View & Print QR"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(qr)} title="Revoke QR">
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
            <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="form-select">
              <option value="">General Business QR (No Table)</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="form-hint">
              General QR lets the customer select staff or table manually. Table QR pre-fills the table.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Generate QR</button>
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
