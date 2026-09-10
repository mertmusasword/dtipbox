import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Users } from 'lucide-react';

export const AdminEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/employees')
      .then((res) => setEmployees(res.data.data.employees))
      .catch((err) => console.error('Failed to load admin employees:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Global Staff Directory</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Overview of registered service staff across all businesses
        </p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading staff directory...</div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No staff records found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Position</th>
                  <th>Business Tenant</th>
                  <th>Login Account</th>
                  <th>Tips Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 700 }}>
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td>{emp.position || 'Staff Member'}</td>
                    <td style={{ fontWeight: 600 }}>{emp.business?.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {emp.user?.email || 'No login account'}
                    </td>
                    <td style={{ fontWeight: 700 }}>{emp._count?.tips || 0}</td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
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
