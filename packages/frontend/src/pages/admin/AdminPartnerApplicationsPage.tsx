import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Handshake,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  Cpu,
  Workflow
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export type PartnerStatus =
  | 'NEW'
  | 'REVIEWING'
  | 'CONTACTED'
  | 'INTEGRATION_DISCUSSION'
  | 'COMPLETED'
  | 'REJECTED';

interface PartnerApplication {
  id: string;
  company_name: string;
  website?: string | null;
  contact_name: string;
  email: string;
  phone?: string | null;
  company_type: string;
  customer_count?: string | null;
  countries?: string | null;
  integration_idea?: string | null;
  message?: string | null;
  status: PartnerStatus;
  admin_notes?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

interface StatusCounts {
  ALL: number;
  NEW: number;
  REVIEWING: number;
  CONTACTED: number;
  INTEGRATION_DISCUSSION: number;
  COMPLETED: number;
  REJECTED: number;
}

const STATUS_LABELS: Record<
  PartnerStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  NEW: {
    label: 'Yeni',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.3)',
  },
  REVIEWING: {
    label: 'İnceleniyor',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  CONTACTED: {
    label: 'İletişime Geçildi',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.12)',
    border: 'rgba(167, 139, 250, 0.3)',
  },
  INTEGRATION_DISCUSSION: {
    label: 'Entegrasyon Görüşmesi',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    border: 'rgba(129, 140, 248, 0.3)',
  },
  COMPLETED: {
    label: 'Tamamlandı',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  REJECTED: {
    label: 'Reddedildi',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(248, 113, 113, 0.3)',
  },
};

