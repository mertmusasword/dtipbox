import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Briefcase,
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
  Filter
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export type CorporateStatus = 'NEW' | 'CONTACTED' | 'IN_DISCUSSION' | 'COMPLETED' | 'REJECTED';

interface CorporateApplication {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  sector: string;
  branch_count: number;
  message?: string | null;
  status: CorporateStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface StatusCounts {
  ALL: number;
  NEW: number;
  CONTACTED: number;
  IN_DISCUSSION: number;
  COMPLETED: number;
  REJECTED: number;
}

const STATUS_LABELS: Record<CorporateStatus, { label: string; color: string; bg: string; border: string }> = {
  NEW: { label: 'Yeni', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  CONTACTED: { label: 'İletişime Geçildi', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.3)' },
  IN_DISCUSSION: { label: 'Görüşülüyor', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.3)' },
  COMPLETED: { label: 'Tamamlandı', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)' },
  REJECTED: { label: 'Reddedildi', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.3)' },
};

export const AdminCorporateApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<CorporateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ALL: 0,
    NEW: 0,
    CONTACTED: 0,
    IN_DISCUSSION: 0,
    COMPLETED: 0,
    REJECTED: 0,
  });

  // Detail / Note Modal State
  const [selectedApp, setSelectedApp] = useState<CorporateApplication | null>(null);
  const [noteStatus, setNoteStatus] = useState<CorporateStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick status update loading
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedStatus === 'ALL'
        ? '/admin/corporate-applications?limit=100'
        : `/admin/corporate-applications?limit=100&status=${selectedStatus}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setApplications(res.data.data.items || []);
        if (res.data.data.statusCounts) {
          setStatusCounts(res.data.data.statusCounts);
        }
      }
    } catch (err: any) {
      console.error('Failed to load corporate applications:', err);
      setError(err.response?.data?.message || err.message || 'Başvurular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const handleStatusChange = async (appId: string, newStatus: CorporateStatus) => {
    try {
      setUpdatingId(appId);
      const res = await api.patch(`/admin/corporate-applications/${appId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        // Update locally
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
        // Refresh counts
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Durum güncellenirken hata oluştu');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetailModal = (app: CorporateApplication) => {
    setSelectedApp(app);
    setNoteStatus(app.status);
    setAdminNotes(app.admin_notes || '');
    setSaveSuccess(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setSavingNote(true);
      const res = await api.patch(`/admin/corporate-applications/${selectedApp.id}/status`, {
        status: noteStatus,
        adminNotes: adminNotes,
      });
      if (res.data?.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApp.id ? { ...app, status: noteStatus, admin_notes: adminNotes } : app
          )
        );
        setSelectedApp({ ...selectedApp, status: noteStatus, admin_notes: adminNotes });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kaydedilirken hata oluştu');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" firmasının başvurusunu silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/corporate-applications/${id}`);
      if (res.data?.success) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Silinirken hata oluştu');
    }
  };

  // Filter by search query
  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(q) ||
      app.contact_name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.phone.toLowerCase().includes(q) ||
      app.sector.toLowerCase().includes(q) ||
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
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <Briefcase size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
              Kurumsal Başvurular
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.92rem', margin: 0 }}>
            Çok şubeli ve kurumsal işletmelerden gelen talepleri ve entegrasyon süreçlerini yönetin
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {[
          { key: 'ALL', label: 'Tüm Başvurular', count: statusCounts.ALL, color: '#94a3b8' },
          { key: 'NEW', label: 'Yeni', count: statusCounts.NEW, color: STATUS_LABELS.NEW.color },
          { key: 'CONTACTED', label: 'İletişime Geçildi', count: statusCounts.CONTACTED, color: STATUS_LABELS.CONTACTED.color },
          { key: 'IN_DISCUSSION', label: 'Görüşülüyor', count: statusCounts.IN_DISCUSSION, color: STATUS_LABELS.IN_DISCUSSION.color },
          { key: 'COMPLETED', label: 'Tamamlandı', count: statusCounts.COMPLETED, color: STATUS_LABELS.COMPLETED.color },
          { key: 'REJECTED', label: 'Reddedildi', count: statusCounts.REJECTED, color: STATUS_LABELS.REJECTED.color },
        ].map((tab) => {
          const active = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              style={{
                background: active ? 'rgba(99, 102, 241, 0.16)' : 'var(--surface-color, #1e293b)',
                border: active ? '1px solid #6366f1' : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: 14,
                padding: '1.15rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginBottom: '0.4rem' }}>
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
            <div>Kurumsal başvurular yükleniyor...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#f87171' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
            <div>{error}</div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.35 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>Başvuru Bulunamadı</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: 420, margin: '0 auto' }}>
              {searchQuery ? 'Arama kriterinize uygun başvuru bulunamadı.' : 'Bu filtrelere ait herhangi bir kurumsal başvuru kaydı yok.'}
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
                  <th style={{ padding: '1rem 1.25rem' }}>Firma & Sektör</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Yetkili & İletişim</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>Şube Sayısı</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Mesaj / İhtiyaçlar</th>
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

                      {/* Company & Sector */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Building2 size={16} color="#818cf8" />
                          <span>{app.company_name}</span>
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#cbd5e1',
                          }}>
                            {app.sector}
                          </span>
                        </div>
                      </td>

                      {/* Contact Person & Info */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={14} color="#94a3b8" />
                          <span>{app.contact_name}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem', fontSize: '0.82rem' }}>
                          <a
                            href={`tel:${app.phone}`}
                            style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Phone size={12} />
                            <span>{app.phone}</span>
                          </a>
                          <a
                            href={`mailto:${app.email}`}
                            style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Mail size={12} />
                            <span>{app.email}</span>
                          </a>
                        </div>
                      </td>

                      {/* Branch Count */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 9999,
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}>
                          <Layers size={13} />
                          <span>{app.branch_count}</span>
                        </span>
                      </td>

                      {/* Message / Need */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: 260 }}>
                        {app.message ? (
                          <div
                            title={app.message}
                            style={{
                              fontSize: '0.84rem',
                              color: '#cbd5e1',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {app.message}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>Belirtilmedi</span>
                        )}
                        {app.admin_notes && (
                          <div style={{
                            marginTop: '0.3rem',
                            fontSize: '0.75rem',
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}>
                            <Edit3 size={11} />
                            <span>Not mevcut</span>
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as CorporateStatus)}
                          style={{
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.border}`,
                            borderRadius: 8,
                            padding: '0.4rem 0.65rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="NEW" style={{ background: '#0f172a', color: '#ffffff' }}>Yeni</option>
                          <option value="CONTACTED" style={{ background: '#0f172a', color: '#ffffff' }}>İletişime Geçildi</option>
                          <option value="IN_DISCUSSION" style={{ background: '#0f172a', color: '#ffffff' }}>Görüşülüyor</option>
                          <option value="COMPLETED" style={{ background: '#0f172a', color: '#ffffff' }}>Tamamlandı</option>
                          <option value="REJECTED" style={{ background: '#0f172a', color: '#ffffff' }}>Reddedildi</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenDetailModal(app)}
                          title="Detayları İncele & Not Ekle"
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8',
                            borderRadius: 8,
                            padding: '0.45rem 0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            marginRight: '0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Edit3 size={13} />
                          <span>İncele</span>
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.company_name)}
                          title="Başvuruyu Sil"
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            borderRadius: 8,
                            padding: '0.45rem 0.6rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail & Admin Note Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Kurumsal Başvuru: ${selectedApp.company_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Info Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Firma Adı</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
                  {selectedApp.company_name}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Sektör</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginTop: '0.2rem' }}>
                  {selectedApp.sector}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Yetkili Kişi</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.2rem' }}>
                  {selectedApp.contact_name}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Şube Sayısı</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8', marginTop: '0.2rem' }}>
                  {selectedApp.branch_count} Lokasyon / Şube
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Telefon</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <a href={`tel:${selectedApp.phone}`} style={{ color: '#38bdf8', fontSize: '0.92rem', textDecoration: 'none' }}>
                    {selectedApp.phone}
                  </a>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>E-posta</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <a href={`mailto:${selectedApp.email}`} style={{ color: '#38bdf8', fontSize: '0.92rem', textDecoration: 'none' }}>
                    {selectedApp.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Needs / Message */}
            <div>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Başvuru Mesajı & İhtiyaçlar:</span>
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: '1rem',
                color: '#e2e8f0',
                fontSize: '0.92rem',
                marginTop: '0.4rem',
                lineHeight: 1.6,
              }}>
                {selectedApp.message || 'Müşteri herhangi bir ek mesaj bırakmadı.'}
              </div>
            </div>

            {/* Status & Admin Notes Form */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Başvuru Durumu:
                </label>
                <select
                  value={noteStatus}
                  onChange={(e) => setNoteStatus(e.target.value as CorporateStatus)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 8,
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                  }}
                >
                  <option value="NEW">Yeni</option>
                  <option value="CONTACTED">İletişime Geçildi</option>
                  <option value="IN_DISCUSSION">Görüşülüyor</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="REJECTED">Reddedildi</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Yönetici / Takip Notları:
                </label>
                <textarea
                  rows={4}
                  placeholder="Görüşme detayları, teklif durumu veya operasyonel notlar..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 8,
                    padding: '0.75rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {saveSuccess && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 8,
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34d399',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <CheckCircle2 size={16} />
                  <span>Durum ve notlar başarıyla güncellendi!</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {savingNote ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
