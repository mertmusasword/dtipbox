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
import { SocialLinksSection } from '../../components/SocialLinksSection';

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
          background: '#FAF9F6',
          color: '#1C1917',
          padding: '2rem',
        }}
      >
        <div className="spinner" style={{ marginBottom: '1.25rem', borderColor: 'rgba(0, 0, 0, 0.1)', borderTopColor: '#059669' }} />
        <div style={{ fontSize: '0.95rem', color: '#78716C', fontWeight: 600 }}>Menü hazırlanıyor...</div>
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
          background: '#FAF9F6',
          color: '#1C1917',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={48} style={{ color: '#D97706', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1C1917' }}>Menü Açılamadı</h2>
        <p style={{ color: '#78716C', maxWidth: '380px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </p>
        {publicToken && (
          <Link to={`/tip/${publicToken}?view=tip`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: '#059669', borderColor: '#059669' }}>
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
        background: '#FAF9F6',
        color: '#1C1917',
        paddingBottom: smartQr.enableTips ? '6.5rem' : '3rem',
      }}
    >
      {/* TOP COMPACT BRAND & ACTION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(250, 249, 246, 0.94)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '0.85rem 1rem',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.02)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            {venue.logo ? (
              <img
                src={venue.logo}
                alt={venue.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E7E5E4, #D6D3D1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#44403C',
                  fontWeight: 800,
                  fontSize: '1rem',
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
                  fontSize: '1.05rem',
                  color: '#1C1917',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {venue.name}
              </div>
              {table && (
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span>📍</span>
                  <span>{table.name}</span>
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
                  padding: '0.45rem 0.8rem',
                  borderRadius: '999px',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  color: '#0284C7',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Wifi size={13} />
                <span>Wi-Fi</span>
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSelector theme="light" />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
        {/* ALLERGEN DISCLAIMER NOTICE BANNER */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '14px',
            padding: '0.85rem 1.1rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.05)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#B45309', fontWeight: 700, fontSize: '0.88rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, color: '#D97706' }} />
              <span>{t('menu.allergenNoticeTitle') || 'Alerjen Bilgisi'}</span>
            </div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#B45309', cursor: 'pointer', padding: 0 }}
            >
              {isDisclaimerExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isDisclaimerExpanded ? (
            <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: '#78350F', lineHeight: 1.5, borderTop: '1px solid #FDE68A', paddingTop: '0.5rem' }}>
              {disclaimerText}
            </div>
          ) : (
            <div style={{ marginTop: '0.35rem', fontSize: '0.76rem', color: '#92400E', opacity: 0.9 }}>
              Menüdeki alerjen bilgileri işletme beyanına dayanmaktadır. Detay için tıklayın.
            </div>
          )}
        </div>

        {/* SEARCH & FILTER ROW */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {/* Live Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.95rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#78716C',
              }}
            />
            <input
              type="text"
              placeholder={t('menu.searchPlaceholder') || 'Menüde yemek veya içecek ara...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: '2.5rem',
                paddingRight: searchQuery ? '2.2rem' : '1rem',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: '#1C1917',
                fontSize: '0.88rem',
                height: '44px',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#E7E5E4',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  border: 'none',
                  color: '#57534E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Allergen Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              padding: '0 1.15rem',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: excludedAllergens.length > 0 ? '#F59E0B' : 'rgba(0, 0, 0, 0.08)',
              background: excludedAllergens.length > 0 ? '#FEF3C7' : '#FFFFFF',
              color: excludedAllergens.length > 0 ? '#92400E' : '#44403C',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: '44px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={16} style={{ color: excludedAllergens.length > 0 ? '#D97706' : '#78716C' }} />
            <span>{t('menu.allergenFilterBtn')}</span>
            {excludedAllergens.length > 0 && (
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
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
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '0.65rem 0.95rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#78350F',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.06)',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: '#B45309' }}>
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
                color: '#B45309',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.78rem',
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
            gap: '0.55rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.5rem',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '999px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: selectedCategoryId === 'ALL' ? '#1C1917' : '#FFFFFF',
              borderColor: selectedCategoryId === 'ALL' ? '#1C1917' : 'rgba(0, 0, 0, 0.08)',
              color: selectedCategoryId === 'ALL' ? '#FFFFFF' : '#57534E',
              boxShadow: selectedCategoryId === 'ALL' ? '0 4px 12px rgba(28, 25, 23, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.03)',
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
                  padding: '0.55rem 1.15rem',
                  borderRadius: '999px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  background: isSelected ? '#1C1917' : '#FFFFFF',
                  borderColor: isSelected ? '#1C1917' : 'rgba(0, 0, 0, 0.08)',
                  color: isSelected ? '#FFFFFF' : '#57534E',
                  boxShadow: isSelected ? '0 4px 12px rgba(28, 25, 23, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.03)',
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
              color: '#78716C',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            }}
          >
            <UtensilsCrossed size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, color: '#78716C' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1C1917', marginBottom: '0.35rem' }}>
              {t('menu.noProductsFound')}
            </h3>
            <p style={{ fontSize: '0.84rem', margin: '0 0 1.25rem 0' }}>
              Arama terimini değiştirebilir veya alerjen filtrelerini sıfırlayabilirsiniz.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                fontSize: '0.84rem',
                padding: '0.55rem 1.2rem',
                borderRadius: '999px',
                background: '#F5F5F4',
                border: '1px solid #E7E5E4',
                color: '#1C1917',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredCategories.map((category) => (
              <section key={category.id} className="menu-category-section">
                {/* Category Title */}
                <div style={{ marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#1C1917' }}>
                    {category.name}
                  </h2>
                  {category.description && (
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#78716C' }}>
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Items in this category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectingItem(item)}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        padding: '1rem',
                        display: 'flex',
                        gap: '0.95rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.35)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                      }}
                    >
                      {/* Left: Info */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#1C1917' }}>
                            {item.name}
                          </h3>
                        </div>

                        {item.description && (
                          <p
                            style={{
                              margin: '0 0 0.5rem 0',
                              fontSize: '0.82rem',
                              color: '#57534E',
                              lineHeight: 1.45,
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
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', marginBottom: '0.45rem' }}>
                          {formatCurrency(Number(item.price), item.currency)}
                        </div>

                        {/* Allergen Pills on Card */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {item.allergens.map((algId) => (
                              <span
                                key={algId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: '#F5F5F4',
                                  color: '#44403C',
                                  border: '1px solid #E7E5E4',
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
                            width: '88px',
                            height: '88px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '12px',
                            background: '#F5F5F4',
                            border: '1px solid #E7E5E4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#A8A29E',
                            flexShrink: 0,
                          }}
                        >
                          <UtensilsCrossed size={24} style={{ opacity: 0.6 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Social Media & Contact Links ("Bizi Takip Edin" - directly at the bottom of the digital menu) */}
        <SocialLinksSection
          smartQr={smartQr}
          publicToken={publicToken}
          language={language}
          style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}
        />

        {/* Naponi Brand Footer */}
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '24px', width: 'auto', opacity: 0.85 }} />
          <span style={{ fontSize: '0.72rem', color: '#78716C' }}>{isTr ? 'Dijital Akıllı Menü & Bahşiş Deneyimi' : 'Digital Smart Menu & Tipping Experience'}</span>
        </div>
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
            to={`/tip/${publicToken}?view=tip`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.35rem',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              boxShadow: '0 10px 28px rgba(5, 150, 105, 0.38)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
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
                <div style={{ fontSize: '0.74rem', opacity: 0.92, fontWeight: 500 }}>
                  {table ? `Masa: ${table.name}` : 'Dijital bahşiş ile ekibi destekleyin'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem' }}>
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
            background: 'rgba(28, 25, 23, 0.65)',
            backdropFilter: 'blur(6px)',
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
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '20px',
              padding: '1.5rem',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
              color: '#1C1917',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} style={{ color: '#D97706' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>
                  {t('menu.allergenFilterBtn')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#57534E', marginBottom: '1.25rem', lineHeight: 1.45 }}>
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
                      padding: '0.65rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: isExcluded ? 800 : 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      background: isExcluded ? '#FEE2E2' : '#F5F5F4',
                      borderColor: isExcluded ? '#EF4444' : '#E7E5E4',
                      color: isExcluded ? '#991B1B' : '#44403C',
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{alg.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getAllergenLabel(alg.id, language)}
                    </span>
                    {isExcluded && <X size={14} style={{ color: '#EF4444', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Health Disclaimer */}
            <div
              style={{
                padding: '0.85rem',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                fontSize: '0.78rem',
                color: '#78350F',
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
                  color: '#78716C',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                {t('menu.clearFilter')}
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{
                  padding: '0.65rem 1.6rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: '999px',
                  background: '#1C1917',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(28, 25, 23, 0.2)',
                }}
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
            background: 'rgba(28, 25, 23, 0.65)',
            backdropFilter: 'blur(6px)',
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
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.18)',
              color: '#1C1917',
            }}
          >
            {inspectingItem.image_url && (
              <img
                src={inspectingItem.image_url}
                alt={inspectingItem.name}
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                }}
              />
            )}

            <div style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1C1917' }}>
                  {inspectingItem.name}
                </h3>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', whiteSpace: 'nowrap' }}>
                  {formatCurrency(Number(inspectingItem.price), inspectingItem.currency)}
                </div>
              </div>

              {inspectingItem.description && (
                <p style={{ margin: '0 0 1.15rem', fontSize: '0.9rem', color: '#57534E', lineHeight: 1.5 }}>
                  {inspectingItem.description}
                </p>
              )}

              {/* Allergens in this item */}
              {inspectingItem.allergens && inspectingItem.allergens.length > 0 && (
                <div
                  style={{
                    padding: '0.9rem',
                    borderRadius: '12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', marginBottom: '0.5rem' }}>
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
                          padding: '3px 9px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                        }}
                      >
                        <span>{getAllergenIcon(algId)}</span>
                        <span>{getAllergenLabel(algId, language)}</span>
                        <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>
                          ({getAllergenDetail(algId, language)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  background: '#F5F5F4',
                  border: '1px solid #E7E5E4',
                  color: '#1C1917',
                  cursor: 'pointer',
                }}
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
            background: 'rgba(28, 25, 23, 0.65)',
            backdropFilter: 'blur(6px)',
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
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '20px',
              padding: '1.65rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
              color: '#1C1917',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                margin: '0 auto 1rem',
              }}
            >
              <Wifi size={26} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 800, color: '#1C1917' }}>
              Misafir Wi-Fi Ağı
            </h3>
            <div style={{ fontSize: '0.86rem', color: '#78716C', marginBottom: '1.25rem' }}>
              Aşağıdaki şifre ile işletmenin misafir Wi-Fi ağına bağlanabilirsiniz.
            </div>

            <div
              style={{
                background: '#F5F5F4',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                padding: '0.9rem 1rem',
                marginBottom: '1.25rem',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: '#78716C' }}>Ağ Adı (SSID):</div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#1C1917', marginBottom: '0.6rem' }}>
                {smartQr.wifiSsid}
              </div>

              {smartQr.wifiPassword && (
                <>
                  <div style={{ fontSize: '0.74rem', color: '#78716C' }}>Şifre:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#059669', fontFamily: 'monospace' }}>
                      {smartQr.wifiPassword}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyWifiPassword(smartQr.wifiPassword!)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: copiedWifi ? '#D1FAE5' : '#FFFFFF',
                        color: copiedWifi ? '#065F46' : '#1C1917',
                        border: '1px solid #D6D3D1',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {copiedWifi ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedWifi ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsWifiModalOpen(false)}
              style={{
                width: '100%',
                padding: '0.7rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                borderRadius: '12px',
                background: '#F5F5F4',
                border: '1px solid #E7E5E4',
                color: '#1C1917',
                cursor: 'pointer',
              }}
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
