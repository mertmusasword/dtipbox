import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { QrCode, Table, Business } from '../../types';
import { Modal } from '../../components/Modal';
import { QrModal } from '../../components/QrModal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  Plus,
  Trash2,
  Eye,
  QrCode as QrIcon,
  UtensilsCrossed,
  Building2,
  Wifi,
  Sparkles,
  Tag,
  Users,
  BarChart3,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
  Settings2,
  Star,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../i18n';

interface SmartQrConfig {
  id: string;
  business_id: string;
  is_smart_enabled: boolean;
  enable_tips: boolean;
  enable_menu?: boolean;
  menu_url?: string | null;
  menu_title?: string | null;
  enable_wifi: boolean;
  wifi_ssid?: string | null;
  wifi_password?: string | null;
  wifi_encryption?: string;
  enable_campaigns: boolean;
  enable_feedback: boolean;
  google_review_url?: string | null;
  enable_signup: boolean;
  signup_title?: string | null;
  signup_reward?: string | null;
  welcome_message?: string | null;
}

interface SmartCampaign {
  id: string;
  title: string;
  description?: string | null;
  badge?: string | null;
  discount_code?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}

interface CustomerLead {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  consent_marketing: boolean;
  consent_at: string;
  created_at: string;
}

interface SmartAnalytics {
  scans: number;
  tipClicks: number;
  tipsCompleted: number;
  menuClicks?: number;
  wifiClicks: number;
  campaignClicks: number;
  feedbackSubmissions: number;
  averageRating: number;
  totalLeads: number;
}

