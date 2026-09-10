import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Employee } from '../../types';
import { Modal } from '../../components/Modal';
import { Plus, Trash2, Edit2, UserCheck, UserX, Users } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadEmployees = () => {
    setLoading(true);
    api
      .get('/business/employees')
      .then((res) => setEmployees(res.data.data))
      .catch((err) => console.error('Failed to load employees:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      position: '',
      avatar: '',
      email: '',
      password: '',
    });
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
        });
      } else {
        await api.post('/business/employees', {
          ...formData,
          position: formData.position || undefined,
          avatar: formData.avatar || undefined,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      await api.put(`/business/employees/${emp.id}`, { is_active: !emp.is_active });
      loadEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove ${emp.first_name} ${emp.last_name}?`)) return;
    try {
      await api.delete(`/business/employees/${emp.id}`);
      loadEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Team & Staff</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Manage staff members for targeted tip distribution
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading team...</div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <div>No employees added yet.</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Add team members so customers can specifically select them when tipping.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Account Status</th>
                  <th>Tips Received</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.first_name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}>
                            {emp.first_name[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.first_name} {emp.last_name}</div>
                          {emp.user?.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{emp.position || '—'}</td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{emp._count?.tips || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(emp)}
                          title={emp.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {emp.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(emp)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(emp)}
                          title="Delete"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Role / Position</label>
            <input
              type="text"
              placeholder="e.g. Head Waiter, Bartender, Barista"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Avatar Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="form-input"
            />
          </div>

          {!editingEmployee && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                OPTIONAL LOGIN CREDENTIALS
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                If you provide an email & password, this employee can sign in to view their own tip statistics.
              </p>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Employee Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@business.com"
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEmployee ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
