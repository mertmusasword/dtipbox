import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import {
  PaymentMethodItem,
  PaymentIntegrationItem,
  PaymentProvider,
  ProviderType,
} from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { useToast } from '../../components/Toast';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Globe2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Layers,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Zap,
  Compass,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export const PaymentMethodsPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  // State
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [integrations, setIntegrations] = useState<PaymentIntegrationItem[]>([]);
  const [catalog, setCatalog] = useState<PaymentProvider[]>([]);
  const [businessCountry, setBusinessCountry] = useState<string>('US');
  const [businessCurrency, setBusinessCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideActiveTab, setGuideActiveTab] = useState<'tr' | 'global' | 'asia'>('tr');
  const [guideProviderKey, setGuideProviderKey] = useState<'iyzico' | 'paytr' | 'stripe' | 'square' | 'paypal'>('iyzico');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCurrency, setFilterCurrency] = useState('ALL');

  // Credentials Form state
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Unlisted Provider Request state
  const [requestForm, setRequestForm] = useState({
    providerName: '',
    country: '',
    website: '',
    paymentType: 'VIRTUAL_POS',
    description: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Load business & payments data
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/business'),
      api.get('/business/payment-methods'),
      api.get('/business/payment-providers/integrations'),
      api.get('/business/payment-providers/catalog'),
    ])
      .then(([bizRes, methodsRes, intRes, catRes]) => {
        if (bizRes.data.data) {
          setBusinessCountry(bizRes.data.data.country || 'US');
          setBusinessCurrency(bizRes.data.data.currency || 'USD');
          setRequestForm((prev) => ({ ...prev, country: bizRes.data.data.country || 'US' }));
        }
        setMethods(methodsRes.data.data || []);
        setIntegrations(intRes.data.data || []);
        setCatalog(catRes.data.data || []);
      })
      .catch(() => setError('Failed to load payment channels & providers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle IBAN / Card Payment Method Status
  const handleToggleMethodStatus = async (item: PaymentMethodItem) => {
    if (!item.canActivate && item.status !== 'ACTIVE') {
      showToast(
        item.type === 'IBAN_TRANSFER'
          ? 'Configure your bank account details first before activating Direct Bank Transfer.'
          : 'This payment channel has no verified active provider. Connect and test a provider first.',
        'error'
      );
      return;
    }

    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put('/business/payment-methods', { type: item.type, status: nextStatus });
      showToast(`${item.type === 'IBAN_TRANSFER' ? 'Direct Bank Transfer' : item.type} ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update payment status', 'error');
    }
  };

  // Open credentials modal
  const handleOpenConnect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setTestResult(null);

    // If already integrated, prefill with existing masked credentials
    const existing = integrations.find((i) => i.provider === provider.id);
    const initialValues: Record<string, string> = {};
    if (existing?.credentials) {
      for (const field of provider.required_credentials) {
        if (existing.credentials[field.key]) {
          initialValues[field.key] = existing.credentials[field.key];
        }
      }
    }
    setCredentialValues(initialValues);
    setShowCatalogModal(false);
    setShowCredentialsModal(true);
  };

  // Run Test Connection & Save
  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await api.post(`/business/payment-providers/${selectedProvider.id}/test`, {
        credentials: credentialValues,
      });

      const { success, message, status } = res.data.data;
      setTestResult({ success, message });

      if (success) {
        showToast(t('payments.testSuccessToast'));
        loadData();
      } else {
        showToast(message || t('payments.testFailedToast'), 'error');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || t('payments.testFailedToast');
      setTestResult({ success: false, message: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  // Disconnect integration
  const handleDisconnect = async (providerId: string, providerName: string) => {
    if (!confirm(t('payments.disconnectConfirm'))) return;

    try {
      await api.delete(`/business/payment-providers/${providerId}`);
      showToast(`${providerName} ${t('common.success')}`);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    }
  };

  // Submit unlisted provider request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);

    try {
      await api.post('/business/payment-providers/request', requestForm);
      showToast(t('payments.requestSuccessToast'));
      setShowRequestModal(false);
      setRequestForm({
        providerName: '',
        country: businessCountry,
        website: '',
        paymentType: 'VIRTUAL_POS',
        description: '',
      });
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <LoadingState message={t('common.loading')} />
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

  // Filtered catalog
  const filteredCatalog = catalog.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterType !== 'ALL' && p.type !== filterType) return false;
    if (filterCountry !== 'ALL') {
      const matchCountry =
        p.is_global ||
        p.countries.includes('*') ||
        p.countries.some((c) => c.toUpperCase() === filterCountry.toUpperCase());
      if (!matchCountry) return false;
    }
    if (filterCurrency !== 'ALL') {
      const matchCurr = p.supported_currencies.some((c) => c.toUpperCase() === filterCurrency.toUpperCase());
      if (!matchCurr) return false;
    }
    return true;
  });

  const ibanMethod = methods.find((m) => m.type === 'IBAN_TRANSFER');
  const cardMethod = methods.find((m) => m.type === 'CARD');
  const applePayMethod = methods.find((m) => m.type === 'APPLE_PAY');
  const googlePayMethod = methods.find((m) => m.type === 'GOOGLE_PAY');

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('payments.pageTitle')}</h1>
          <p className="page-subtitle mb-0">
            {t('payments.pageSubtitle')}
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowGuideModal(true)}>
            <BookOpen size={16} /> {t('payments.guideBtn') || 'Entegrasyon Rehberi'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowCatalogModal(true)}>
            <Plus size={16} /> {t('payments.addProviderBtn')}
          </button>
        </div>
      </div>

      {/* QUICK INTEGRATION ADVISORY BANNER */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.1rem 1.35rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <Compass size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {t('payments.guideBannerTitle') || 'Hangi Sağlayıcıyı Seçmelisiniz? Nasıl Bağlanır?'}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {t('payments.guideBannerDesc') || 'Sanal POS bağlama, API anahtarlarını bulma ve 3 adımda doğrudan kartlı bahşiş alma rehberi.'}
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowGuideModal(true)}
          style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <BookOpen size={14} /> {t('payments.guideBtn') || 'Rehberi Aç'} <ArrowRight size={14} />
        </button>
      </div>

      {/* SECTION 1: DIRECT BANK / IBAN SETTLEMENT */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="metric-icon" style={{ color: ibanMethod?.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-primary)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{t('payments.bankTransferTitle')}</h3>
                {ibanMethod?.connectionStatus === 'CONNECTED' ? (
                  <span className="badge badge-info">
                    <CheckCircle2 size={12} /> {t('payments.bankConfigured')}
                  </span>
                ) : (
                  <span className="badge badge-neutral">
                    <XCircle size={12} /> {t('payments.missingBank')}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                {t('payments.bankTransferDesc')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/business/payment-account" className="btn btn-secondary btn-sm">
              {t('payments.configureBankBtn')}
            </Link>
            {ibanMethod && (
              <button
                className={`btn ${ibanMethod.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                disabled={!ibanMethod.canActivate && ibanMethod.status !== 'ACTIVE'}
                onClick={() => handleToggleMethodStatus(ibanMethod)}
                style={{ minWidth: '120px' }}
              >
                {ibanMethod.status === 'ACTIVE' ? t('common.inactive') : t('common.active')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: CONNECTED PAYMENT PROVIDERS & GATEWAYS */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{t('payments.connectedGatewaysTitle')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              {t('payments.connectedGatewaysDesc')}
            </p>
          </div>
        </div>

        {integrations.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <CreditCard size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('payments.noGatewaysTitle')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              {t('payments.noGatewaysDesc')}
            </p>
            <button className="btn btn-primary" onClick={() => setShowCatalogModal(true)}>
              <Plus size={16} /> {t('payments.browseProvidersBtn')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {integrations.map((intItem) => {
              const meta = catalog.find((c) => c.id === intItem.provider);
              const isConnected = intItem.status === 'CONNECTED';
              const isError = intItem.status === 'ERROR';

              // Check if any card/wallet channel is currently active for this business
              const isCardActive = cardMethod?.status === 'ACTIVE';

              return (
                <div
                  key={intItem.id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div className="metric-icon" style={{ color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                            {meta?.display_name || intItem.provider}
                          </h3>
                          <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {meta?.type || 'GATEWAY'}
                          </span>
                          {isConnected ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Connected & Verified
                            </span>
                          ) : isError ? (
                            <span className="badge badge-danger">
                              <AlertCircle size={12} /> Connection Failed
                            </span>
                          ) : (
                            <span className="badge badge-neutral">
                              <XCircle size={12} /> Not Connected
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
                          {meta?.description || 'Payment gateway integration'}
                        </p>
                        {intItem.last_tested_at && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            Last tested: {new Date(intItem.last_tested_at).toLocaleString()}
                          </div>
                        )}
                        {intItem.last_error_message && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.4rem', fontWeight: 500 }}>
                            Error: {intItem.last_error_message}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {meta && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenConnect(meta)}
                          title="Configure API Keys & Run Test"
                        >
                          <RefreshCw size={14} /> Test / Configure
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDisconnect(intItem.provider, meta?.display_name || intItem.provider)}
                        title="Disconnect Integration"
                      >
                        <Trash2 size={14} /> Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Payment Methods Controlled by this Provider */}
                  <div
                    style={{
                      background: 'var(--bg-input)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Acceptance Status (Credit Cards, Apple Pay, Google Pay)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {isConnected
                          ? isCardActive
                            ? '🟢 Publicly Active: Customers can tip with credit cards & 1-touch mobile wallets.'
                            : '🟡 Inactive: Connected and ready, but currently turned OFF for customers.'
                          : '🔴 Unavailable: Connection test must pass before customers can use this channel.'}
                      </div>
                    </div>

                    <div>
                      {cardMethod && (
                        <button
                          className={`btn ${isCardActive ? 'btn-danger' : 'btn-primary'} btn-sm`}
                          disabled={!isConnected}
                          onClick={() => handleToggleMethodStatus(cardMethod)}
                          style={{ minWidth: '130px' }}
                        >
                          {isCardActive ? 'Deactivate Cards' : 'Activate Cards'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD PAYMENT PROVIDER / CATALOG BROWSER */}
      {showCatalogModal && (
        <div className="modal-backdrop" onClick={() => setShowCatalogModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{t('payments.catalogModalTitle')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  {t('payments.catalogModalSubtitle')}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowCatalogModal(false)}>
                &times;
              </button>
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={t('payments.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ALL">{t('payments.allCountries')}</option>
                  <option value={businessCountry}>{t('payments.myCountry')} ({businessCountry})</option>
                  <option value="US">United States (US)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="EU">European Union (EU)</option>
                  <option value="TR">Turkey (TR)</option>
                  <option value="CN">China (CN)</option>
                </select>
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ALL">{t('payments.allTypes')}</option>
                  <option value="CARD">{t('payments.cardGateway')}</option>
                  <option value="VIRTUAL_POS">{t('payments.virtualPos')}</option>
                  <option value="WALLET">{t('payments.digitalWallet')}</option>
                </select>
              </div>
            </div>

            {/* Provider Grid */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCatalog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No providers match your search filters.
                </div>
              ) : (
                filteredCatalog.map((provider) => {
                  const hasLiveAdapter = provider.has_adapter && provider.status === 'ACTIVE';
                  const isConnected = integrations.some((i) => i.provider === provider.id && i.status === 'CONNECTED');

                  return (
                    <div
                      key={provider.id}
                      className="glass-card glass-card-interactive"
                      style={{
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.25rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{provider.display_name}</h4>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                            {provider.type}
                          </span>
                          {hasLiveAdapter ? (
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                              ⚡ Ready to Connect
                            </span>
                          ) : (
                            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                              {provider.status === 'DEVELOPMENT' ? 'In Development' : 'Coming Soon'}
                            </span>
                          )}
                          {isConnected && (
                            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                              Connected
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
                          {provider.description}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Countries: {provider.is_global ? 'Global' : provider.countries.slice(0, 5).join(', ')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Currencies: {provider.supported_currencies.slice(0, 4).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div>
                        {hasLiveAdapter ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenConnect(provider)}
                          >
                            {isConnected ? 'Reconfigure' : 'Connect'}
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" disabled title="Adapter under development">
                            Coming Soon
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Request Unlisted Provider banner */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(99, 102, 241, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('payments.unlistedBannerTitle')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {t('payments.unlistedBannerDesc')}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowCatalogModal(false);
                  setShowRequestModal(true);
                }}
              >
                {t('payments.unlistedBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREDENTIALS & CONNECTION TEST */}
      {showCredentialsModal && selectedProvider && (
        <div className="modal-backdrop" onClick={() => setShowCredentialsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '620px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{t('payments.connectModalTitle')} {selectedProvider.display_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  {t('payments.connectModalSubtitle')}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowCredentialsModal(false)}>
                &times;
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: testResult.success ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: testResult.success ? 'var(--success)' : 'var(--danger)',
                  fontSize: '0.875rem',
                }}
              >
                {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{testResult.message}</div>
              </div>
            )}

            <form onSubmit={handleTestAndSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {selectedProvider.required_credentials.map((field) => {
                const isPassword = field.type === 'password';
                const isVisible = showPasswords[field.key] || false;

                return (
                  <div key={field.key} className="form-group mb-0">
                    <label className="form-label">
                      {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={isPassword && !isVisible ? 'password' : 'text'}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={credentialValues[field.key] || ''}
                        onChange={(e) => setCredentialValues({ ...credentialValues, [field.key]: e.target.value })}
                        className="form-input"
                        style={isPassword ? { paddingRight: '2.5rem' } : {}}
                      />
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !isVisible })}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                    {field.description && (
                      <div className="form-hint" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {field.description}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCredentialsModal(false)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={testingConnection}
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                >
                  {testingConnection ? t('payments.verifyingGateway') : t('payments.testAndSaveBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST UNLISTED PROVIDER */}
      {showRequestModal && (
        <div className="modal-backdrop" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" style={{ maxWidth: '580px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{t('payments.requestModalTitle')}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  {t('payments.requestModalSubtitle')}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group mb-0">
                <label className="form-label">
                  {t('payments.providerNameLabel')} <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paratika, Paynet, Worldpay, Clover, Helcim"
                  value={requestForm.providerName}
                  onChange={(e) => setRequestForm({ ...requestForm, providerName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">
                    Country (ISO) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TR, CA, US, DE, FR"
                    value={requestForm.country}
                    onChange={(e) => setRequestForm({ ...requestForm, country: e.target.value.toUpperCase() })}
                    className="form-input"
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">{t('payments.gatewayTypeLabel')}</label>
                  <select
                    value={requestForm.paymentType}
                    onChange={(e) => setRequestForm({ ...requestForm, paymentType: e.target.value })}
                    className="form-input"
                  >
                    <option value="VIRTUAL_POS">{t('payments.virtualPos')}</option>
                    <option value="CARD">{t('payments.cardGateway')}</option>
                    <option value="WALLET">{t('payments.digitalWallet')}</option>
                    <option value="BANK_TRANSFER">{t('tip.bankTransfer')}</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">{t('payments.websiteLabel')}</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={requestForm.website}
                  onChange={(e) => setRequestForm({ ...requestForm, website: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">{t('payments.notesLabel')}</label>
                <textarea
                  placeholder="Any merchant ID specifications, branches, or notes..."
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="form-input"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={submittingRequest} className="btn btn-primary">
                  {submittingRequest ? t('common.loading') : t('payments.submitRequestBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 4: QUICK INTEGRATION GUIDE (REHBER) */}
      {showGuideModal && (
        <div className="modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>
                    {t('payments.guideModalTitle') || 'İşletmeler İçin Hızlı Entegrasyon Rehberi'}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                    {t('payments.guideModalSubtitle') || 'Aracı havuz olmadan kartlı bahşişleri doğrudan kendi banka/POS hesabınıza aktarın.'}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowGuideModal(false)}>
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
              {/* 1. THREE CORE PRINCIPLES */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="var(--primary)" /> 3 Temel Prensip (Nasıl Çalışır?)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div
                    style={{
                      background: 'var(--bg-input)',
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>
                      <Check size={16} /> 1. Aracı Havuz Yok
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                      Bahşişler doğrudan bağladığınız sanal POS (iyzico, PayTR, Stripe vb.) hesabınıza yatar. Naponi parada günlerce bekleme yapmaz.
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-input)',
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      <ShieldCheck size={16} /> 2. Sıfır Kart Riski
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                      Müşterinizin kart bilgileri Naponi sunucularında asla tutulmaz. Tüm ödemeler PCI-DSS Seviye 1 güvenceli ödeme devleri üzerinden akar.
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-input)',
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#ec4899' }}>
                      <Smartphone size={16} /> 3. Otomatik QR Etkileşimi
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                      Sağlayıcınızı test edip kaydettiğiniz anda işletmenizdeki ve masalarınızdaki tüm QR kodlar kartla bahşişe anında açılır.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. WHICH PROVIDER TO CHOOSE */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe2 size={16} color="var(--primary)" /> Hangi Sağlayıcıyı Seçmeliyim?
                </h4>

                {/* Region Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${guideActiveTab === 'tr' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setGuideActiveTab('tr')}
                  >
                    🇹🇷 Türkiye (TL & Yerel Kartlar)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${guideActiveTab === 'global' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setGuideActiveTab('global')}
                  >
                    🌍 Global / Batı Pazarı (USD, EUR, GBP)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${guideActiveTab === 'asia' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setGuideActiveTab('asia')}
                  >
                    🇨🇳 Asya & Turist Hub'ları
                  </button>
                </div>

                {/* Tab Contents */}
                <div
                  style={{
                    background: 'var(--bg-input)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  {guideActiveTab === 'tr' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div>
                        <strong>🥇 iyzico Sanal POS:</strong> Türkiye'deki en popüler çözümdür. Troy, Maximum, Bonus, Axess vb. tüm yerel kartlar ve yurtdışı kartlar geçerlidir. Bireysel şahıs şirketleri de çok kolay hesap açabilir.
                      </div>
                      <div>
                        <strong>🥈 PayTR Sanal POS:</strong> Rekabetçi komisyon oranları ve ertesi gün nakit ödeme avantajıyla öne çıkar. Hızlı entegrasyon için idealdir.
                      </div>
                    </div>
                  )}

                  {guideActiveTab === 'global' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div>
                        <strong>Stripe:</strong> 40+ ülkede Apple Pay, Google Pay ve tüm küresel kartları tek tıkla kabul etmek için dünyanın altın standardıdır.
                      </div>
                      <div>
                        <strong>Square:</strong> ABD, Kanada, İngiltere ve Avustralya'daki kafe, restoran ve barlar için çok yaygındır.
                      </div>
                      <div>
                        <strong>PayPal:</strong> 200'den fazla ülkede müşterilerin güvenle kullandığı küresel cüzdandır.
                      </div>
                      <div>
                        <strong>Adyen & Moneris:</strong> Kurumsal ölçekteki işletmeler ve Kanada pazarındaki işletmeler için idealdir.
                      </div>
                    </div>
                  )}

                  {guideActiveTab === 'asia' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div>
                        <strong>Alipay Global:</strong> Çinli turistlerin ve Asya-Pasifik seyahatçilerinin ana ödeme yöntemidir. QR kodla anında tahsilat sağlar.
                      </div>
                      <div>
                        <strong>WeChat Pay:</strong> Milyarlarca aktif kullanıcısı olan WeChat ekosisteminin mobil cüzdanıdır. Turistik bölgeler için tavsiye edilir.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. STEP-BY-STEP KEY FINDER */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={16} color="var(--primary)" /> API Anahtarlarımı Nereden Bulurum?
                </h4>

                {/* Provider Selector for Guide */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  {(['iyzico', 'paytr', 'stripe', 'square', 'paypal'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`btn btn-sm ${guideProviderKey === key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                      onClick={() => setGuideProviderKey(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '0.825rem',
                  }}
                >
                  {guideProviderKey === 'iyzico' && (
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li><strong>iyzico Kontrol Paneline</strong> (veya Sandbox test paneline) giriş yapın.</li>
                      <li>Sol menüde yer alan <strong>Ayarlar &rarr; Firma Ayarları</strong> sekmesine tıklayın.</li>
                      <li>Sayfanın en altındaki <strong>API Anahtarı (API Key)</strong> ve <strong>Güvenlik Anahtarı (Secret Key)</strong> değerlerini kopyalayın.</li>
                      <li>Bu sayfadaki iyzico kartında <strong>"Bağla"</strong> butonuna tıklayıp anahtarları yapıştırın ve <strong>"Bağlantıyı Test Et ve Kaydet"</strong>e basın.</li>
                    </ol>
                  )}

                  {guideProviderKey === 'paytr' && (
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li><strong>PayTR Mağaza Yönetim Paneline</strong> giriş yapın.</li>
                      <li>Üst menüden <strong>Destek & Entegrasyon &rarr; Entegrasyon Bilgileri</strong> sayfasına gidin.</li>
                      <li>Burada yer alan <strong>Mağaza No (Merchant ID)</strong>, <strong>Mağaza Parolası (Merchant Key)</strong> ve <strong>Mağaza Gizli Anahtarı (Merchant Salt)</strong> değerlerini kopyalayın.</li>
                      <li>Bu sayfadaki PayTR kartında <strong>"Bağla"</strong> butonuna tıklayıp yapıştırın ve kaydedin.</li>
                    </ol>
                  )}

                  {guideProviderKey === 'stripe' && (
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li><strong>Stripe Dashboard</strong> (dashboard.stripe.com) sayfasına giriş yapın.</li>
                      <li>Sol alt taraftaki <strong>Developers &rarr; API keys</strong> bölümünü açın.</li>
                      <li><strong>Publishable key</strong> (<code>pk_live_...</code> veya <code>pk_test_...</code>) ve <strong>Secret key</strong> (<code>sk_live_...</code> veya <code>sk_test_...</code>) değerlerini alın.</li>
                      <li>Stripe kartındaki <strong>"Bağla"</strong> butonuna tıklayarak anahtarlarınızı kaydedin.</li>
                    </ol>
                  )}

                  {guideProviderKey === 'square' && (
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li><strong>Square Developer Dashboard</strong> (developer.squareup.com) sayfasına gidin.</li>
                      <li>Uygulamanızı seçip <strong>Credentials</strong> sekmesinden <strong>Application ID</strong> ve <strong>Access Token</strong> alın.</li>
                      <li><strong>Locations</strong> sekmesinden işletmenizin <strong>Location ID</strong> değerini kopyalayın.</li>
                      <li>Square kartında <strong>"Bağla"</strong> formuna girerek testi tamamlayın.</li>
                    </ol>
                  )}

                  {guideProviderKey === 'paypal' && (
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li><strong>PayPal Developer Dashboard</strong> (developer.paypal.com/dashboard) adresine gidin.</li>
                      <li><strong>Apps & Credentials</strong> bölümünden uygulamanızı seçin (veya Create App ile oluşturun).</li>
                      <li><strong>Client ID</strong> ve <strong>Client Secret</strong> değerlerini kopyalayın.</li>
                      <li>PayPal kartındaki <strong>"Bağla"</strong> modalına yapıştırın.</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💡 Yardıma ihtiyacınız olursa <a href="mailto:info@naponi.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>info@naponi.com</a> üzerinden bize ulaşabilirsiniz.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGuideModal(false)}
                >
                  {t('common.close') || 'Kapat'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowGuideModal(false);
                    setShowCatalogModal(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} /> {t('payments.browseProvidersBtn') || 'Sağlayıcıları İncele ve Bağla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
