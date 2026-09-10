import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ShieldCheck } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/audit-logs')
      .then((res) => setLogs(res.data.data.logs))
      .catch((err) => console.error('Failed to load audit logs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Platform Audit Trail</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Immutable log of operational and financial security actions across the platform
        </p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target Business</th>
                  <th>Entity Type</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{log.actor?.email || 'System / Webhook'}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.business?.name || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.entity_type}</td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {JSON.stringify(log.metadata || {})}
                      </code>
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
