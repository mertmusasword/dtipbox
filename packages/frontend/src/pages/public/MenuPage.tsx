import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { PublicMenuDetails, MenuItem, MenuCategory } from '../../types';
import { useLanguage, LanguageSelector } from '../../i18n';
import { getAllergenLabel, getAllergenIcon, getAllergenDetail } from '../../constants/allergens';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Heart,
  Sparkles,
  Wifi,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Check,
  Building2,
  Copy,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { publicToken } = useParams<{ publicToken: string }>();
  const { t, formatCurrency, language } = useLanguage();
  const isTr = language === 'tr';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PublicMenuDetails | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

  // Selected item modal for zoomed inspection
  const [inspectingItem, setInspectingItem] = useState<MenuItem | null>(null);

  // Wi-Fi quick modal
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  useEffect(() => {
    if (!publicToken) return;
    setLoading(true);
    setError(null);
    api
      .get(`/menu/public/${publicToken}`)
      .then((res) => {
        setDetails(res.data.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Menü yüklenemedi. Lütfen internet bağlantınızı kontrol ediniz.');
      })
      .finally(() => setLoading(false));
  }, [publicToken]);

  useEffect(() => {
    if (details?.venue?.name) {
      document.title = `${details.venue.name} - ${isTr ? 'Menü & Alerjen Bilgisi' : 'Menu & Allergens'} | Naponi`;
    }
  }, [details?.venue?.name, isTr]);

  // Compute filtered categories and items
  const filteredCategories = useMemo(() => {
    if (!details?.menu?.categories) return [];

    const query = searchQuery.trim().toLowerCase();

    return details.menu.categories
      .filter((cat) => selectedCategoryId === 'ALL' || cat.id === selectedCategoryId)
      .map((cat) => {
        const matchingItems = (cat.items || []).filter((item) => {
          // 1. Must be active
          if (!item.is_active) return false;

          // 2. Search query match
          if (query) {
            const nameMatch = item.name.toLowerCase().includes(query);
            const descMatch = item.description?.toLowerCase().includes(query);
            if (!nameMatch && !descMatch) return false;
          }

          // 3. Allergen Exclusion Filter
          if (excludedAllergens.length > 0 && item.allergens && item.allergens.length > 0) {
            const containsExcluded = item.allergens.some((alg) => excludedAllergens.includes(alg));
            if (containsExcluded) return false;
          }

          return true;
        });

        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [details, selectedCategoryId, searchQuery, excludedAllergens]);

  const totalFilteredItems = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  const toggleExcludedAllergen = (id: string) => {
    setExcludedAllergens((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const clearAllFilters = () => {
    setExcludedAllergens([]);
    setSearchQuery('');
    setSelectedCategoryId('ALL');
  };

  const copyWifiPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #0f172a, #020617)',
          color: '#ffffff',
          padding: '2rem',
        }}
      >
        <div className="spinner" style={{ marginBottom: '1.25rem' }} />
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Menü hazırlanıyor...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #0f172a, #020617)',
          color: '#ffffff',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Menü Açılamadı</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </p>
        {publicToken && (
          <Link to={`/tip/${publicToken}`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Bahşiş Ekranına Git
          </Link>
        )}
      </div>
    );
  }

  const { venue, table, smartQr, allergenCatalog, allergenDisclaimer } = details;
  const disclaimerText = allergenDisclaimer[language] || allergenDisclaimer.tr || allergenDisclaimer.en;

  return (
    <div
      className="naponi-native-menu"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0f172a, #020617)',
        color: '#ffffff',
        paddingBottom: smartQr.enableTips ? '6rem' : '3rem',
      }}
    >
      {/* TOP COMPACT BRAND & ACTION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          background: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.75rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Venue Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {venue.logo ? (
              <img
                src={venue.logo}
                alt={venue.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a5b4fc',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {venue.name.charAt(0)}
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {venue.name}
              </div>
              {table && (
                <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600 }}>
                  📍 {table.name}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Wi-Fi Trigger if enabled */}
            {smartQr.enableWifi && smartQr.wifiSsid && (
              <button
                type="button"
                onClick={() => setIsWifiModalOpen(true)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <Wifi size={13} />
                <span>Wi-Fi</span>
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
        {/* ALLERGEN DISCLAIMER NOTICE BANNER */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
          }}
        >
          <div
            onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.86rem' }}>
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>{t('menu.allergenNoticeTitle') || 'Alerjen Bilgisi'}</span>
            </div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0 }}
            >
              {isDisclaimerExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isDisclaimerExpanded ? (
            <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.5, borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: '0.5rem' }}>
              {disclaimerText}
            </div>
          ) : (
            <div style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: '#fef3c7', opacity: 0.85 }}>
              Menüdeki alerjen bilgileri işletme beyanına dayanmaktadır. Detay için tıklayın.
            </div>
          )}
        </div>

        {/* SEARCH & FILTER ROW */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {/* Live Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input"
              placeholder={t('menu.searchPlaceholder') || 'Menüde yemek veya içecek ara...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.4rem',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                fontSize: '0.86rem',
                height: '42px',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Allergen Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              padding: '0 1rem',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: excludedAllergens.length > 0 ? '#fbbf24' : 'rgba(255, 255, 255, 0.12)',
              background: excludedAllergens.length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: excludedAllergens.length > 0 ? '#fbbf24' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: '42px',
            }}
          >
            <Filter size={15} />
            <span>{t('menu.allergenFilterBtn')}</span>
            {excludedAllergens.length > 0 && (
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fbbf24',
                  color: '#0f172a',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {excludedAllergens.length}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE ALLERGEN FILTER BADGE NOTICE */}
        {excludedAllergens.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              color: '#fef3c7',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                {excludedAllergens.length} {t('menu.filterActiveNotice')}
              </span>
              : {excludedAllergens.map((id) => getAllergenLabel(id, language)).join(', ')} (Gizlendi)
            </div>
            <button
              type="button"
              onClick={() => setExcludedAllergens([])}
              style={{
                background: 'none',
                border: 'none',
                color: '#fbbf24',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline',
              }}
            >
              {t('menu.clearFilter')}
            </button>
          </div>
        )}

        {/* CATEGORY HORIZONTAL SCROLL PILLS */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: selectedCategoryId === 'ALL' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: selectedCategoryId === 'ALL' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
              color: selectedCategoryId === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            {t('menu.allCategories') || 'Tümü'}
          </button>

          {details.menu.categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* CATEGORY & ITEMS LIST */}
        {filteredCategories.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <UtensilsCrossed size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              {t('menu.noProductsFound')}
            </h3>
            <p style={{ fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
              Arama terimini değiştirebilir veya alerjen filtrelerini sıfırlayabilirsiniz.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearAllFilters}
              style={{ fontSize: '0.82rem' }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {filteredCategories.map((category) => (
              <section key={category.id} className="menu-category-section">
                {/* Category Title */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#f8fafc' }}>
                    {category.name}
                  </h2>
                  {category.description && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Items in this category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectingItem(item)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        padding: '0.9rem',
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                    >
                      {/* Left: Info */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                            {item.name}
                          </h3>
                        </div>

                        {item.description && (
                          <p
                            style={{
                              margin: '0 0 0.45rem 0',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.description}
                          </p>
                        )}

                        {/* Price */}
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.4rem' }}>
                          {formatCurrency(Number(item.price), item.currency)}
                        </div>

                        {/* Allergen Pills on Card */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {item.allergens.map((algId) => (
                              <span
                                key={algId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  padding: '1px 6px',
                                  borderRadius: '5px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                                title={getAllergenDetail(algId, language)}
                              >
                                <span>{getAllergenIcon(algId)}</span>
                                <span>{getAllergenLabel(algId, language)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Optional Image */}
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: '84px',
                            height: '84px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            flexShrink: 0,
                          }}
                        >
                          <UtensilsCrossed size={22} style={{ opacity: 0.5 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* FLOATING PERSISTENT BOTTOM BAR: SUPPORT STAFF / LEAVE TIP */}
      {smartQr.enableTips && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '540px',
            zIndex: 50,
          }}
        >
          <Link
            to={`/tip/${publicToken}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.94rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={18} fill="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800 }}>{t('menu.tipStaffMobile') || 'Garsona Bahşiş Bırak'}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 500 }}>
                  {table ? `Masa: ${table.name}` : 'Dijital bahşiş ile ekibi destekleyin'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem' }}>
              <span>Bahşiş Ver</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}

      {/* ALLERGEN FILTER MODAL */}
      {isFilterModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsFilterModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} style={{ color: '#fbbf24' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {t('menu.allergenFilterBtn')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {t('menu.filterExcludesLabel')}
            </p>

            {/* Grid of 14 allergens */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              {allergenCatalog.map((alg) => {
                const isExcluded = excludedAllergens.includes(alg.id);
                return (
                  <button
                    key={alg.id}
                    type="button"
                    onClick={() => toggleExcludedAllergen(alg.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: isExcluded ? 800 : 500,
                      cursor: 'pointer',
                      border: '1px solid',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      background: isExcluded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isExcluded ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                      color: isExcluded ? '#fca5a5' : 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{alg.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getAllergenLabel(alg.id, language)}
                    </span>
                    {isExcluded && <X size={14} style={{ color: '#ef4444', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Health Disclaimer */}
            <div
              style={{
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#fef3c7',
                lineHeight: 1.45,
                marginBottom: '1.25rem',
              }}
            >
              ⚠️ <strong>Yasal Sorumluluk Hatırlatması:</strong> {t('menu.filterDisclaimerNote')}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setExcludedAllergens([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t('menu.clearFilter')}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.86rem' }}
              >
                Filtreleri Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT INSPECTION MODAL */}
      {inspectingItem && (
        <div
          className="modal-overlay"
          onClick={() => setInspectingItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {inspectingItem.image_url && (
              <img
                src={inspectingItem.image_url}
                alt={inspectingItem.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
            )}

            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {inspectingItem.name}
                </h3>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>
                  {formatCurrency(Number(inspectingItem.price), inspectingItem.currency)}
                </div>
              </div>

              {inspectingItem.description && (
                <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {inspectingItem.description}
                </p>
              )}

              {/* Allergens in this item */}
              {inspectingItem.allergens && inspectingItem.allergens.length > 0 && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.45rem' }}>
                    ⚠️ İçerdiği Alerjenler (İşletme Beyanı):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {inspectingItem.allergens.map((algId) => (
                      <div
                        key={algId}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                        }}
                      >
                        <span>{getAllergenIcon(algId)}</span>
                        <span>{getAllergenLabel(algId, language)}</span>
                        <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>
                          ({getAllergenDetail(algId, language)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setInspectingItem(null)}
                style={{ width: '100%', padding: '0.65rem', fontWeight: 700 }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WI-FI QUICK MODAL */}
      {isWifiModalOpen && smartQr.enableWifi && (
        <div
          className="modal-overlay"
          onClick={() => setIsWifiModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(14, 165, 233, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                margin: '0 auto 1rem',
              }}
            >
              <Wifi size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
              Misafir Wi-Fi Ağı
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Aşağıdaki şifre ile işletmenin misafir Wi-Fi ağına bağlanabilirsiniz.
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ağ Adı (SSID):</div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                {smartQr.wifiSsid}
              </div>

              {smartQr.wifiPassword && (
                <>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Şifre:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {smartQr.wifiPassword}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyWifiPassword(smartQr.wifiPassword!)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: copiedWifi ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: copiedWifi ? '#34d399' : '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {copiedWifi ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedWifi ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsWifiModalOpen(false)}
              style={{ width: '100%' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MenuPage;
