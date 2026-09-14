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

const STATUS_CONFIG: Record<
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

  // Detail / Note Modal State
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [noteStatus, setNoteStatus] = useState<PartnerStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick status update loading
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = selectedStatus === 'ALL'
        ? '/admin/partner-applications?limit=100'
        : `/admin/partner-applications?limit=100&status=${selectedStatus}`;

      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

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

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Bu partnerlik başvurusunu silmek istediğinizden emin misiniz?')) {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Handshake size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Teknoloji Partner Başvuruları
              </h1>
              <p className="text-sm text-slate-400">
                POS, QR Menü, ödeme ve restoran yönetim yazılım firmalarının B2B ortaklık talepleri
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchApplications()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-sm font-medium self-start md:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {[
          { key: 'ALL', label: 'Tümü' },
          { key: 'NEW', label: 'Yeni' },
          { key: 'REVIEWING', label: 'İnceleniyor' },
          { key: 'CONTACTED', label: 'İletişime Geçildi' },
          { key: 'INTEGRATION_DISCUSSION', label: 'Entegrasyon Görüşmesi' },
          { key: 'COMPLETED', label: 'Tamamlandı' },
          { key: 'REJECTED', label: 'Reddedildi' },
        ].map((tab) => {
          const count = (statusCounts as any)[tab.key] || 0;
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Firma adı, yetkili, e-posta, telefon veya firma türüne göre ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Applications List */}
      {loading && applications.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-sky-400" />
          <p className="text-sm">Başvurular yükleniyor...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80">
          <Handshake size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300 mb-1">Başvuru Bulunamadı</h3>
          <p className="text-sm text-slate-500">
            {selectedStatus === 'ALL'
              ? 'Henüz gelen teknoloji partnerliği başvurusu bulunmuyor.'
              : 'Seçili filtreye uygun başvuru bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Main Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                    >
                      {st.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {app.company_type}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(app.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-bold text-white truncate">{app.company_name}</h3>
                    {app.website && (
                      <a
                        href={app.website.startsWith('http') ? app.website : `https://${app.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        {app.website}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-500" />
                      {app.contact_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-slate-500" />
                      {app.email}
                    </span>
                    {app.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-500" />
                        {app.phone}
                      </span>
                    )}
                    {app.customer_count && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Building2 size={12} />
                        {app.customer_count}
                      </span>
                    )}
                  </div>

                  {app.integration_idea && (
                    <p className="mt-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 line-clamp-2">
                      <span className="text-slate-400 font-semibold">Entegrasyon Fikri: </span>
                      {app.integration_idea}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleQuickStatusChange(app.id, e.target.value as PartnerStatus)}
                    className="text-xs bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="NEW">Yeni</option>
                    <option value="REVIEWING">İnceleniyor</option>
                    <option value="CONTACTED">İletişime Geçildi</option>
                    <option value="INTEGRATION_DISCUSSION">Entegrasyon Görüşmesi</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="REJECTED">Reddedildi</option>
                  </select>

                  {/* View Details / Notes Button */}
                  <button
                    onClick={() => openDetailModal(app)}
                    className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                    title="Detayları ve Notları Görüntüle"
                  >
                    <Edit3 size={15} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Başvuruyu Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Note Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Partnerlik Başvurusu Detayları"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Info */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{selectedApp.company_name}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: STATUS_CONFIG[selectedApp.status]?.bg,
                    color: STATUS_CONFIG[selectedApp.status]?.color,
                  }}
                >
                  {STATUS_CONFIG[selectedApp.status]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3">
                <div>
                  <span className="text-slate-500 block">Yetkili Kişi</span>
                  <span className="text-white font-medium">{selectedApp.contact_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Firma Türü</span>
                  <span className="text-white font-medium">{selectedApp.company_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">E-posta</span>
                  <a href={`mailto:${selectedApp.email}`} className="text-sky-400 hover:underline">
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Telefon</span>
                  <span className="text-white">{selectedApp.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Web Sitesi</span>
                  {selectedApp.website ? (
                    <a
                      href={selectedApp.website.startsWith('http') ? selectedApp.website : `https://${selectedApp.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {selectedApp.website} <ExternalLink size={10} />
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Müşteri Sayısı</span>
                  <span className="text-emerald-400 font-semibold">{selectedApp.customer_count || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Faaliyet Gösterilen Ülkeler</span>
                  <span className="text-white">{selectedApp.countries || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Başvuru Tarihi</span>
                  <span className="text-white">
                    {new Date(selectedApp.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Entegrasyon Fikri */}
            {selectedApp.integration_idea && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Workflow size={14} />
                  Entegrasyon Vizyonu / Düşüncesi
                </h4>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.integration_idea}
                </p>
              </div>
            )}

            {/* Mesaj */}
            {selectedApp.message && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Başvuru Mesajı
                </h4>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.message}
                </p>
              </div>
            )}

            {/* Status Update & Internal Notes Form */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Başvuru Durumu
                </label>
                <select
                  value={noteStatus}
                  onChange={(e) => setNoteStatus(e.target.value as PartnerStatus)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="NEW">Yeni</option>
                  <option value="REVIEWING">İnceleniyor</option>
                  <option value="CONTACTED">İletişime Geçildi</option>
                  <option value="INTEGRATION_DISCUSSION">Entegrasyon Görüşmesi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="REJECTED">Reddedildi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dahili Yönetici Notları
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Görüşme notları, teknik değerlendirmeler, yetkili ile yapılan aramalar..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>Bilgiler başarıyla kaydedildi.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveModal}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all disabled:opacity-50 flex items-center gap-1.5"
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

export default AdminPartnerApplicationsPage;
