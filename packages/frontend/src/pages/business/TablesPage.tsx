import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Table } from '../../types';
import { Modal } from '../../components/Modal';
import { Plus, Trash2, Edit2, UtensilsCrossed } from 'lucide-react';

export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState('');

  const loadTables = () => {
    setLoading(true);
    api
      .get('/business/tables')
      .then((res) => setTables(res.data.data))
      .catch((err) => console.error('Failed to load tables:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTables();
  }, []);

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
      } else {
        await api.post('/business/tables', { name: tableName });
      }
      setIsModalOpen(false);
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Delete table "${table.name}"?`)) return;
    try {
      await api.delete(`/business/tables/${table.id}`);
      loadTables();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete table');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Dining Tables & Sections</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Optionally organize tips by specific tables, rooms, or bar areas
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tables...</div>
        ) : tables.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <UtensilsCrossed size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <div>No tables defined yet.</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Tables are optional. You can add tables to generate table-specific QR codes.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Table / Area Name</th>
                  <th>QR Codes</th>
                  <th>Tips Logged</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((tbl) => (
                  <tr key={tbl.id}>
                    <td style={{ fontWeight: 600 }}>{tbl.name}</td>
                    <td>{tbl._count?.qr_codes || 0}</td>
                    <td>{tbl._count?.tips || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(tbl)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tbl)} title="Delete">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit Table' : 'Add New Table'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Table Name or Location</label>
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
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTable ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
