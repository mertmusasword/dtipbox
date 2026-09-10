import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { CreditCard } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/payments')
      .then((res) => setTips(res.data.data.tips))
      .catch((err) => console.error('Failed to load admin payments:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Global Payments & Tips Ledger</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Real-time stream of all customer tip transactions across the platform
        </p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payment ledger...</div>
        ) : tips.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No payment records logged yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Amount</th>
                  <th>Business</th>
                  <th>Recipient Staff</th>
                  <th>Table</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tips.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {t.currency} {t.amount}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.business?.name}</td>
                    <td>{t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : 'General Pool'}</td>
                    <td>{t.table?.name || '—'}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {t.payment_method}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.payment_status === 'SUCCESS'
                            ? 'badge-success'
                            : t.payment_status === 'UNVERIFIED'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {t.payment_status}
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
