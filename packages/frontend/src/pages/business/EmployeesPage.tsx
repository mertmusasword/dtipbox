import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { Employee } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { Plus, Trash2, Edit2, UserCheck, UserX, Users } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatNumber } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    avatar: '',
    email: '',
    password: '',
  });

  const loadEmployees = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/business/employees')
      .then((res) => setEmployees(res.data.data))
      .catch(() => setError('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({ first_name: '', last_name: '', position: '', avatar: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      position: emp.position || '',
      avatar: emp.avatar || '',
      email: emp.user?.email || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/business/employees/${editingEmployee.id}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          position: formData.position || undefined,
          avatar: formData.avatar || undefined,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
        showToast(`${formData.first_name} ${formData.last_name} updated`);
      } else {
        await api.post('/business/employees', {
          ...formData,
          position: formData.position || undefined,
          avatar: formData.avatar || undefined,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
        showToast(`${formData.first_name} ${formData.last_name} added to team`);
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      await api.put(`/business/employees/${emp.id}`, { is_active: !emp.is_active });
      showToast(`${emp.first_name} ${emp.is_active ? 'deactivated' : 'activated'}`);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await api.delete(`/business/employees/${emp.id}`);
      showToast(`${emp.first_name} ${emp.last_name} removed`);
      loadEmployees();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete employee', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('business.staffTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('business.staffSubtitle')}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> {t('business.addStaffBtn')}
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <LoadingState compact message={t('common.loading')} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadEmployees} />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t('business.staffTitle')}
            description={t('business.staffSubtitle')}
            action={
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={16} /> {t('business.addStaffBtn')}
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('business.position')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('nav.payments')}</th>
                  <th className="text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={`avatar ${emp.avatar ? '' : 'avatar-placeholder'}`}>
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.first_name} />
                          ) : (
                            emp.first_name[0]
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{emp.first_name} {emp.last_name}</div>
                          {emp.user?.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{emp.position || '—'}</td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="font-bold">{formatNumber(emp._count?.tips || 0)}</td>
                    <td className="text-right">
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(emp)}
                          title={emp.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {emp.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(emp)} title={t('common.edit')}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)} title={t('common.delete')}>
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? `${t('common.edit')}: ${editingEmployee.first_name} ${editingEmployee.last_name}` : t('business.addStaffBtn')}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid form-grid-2">
            <div className="form-group mb-0">
              <label className="form-label">{t('business.firstName')}</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">{t('business.lastName')}</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">{t('business.position')}</label>
            <input
              type="text"
              placeholder="e.g. Head Waiter, Bartender, Barista"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">{t('business.avatarUrl')}</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('common.details')}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">{t('common.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@business.com"
                className="form-input"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">{t('auth.passwordLabel')}</label>
              <input
                type="password"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingEmployee ? '••••••••' : '••••••••'}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEmployee ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
