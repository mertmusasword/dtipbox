import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { PublicMenuDetails, MenuItem, MenuCategory, MenuThemeKey } from '../../types';
import { useLanguage, LanguageSelector } from '../../i18n';
import { getAllergenLabel, getAllergenIcon, getAllergenDetail, ALLERGEN_DISCLAIMER } from '../../constants/allergens';
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
  Star,
} from 'lucide-react';
import { SocialLinksSection } from '../../components/SocialLinksSection';

export interface ThemeTokens {
  bg: string;
  bgGradient: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  surface: string;
  surfaceBorder: string;
  surfaceHover: string;
  cardShadow: string;
  headerBg: string;
  headerBorder: string;
  accent: string;
  accentLight: string;
  accentText: string;
  priceColor: string;
  priceBg: string;
  priceBorder: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  pillActiveBg: string;
  pillActiveText: string;
  bottomBarBg: string;
  bottomBarBorder: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  isDark: boolean;
}

export const THEME_PALETTES: Record<MenuThemeKey, ThemeTokens> = {
  DARK_LUXURY: {
    bg: '#0B0B0E',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.12) 0%, rgba(11, 11, 14, 1) 70%)',
    textPrimary: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    surface: '#15151A',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    surfaceHover: 'rgba(212, 175, 55, 0.3)',
    cardShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
    headerBg: 'rgba(11, 11, 14, 0.92)',
    headerBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#D4AF37',
    accentLight: 'rgba(212, 175, 55, 0.18)',
    accentText: '#0B0B0E',
    priceColor: '#E6C665',
    priceBg: 'rgba(212, 175, 55, 0.12)',
    priceBorder: 'rgba(212, 175, 55, 0.3)',
    pillBg: 'rgba(255, 255, 255, 0.05)',
    pillBorder: 'rgba(255, 255, 255, 0.08)',
    pillText: '#D4D4D8',
    pillActiveBg: 'linear-gradient(135deg, #D4AF37, #B89628)',
    pillActiveText: '#0B0B0E',
    bottomBarBg: 'rgba(18, 18, 24, 0.92)',
    bottomBarBorder: 'rgba(212, 175, 55, 0.3)',
    inputBg: 'rgba(255, 255, 255, 0.06)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputFocusBorder: '#D4AF37',
    isDark: true,
  },
  WARM_ARTISAN: {
    bg: '#FAF7F2',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.07) 0%, rgba(250, 247, 242, 1) 70%)',
    textPrimary: '#292524',
    textSecondary: '#57534E',
    textMuted: '#78716C',
    surface: '#FFFFFF',
    surfaceBorder: 'rgba(120, 113, 108, 0.12)',
    surfaceHover: 'rgba(180, 83, 9, 0.25)',
    cardShadow: '0 4px 20px rgba(68, 64, 60, 0.06)',
    headerBg: 'rgba(250, 247, 242, 0.94)',
    headerBorder: 'rgba(120, 113, 108, 0.1)',
    accent: '#B45309',
    accentLight: 'rgba(180, 83, 9, 0.12)',
    accentText: '#FFFFFF',
    priceColor: '#B45309',
    priceBg: '#FEF3C7',
    priceBorder: 'rgba(180, 83, 9, 0.2)',
    pillBg: '#F5F5F4',
    pillBorder: 'rgba(120, 113, 108, 0.15)',
    pillText: '#44403C',
    pillActiveBg: '#B45309',
    pillActiveText: '#FFFFFF',
    bottomBarBg: 'rgba(255, 255, 255, 0.92)',
    bottomBarBorder: 'rgba(120, 113, 108, 0.15)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(120, 113, 108, 0.15)',
    inputFocusBorder: '#B45309',
    isDark: false,
  },
  MODERN_EMERALD: {
    bg: '#F8FAFC',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.08) 0%, rgba(248, 250, 252, 1) 70%)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    surface: '#FFFFFF',
    surfaceBorder: 'rgba(226, 232, 240, 0.9)',
    surfaceHover: 'rgba(16, 185, 129, 0.3)',
    cardShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
    headerBg: 'rgba(248, 250, 252, 0.94)',
    headerBorder: 'rgba(226, 232, 240, 0.8)',
    accent: '#059669',
    accentLight: 'rgba(5, 150, 105, 0.12)',
    accentText: '#FFFFFF',
    priceColor: '#059669',
    priceBg: '#ECFDF5',
    priceBorder: 'rgba(5, 150, 105, 0.25)',
    pillBg: '#F1F5F9',
    pillBorder: 'rgba(203, 213, 225, 0.8)',
    pillText: '#334155',
    pillActiveBg: '#059669',
    pillActiveText: '#FFFFFF',
    bottomBarBg: 'rgba(255, 255, 255, 0.92)',
    bottomBarBorder: 'rgba(5, 150, 105, 0.25)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(226, 232, 240, 0.9)',
    inputFocusBorder: '#059669',
    isDark: false,
  },
  MIDNIGHT_ROSE: {
    bg: '#120A12',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(244, 63, 94, 0.12) 0%, rgba(18, 10, 18, 1) 75%)',
    textPrimary: '#FFF1F2',
    textSecondary: '#FDA4AF',
    textMuted: '#9F7582',
    surface: '#1E121E',
    surfaceBorder: 'rgba(244, 63, 94, 0.15)',
    surfaceHover: 'rgba(244, 63, 94, 0.35)',
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
    headerBg: 'rgba(18, 10, 18, 0.92)',
    headerBorder: 'rgba(244, 63, 94, 0.15)',
    accent: '#FB7185',
    accentLight: 'rgba(251, 113, 133, 0.18)',
    accentText: '#120A12',
    priceColor: '#FDA4AF',
    priceBg: 'rgba(244, 63, 94, 0.15)',
    priceBorder: 'rgba(244, 63, 94, 0.3)',
    pillBg: 'rgba(255, 255, 255, 0.05)',
    pillBorder: 'rgba(244, 63, 94, 0.15)',
    pillText: '#FECDD3',
    pillActiveBg: 'linear-gradient(135deg, #FB7185, #E11D48)',
    pillActiveText: '#FFFFFF',
    bottomBarBg: 'rgba(26, 14, 25, 0.92)',
    bottomBarBorder: 'rgba(244, 63, 94, 0.3)',
    inputBg: 'rgba(255, 255, 255, 0.06)',
    inputBorder: 'rgba(244, 63, 94, 0.2)',
    inputFocusBorder: '#FB7185',
    isDark: true,
  },
};

