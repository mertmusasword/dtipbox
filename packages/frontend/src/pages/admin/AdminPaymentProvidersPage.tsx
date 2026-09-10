import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { PaymentProvider, PaymentProviderRequest, ProviderCatalogStatus, ProviderRequestStatus } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import {
  CreditCard,
  Building2,
  Globe2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Inbox,
  AlertTriangle,
  Send,
} from 'lucide-react';

export const AdminPaymentProvidersPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');

  const [catalog, setCatalog] = useState<PaymentProvider[]>([]);
  const [requests, setRequests] = useState<PaymentProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/admin/payment-providers/catalog'),
      api.get('/admin/payment-providers/requests'),
    ])
      .then(([catRes, reqRes]) => {
        setCatalog(catRes.data.data || []);
        setRequests(reqRes.data.data.requests || []);
      })
      .catch(() => setError('Failed to load payment provider administration data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update catalog status
  const handleUpdateStatus = async (providerId: string, status: ProviderCatalogStatus, hasAdapter: boolean) => {
    if (status === 'ACTIVE' && !hasAdapter) {
      showToast('Cannot mark provider as ACTIVE because no backend code adapter is implemented yet.', 'error');
      return;
    }

    try {
      await api.put(`/admin/payment-providers/${providerId}/status`, { status });
      showToast(`Provider status updated to ${status}`);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update provider status', 'error');
    }
  };

  // Update merchant request status
  const handleUpdateRequestStatus = async (requestId: string, status: ProviderRequestStatus) => {
    try {
      await api.put(`/admin/payment-providers/requests/${requestId}/status`, { status });
      showToast(`Request status updated to ${status}`);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update request status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading payment providers management..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const liveAdapterCount = catalog.filter((p) => p.has_adapter).length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const totalConnectedBiz = catalog.reduce((acc, p) => acc + (p.connectedBusinessCount || 0), 0);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Provider Administration</h1>
          <p className="page-subtitle mb-0">
            Global payment gateway registry, capability verification, and merchant integration requests
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Catalog Providers</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{catalog.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Global & Regional POS</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Code Adapters</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
            {liveAdapterCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Production tested</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Connected Merchants</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalConnectedBiz}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Live gateway links</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Requests</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: pendingRequestsCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {pendingRequestsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Unlisted merchant demands</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('catalog')}
        >
          <Layers size={14} /> Provider Catalog ({catalog.length})
        </button>
        <button
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('requests')}
        >
          <Inbox size={14} /> Merchant Requests ({requests.length}) {pendingRequestsCount > 0 && `• ${pendingRequestsCount} pending`}
        </button>
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '0.75rem' }}>PROVIDER</th>
                <th style={{ padding: '0.75rem' }}>TYPE</th>
                <th style={{ padding: '0.75rem' }}>COUNTRIES</th>
                <th style={{ padding: '0.75rem' }}>CURRENCIES</th>
                <th style={{ padding: '0.75rem' }}>CAPABILITIES</th>
                <th style={{ padding: '0.75rem' }}>MERCHANTS</th>
                <th style={{ padding: '0.75rem' }}>ADAPTER</th>
                <th style={{ padding: '0.75rem' }}>CATALOG STATUS</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => {
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{item.display_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.is_global ? 'Global (*)' : item.countries.join(', ')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.supported_currencies.join(', ')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.capabilities.join(', ')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 700 }}>
                      {item.connectedBusinessCount || 0}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {item.has_adapter ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          ⚡ Implemented
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          No Adapter
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as ProviderCatalogStatus, item.has_adapter)}
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      >
                        <option value="ACTIVE" disabled={!item.has_adapter}>
                          ACTIVE {!item.has_adapter ? '(Adapter Required)' : ''}
                        </option>
                        <option value="DEVELOPMENT">DEVELOPMENT</option>
                        <option value="COMING_SOON">COMING_SOON</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: MERCHANT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No merchant provider requests have been submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((reqItem) => {
                return (
                  <div
                    key={reqItem.id}
                    style={{
                      background: 'var(--bg-input)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                          {reqItem.provider_name}
                        </h4>
                        <span className="badge badge-info">{reqItem.country}</span>
                        <span className="badge badge-neutral">{reqItem.payment_type}</span>
                        <span
                          className={`badge ${
                            reqItem.status === 'PENDING'
                              ? 'badge-warning'
                              : reqItem.status === 'PLANNED'
                              ? 'badge-success'
                              : 'badge-neutral'
                          }`}
                        >
                          {reqItem.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        Requested by: <strong>{reqItem.business?.name || reqItem.business_id}</strong> ({reqItem.business?.email || 'N/A'})
                      </div>

                      {reqItem.website && (
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          <a href={reqItem.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {reqItem.website} <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {reqItem.description && (
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                          "{reqItem.description}"
                        </p>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Submitted on: {new Date(reqItem.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        value={reqItem.status}
                        onChange={(e) => handleUpdateRequestStatus(reqItem.id, e.target.value as ProviderRequestStatus)}
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="REVIEWED">REVIEWED</option>
                        <option value="PLANNED">PLANNED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