export const AdminPartnerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ALL: 0,
    NEW: 0,
    REVIEWING: 0,
    CONTACTED: 0,
    INTEGRATION_DISCUSSION: 0,
    COMPLETED: 0,
    REJECTED: 0,
  });

  // Detail & Note Modal State
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [noteStatus, setNoteStatus] = useState<PartnerStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick status update loading indicator
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedStatus === 'ALL'
        ? '/admin/partner-applications?limit=100'
        : `/admin/partner-applications?limit=100&status=${selectedStatus}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setApplications(res.data.data.items || []);
        if (res.data.data.statusCounts) {
          setStatusCounts(res.data.data.statusCounts);
        }
      }
    } catch (err: any) {
      console.error('Failed to load partner applications:', err);
      setError(err.response?.data?.message || err.message || 'Başvurular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const handleQuickStatusChange = async (appId: string, newStatus: PartnerStatus) => {
    try {
      setUpdatingId(appId);
      const res = await api.patch(`/admin/partner-applications/${appId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Durum güncellenirken hata oluştu');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailModal = (app: PartnerApplication) => {
    setSelectedApp(app);
    setNoteStatus(app.status);
    setAdminNotes(app.admin_notes || '');
    setSaveSuccess(false);
  };

  const handleSaveModal = async () => {
    if (!selectedApp) return;
    try {
      setSavingNote(true);
      const res = await api.patch(`/admin/partner-applications/${selectedApp.id}/status`, {
        status: noteStatus,
        adminNotes: adminNotes,
      });
      if (res.data?.success) {
        setSaveSuccess(true);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApp.id
              ? { ...app, status: noteStatus, admin_notes: adminNotes }
              : app
          )
        );
        setTimeout(() => {
          setSelectedApp(null);
          fetchApplications();
        }, 800);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Güncelleme yapılırken hata oluştu');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (appId: string, name: string) => {
    if (!window.confirm(`"${name}" firmasının partnerlik başvurusunu silmek istediğinizden emin misiniz?`)) {
      return;
    }
    try {
      await api.delete(`/admin/partner-applications/${appId}`);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  // Client-side search filter
  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(q) ||
      app.contact_name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      (app.phone && app.phone.toLowerCase().includes(q)) ||
      app.company_type.toLowerCase().includes(q) ||
      (app.integration_idea && app.integration_idea.toLowerCase().includes(q)) ||
      (app.message && app.message.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}>
              <Handshake size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
              Teknoloji Partner Başvuruları
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.92rem', margin: 0 }}>
            POS, QR Menü, ödeme ve restoran yönetim yazılım firmalarının B2B ortaklık taleplerini yönetin
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'var(--surface-color, #1e293b)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            color: 'var(--text-primary, #f8fafc)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Status Filter Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {[
          { key: 'ALL', label: 'Tüm Başvurular', count: statusCounts.ALL, color: '#94a3b8' },
          { key: 'NEW', label: 'Yeni', count: statusCounts.NEW, color: STATUS_LABELS.NEW.color },
          { key: 'REVIEWING', label: 'İnceleniyor', count: statusCounts.REVIEWING, color: STATUS_LABELS.REVIEWING.color },
          { key: 'CONTACTED', label: 'İletişime Geçildi', count: statusCounts.CONTACTED, color: STATUS_LABELS.CONTACTED.color },
          { key: 'INTEGRATION_DISCUSSION', label: 'Entegrasyon Görüşmesi', count: statusCounts.INTEGRATION_DISCUSSION, color: STATUS_LABELS.INTEGRATION_DISCUSSION.color },
          { key: 'COMPLETED', label: 'Tamamlandı', count: statusCounts.COMPLETED, color: STATUS_LABELS.COMPLETED.color },
          { key: 'REJECTED', label: 'Reddedildi', count: statusCounts.REJECTED, color: STATUS_LABELS.REJECTED.color },
        ].map((tab) => {
          const active = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              style={{
                background: active ? 'rgba(56, 189, 248, 0.14)' : 'var(--surface-color, #1e293b)',
                border: active ? '1px solid #38bdf8' : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: 14,
                padding: '1.1rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginBottom: '0.35rem' }}>
                {tab.label}
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: tab.color }}>
                {tab.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
        background: 'var(--surface-color, #1e293b)',
        padding: '0.85rem 1.25rem',
        borderRadius: 12,
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Firma adı, yetkili, telefon, e-posta veya sektör ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
          {filteredApps.length} başvuru listeleniyor
        </div>
      </div>

      {/* Applications Table */}
      <div style={{
        background: 'var(--surface-color, #1e293b)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <div>Teknoloji partneri başvuruları yükleniyor...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
            <div>{error}</div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Handshake size={48} style={{ margin: '0 auto 1rem', opacity: 0.35, color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>Başvuru Bulunamadı</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: 420, margin: '0 auto' }}>
              {searchQuery ? 'Arama kriterinize uygun partnerlik başvurusu bulunamadı.' : 'Bu filtreye ait herhangi bir başvuru kaydı yok.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Tarih</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Firma & Tür</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Yetkili & İletişim</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>Müşteri Sayısı</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Entegrasyon Fikri</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Durum</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.NEW;
                  const dateStr = new Date(app.created_at).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.84rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="#64748b" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Company & Type */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Building2 size={16} color="#38bdf8" />
                          <span>{app.company_name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 6,
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38bdf8',
                            fontWeight: 600,
                          }}>
                            {app.company_type}
                          </span>
                          {app.website && (
                            <a
                              href={app.website.startsWith('http') ? app.website : `https://${app.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <Globe size={11} />
                              <span>{app.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Contact & Info */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={14} color="#94a3b8" />
                          <span>{app.contact_name}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem', fontSize: '0.82rem' }}>
                          {app.phone && (
                            <a
                              href={`tel:${app.phone}`}
                              style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Phone size={12} />
                              <span>{app.phone}</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${app.email}`}
                            style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Mail size={12} />
                            <span>{app.email}</span>
                          </a>
                        </div>
                      </td>

                      {/* Customer Count */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: 8,
                          background: 'rgba(52, 211, 153, 0.1)',
                          border: '1px solid rgba(52, 211, 153, 0.25)',
                          color: '#34d399',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}>
                          <Layers size={13} />
                          <span>{app.customer_count || '-'}</span>
                        </span>
                      </td>

                      {/* Integration Idea */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: 280 }}>
                        {app.integration_idea ? (
                          <div style={{
                            fontSize: '0.84rem',
                            color: '#cbd5e1',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}>
                            {app.integration_idea}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Belirtilmedi</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.3rem 0.7rem',
                            borderRadius: 999,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.border}`,
                          }}>
                            {statusInfo.label}
                          </span>
                          <select
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) => handleQuickStatusChange(app.id, e.target.value as PartnerStatus)}
                            style={{
                              fontSize: '0.75rem',
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#ffffff',
                              borderRadius: 6,
                              padding: '0.25rem 0.4rem',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="NEW">Yeni</option>
                            <option value="REVIEWING">İnceleniyor</option>
                            <option value="CONTACTED">İletişime Geçildi</option>
                            <option value="INTEGRATION_DISCUSSION">Entegrasyon Görüşmesi</option>
                            <option value="COMPLETED">Tamamlandı</option>
                            <option value="REJECTED">Reddedildi</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => openDetailModal(app)}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: 8,
                              background: 'rgba(56, 189, 248, 0.12)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              color: '#38bdf8',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease',
                            }}
                            title="Detay & Notlar"
                          >
                            <Edit3 size={13} />
                            <span>Detay</span>
                          </button>
                          <button
                            onClick={() => handleDelete(app.id, app.company_name)}
                            style={{
                              padding: '0.45rem',
                              borderRadius: 8,
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            title="Başvuruyu Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Note Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Partnerlik Başvurusu Detayları"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {selectedApp.company_name}
                </h3>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.8rem',
                  borderRadius: 999,
                  background: STATUS_LABELS[selectedApp.status]?.bg,
                  color: STATUS_LABELS[selectedApp.status]?.color,
                  border: `1px solid ${STATUS_LABELS[selectedApp.status]?.border}`,
                }}>
                  {STATUS_LABELS[selectedApp.status]?.label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Yetkili Kişi</span>
                  <strong style={{ color: '#ffffff' }}>{selectedApp.contact_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Firma Türü</span>
                  <strong style={{ color: '#38bdf8' }}>{selectedApp.company_type}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>E-posta</span>
                  <a href={`mailto:${selectedApp.email}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Telefon</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.phone || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Web Sitesi</span>
                  {selectedApp.website ? (
                    <a
                      href={selectedApp.website.startsWith('http') ? selectedApp.website : `https://${selectedApp.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {selectedApp.website} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Müşteri Portföyü</span>
                  <strong style={{ color: '#34d399' }}>{selectedApp.customer_count || '-'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Faaliyet Ülkeleri</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.countries || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Başvuru Tarihi</span>
                  <span style={{ color: '#ffffff' }}>
                    {new Date(selectedApp.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Integration Idea */}
            {selectedApp.integration_idea && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 12,
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Workflow size={14} />
                  <span>Entegrasyon Vizyonu & Düşüncesi</span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedApp.integration_idea}
                </p>
              </div>
            )}

            {/* Additional Message */}
            {selectedApp.message && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={14} />
                  <span>Başvuru Mesajı</span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedApp.message}
                </p>
              </div>
            )}

            {/* Status & Notes Editing */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '1.25rem',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Başvuru Durumu
                </label>
                <select
                  value={noteStatus}
                  onChange={(e) => setNoteStatus(e.target.value as PartnerStatus)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="NEW">Yeni</option>
                  <option value="REVIEWING">İnceleniyor</option>
                  <option value="CONTACTED">İletişime Geçildi</option>
                  <option value="INTEGRATION_DISCUSSION">Entegrasyon Görüşmesi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="REJECTED">Reddedildi</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Dahili Yönetici Notları
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Görüşme notları, teklif detayları, teknik değerlendirmeler..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {saveSuccess && (
                <div style={{
                  padding: '0.6rem 1rem',
                  borderRadius: 8,
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34d399',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  <CheckCircle2 size={16} />
                  <span>Bilgiler ve notlar başarıyla kaydedildi.</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Kapat
                </button>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveModal}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    border: 'none',
                    color: '#090d16',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: savingNote ? 'not-allowed' : 'pointer',
                    opacity: savingNote ? 0.6 : 1,
                  }}
                >
                  {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPartnerApplicationsPage;
