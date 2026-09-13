import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { QrCode, Table, Business } from '../../types';
import { Modal } from '../../components/Modal';
import { QrModal } from '../../components/QrModal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { Plus, Trash2, Eye, QrCode as QrIcon, UtensilsCrossed, Building2 } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const QrCodesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatDate, language } = useLanguage();
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
          <>
            {/* Desktop Table View */}
            <div className="desktop-view table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{language === 'tr' ? 'Tür' : 'Type'}</th>
                    <th>{language === 'tr' ? 'Hedef / Masa' : 'Destination'}</th>
                    <th>{language === 'tr' ? 'QR Token' : 'Public Token'}</th>
                    <th>{t('common.date')}</th>
                    <th className="text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {qrCodes.map((qr) => (
                    <tr key={qr.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                          {qr.table ? t('business.qrTypeTable') : t('business.qrTypeGeneral')}
                        </span>
                      </td>
                      <td className="font-bold">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {qr.table ? (
                            <UtensilsCrossed size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                          ) : (
                            <Building2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                          )}
                          <span>{qr.table?.name || business?.name || 'General Pool'}</span>
                        </div>
                      </td>
                      <td>
                        <code className="code-tag">{qr.public_token}</code>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formatDate(qr.created_at)}
                      </td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                        <div className="inline-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedQr(qr)}
                            title={language === 'tr' ? 'QR Tasarla & Yazdır' : 'Design & Print QR'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} /> <span>{language === 'tr' ? 'Tasarla & Yazdır' : 'Design & Print'}</span>
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

            {/* Mobile Card List View */}
            <div className="mobile-cards-view">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="mobile-card-item">
                  <div className="mobile-card-header">
                    <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                      {qr.table ? t('business.qrTypeTable') : t('business.qrTypeGeneral')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatDate(qr.created_at)}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {qr.table ? (
                        <UtensilsCrossed size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      ) : (
                        <Building2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />
                      )}
                      <span className="font-bold" style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                        {qr.table?.name || business?.name || 'General Pool'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token:</span>
                      <code className="code-tag" style={{ fontSize: '0.78rem' }}>{qr.public_token}</code>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setSelectedQr(qr)}
                    >
                      <Eye size={16} />
                      <span>{language === 'tr' ? 'QR Tasarla & Baskı Al' : 'Design & Print QR'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon-only"
                      onClick={() => handleDelete(qr)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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

      {/* View / Download / Customize QR Modal */}
      {selectedQr && business && (
        <QrModal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          publicToken={selectedQr.public_token}
          businessName={business.name}
          tableName={selectedQr.table?.name}
          businessLogo={business.logo || null}
        />
      )}
    </div>
  );
};
