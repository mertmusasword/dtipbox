import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import {
  PosCatalogItem,
  PosConnectionItem,
  PosEmployeeMappingItem,
  Employee,
} from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import {
  Cpu,
  RefreshCw,
  Plus,
  Search,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Users,
  Building2,
  Key,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Lock,
  ChevronRight,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '../../i18n';

export const PosIntegrationsPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // Data states
  const [connections, setConnections] = useState<PosConnectionItem[]>([]);
  const [catalog, setCatalog] = useState<PosCatalogItem[]>([]);
  const [businessEmployees, setBusinessEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab: 'connections' | 'catalog'
  const [activeTab, setActiveTab] = useState<'connections' | 'catalog'>('connections');

  // Filter & Search
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PosCatalogItem | null>(null);
  const [connectForm, setConnectForm] = useState<Record<string, any>>({});
  const [connecting, setConnecting] = useState(false);

  // Syncing state (track per connection ID)
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Staff mapping modal
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [activeConnectionForMapping, setActiveConnectionForMapping] = useState<PosConnectionItem | null>(null);
  const [currentMappings, setCurrentMappings] = useState<PosEmployeeMappingItem[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);

  // Unlisted POS request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    providerName: '',
    country: 'TR',
    website: '',
    notes: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // 1. Fetch data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [connRes, catRes, empRes] = await Promise.all([
        api.get('/pos/connections'),
        api.get('/pos/providers'),
        api.get('/business/employees').catch(() => ({ data: { data: [] } })),
      ]);

      const conns = connRes.data.data || [];
      const cats = catRes.data.data || [];
      const emps = empRes.data.data || [];

      setConnections(conns);
      setCatalog(cats);
      setBusinessEmployees(emps);

      // Default to catalog tab if no active connections yet
      if (conns.length === 0) {
        setActiveTab('catalog');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'POS entegrasyonları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Connect POS
  const handleOpenConnect = (item: PosCatalogItem) => {
    setSelectedProvider(item);
    // Initialize default credentials
    const defaults: Record<string, any> = {};
    if (item.id === 'mock_pos') {
      defaults.apiKey = 'mock_sandbox_key_123';
      defaults.locationName = 'Main Dining Room & Terrace';
    } else {
      item.required_credentials.forEach((f) => {
        defaults[f.key] = '';
      });
    }
    setConnectForm(defaults);
    setShowConnectModal(true);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    try {
      setConnecting(true);
      const res = await api.post('/pos/connections', {
        provider: selectedProvider.id,
        credentials: connectForm,
        locationName: connectForm.locationName || 'Main Store',
      });

      showToast(res.data.data?.message || `${selectedProvider.display_name} başarıyla bağlandı!`);
      setShowConnectModal(false);
      setActiveTab('connections');
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Bağlantı kurulamadı.', 'error');
    } finally {
      setConnecting(false);
    }
  };

  // 3. Disconnect POS
  const handleDisconnect = async (connectionId: string, providerName: string) => {
    if (!confirm(`${providerName} bağlantısını sonlandırmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/pos/connections/${connectionId}`);
      showToast(`${providerName} bağlantısı sonlandırıldı.`);
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Bağlantı kesilemedi.', 'error');
    }
  };

  // 4. Trigger Sync
  const handleSync = async (connectionId: string) => {
    try {
      setSyncingId(connectionId);
      const res = await api.post(`/pos/connections/${connectionId}/sync`);
      const data = res.data.data;
      showToast(
        data?.message ||
          `Senkronizasyon başarılı: ${data?.tipsImported || 0} bahşiş kaydı aktarıldı!`
      );
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Senkronizasyon başarısız oldu.', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  // 5. Open Mapping Modal
  const handleOpenMapping = async (conn: PosConnectionItem) => {
    setActiveConnectionForMapping(conn);
    setMappingModalOpen(true);
    try {
      setLoadingMappings(true);
      const res = await api.get(`/pos/connections/${conn.id}/employees`);
      setCurrentMappings(res.data.data?.mappings || []);
    } catch (err: any) {
      showToast('Personel eşleştirmeleri yüklenemedi.', 'error');
    } finally {
      setLoadingMappings(false);
    }
  };

  // 6. Update Staff Mapping
  const handleMapEmployee = async (externalEmployeeId: string, employeeId: string | null) => {
    if (!activeConnectionForMapping) return;

    try {
      await api.put(`/pos/connections/${activeConnectionForMapping.id}/employees/map`, {
        externalEmployeeId,
        employeeId: employeeId || null,
      });

      // Update local mappings state
      setCurrentMappings((prev) =>
        prev.map((m) =>
          m.external_employee_id === externalEmployeeId
            ? {
                ...m,
                employee_id: employeeId || null,
                employee: employeeId
                  ? businessEmployees.find((e) => e.id === employeeId) || null
                  : null,
              }
            : m
        )
      );

      showToast('Personel eşleştirmesi güncellendi.');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Eşleştirme güncellenemedi.', 'error');
    }
  };

  // 7. Submit Custom POS Request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingRequest(true);
      await api.post('/pos/request', requestForm);
      showToast('POS entegrasyon talebiniz alındı. Mühendislik ekibimiz inceleyecektir.');
      setShowRequestModal(false);
      setRequestForm({
        providerName: '',
        country: 'TR',
        website: '',
        notes: '',
      });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Talep iletilemedi.', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Catalog filtering
  const filteredCatalog = catalog.filter((item) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.display_name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.region_label.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Region / Country Filter
    if (selectedRegion === 'ALL') return true;
    if (selectedRegion === 'GLOBAL') return item.is_global || item.countries.includes('*');
    return item.countries.includes(selectedRegion) || item.countries.includes('*');
  });

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="POS Entegrasyon Katmanı Yükleniyor..." />
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

  return (
    <div className="page-wrapper" style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  padding: '0.6rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Cpu size={24} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  POS & Adisyon Entegrasyonları
                </h1>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#818cf8',
                    background: 'rgba(99, 102, 241, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  Keep Your POS. Add Naponi.
                </span>
              </div>
            </div>

            <p style={{ margin: '0.75rem 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '680px', lineHeight: 1.6 }}>
              Mevcut kasanızı veya POS donanımınızı değiştirmenize gerek yok. Naponi, restoranınızdaki POS sistemiyle
              senkronize olarak masaları, vardiyadaki personeli ve bahşiş akışını otomatik eşleştirir.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              <HelpCircle size={16} />
              Özel POS Talep Et
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Plus size={16} />
              Yeni POS Ekle
            </button>
          </div>
        </div>

        {/* Global Architecture Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '6px', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>AES-256 Şifreli</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>API anahtarları güvenle korunur</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px', borderRadius: '8px' }}>
              <Globe2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Global Uyumluluk</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ABD, Türkiye, AB, Körfez & Asya</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '6px', borderRadius: '8px' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Personel Eşleştirme</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kasa personeli Naponi ile senkron</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '6px', borderRadius: '8px' }}>
              <RefreshCw size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Çift Kanal Destek</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>QR + POS Bahşiş Havuzu bir arada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.75rem',
        }}
      >
        <button
          onClick={() => setActiveTab('connections')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'connections' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'connections' ? '#f8fafc' : '#94a3b8',
            fontSize: '1rem',
            fontWeight: 700,
            padding: '0.75rem 0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Cpu size={18} />
          Bağlı Sistemler
          <span
            style={{
              background: activeTab === 'connections' ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 700,
            }}
          >
            {connections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'catalog' ? '#f8fafc' : '#94a3b8',
            fontSize: '1rem',
            fontWeight: 700,
            padding: '0.75rem 0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={18} />
          Entegrasyon Kataloğu
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 700,
            }}
          >
            {catalog.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CONNECTED SYSTEMS */}
      {activeTab === 'connections' && (
        <div>
          {connections.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Cpu size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#f8fafc', fontSize: '1.25rem' }}>
                Henüz Bağlı Bir POS Sistemi Yok
              </h3>
              <p style={{ margin: '0 auto 1.5rem', color: '#94a3b8', maxWidth: '480px', fontSize: '0.9rem' }}>
                Kullandığınız restoran POS veya adisyon sistemini seçerek bahşiş ve personel senkronizasyonunu hemen başlatın.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                }}
              >
                Katalogdan POS Seç
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div>
                    {/* Header: Name + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818cf8',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                          }}
                        >
                          <Cpu size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                            {conn.providerName}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {conn.locationName || 'Main Location'}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background:
                            conn.status === 'CONNECTED'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : conn.status === 'SYNCING'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            conn.status === 'CONNECTED'
                              ? '#4ade80'
                              : conn.status === 'SYNCING'
                              ? '#60a5fa'
                              : '#f87171',
                          border: `1px solid ${
                            conn.status === 'CONNECTED'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : conn.status === 'SYNCING'
                              ? 'rgba(59, 130, 246, 0.3)'
                              : 'rgba(239, 68, 68, 0.3)'
                          }`,
                        }}
                      >
                        {conn.status}
                      </span>
                    </div>

                    {/* Meta details */}
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '10px',
                        padding: '0.875rem',
                        fontSize: '0.85rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Kimlik Bilgisi:</span>
                        <span style={{ color: '#e2e8f0', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} />
                          {conn.credentialsMasked?.apiKey || '••••••••'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Son Senkronizasyon:</span>
                        <span style={{ color: '#e2e8f0' }}>
                          {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Henüz senkronize edilmedi'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                        <span>Personel Eşleştirmesi:</span>
                        <span style={{ color: conn.mappedEmployeesCount > 0 ? '#4ade80' : '#fbbf24', fontWeight: 600 }}>
                          {conn.mappedEmployeesCount} / {conn.employeeMappingsCount} Eşleşti
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => handleSync(conn.id)}
                      disabled={syncingId === conn.id}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: syncingId === conn.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <RefreshCw size={14} className={syncingId === conn.id ? 'animate-spin' : ''} />
                      {syncingId === conn.id ? 'Eşitleniyor...' : 'Şimdi Senkronize Et'}
                    </button>

                    <button
                      onClick={() => handleOpenMapping(conn)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#e2e8f0',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Users size={14} />
                      Personel
                    </button>

                    <button
                      onClick={() => handleDisconnect(conn.id, conn.providerName)}
                      title="Bağlantıyı Kes"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          {/* Controls: Region tabs & Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="POS sistemi, ülke veya özellik ara (örn: Toast, Simpra, Meituan, Lightspeed, SambaPOS)..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  color: '#f8fafc',
                  fontSize: '0.925rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Region Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {[
                { id: 'ALL', label: 'Tüm Sistemler' },
                { id: 'TR', label: '🇹🇷 Türkiye' },
                { id: 'US', label: '🇺🇸 ABD & Kanada' },
                { id: 'GB', label: '🇬🇧 🇪🇺 Avrupa' },
                { id: 'AE', label: '🇦🇪 Körfez / BAE' },
                { id: 'ID', label: '🇮🇩 Endonezya / Bali' },
                { id: 'JP', label: '🇯🇵 Japonya' },
                { id: 'CN', label: '🇨🇳 Çin' },
                { id: 'GLOBAL', label: '🌐 Global Zincir & Otel' },
              ].map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  style={{
                    background: selectedRegion === reg.id ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
                    color: selectedRegion === reg.id ? '#ffffff' : '#94a3b8',
                    border: '1px solid',
                    borderColor: selectedRegion === reg.id ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '999px',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filteredCatalog.map((item) => {
              const isConnected = connections.some((c) => c.provider === item.id && c.status === 'CONNECTED');

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            background: item.logo_badge || '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '1rem',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {item.display_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                            {item.display_name}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                            {item.region_label}
                          </span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isConnected ? (
                        <span
                          style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={12} /> BAĞLI
                        </span>
                      ) : item.has_adapter ? (
                        <span
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          AKTİF CANLI
                        </span>
                      ) : (
                        <span
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          ÇOK YAKINDA
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>

                    {/* Capabilities Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      {item.capabilities.map((cap) => (
                        <span
                          key={cap}
                          style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            color: '#cbd5e1',
                            fontSize: '0.7rem',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {cap.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connect or Early Access Action */}
                  <div>
                    {isConnected ? (
                      <button
                        onClick={() => setActiveTab('connections')}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        Yönetime Git
                        <ChevronRight size={16} />
                      </button>
                    ) : item.has_adapter ? (
                      <button
                        onClick={() => handleOpenConnect(item)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        <Plus size={16} />
                        Test & Hemen Bağla
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setRequestForm((prev) => ({
                            ...prev,
                            providerName: item.display_name,
                            country: item.countries[0] === '*' ? 'GLOBAL' : item.countries[0],
                          }));
                          setShowRequestModal(true);
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#94a3b8',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Clock size={14} />
                        Erken Erişim Bildirimi Al
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unlisted POS Help Banner */}
          <div
            style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.4rem', color: '#f8fafc', fontSize: '1.15rem', fontWeight: 700 }}>
                Kullandığınız Restoran POS Sistemi Listede Yok mu?
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                Naponi Açık POS Entegrasyon Mimarisi ile dünyanın her yerindeki yerel veya özel adisyon sistemlerine 48 saat içinde özel adaptör geliştirebiliyoruz.
              </p>
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Özel POS Talebi Gönder
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: CONNECT POS MODAL */}
      {showConnectModal && selectedProvider && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: selectedProvider.logo_badge || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>
                    {selectedProvider.display_name} Bağla
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {selectedProvider.region_label}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowConnectModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedProvider.id === 'mock_pos' && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.825rem',
                  color: '#a5b4fc',
                }}
              >
                <strong>Sandbox Test Modu:</strong> Bu mod, canlı restoran POS sistemini taklit eden örnek sipariş, masa ve personel verilerini anında aktararak mimariyi test etmenizi sağlar.
              </div>
            )}

            <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedProvider.required_credentials.map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    {field.label} {field.required && <span style={{ color: '#f87171' }}>*</span>}
                  </label>
                  <input
                    type={field.type === 'password' ? 'password' : 'text'}
                    required={field.required}
                    value={connectForm[field.key] || ''}
                    onChange={(e) =>
                      setConnectForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={`${field.label} giriniz`}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Restoran / Şube Adı
                </label>
                <input
                  type="text"
                  value={connectForm.locationName || ''}
                  onChange={(e) =>
                    setConnectForm((prev) => ({ ...prev, locationName: e.target.value }))
                  }
                  placeholder="Örn: Kadıköy Şubesi / Main Dining"
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={connecting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: connecting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {connecting ? 'Doğrulanıyor...' : 'Bağlantıyı Tamamla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EMPLOYEE MAPPING MODAL */}
      {mappingModalOpen && activeConnectionForMapping && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 700 }}>
                  POS Personel Eşleştirme
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {activeConnectionForMapping.providerName} sisteminden çekilen garson & personeli Naponi kullanıcılarıyla eşleştirin.
                </div>
              </div>
              <button
                onClick={() => setMappingModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingMappings ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <LoadingState message="Personel eşleştirmeleri getiriliyor..." />
              </div>
            ) : currentMappings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                POS sisteminden henüz personel kaydı aktarılmadı. Lütfen önce 'Şimdi Senkronize Et' butonuna tıklayın.
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentMappings.map((mapItem) => (
                  <div
                    key={mapItem.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.55)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>
                        {mapItem.external_employee_name}
                      </div>
                      <div style={{ color: '#818cf8', fontSize: '0.75rem' }}>
                        POS Rolü: {mapItem.external_role || 'Staff'} (ID: {mapItem.external_employee_id})
                      </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                      <select
                        value={mapItem.employee_id || ''}
                        onChange={(e) =>
                          handleMapEmployee(mapItem.external_employee_id, e.target.value || null)
                        }
                        style={{
                          width: '100%',
                          background: 'rgba(30, 41, 59, 0.9)',
                          color: '#f8fafc',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          fontSize: '0.825rem',
                          outline: 'none',
                        }}
                      >
                        <option value="">-- Eşleştirilmedi --</option>
                        {businessEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} {emp.role_title ? `(${emp.role_title})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMappingModalOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOM POS REQUEST MODAL */}
      {showRequestModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>
                  Özel POS Entegrasyon Talebi
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Kullandığınız sistemi bildirin, entegrasyon ekibimiz hızla devreye alsın.
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  POS / Adisyon Yazılımı Adı <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.providerName}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, providerName: e.target.value }))
                  }
                  placeholder="Örn: SambaPOS, Simpra, Meituan, Omnivore..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Ülke Kodu (2 Haneli) <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={requestForm.country}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, country: e.target.value.toUpperCase() }))
                  }
                  placeholder="TR, US, DE, AE, ID, JP..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Yazılım Web Sitesi / Dokümantasyon (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={requestForm.website}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Ek Bilgiler & İhtiyaçlar
                </label>
                <textarea
                  rows={3}
                  value={requestForm.notes}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Hangi şubelerde kullandığınızı veya özel entegrasyon gereksinimlerinizi yazabilirsiniz..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: submittingRequest ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {submittingRequest ? 'Gönderiliyor...' : 'Talep Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
