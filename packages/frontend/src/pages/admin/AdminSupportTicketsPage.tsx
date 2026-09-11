import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import {
  Headphones,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Filter,
  CreditCard,
  Wrench,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory =
  | 'POS_INTEGRATION'
  | 'TECHNICAL_SUPPORT'
  | 'ACCOUNT_BILLING'
  | 'GENERAL_INQUIRY'
  | 'FEEDBACK_SUGGESTION';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  business_name?: string | null;
  category: TicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_notes?: string | null;
  user_id?: string | null;
  business_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface StatusCounts {
  ALL: number;
  NEW: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; border: string }> = {
  NEW: { label: 'Yeni', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  IN_PROGRESS: { label: 'İşlemde', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.3)' },
  RESOLVED: { label: 'Çözüldü', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)' },
  CLOSED: { label: 'Kapatıldı', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' },
};

const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  POS_INTEGRATION: {
    label: 'POS & Entegrasyon',
    icon: <CreditCard size={13} />,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
  },
  TECHNICAL_SUPPORT: {
    label: 'Teknik Destek',
    icon: <Wrench size={13} />,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  ACCOUNT_BILLING: {
    label: 'Hesap & Faturalama',
    icon: <FileText size={13} />,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
  },
  GENERAL_INQUIRY: {
    label: 'Genel Bilgi',
    icon: <MessageSquare size={13} />,
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
  },
  FEEDBACK_SUGGESTION: {
    label: 'Öneri & İstek',
    icon: <Sparkles size={13} />,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
};

export const AdminSupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ALL: 0,
    NEW: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  });

  // Active Detail Modal
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<TicketStatus>('NEW');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/admin/support-tickets', { params });
      if (res.data.success) {
        setTickets(res.data.data);
        if (res.data.meta?.statusCounts) {
          setStatusCounts(res.data.meta.statusCounts);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Destek talepleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenDetail = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setEditStatus(ticket.status);
    setEditNotes(ticket.admin_notes || '');
    setIsDetailModalOpen(true);
  };

  const handleQuickStatusChange = async (ticketId: string, nextStatus: TicketStatus) => {
    try {
      const res = await api.patch(`/admin/support-tickets/${ticketId}/status`, {
        status: nextStatus,
      });
      if (res.data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
        );
        fetchTickets();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Durum güncellenirken bir hata oluştu');
    }
  };

  const handleSaveDetail = async () => {
    if (!activeTicket) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/support-tickets/${activeTicket.id}/status`, {
        status: editStatus,
        admin_notes: editNotes,
      });
      if (res.data.success) {
        setIsDetailModalOpen(false);
        fetchTickets();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kaydedilirken hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu destek talebini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await api.delete(`/admin/support-tickets/${id}`);
      if (res.data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        if (activeTicket?.id === id) setIsDetailModalOpen(false);
        fetchTickets();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', minHeight: '85vh' }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <Headphones size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Destek Talepleri & İletişim
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            POS entegrasyonu, teknik sorunlar ve genel soru/istek taleplerini tek panelden inceleyin ve yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTickets()}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* STATUS FILTER STAT CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { key: 'ALL', label: 'Tümü', count: statusCounts.ALL, color: '#e2e8f0', bg: 'rgba(255, 255, 255, 0.05)' },
          { key: 'NEW', label: 'Yeni', count: statusCounts.NEW, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
          { key: 'IN_PROGRESS', label: 'İşlemde', count: statusCounts.IN_PROGRESS, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
          { key: 'RESOLVED', label: 'Çözüldü', count: statusCounts.RESOLVED, color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
          { key: 'CLOSED', label: 'Kapatıldı', count: statusCounts.CLOSED, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
        ].map((item) => {
          const isSelected = selectedStatus === item.key;
          return (
            <div
              key={item.key}
              onClick={() => setSelectedStatus(item.key)}
              style={{
                background: isSelected ? item.bg : 'rgba(15, 23, 42, 0.6)',
                border: isSelected ? `2px solid ${item.color}` : '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                boxShadow: isSelected ? `0 4px 14px ${item.color}25` : 'none',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: item.color, marginTop: '0.35rem' }}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="input"
              placeholder="Ad, e-posta, konu veya işletme ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kategori:</span>
          </div>
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ minWidth: 190, cursor: 'pointer' }}
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="POS_INTEGRATION">💳 POS & Entegrasyon</option>
            <option value="TECHNICAL_SUPPORT">🛠️ Teknik Destek</option>
            <option value="ACCOUNT_BILLING">📄 Hesap & Faturalama</option>
            <option value="GENERAL_INQUIRY">💬 Genel Bilgi</option>
            <option value="FEEDBACK_SUGGESTION">✨ Öneri & İstek</option>
          </select>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 10,
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TICKETS TABLE / LIST */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Gönderen / İşletme</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Kategori</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Konu & Mesaj</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Durum</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Tarih</th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
                    <div>Destek talepleri getiriliyor...</div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Headphones size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Henüz destek talebi bulunmuyor</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>Gelen talepler burada listelenecektir.</div>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const sCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.NEW;
                  const cCfg = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.GENERAL_INQUIRY;

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Sender / Business */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {t.name}
                        </div>
                        {t.business_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#818cf8', marginTop: '0.2rem' }}>
                            <Building2 size={12} />
                            <span>{t.business_name}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          <Mail size={11} />
                          <span>{t.email}</span>
                        </div>
                        {t.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            <Phone size={11} />
                            <span>{t.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: cCfg.bg,
                          color: cCfg.color,
                          border: `1px solid ${cCfg.color}30`,
                          whiteSpace: 'nowrap',
                        }}>
                          {cCfg.icon}
                          <span>{cCfg.label}</span>
                        </span>
                      </td>

                      {/* Subject & Preview */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', maxWidth: '340px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {t.subject}
                        </div>
                        <div style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {t.message}
                        </div>
                        {t.admin_notes && (
                          <div style={{
                            marginTop: '0.45rem',
                            fontSize: '0.75rem',
                            color: '#e2e8f0',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 6,
                            display: 'inline-block',
                          }}>
                            📝 Not: {t.admin_notes.slice(0, 45)}...
                          </div>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickStatusChange(t.id, e.target.value as TicketStatus)}
                          style={{
                            background: sCfg.bg,
                            border: `1px solid ${sCfg.border}`,
                            color: sCfg.color,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 8,
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="NEW" style={{ background: '#0f172a', color: '#38bdf8' }}>Yeni</option>
                          <option value="IN_PROGRESS" style={{ background: '#0f172a', color: '#a78bfa' }}>İşlemde</option>
                          <option value="RESOLVED" style={{ background: '#0f172a', color: '#34d399' }}>Çözüldü</option>
                          <option value="CLOSED" style={{ background: '#0f172a', color: '#94a3b8' }}>Kapatıldı</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
                          {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(t)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Edit3 size={13} />
                            <span>İncele / Not</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.4rem 0.6rem' }}
                            title="Talebi Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & ADMIN NOTES MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Destek Talebi İnceleme & Durum"
      >
        {activeTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* SENDER INFO BANNER */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gönderen</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {activeTicket.name}
                </div>
              </div>
              {activeTicket.business_name && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>İşletme</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#818cf8', marginTop: '0.2rem' }}>
                    {activeTicket.business_name}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>E-posta</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  <a href={`mailto:${activeTicket.email}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>
                    {activeTicket.email}
                  </a>
                </div>
              </div>
              {activeTicket.phone && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Telefon / WhatsApp</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    <a href={`tel:${activeTicket.phone}`} style={{ color: '#34d399', textDecoration: 'none' }}>
                      {activeTicket.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* CATEGORY & SUBJECT */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: CATEGORY_CONFIG[activeTicket.category]?.bg || 'rgba(255,255,255,0.1)',
                  color: CATEGORY_CONFIG[activeTicket.category]?.color || '#fff',
                }}>
                  {CATEGORY_CONFIG[activeTicket.category]?.icon}
                  {CATEGORY_CONFIG[activeTicket.category]?.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(activeTicket.created_at).toLocaleString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {activeTicket.subject}
              </h3>
            </div>

            {/* FULL MESSAGE */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                Gelen Mesaj & Detaylar:
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '1rem',
                fontSize: '0.92rem',
                color: '#e2e8f0',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
              }}>
                {activeTicket.message}
              </div>
            </div>

            {/* STATUS UPDATE */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Talep Durumu:
              </label>
              <select
                className="input"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                style={{ width: '100%' }}
              >
                <option value="NEW">🆕 Yeni</option>
                <option value="IN_PROGRESS">⏳ İşlemde / Görüşülüyor</option>
                <option value="RESOLVED">✅ Çözüldü / Destek Verildi</option>
                <option value="CLOSED">🔒 Kapatıldı</option>
              </select>
            </div>

            {/* INTERNAL ADMIN NOTES */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Yönetici Özel Notları:
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Bu destek talebine ilişkin yapılan görüşme, verilen bilgi veya iç notlarınızı yazın..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* MODAL ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(activeTicket.id)}
              >
                Talebi Sil
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={updating}
                  onClick={handleSaveDetail}
                >
                  {updating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
