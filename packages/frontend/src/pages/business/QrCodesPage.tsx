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
import { useLanguage } from '../../i18n';

export const QrCodesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatDate } = useLanguage();
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
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

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
      showToast(t('common.success'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  const handleDelete = async (qr: QrCode) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.delete(`/business/qr/${qr.id}`);
      showToast(t('common.success'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('business.qrTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.qrSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> {t('business.generateQrBtn')}
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : qrCodes.length === 0 ? (
          <EmptyState
            icon={<QrIcon size={28} />}
            title="No QR codes generated yet"
            description="Create a general business QR or individual table QR to start receiving tips."
            action={
              <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} /> {t('business.generateQrBtn')}
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Destination</th>
                  <th>Public Token</th>
                  <th>{t('common.date')}</th>
                  <th className="text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                        {qr.table ? t('business.qrTypeTable') : t('business.qrTypeGeneral')}
                      </span>
                    </td>
                    <td className="font-bold">
                      {qr.table?.name || business?.name || 'General Pool'}
                    </td>
                    <td>
                      <code className="code-tag">{qr.public_token}</code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {formatDate(qr.created_at)}
                    </td>
                    <td className="text-right">
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedQr(qr)}
                          title="View & Print QR"
                        >
                          <Eye size={14} /> {t('common.details')}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(qr)} title={t('common.delete')}>
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
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('business.generateQrBtn')}>
        <form onSubmit={handleCreateQr}>
          <div className="form-group">
            <label className="form-label">{t('business.tablesTitle')}</label>
            <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="form-select">
              <option value="">{t('business.qrTypeGeneral')}</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">{t('business.generateQrBtn')}</button>
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