export const QrCodesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatDate, language } = useLanguage();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'qrcodes' | 'config' | 'campaigns' | 'leads' | 'analytics'>('qrcodes');

  // Base QR State
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);

  // Smart QR Config State
  const [smartConfig, setSmartConfig] = useState<SmartQrConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<SmartCampaign[]>([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    badge: 'Fırsat',
    discount_code: '',
    expires_at: '',
    is_active: true,
  });

  // Leads State
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState<SmartAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const isTr = language === 'tr';

  // Load all initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [qrRes, tblRes, bizRes, configRes] = await Promise.all([
        api.get('/business/qr'),
        api.get('/business/tables'),
        api.get('/business'),
        api.get('/smart-qr/config').catch(() => ({ data: { data: null } })),
      ]);

      setQrCodes(qrRes.data.data || []);
      setTables(tblRes.data.data || []);
      setBusiness(bizRes.data.data || null);
      if (configRes.data.data) {
        setSmartConfig(configRes.data.data);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === 'campaigns') {
      api.get('/smart-qr/campaigns')
        .then((res) => setCampaigns(res.data.data || []))
        .catch(() => {});
    } else if (activeTab === 'leads') {
      setLoadingLeads(true);
      api.get('/smart-qr/leads')
        .then((res) => setLeads(res.data.data || []))
        .catch(() => {})
        .finally(() => setLoadingLeads(false));
    } else if (activeTab === 'analytics') {
      setLoadingAnalytics(true);
      api.get('/smart-qr/analytics')
        .then((res) => setAnalytics(res.data.data?.metrics || null))
        .catch(() => {})
        .finally(() => setLoadingAnalytics(false));
    }
  }, [activeTab]);

  // Handle Save Smart QR Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartConfig) return;
    setSavingConfig(true);
    try {
      const res = await api.put('/smart-qr/config', smartConfig);
      setSmartConfig(res.data.data);
      showToast(isTr ? 'Smart QR ayarları kaydedildi' : 'Smart QR settings saved successfully');
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Save Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);
    try {
      const res = await api.post('/smart-qr/campaigns', {
        title: campaignForm.title.trim(),
        description: campaignForm.description.trim() || undefined,
        badge: campaignForm.badge.trim() || undefined,
        discount_code: campaignForm.discount_code.trim() || undefined,
        expires_at: campaignForm.expires_at ? new Date(campaignForm.expires_at).toISOString() : undefined,
        is_active: campaignForm.is_active,
      });
      setCampaigns((prev) => [res.data.data, ...prev]);
      setIsCampaignModalOpen(false);
      setCampaignForm({
        title: '',
        description: '',
        badge: 'Fırsat',
        discount_code: '',
        expires_at: '',
        is_active: true,
      });
      showToast(isTr ? 'Kampanya başarıyla eklendi' : 'Campaign created successfully');
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Handle Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.delete(`/smart-qr/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showToast(isTr ? 'Kampanya silindi' : 'Campaign deleted');
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  // Download Leads CSV
  const handleDownloadLeadsCsv = () => {
    if (!leads.length) return;
    const headers = ['Ad Soyad', 'E-posta', 'Telefon', 'KVKK İzni', 'Kayıt Tarihi'];
    const rows = leads.map((l) => [
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      l.consent_marketing ? 'EVET' : 'HAYIR',
      `"${new Date(l.created_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `naponi-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Create Base QR
  const handleCreateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/business/qr', {
        table_id: selectedTableId || undefined,
        type: 'DTIPBOX',
      });
      setIsCreateModalOpen(false);
      setSelectedTableId('');
      showToast(t('common.success'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  // Handle Delete Base QR
  const handleDeleteQr = async (qr: QrCode) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.delete(`/business/qr/${qr.id}`);
      showToast(t('common.success'));
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {isTr ? 'Smart QR & Masalar' : 'Smart QR & Tables'}
            </h1>
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                color: '#a5b4fc',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} /> Naponi Smart Engine
            </span>
          </div>
          <p className="page-subtitle mb-0">
            {isTr
              ? 'Masadaki tek QR üzerinden bahşiş toplayın, misafir Wi-Fi paylaşın, indirim kuponları sunun ve sadık müşteri veritabanı oluşturun.'
              : 'Turn table QR codes into a multi-service hospitality hub: collect tips, share guest Wi-Fi, run promos, and capture leads.'}
          </p>
        </div>

        {activeTab === 'qrcodes' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} /> {t('business.generateQrBtn')}
            </button>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setIsCampaignModalOpen(true)}>
              <Plus size={16} /> {isTr ? 'Yeni Kampanya Ekle' : 'Add Campaign'}
            </button>
          </div>
        )}

        {activeTab === 'leads' && leads.length > 0 && (
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={handleDownloadLeadsCsv}>
              <Download size={16} /> {isTr ? 'CSV Olarak İndir' : 'Export CSV'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('qrcodes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.1rem',
            background: activeTab === 'qrcodes' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'qrcodes' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'qrcodes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            whiteSpace: 'nowrap',
          }}
        >
          <QrIcon size={16} />
          <span>{isTr ? 'QR Kodlarım & Masalar' : 'My QR Codes'}</span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {qrCodes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.1rem',
            background: activeTab === 'config' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'config' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'config' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            whiteSpace: 'nowrap',
          }}
        >
          <Settings2 size={16} />
          <span>{isTr ? 'Smart Modüller & Wi-Fi' : 'Smart Modules & Wi-Fi'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.1rem',
            background: activeTab === 'campaigns' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'campaigns' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'campaigns' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            whiteSpace: 'nowrap',
          }}
        >
          <Tag size={16} />
          <span>{isTr ? 'Kampanyalar & Fırsatlar' : 'Promos & Offers'}</span>
          {campaigns.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {campaigns.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.1rem',
            background: activeTab === 'leads' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'leads' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'leads' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={16} />
          <span>{isTr ? 'Müşteri Veritabanı (Leads)' : 'Guest Leads'}</span>
          {leads.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: 'rgba(52, 211, 153, 0.2)',
                color: '#34d399',
              }}
            >
              {leads.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.1rem',
            background: activeTab === 'analytics' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            whiteSpace: 'nowrap',
          }}
        >
          <BarChart3 size={16} />
          <span>{isTr ? 'Smart Analitik' : 'Analytics'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BASE QR CODES & TABLES */}
      {/* ========================================================================= */}
      {activeTab === 'qrcodes' && (
        <div className="glass-card">
          {loading ? (
            <LoadingState compact message={t('common.loading')} />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : qrCodes.length === 0 ? (
            <EmptyState
              icon={<QrIcon size={28} />}
              title={isTr ? 'Henüz QR kod oluşturulmadı' : 'No QR codes generated yet'}
              description={
                isTr
                  ? 'Mekanınızın geneli veya masalarınız için QR kod oluşturarak bahşiş ve akıllı hizmetleri hemen başlatın.'
                  : 'Create a general business QR or individual table QR to start receiving tips.'
              }
              action={
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={16} /> {t('business.generateQrBtn')}
                </button>
              }
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-view table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isTr ? 'Tür' : 'Type'}</th>
                      <th>{isTr ? 'Hedef / Masa' : 'Destination'}</th>
                      <th>{isTr ? 'Smart Durumu' : 'Smart Status'}</th>
                      <th>{isTr ? 'QR Token' : 'Public Token'}</th>
                      <th>{t('common.date')}</th>
                      <th className="text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                            {qr.table ? t('business.qrTypeTable') : t('business.qrTypeGeneral')}
                          </span>
                        </td>
                        <td className="font-bold">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            {qr.table ? (
                              <UtensilsCrossed size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            ) : (
                              <Building2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                            )}
                            <span>{qr.table?.name || business?.name || 'General Pool'}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              color: smartConfig?.is_smart_enabled ? '#34d399' : 'var(--text-muted)',
                              fontWeight: 600,
                            }}
                          >
                            <Sparkles size={13} />
                            {smartConfig?.is_smart_enabled
                              ? isTr
                                ? 'Smart Hub Aktif'
                                : 'Smart Active'
                              : isTr
                              ? 'Yalnızca Bahşiş'
                              : 'Tips Only'}
                          </span>
                        </td>
                        <td>
                          <code className="code-tag">{qr.public_token}</code>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(qr.created_at)}
                        </td>
                        <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                          <div className="inline-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedQr(qr)}
                              title={isTr ? 'QR Tasarla & Yazdır' : 'Design & Print QR'}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={14} /> <span>{isTr ? 'Tasarla & Yazdır' : 'Design & Print'}</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteQr(qr)}
                              title={t('common.delete')}
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

              {/* Mobile Card List View */}
              <div className="mobile-cards-view">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="mobile-card-item">
                    <div className="mobile-card-header">
                      <span className={`badge ${qr.table ? 'badge-info' : 'badge-success'}`}>
                        {qr.table ? t('business.qrTypeTable') : t('business.qrTypeGeneral')}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatDate(qr.created_at)}
                      </span>
                    </div>

                    <div className="mobile-card-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {qr.table ? (
                          <UtensilsCrossed size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                        ) : (
                          <Building2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />
                        )}
                        <span className="font-bold" style={{ fontSize: '1.05rem', color: '#ffffff' }}>
                          {qr.table?.name || business?.name || 'General Pool'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token:</span>
                        <code className="code-tag" style={{ fontSize: '0.78rem' }}>{qr.public_token}</code>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setSelectedQr(qr)}
                      >
                        <Eye size={16} />
                        <span>{isTr ? 'QR Tasarla & Baskı Al' : 'Design & Print QR'}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon-only"
                        onClick={() => handleDeleteQr(qr)}
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SMART QR MODULES & WI-FI CONFIG */}
      {/* ========================================================================= */}
      {activeTab === 'config' && smartConfig && (
        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Master Toggle Banner */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              border: smartConfig.is_smart_enabled ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: smartConfig.is_smart_enabled
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04))'
                : 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  {isTr ? 'Naponi Smart Hub' : 'Naponi Smart Hub'}
                </h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {isTr
                  ? 'Açık olduğunda, masadaki QR kod bahşişin yanı sıra Wi-Fi, Fırsatlar ve Yorumlar içeren çok fonksiyonlu karşılama hub’ına dönüşür.'
                  : 'When enabled, the table QR opens a multi-feature hospitality hub including Wi-Fi, offers, and feedback alongside digital tipping.'}
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={smartConfig.is_smart_enabled}
                onChange={(e) => setSmartConfig({ ...smartConfig, is_smart_enabled: e.target.checked })}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {smartConfig.is_smart_enabled ? (isTr ? 'Aktif' : 'Active') : (isTr ? 'Pasif' : 'Inactive')}
              </span>
            </label>
          </div>

          {/* Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Module 1: Tipping */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrIcon size={18} style={{ color: 'var(--accent-primary)' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'Dijital Bahşiş Modülü' : 'Digital Tipping'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={smartConfig.enable_tips}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_tips: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isTr
                  ? 'Müşteriler kart veya dijital cüzdanla garsonlara / işletme havuzuna anında bahşiş bırakabilir.'
                  : 'Guests can instantly leave tips to staff or pool using cards and digital wallets.'}
              </p>
            </div>

            {/* Module 2: Digital Menu */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UtensilsCrossed size={18} style={{ color: '#10b981' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'Dijital Menü Entegrasyonu' : 'Digital Menu Integration'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(smartConfig.enable_menu)}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_menu: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {isTr
                  ? 'Mevcut dijital menünüzün (FineDine, Menulux, web sitesi veya PDF) linkini ekleyin. Masada tek bir QR ile hem menü açılsın hem bahşiş verilsin.'
                  : 'Link your existing digital menu (FineDine, Menulux, website, or PDF). Eliminate duplicate table stands with a unified QR.'}
              </p>

              {smartConfig.enable_menu && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'Menü Linki (URL) *' : 'Digital Menu URL *'}
                    </label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://menu.mekaniniz.com veya https://finedine.co/..."
                      value={smartConfig.menu_url || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, menu_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'Menü Buton Başlığı (İsteğe Bağlı)' : 'Button Label (Optional)'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder={isTr ? 'Örn: Dijital Menü / Menüyü Gör' : 'e.g. View Menu'}
                      value={smartConfig.menu_title || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, menu_title: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Module 3: Wi-Fi */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wifi size={18} style={{ color: '#38bdf8' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'Misafir Wi-Fi Paylaşımı' : 'Guest Wi-Fi Access'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={smartConfig.enable_wifi}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_wifi: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {isTr
                  ? 'Müşteriler garsona şifre sormadan tek tıkla şifreyi kopyalar ve internete bağlanır.'
                  : 'Guests copy Wi-Fi passwords with one tap and connect seamlessly without asking staff.'}
              </p>

              {smartConfig.enable_wifi && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'Wi-Fi Ağ Adı (SSID)' : 'Wi-Fi Network Name (SSID)'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Örn: Naponi_Guest"
                      value={smartConfig.wifi_ssid || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, wifi_ssid: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'Wi-Fi Şifresi' : 'Wi-Fi Password'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Örn: guest2026"
                      value={smartConfig.wifi_password || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, wifi_password: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Module 3: Campaigns */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={18} style={{ color: '#f59e0b' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'Kampanyalar & Fırsatlar' : 'Promos & Specials'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={smartConfig.enable_campaigns}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_campaigns: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isTr
                  ? 'Günün indirimli menüleri, kupon kodları veya ikram promosyonları masada müşteriye listelenir.'
                  : 'Highlight daily specials, discount codes, or complimentary treats directly on table QR.'}
              </p>
            </div>

            {/* Module 4: Feedback */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={18} style={{ color: '#fbbf24' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'Anlık Müşteri Değerlendirmesi' : 'Customer Feedback'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={smartConfig.enable_feedback}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_feedback: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isTr
                  ? 'Müşteri bahşiş vermese bile masadan 1-5 yıldız puan ve özel yorum bırakabilir; geri bildirimler doğrudan panelinize düşer.'
                  : 'Guests can leave 1-5 star ratings and reviews from the table even without leaving a tip.'}
              </p>

              {smartConfig.enable_feedback && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
                    <Sparkles size={14} style={{ color: '#fbbf24' }} />
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                      {isTr ? 'Google Haritalar Yorum Linki (Akıllı İtibar Kalkanı)' : 'Google Maps Review URL (Smart Reputation Shield)'}
                    </label>
                  </div>
                  <input
                    type="url"
                    className="input"
                    placeholder="Örn: https://g.page/r/.../review veya Google Haritalar linki"
                    value={smartConfig.google_review_url || ''}
                    onChange={(e) => setSmartConfig({ ...smartConfig, google_review_url: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.45rem 0 0', lineHeight: 1.45 }}>
                    {isTr
                      ? '⭐ 5 yıldız veren misafirler tek tıkla doğrudan Google Haritalar profilinize yönlendirilir. 1-3 yıldız veren memnuniyetsiz misafirler ise Google\'a yansıtılmadan sadece panelinize özel geri bildirim olarak düşer.'
                      : '⭐ Guests rating 5 stars are prompted to post verified Google reviews. Ratings of 1-3 stars are kept private and sent directly to your manager inbox.'}
                  </p>
                </div>
              )}
            </div>

            {/* Module 5: Customer Lead Capture */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={18} style={{ color: '#ec4899' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {isTr ? 'VIP Müşteri Kaydı (Lead Capture)' : 'VIP Customer Signup'}
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={smartConfig.enable_signup}
                  onChange={(e) => setSmartConfig({ ...smartConfig, enable_signup: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {isTr
                  ? 'Müşteriler sonraki ziyaretlerinde ikram veya indirim kazanmak için e-posta/telefon bırakır (KVKK izinli).'
                  : 'Capture guest emails or phone numbers with explicit consent for SMS/email newsletters and loyalty perks.'}
              </p>

              {smartConfig.enable_signup && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'Form Başlığı' : 'Headline'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Örn: Ayrıcalık Kulübümüze Katılın"
                      value={smartConfig.signup_title || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, signup_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTr ? 'İkram / Teşvik Açıklaması' : 'Reward Description'}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Örn: Bir sonraki ziyaretinizde kahve veya tatlı ikramı kazanın!"
                      value={smartConfig.signup_reward || ''}
                      onChange={(e) => setSmartConfig({ ...smartConfig, signup_reward: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={savingConfig} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              <CheckCircle2 size={16} />
              <span>{savingConfig ? t('common.loading') : isTr ? 'Ayarları Kaydet' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPAIGNS & PROMOTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="glass-card">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Tag size={28} />}
              title={isTr ? 'Henüz aktif bir kampanya yok' : 'No active campaigns yet'}
              description={
                isTr
                  ? 'Masadaki QR kodda müşterilere özel indirim kuponları, günün tatlısı fırsatı veya dönemsel kampanyalar ekleyin.'
                  : 'Add table discount codes, seasonal treats, or special offers displayed right inside your Smart QR.'
              }
              action={
                <button className="btn btn-primary" onClick={() => setIsCampaignModalOpen(true)}>
                  <Plus size={16} /> {isTr ? 'Yeni Kampanya Ekle' : 'Add Campaign'}
                </button>
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', padding: '0.5rem' }}>
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {camp.badge || 'Fırsat'}
                      </span>
                      <span className={`badge ${camp.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {camp.is_active ? (isTr ? 'Aktif' : 'Active') : (isTr ? 'Pasif' : 'Inactive')}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 700 }}>
                      {camp.title}
                    </h4>

                    {camp.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        {camp.description}
                      </p>
                    )}

                    {camp.discount_code && (
                      <div
                        style={{
                          background: 'rgba(15, 23, 42, 0.5)',
                          border: '1px dashed rgba(255, 255, 255, 0.15)',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#a5b4fc',
                        }}
                      >
                        <span>{isTr ? 'KOD:' : 'CODE:'}</span>
                        <code>{camp.discount_code}</code>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {camp.expires_at ? `${isTr ? 'Bitiş:' : 'Expires:'} ${formatDate(camp.expires_at)}` : (isTr ? 'Süresiz' : 'No Expiry')}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteCampaign(camp.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER LEADS & CRM */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="glass-card">
          {loadingLeads ? (
            <LoadingState compact message={t('common.loading')} />
          ) : leads.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title={isTr ? 'Henüz müşteri kaydı bulunmuyor' : 'No guest leads collected yet'}
              description={
                isTr
                  ? 'Masadaki Smart QR üzerinden misafirleriniz ikram veya duyurular için iletişim bilgilerini bıraktıkça burada listelenecektir.'
                  : 'Guests who register via your Smart QR for loyalty perks and offers will appear here.'
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isTr ? 'Müşteri Adı' : 'Guest Name'}</th>
                    <th>{isTr ? 'E-posta' : 'Email'}</th>
                    <th>{isTr ? 'Telefon' : 'Phone'}</th>
                    <th>{isTr ? 'Pazarlama İzni' : 'Consent'}</th>
                    <th>{isTr ? 'Kayıt Tarihi' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td className="font-bold">{l.name || (isTr ? 'İsimsiz Misafir' : 'Anonymous Guest')}</td>
                      <td>{l.email ? <a href={`mailto:${l.email}`} style={{ color: '#38bdf8' }}>{l.email}</a> : '—'}</td>
                      <td>{l.phone ? <a href={`tel:${l.phone}`} style={{ color: '#a5b4fc' }}>{l.phone}</a> : '—'}</td>
                      <td>
                        <span className={`badge ${l.consent_marketing ? 'badge-success' : 'badge-warning'}`}>
                          {l.consent_marketing ? (isTr ? 'KVKK / Onaylı' : 'Consented') : (isTr ? 'Onaysız' : 'No Consent')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatDate(l.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SMART QR ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div>
          {loadingAnalytics ? (
            <LoadingState compact message={t('common.loading')} />
          ) : !analytics ? (
            <EmptyState
              icon={<BarChart3 size={28} />}
              title={isTr ? 'Analitik verisi hazırlanıyor' : 'Analytics are being gathered'}
              description={isTr ? 'QR kodlarınız okutuldukça etkileşimler burada gerçek zamanlı gösterilir.' : 'Scan stats will appear here.'}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Toplam QR Taraması' : 'Total QR Scans'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                  {analytics.scans}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Bahşiş Sayfası Tıklaması' : 'Tip Flow Starts'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                  {analytics.tipClicks}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Tamamlanan Bahşişler' : 'Tips Completed'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                  {analytics.tipsCompleted}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Menü İncelemeleri' : 'Menu Views'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                  {analytics.menuClicks || 0}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Wi-Fi Bağlantı İsteği' : 'Wi-Fi Connects'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                  {analytics.wifiClicks}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Kampanya İncelemeleri' : 'Promo Views'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                  {analytics.campaignClicks}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Toplanan Müşteri (Leads)' : 'Captured Leads'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', marginTop: '0.25rem' }}>
                  {analytics.totalLeads}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isTr ? 'Ortalama Memnuniyet' : 'Average Rating'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                  {analytics.averageRating} ★
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Generate Base QR Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('business.generateQrBtn')}>
        <form onSubmit={handleCreateQr}>
          <div className="form-group">
            <label className="form-label">{t('business.tablesTitle')}</label>
            <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="form-select">
              <option value="">{t('business.qrTypeGeneral')}</option>
              {tables.map((tbl) => (
                <option key={tbl.id} value={tbl.id}>{tbl.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">{t('business.generateQrBtn')}</button>
          </div>
        </form>
      </Modal>

      {/* Add Campaign Modal */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title={isTr ? 'Yeni Fırsat / Kampanya Tanımla' : 'Add New Promo / Campaign'}
      >
        <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">{isTr ? 'Kampanya Başlığı *' : 'Campaign Title *'}</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Örn: Tatlı Menüsünde %20 İndirim"
              value={campaignForm.title}
              onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">{isTr ? 'Rozet / Etiket' : 'Badge Tag'}</label>
            <input
              type="text"
              className="input"
              placeholder="Örn: Günün Fırsatı, %15 İndirim, Şefin Seçimi"
              value={campaignForm.badge}
              onChange={(e) => setCampaignForm({ ...campaignForm, badge: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">{isTr ? 'Açıklama (İsteğe Bağlı)' : 'Description (Optional)'}</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Örn: İki ana yemek siparişinize özel tatlı menümüz indirimli servis edilir."
              value={campaignForm.description}
              onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">{isTr ? 'Kupon / Promosyon Kodu' : 'Discount / Promo Code'}</label>
            <input
              type="text"
              className="input"
              placeholder="Örn: NAPONI20"
              value={campaignForm.discount_code}
              onChange={(e) => setCampaignForm({ ...campaignForm, discount_code: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">{isTr ? 'Son Geçerlilik Tarihi' : 'Expiration Date'}</label>
            <input
              type="date"
              className="input"
              value={campaignForm.expires_at}
              onChange={(e) => setCampaignForm({ ...campaignForm, expires_at: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCampaignModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={savingCampaign} className="btn btn-primary">
              {savingCampaign ? t('common.loading') : isTr ? 'Kampanyayı Yayınla' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View / Download / Customize QR Modal */}
      {selectedQr && business && (
        <QrModal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          publicToken={selectedQr.public_token}
          businessName={business.name}
          tableName={selectedQr.table?.name}
          businessLogo={business.logo || null}
        />
      )}
    </div>
  );
};