export const MenuPage: React.FC = () => {
  const { publicToken } = useParams<{ publicToken: string }>();
  const { t, formatCurrency, language, dir } = useLanguage();
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
        setError(
          err.response?.data?.error ||
          (isTr
            ? 'Menü yüklenemedi. Lütfen internet bağlantınızı kontrol ediniz.'
            : language === 'ru'
            ? 'Не удалось загрузить меню. Проверьте подключение к интернету.'
            : 'Failed to load menu. Please check your internet connection.')
        );
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

  const themeKey: MenuThemeKey = (details?.smartQr?.menuTheme as MenuThemeKey) || 'DARK_LUXURY';
  const theme = THEME_PALETTES[themeKey] || THEME_PALETTES.DARK_LUXURY;

  // Chef's Highlights / Featured stories
  const featuredStories = useMemo(() => {
    if (details?.smartQr?.enableItemStories === false) return [];
    if (!details?.menu?.categories) return [];
    const allItems: MenuItem[] = [];
    for (const cat of details.menu.categories) {
      for (const item of cat.items || []) {
        if (item.is_active) {
          allItems.push(item);
        }
      }
    }
    const explicitlyFeatured = allItems.filter((i) => i.is_featured);
    if (explicitlyFeatured.length > 0) {
      return explicitlyFeatured;
    }
    return allItems.filter((i) => i.image_url).slice(0, 8);
  }, [details]);

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
          background: theme.bg,
          backgroundImage: theme.bgGradient,
          color: theme.textPrimary,
          padding: '2rem',
        }}
      >
        <div
          className="spinner"
          style={{
            marginBottom: '1.25rem',
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
            borderTopColor: theme.accent,
          }}
        />
        <div style={{ fontSize: '0.95rem', color: theme.textSecondary, fontWeight: 600 }}>Menü hazırlanıyor...</div>
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
          background: theme.bg,
          backgroundImage: theme.bgGradient,
          color: theme.textPrimary,
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: '1.25rem', right: dir === 'rtl' ? 'auto' : '1.25rem', left: dir === 'rtl' ? '1.25rem' : 'auto' }}>
          <LanguageSelector variant="compact" theme={theme.isDark ? 'dark' : 'light'} />
        </div>
        <AlertTriangle size={52} style={{ color: '#D97706', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: theme.textPrimary }}>
          {t('tip.invalidQr') || (isTr ? 'Menü Açılamadı' : 'Menu Unavailable')}
        </h2>
        <p style={{ color: theme.textSecondary, maxWidth: '400px', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          {error || t('tip.inactiveBusiness')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '280px' }}>
          {publicToken && (
            <Link
              to={`/tip/${publicToken}?view=tip`}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                background: theme.accent,
                color: theme.accentText,
                borderColor: theme.accent,
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {t('tip.title') || (isTr ? 'Bahşiş Bırak' : 'Leave a Tip')}
            </Link>
          )}
          <Link
            to="/"
            className="btn btn-secondary"
            style={{
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            {t('tip.backToHome') || (isTr ? 'Ana Sayfaya Dön' : 'Back to Home')}
          </Link>
        </div>
      </div>
    );
  }

  const { venue, table, smartQr, allergenCatalog, allergenDisclaimer } = details;
  const disclaimerText = allergenDisclaimer[language] || allergenDisclaimer.tr || allergenDisclaimer.en;
  const coverImageUrl = (smartQr?.menuCoverImage || (smartQr as any)?.menu_cover_image || '').trim();
  const coverImagePosition = (smartQr as any)?.menuCoverPosition ?? (smartQr as any)?.menu_cover_position ?? 50;

  return (
    <div
      className="naponi-native-menu"
      style={{
        minHeight: '100vh',
        background: theme.bg,
        backgroundImage: theme.bgGradient,
        backgroundAttachment: 'fixed',
        color: theme.textPrimary,
        paddingBottom: smartQr.enableTips ? '5.5rem' : '2.5rem',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* CINEMATIC HERO COVER BANNER */}
      {coverImageUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            overflow: 'hidden',
            backgroundColor: theme.surface,
          }}
        >
          {/* Banner Image with referrerPolicy for hotlink support */}
          <img
            src={coverImageUrl}
            alt={venue.name}
            referrerPolicy="no-referrer"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `center ${coverImagePosition}%`,
              display: 'block',
            }}
          />

          {/* Ambient Gradient Overlays */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 50%, ${theme.bg} 100%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Quick Header Actions on Top of Banner */}
          <div
            style={{
              position: 'absolute',
              top: '0.85rem',
              left: '1rem',
              right: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {table && (
                <div
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '999px',
                    background: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>📍</span>
                  <span>{table.name}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {smartQr.enableWifi && smartQr.wifiSsid && (
                <button
                  type="button"
                  onClick={() => setIsWifiModalOpen(true)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    background: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    height: '34px',
                  }}
                >
                  <Wifi size={13} />
                  <span>Wi-Fi</span>
                </button>
              )}
              <LanguageSelector theme="dark" />
            </div>
          </div>
        </div>
      ) : null}

      {/* TOP STICKY BAR (When no cover image, or persistent while browsing) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.headerBorder}`,
          padding: '0.75rem 1rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.accent}`,
                  boxShadow: `0 2px 8px ${theme.accentLight}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent}, #B89628)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.accentText,
                  fontWeight: 800,
                  fontSize: '0.95rem',
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
                  fontSize: '1rem',
                  color: theme.textPrimary,
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {venue.name}
              </div>
              {table && (
                <div style={{ fontSize: '0.72rem', color: theme.accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span>📍</span>
                  <span>{table.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {/* Wi-Fi Trigger if enabled and no cover image */}
            {!coverImageUrl && smartQr.enableWifi && smartQr.wifiSsid && (
              <button
                type="button"
                onClick={() => setIsWifiModalOpen(true)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '999px',
                  background: theme.pillBg,
                  border: `1px solid ${theme.pillBorder}`,
                  color: theme.accent,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  height: '34px',
                }}
              >
                <Wifi size={13} style={{ flexShrink: 0 }} />
                <span>Wi-Fi</span>
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSelector theme={theme.isDark ? 'dark' : 'light'} />
          </div>
        </div>
      </header>

      {/* VENUE BRAND INTRO (Shown below cover image or at top of body) */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: coverImageUrl ? '0.75rem 1rem 0' : '1rem 1rem 0' }}>
        {coverImageUrl && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.02em' }}>
                {venue.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: theme.textSecondary }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700 }}>
                  <Star size={13} fill="#F59E0B" /> 4.9
                </span>
                <span>•</span>
                <span>{isTr ? 'Özel QR Menü' : 'Curated Menu'}</span>
              </div>
            </div>
            {venue.logo && (
              <img
                src={venue.logo}
                alt={venue.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.accent}`,
                  boxShadow: `0 4px 16px ${theme.accentLight}`,
                }}
              />
            )}
          </div>
        )}

        {/* CHEF'S HIGHLIGHTS / INSTAGRAM-STYLE STORIES CAROUSEL */}
        {featuredStories.length > 0 && (
          <div style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem 0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 800, color: theme.textPrimary, letterSpacing: '-0.01em' }}>
                <Sparkles size={16} style={{ color: theme.accent }} />
                <span>{isTr ? 'Şefin Seçtikleri' : "Chef's Highlights"}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: theme.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isTr ? 'Öne Çıkanlar' : 'Featured'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                paddingTop: '0.2rem',
                paddingLeft: '0.25rem',
                scrollbarWidth: 'none',
              }}
            >
              {featuredStories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInspectingItem(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    width: '74px',
                    flexShrink: 0,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      padding: '2.5px',
                      background: `linear-gradient(135deg, ${theme.accent}, #F59E0B, ${theme.accent})`,
                      boxShadow: `0 4px 14px ${theme.accentLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          background: theme.surface,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: theme.surface,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.accent,
                        }}
                      >
                        <UtensilsCrossed size={22} />
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: theme.textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: theme.priceColor,
                      marginTop: '-0.25rem',
                    }}
                  >
                    {formatCurrency(Number(item.price), item.currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '0.5rem 1rem 1rem' }}>
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
                color: theme.textMuted,
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
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.textPrimary,
                fontSize: '0.88rem',
                height: '44px',
                outline: 'none',
                boxShadow: theme.cardShadow,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.inputFocusBorder;
                e.target.style.boxShadow = `0 0 0 3px ${theme.accentLight}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.inputBorder;
                e.target.style.boxShadow = theme.cardShadow;
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
                  background: theme.surfaceBorder,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  border: 'none',
                  color: theme.textSecondary,
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
              border: `1px solid ${excludedAllergens.length > 0 ? theme.accent : theme.surfaceBorder}`,
              background: excludedAllergens.length > 0 ? theme.accentLight : theme.surface,
              color: excludedAllergens.length > 0 ? theme.accent : theme.textPrimary,
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: '44px',
              boxShadow: theme.cardShadow,
              transition: 'all 0.2s',
            }}
          >
            <Filter size={16} style={{ color: excludedAllergens.length > 0 ? theme.accent : theme.textMuted }} />
            <span>{t('menu.allergenFilterBtn')}</span>
            {excludedAllergens.length > 0 && (
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: theme.accent,
                  color: theme.accentText,
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
              background: theme.accentLight,
              border: `1px solid ${theme.accent}`,
              borderRadius: '12px',
              padding: '0.65rem 0.95rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: theme.textPrimary,
              boxShadow: theme.cardShadow,
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: theme.accent }}>
                {excludedAllergens.length} {t('menu.filterActiveNotice')}
              </span>
              : {excludedAllergens.map((id) => getAllergenLabel(id, language)).join(', ')} ({isTr ? 'Gizlendi' : 'Hidden'})
            </div>
            <button
              type="button"
              onClick={() => setExcludedAllergens([])}
              style={{
                background: 'none',
                border: 'none',
                color: theme.accent,
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
              border: `1px solid ${selectedCategoryId === 'ALL' ? theme.accent : theme.pillBorder}`,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: selectedCategoryId === 'ALL' ? theme.pillActiveBg : theme.pillBg,
              color: selectedCategoryId === 'ALL' ? theme.pillActiveText : theme.pillText,
              boxShadow: selectedCategoryId === 'ALL' ? `0 4px 14px ${theme.accentLight}` : 'none',
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
                  border: `1px solid ${isSelected ? theme.accent : theme.pillBorder}`,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  background: isSelected ? theme.pillActiveBg : theme.pillBg,
                  color: isSelected ? theme.pillActiveText : theme.pillText,
                  boxShadow: isSelected ? `0 4px 14px ${theme.accentLight}` : 'none',
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
              color: theme.textSecondary,
              background: theme.surface,
              borderRadius: '20px',
              border: `1px solid ${theme.surfaceBorder}`,
              boxShadow: theme.cardShadow,
            }}
          >
            <UtensilsCrossed size={40} style={{ margin: '0 auto 1rem', opacity: 0.3, color: theme.textMuted }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '0.35rem' }}>
              {t('menu.noProductsFound')}
            </h3>
            <p style={{ fontSize: '0.84rem', margin: '0 0 1.25rem 0', color: theme.textSecondary }}>
              Arama terimini değiştirebilir veya alerjen filtrelerini sıfırlayabilirsiniz.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                fontSize: '0.84rem',
                padding: '0.55rem 1.2rem',
                borderRadius: '999px',
                background: theme.pillBg,
                border: `1px solid ${theme.pillBorder}`,
                color: theme.textPrimary,
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
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '4px', height: '1.25rem', borderRadius: '4px', background: theme.accent }} />
                  <div>
                    <h2 style={{ fontSize: '1.22rem', fontWeight: 800, margin: 0, color: theme.textPrimary, letterSpacing: '-0.01em' }}>
                      {category.name}
                    </h2>
                    {category.description && (
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: theme.textSecondary }}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items in this category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setInspectingItem(item)}
                      style={{
                        background: theme.surface,
                        borderRadius: '18px',
                        border: `1px solid ${item.is_featured ? theme.accent : theme.surfaceBorder}`,
                        padding: '1.05rem',
                        display: 'flex',
                        gap: '0.95rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: theme.cardShadow,
                        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.surfaceHover;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = item.is_featured ? theme.accent : theme.surfaceBorder;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Left: Info */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.3rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 750, color: theme.textPrimary }}>
                            {item.name}
                          </h3>
                          {item.is_featured && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                background: theme.accentLight,
                                color: theme.accent,
                                border: `1px solid ${theme.accent}`,
                                letterSpacing: '0.02em',
                              }}
                            >
                              <Star size={10} fill="currentColor" />
                              <span>{isTr ? 'Şefin Seçimi' : "Chef's Choice"}</span>
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p
                            style={{
                              margin: '0 0 0.55rem 0',
                              fontSize: '0.82rem',
                              color: theme.textSecondary,
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

                        {/* Price Capsule */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            background: theme.priceBg,
                            border: `1px solid ${theme.priceBorder}`,
                            color: theme.priceColor,
                            fontSize: '0.98rem',
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            marginBottom: item.allergens && item.allergens.length > 0 ? '0.45rem' : 0,
                          }}
                        >
                          {formatCurrency(Number(item.price), item.currency)}
                        </div>

                        {/* Allergen Pills on Card */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                            {item.allergens.map((algId) => (
                              <span
                                key={algId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  background: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : '#F5F5F4',
                                  color: theme.textSecondary,
                                  border: `1px solid ${theme.surfaceBorder}`,
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
                            borderRadius: '14px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: `1px solid ${theme.surfaceBorder}`,
                            background: theme.isDark ? '#26262F' : '#E7E5E4',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '74px',
                            height: '74px',
                            borderRadius: '14px',
                            background: theme.pillBg,
                            border: `1px solid ${theme.pillBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.accent,
                            flexShrink: 0,
                          }}
                        >
                          <UtensilsCrossed size={22} style={{ opacity: 0.7 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ALLERGEN DISCLAIMER NOTICE BANNER */}
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: '16px',
            padding: '0.85rem 1.1rem',
            marginTop: '2rem',
            marginBottom: '0.5rem',
            boxShadow: theme.cardShadow,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: theme.accent, fontWeight: 700, fontSize: '0.88rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, color: '#D97706' }} />
              <span>{t('menu.allergenNoticeTitle') || 'Alerjen Bilgisi'}</span>
            </div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', padding: 0 }}
            >
              {isDisclaimerExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isDisclaimerExpanded ? (
            <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: theme.textSecondary, lineHeight: 1.5, borderTop: `1px solid ${theme.surfaceBorder}`, paddingTop: '0.5rem' }}>
              {disclaimerText}
            </div>
          ) : (
            <div style={{ marginTop: '0.35rem', fontSize: '0.76rem', color: theme.textMuted }}>
              Menüdeki alerjen bilgileri işletme beyanına dayanmaktadır. Detay için tıklayın.
            </div>
          )}
        </div>

        {/* Social Media & Contact Links */}
        <SocialLinksSection
          smartQr={smartQr}
          publicToken={publicToken}
          language={language}
          style={{ marginTop: '1.75rem', marginBottom: '1.5rem' }}
        />

        {/* Naponi Brand Footer */}
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img
            src={theme.isDark ? '/naponi-brand-white.svg' : '/naponi-brand-dark.svg'}
            alt="Naponi"
            style={{ height: '24px', width: 'auto', opacity: 0.85 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/naponi-brand-dark.svg';
            }}
          />
          <span style={{ fontSize: '0.72rem', color: theme.textMuted }}>
            {isTr ? 'Dijital Akıllı Menü & Bahşiş Deneyimi' : 'Digital Smart Menu & Tipping Experience'}
          </span>
        </div>
      </main>

      {/* FLOATING FROSTED GLASS PERSISTENT BOTTOM BAR: SUPPORT STAFF / LEAVE TIP */}
      {smartQr.enableTips && (
        <div
          style={{
            position: 'fixed',
            bottom: '0.85rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 1.75rem)',
            maxWidth: '480px',
            zIndex: 50,
          }}
        >
          <Link
            to={`/tip/${publicToken}?view=tip`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.95rem 0.65rem 0.85rem',
              borderRadius: '999px',
              background: theme.bottomBarBg,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: `1px solid ${theme.bottomBarBorder}`,
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
              textDecoration: 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: theme.accentLight,
                  color: theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Heart size={16} fill="currentColor" />
              </div>
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: theme.textPrimary, whiteSpace: 'nowrap' }}>
                  {t('menu.tipStaffMobile') || 'Bahşiş Bırak'}
                </span>
                {table && (
                  <span style={{ fontSize: '0.72rem', color: theme.accent, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({table.name})
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                fontWeight: 750,
                background: theme.accent,
                color: theme.accentText,
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${theme.accentLight}`,
              }}
            >
              <span>{isTr ? 'Bahşiş Ver' : 'Leave Tip'}</span>
              <ArrowRight size={13} />
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
            background: 'rgba(0, 0, 0, 0.7)',
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
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '24px',
              padding: '1.5rem',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: theme.cardShadow,
              color: theme.textPrimary,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} style={{ color: theme.accent }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: theme.textPrimary }}>
                  {t('menu.allergenFilterBtn')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: theme.textSecondary, marginBottom: '1.25rem', lineHeight: 1.45 }}>
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
                      background: isExcluded ? 'rgba(239, 68, 68, 0.15)' : theme.pillBg,
                      borderColor: isExcluded ? '#EF4444' : theme.pillBorder,
                      color: isExcluded ? '#EF4444' : theme.textPrimary,
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
                background: theme.accentLight,
                border: `1px solid ${theme.accent}`,
                borderRadius: '12px',
                fontSize: '0.78rem',
                color: theme.textPrimary,
                lineHeight: 1.45,
                marginBottom: '1.25rem',
              }}
            >
              {ALLERGEN_DISCLAIMER[language] || ALLERGEN_DISCLAIMER.en || ALLERGEN_DISCLAIMER.tr}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setExcludedAllergens([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textSecondary,
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
                  background: theme.accent,
                  color: theme.accentText,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${theme.accentLight}`,
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
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: theme.cardShadow,
              color: theme.textPrimary,
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
                  borderBottom: `1px solid ${theme.surfaceBorder}`,
                }}
              />
            )}

            <div style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.textPrimary }}>
                    {inspectingItem.name}
                  </h3>
                  {inspectingItem.is_featured && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: theme.accentLight,
                        color: theme.accent,
                        border: `1px solid ${theme.accent}`,
                        marginTop: '0.35rem',
                      }}
                    >
                      <Star size={10} fill="currentColor" />
                      <span>{isTr ? 'Şefin Seçimi' : "Chef's Choice"}</span>
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: theme.priceColor,
                    whiteSpace: 'nowrap',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    background: theme.priceBg,
                    border: `1px solid ${theme.priceBorder}`,
                  }}
                >
                  {formatCurrency(Number(inspectingItem.price), inspectingItem.currency)}
                </div>
              </div>

              {inspectingItem.description && (
                <p style={{ margin: '0 0 1.15rem', fontSize: '0.9rem', color: theme.textSecondary, lineHeight: 1.5 }}>
                  {inspectingItem.description}
                </p>
              )}

              {/* Allergens in this item */}
              {inspectingItem.allergens && inspectingItem.allergens.length > 0 && (
                <div
                  style={{
                    padding: '0.9rem',
                    borderRadius: '14px',
                    background: theme.pillBg,
                    border: `1px solid ${theme.pillBorder}`,
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.accent, marginBottom: '0.5rem' }}>
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
                          background: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                          color: theme.textPrimary,
                          border: `1px solid ${theme.surfaceBorder}`,
                        }}
                      >
                        <span>{getAllergenIcon(algId)}</span>
                        <span>{getAllergenLabel(algId, language)}</span>
                        <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>
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
                  background: theme.pillBg,
                  border: `1px solid ${theme.pillBorder}`,
                  color: theme.textPrimary,
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
            background: 'rgba(0, 0, 0, 0.75)',
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
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: '24px',
              padding: '1.65rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: theme.cardShadow,
              color: theme.textPrimary,
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: theme.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.accent,
                margin: '0 auto 1rem',
              }}
            >
              <Wifi size={26} />
            </div>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 800, color: theme.textPrimary }}>
              Misafir Wi-Fi Ağı
            </h3>
            <div style={{ fontSize: '0.86rem', color: theme.textSecondary, marginBottom: '1.25rem' }}>
              Aşağıdaki şifre ile işletmenin misafir Wi-Fi ağına bağlanabilirsiniz.
            </div>

            <div
              style={{
                background: theme.pillBg,
                border: `1px solid ${theme.pillBorder}`,
                borderRadius: '14px',
                padding: '0.9rem 1rem',
                marginBottom: '1.25rem',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: theme.textSecondary }}>Ağ Adı (SSID):</div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: theme.textPrimary, marginBottom: '0.6rem' }}>
                {smartQr.wifiSsid}
              </div>

              {smartQr.wifiPassword && (
                <>
                  <div style={{ fontSize: '0.74rem', color: theme.textSecondary }}>Şifre:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.accent, fontFamily: 'monospace' }}>
                      {smartQr.wifiPassword}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyWifiPassword(smartQr.wifiPassword!)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: copiedWifi ? theme.accent : theme.surface,
                        color: copiedWifi ? theme.accentText : theme.textPrimary,
                        border: `1px solid ${theme.surfaceBorder}`,
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
                background: theme.pillBg,
                border: `1px solid ${theme.pillBorder}`,
                color: theme.textPrimary,
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
