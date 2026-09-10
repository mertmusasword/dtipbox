import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { Table } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { Plus, Trash2, Edit2, UtensilsCrossed } from 'lucide-react';

export const TablesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatNumber } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState('');

  const loadTables = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business/tables')
      .then((res) => setTables(res.data.data))
      .catch(() => setError('Failed to load tables'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const openCreateModal = () => {
    setEditingTable(null);
    setTableName('');
    setIsModalOpen(true);
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await api.put(`/business/tables/${editingTable.id}`, { name: tableName });
        showToast(`Table "${tableName}" updated`);
      } else {
        await api.post('/business/tables', { name: tableName });
        showToast(`Table "${tableName}" created`);
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Delete table "${table.name}"?`)) return;
    try {
      await api.delete(`/business/tables/${table.id}`);
      showToast(`Table "${table.name}" deleted`);
      loadTables();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete table', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('business.tablesTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.tablesSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> {t('business.addTableBtn')}
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTables} />
        ) : tables.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed size={28} />}
            title={t('business.tablesTitle')}
            description={t('business.tablesSubtitle')}
            action={
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={16} /> {t('business.addTableBtn')}
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('business.tableName')}</th>
                  <th>{t('business.qrCodesCount')}</th>
                  <th>{t('nav.payments')}</th>
                  <th className="text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((tbl) => (
                  <tr key={tbl.id}>
                    <td className="font-bold">{tbl.name}</td>
                    <td>{formatNumber(tbl._count?.qr_codes || 0)}</td>
                    <td>{formatNumber(tbl._count?.tips || 0)}</td>
                    <td className="text-right">
                      <div className="inline-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(tbl)} title={t('common.edit')}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tbl)} title={t('common.delete')}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTable ? `${t('common.edit')}: ${editingTable.name}` : t('business.addTableBtn')}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('business.tableName')}</label>
            <input
              type="text"
              required
              placeholder="e.g. Table 12, Rooftop Lounge, Bar 1"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTable ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
