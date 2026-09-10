import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Building2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Modal } from '../../components/Modal';

export const AdminBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  const loadBusinesses = () => {
    setLoading(true);
    api
      .get('/admin/businesses')
      .then((res) => setBusinesses(res.data.data.businesses))
      .catch((err) => console.error('Failed to load businesses:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleToggleStatus = async (biz: any) => {
    try {
      await api.put(`/admin/businesses/${biz.id}/status`, { is_active: !biz.is_active });
      loadBusinesses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleViewDetail = async (bizId: string) => {
    try {
      const res = await api.get(`/admin/businesses/${bizId}`);
      setSelectedBusiness(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to load business details');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Manage Businesses</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Global tenants operating on D-TIPBOX
        </p>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading businesses...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Country / Currency</th>
                  <th>Owner</th>
                  <th>Staff / Tables</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700 }}>{b.name}</td>
                    <td>
                      {b.country} • <span style={{ fontWeight: 600 }}>{b.currency}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.owner?.email}</td>
                    <td>
                      {b._count?.employees || 0} staff • {b._count?.tables || 0} tables
                    </td>
                    <td>
                      <span className={`badge ${b.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {b.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail(b.id)}
                          title="View Details"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className={`btn ${b.is_active ? 'btn-danger' : 'btn-primary'} btn-sm`}
                          onClick={() => handleToggleStatus(b)}
                        >
                          {b.is_active ? 'Deactivate' : 'Activate'}
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

      {/* Business Details Modal */}
      {selectedBusiness && (
        <Modal
          isOpen={!!selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          title={`Business Details: ${selectedBusiness.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong>ID:</strong> <code>{selectedBusiness.id}</code></div>
              <div><strong>Owner:</strong> {selectedBusiness.owner?.email}</div>
              <div><strong>Timezone:</strong> {selectedBusiness.timezone}</div>
              <div><strong>Created:</strong> {new Date(selectedBusiness.created_at).toLocaleString()}</div>
            </div>

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Bank Account Setup</h4>
              {selectedBusiness.payment_account ? (
                <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div><strong>Account Holder:</strong> {selectedBusiness.payment_account.account_holder_name}</div>
                  <div><strong>Bank:</strong> {selectedBusiness.payment_account.bank_name || '—'}</div>
                  <div><strong>IBAN:</strong> {selectedBusiness.payment_account.iban || '—'}</div>
                  <div><strong>Account Number:</strong> {selectedBusiness.payment_account.account_number || '—'}</div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>No bank payment account configured.</div>
              )}
            </div>

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Summary</h4>
              <div>Active Staff: {selectedBusiness.employees?.length || 0}</div>
              <div>Active Tables: {selectedBusiness.tables?.length || 0}</div>
              <div>QR Codes: {selectedBusiness.qr_codes?.length || 0}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
