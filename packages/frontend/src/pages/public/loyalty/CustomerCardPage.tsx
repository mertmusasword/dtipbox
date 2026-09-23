import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../../../api/client';
import { useToast } from '../../../components/Toast';
import { useLanguage, LanguageSelector } from '../../../i18n';
import {
  Award,
  Sparkles,
  Gift,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface CardResponse {
  card: {
    id: string;
    public_id: string;
    card_code: string;
    customer_email: string;
    customer_name: string | null;
    current_stamps: number;
    total_stamps_earned: number;
    total_rewards_redeemed: number;
    reward_pending: boolean;
  };
  program: {
    name: string;
    target_stamps: number;
    reward_description: string;
    is_active: boolean;
  };
  business: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

interface ScanTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export const CustomerCardPage: React.FC = () => {
  const { publicCardId } = useParams<{ publicCardId: string }>();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const isRu = language === 'ru';

  const [data, setData] = useState<CardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic QR
  const [tokenData, setTokenData] = useState<ScanTokenResponse | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [refreshingToken, setRefreshingToken] = useState<boolean>(false);

  // Modals
  const [showAddToHomeScreenModal, setShowAddToHomeScreenModal] = useState(false);
  const [showRedeemInfoModal, setShowRedeemInfoModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch card data
  const fetchCardData = useCallback(async (silent = false) => {
    if (!publicCardId) return;
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/loyalty/card/${publicCardId}`);
      setData(res.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load card:', err);
      if (!silent) setError('Sadakat kartı bulunamadı.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [publicCardId]);

  // Fetch dynamic scan token
  const fetchScanToken = useCallback(async () => {
    if (!publicCardId) return;
    setRefreshingToken(true);
    try {
      const res = await api.get(`/loyalty/card/${publicCardId}/token`);
      const tokenRes: ScanTokenResponse = res.data.data;
      setTokenData(tokenRes);
      setSecondsRemaining(Math.min(tokenRes.expiresInSeconds || 30, 30));

      // Generate QR
      QRCode.toDataURL(
        tokenRes.token,
        {
          width: 280,
          margin: 1,
          color: {
            dark: '#090d16',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrUrl(url);
          }
        }
      );
    } catch (err) {
      console.error('Failed to fetch dynamic token:', err);
    } finally {
      setRefreshingToken(false);
    }
  }, [publicCardId]);

  // Initial load
  useEffect(() => {
    fetchCardData();
    fetchScanToken();
  }, [fetchCardData, fetchScanToken]);

  // 1-second countdown ticker for QR expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Token expired, fetch fresh token and re-poll card for updates
          fetchScanToken();
          fetchCardData(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchScanToken, fetchCardData]);

  // Polling card updates every 10 seconds (silent)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchCardData(true);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchCardData]);

  const handleCopyCode = () => {
    if (!data?.card.card_code) return;
    navigator.clipboard.writeText(data.card.card_code);
    setCopiedCode(true);
    showToast(
      isTr
        ? 'Kart kodu panoya kopyalandı!'
        : isRu
        ? 'Код карты скопирован!'
        : 'Card code copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast(
      isTr
        ? 'Kart bağlantısı kopyalandı!'
        : isRu
        ? 'Ссылка на карту скопирована!'
        : 'Card link copied!',
      'success'
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleEmailMeLink = async () => {
    if (!data?.card.customer_email || !data?.business.id) return;
    setSendingEmail(true);
    try {
      await api.post('/loyalty/recover', {
        email: data.card.customer_email,
        business_id: data.business.id,
      });
      showToast(
        isTr
          ? 'Kart bağlantınız e-posta adresinize gönderildi!'
          : isRu
          ? 'Ссылка на карту отправлена на ваш email!'
          : 'Card link sent to your email!',
        'success'
      );
    } catch (err: any) {
      showToast(
        err.response?.data?.error ||
        (isTr
          ? 'E-posta gönderilemedi'
          : isRu
          ? 'Не удалось отправить email'
          : 'Failed to send email'),
        'error'
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="loyalty-public-layout">
        <div className="spinner" style={{ margin: '4rem auto' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="loyalty-public-layout">
        <div className="loyalty-enroll-card" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            {isTr ? 'Kart Bulunamadı' : isRu ? 'Карта не найдена' : 'Card Not Found'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {error ||
              (isTr
                ? 'Belirtilen kimliğe ait bir sadakat kartı mevcut değil veya bağlantı geçersiz.'
                : isRu
                ? 'Карта лояльности по указанной ссылке не найдена или срок действия истек.'
                : 'No loyalty card found for the provided ID or the link is invalid.')}
          </p>
          <Link
            to="/loyalty/recover"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: '#818cf8',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {isTr ? 'Kartımı E-posta ile Bul →' : isRu ? 'Найти карту по email →' : 'Find Card by Email →'}
          </Link>
        </div>
      </div>
    );
  }

  const { card, program, business } = data;
  const targetStamps = program.target_stamps || 10;
  const currentStamps = card.current_stamps;
  const isRewardReady = currentStamps >= targetStamps || card.reward_pending;
  const remainingStamps = Math.max(0, targetStamps - currentStamps);

  return (
    <div className="loyalty-public-layout" style={{ position: 'relative' }}>
      {/* Top Language Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <LanguageSelector variant="compact" />
      </div>

      {/* Business Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {business.logo_url || (business as any).logo ? (
            <img
              src={business.logo_url || (business as any).logo}
              alt={business.name}
              style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
            />
          ) : (
            <Award size={22} color="#818cf8" />
          )}
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{business.name}</span>
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {card.customer_name ? (
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {isTr ? `Merhaba, ${card.customer_name}` : isRu ? `Здравствуйте, ${card.customer_name}` : `Hello, ${card.customer_name}`}
            </span>
          ) : null}
          {card.customer_name && card.customer_email ? ' • ' : ''}
          {card.customer_email ? (
            <span style={{ color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={13} style={{ display: 'inline', verticalAlign: '-1px' }} />
              {card.customer_email}
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {program.name}
        </div>
      </div>

      {/* Reward Ready Celebration Banner */}
      {isRewardReady && (
        <div className="loyalty-reward-unlocked-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="loyalty-reward-icon-bounce">
              <Gift size={28} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fbbf24' }}>
                {isTr
                  ? 'Tebrikler! Ödül Kazandınız!'
                  : isRu
                  ? 'Поздравляем! Вы получили награду!'
                  : 'Congratulations! You earned a reward!'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fef3c7', marginTop: '2px' }}>
                {program.reward_description}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRedeemInfoModal(true)}
            className="loyalty-reward-redeem-btn"
          >
            {isTr ? 'Ödülü Kullan' : isRu ? 'Получить награду' : 'Redeem Reward'}
          </button>
        </div>
      )}

      {/* Punch Card Visual */}
      <div className="loyalty-punch-card-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
              {isTr ? 'Damga Durumu' : isRu ? 'Статус штампов' : 'Stamp Status'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {currentStamps}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {isTr ? `/ ${targetStamps} Damga` : isRu ? `/ ${targetStamps} шт.` : `/ ${targetStamps} Stamps`}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isTr ? 'Hedef Ödül' : isRu ? 'Целевая награда' : 'Reward Goal'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
              {program.reward_description}
            </div>
          </div>
        </div>

        {/* Punch Slots Grid */}
        <div className="loyalty-stamp-slots-grid">
          {Array.from({ length: targetStamps }).map((_, index) => {
            const isFilled = index < currentStamps;
            const isNext = index === currentStamps;
            return (
              <div
                key={index}
                className={`loyalty-stamp-slot ${isFilled ? 'stamp-filled' : ''} ${isNext ? 'stamp-next' : ''}`}
              >
                {isFilled ? (
                  <CheckCircle2 size={24} className="loyalty-stamp-check-icon" />
                ) : (
                  <span className="loyalty-stamp-slot-number">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar and subtitle */}
        <div style={{ marginTop: '1.25rem' }}>
          <div className="loyalty-progress-track">
            <div
              className="loyalty-progress-fill"
              style={{ width: `${Math.min(100, (currentStamps / targetStamps) * 100)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isTr
                ? (isRewardReady
                  ? 'Ödülünüz hazır! Personele göstererek teslim alabilirsiniz.'
                  : `Ödülünüze son ${remainingStamps} damga kaldı!`)
                : isRu
                ? (isRewardReady
                  ? 'Ваша награда готова! Покажите её персоналу для получения.'
                  : `До награды осталось ${remainingStamps} шт.!`)
                : (isRewardReady
                  ? 'Your reward is ready! Show it to the staff to claim.'
                  : `Only ${remainingStamps} stamps left to reward!`)}
            </span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>
              %{Math.round((currentStamps / targetStamps) * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic 30-Second QR Box */}
      <div className="loyalty-qr-card-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
            <Sparkles size={16} color="#818cf8" />
            <span>{isTr ? 'Dinamik Damga QR Kodu' : isRu ? 'Динамический QR-код' : 'Dynamic Stamp QR'}</span>
          </div>
          <button
            type="button"
            onClick={fetchScanToken}
            disabled={refreshingToken}
            title={isTr ? 'Kodu Yenile' : isRu ? 'Обновить код' : 'Refresh Code'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
            }}
          >
            <RefreshCw size={14} className={refreshingToken ? 'spin' : ''} />
            <span>{isTr ? 'Yenile' : isRu ? 'Обновить' : 'Refresh'}</span>
          </button>
        </div>

        {/* QR Canvas / Image */}
        <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
          <div className="loyalty-qr-canvas-wrapper">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={isTr ? 'Sadakat Damga QR Kodu' : isRu ? 'QR-код карты лояльности' : 'Loyalty Stamp QR Code'}
                className="loyalty-qr-img"
              />
            ) : (
              <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            )}
          </div>
        </div>

        {/* Expiry countdown bar */}
        <div style={{ marginTop: '0.75rem' }}>
          <div className="loyalty-timer-track">
            <div
              className="loyalty-timer-fill"
              style={{
                width: `${(secondsRemaining / 30) * 100}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isTr ? (
              <>QR Kod <strong style={{ color: '#a5b4fc' }}>{secondsRemaining} saniye</strong> içinde yenilenecektir.</>
            ) : isRu ? (
              <>QR-код обновится через <strong style={{ color: '#a5b4fc' }}>{secondsRemaining} сек.</strong></>
            ) : (
              <>QR Code refreshes in <strong style={{ color: '#a5b4fc' }}>{secondsRemaining}s</strong>.</>
            )}
          </div>
        </div>

        {/* Monospace Card Code Fallback */}
        <div className="loyalty-card-code-section">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {isTr
              ? 'QR taranamıyorsa bu kodu personele iletin:'
              : isRu
              ? 'Если QR не сканируется, покажите этот код персоналу:'
              : 'If QR cannot be scanned, show this code to the staff:'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span className="loyalty-card-code-badge">{card.card_code}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="loyalty-icon-action-btn"
              title={isTr ? 'Kodu Kopyala' : isRu ? 'Скопировать код' : 'Copy Code'}
            >
              {copiedCode ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            </button>
          </div>

          {/* Registered Email Row */}
          {card.customer_email && (
            <div style={{
              marginTop: '0.85rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Mail size={13} color="#818cf8" />
                {isTr ? 'Kayıtlı E-posta:' : isRu ? 'Зарегистрированный email:' : 'Registered Email:'}
              </span>
              <strong style={{ color: '#fff', letterSpacing: '0.01em' }}>{card.customer_email}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Customer Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowAddToHomeScreenModal(true)}
          className="loyalty-quick-action-btn"
        >
          <Smartphone size={16} color="#818cf8" />
          <span>{isTr ? 'Ana Ekrana Ekle' : isRu ? 'На экран' : 'Add to Home'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="loyalty-quick-action-btn"
        >
          {copiedLink ? <Check size={16} color="#34d399" /> : <Share2 size={16} color="#818cf8" />}
          <span>
            {copiedLink
              ? (isTr ? 'Kopyalandı' : isRu ? 'Скопировано' : 'Copied')
              : (isTr ? 'Bağlantı' : isRu ? 'Ссылка' : 'Share Link')}
          </span>
        </button>

        <button
          type="button"
          onClick={handleEmailMeLink}
          disabled={sendingEmail}
          className="loyalty-quick-action-btn"
        >
          <Mail size={16} color="#818cf8" />
          <span>
            {sendingEmail
              ? (isTr ? 'Gönderiliyor...' : isRu ? 'Отправка...' : 'Sending...')
              : (isTr ? 'E-postama At' : isRu ? 'На мой email' : 'Email to Me')}
          </span>
        </button>
      </div>

      {/* Stats summary */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          {isTr ? 'Toplam Damga: ' : isRu ? 'Всего штампов: ' : 'Total Stamps: '}
          <strong style={{ color: '#fff' }}>{card.total_stamps_earned}</strong>
        </div>
        <div>
          {isTr ? 'Alınan Ödül: ' : isRu ? 'Получено наград: ' : 'Rewards Claimed: '}
          <strong style={{ color: '#fbbf24' }}>{card.total_rewards_redeemed}</strong>
        </div>
      </div>

      {/* Add To Home Screen Modal */}
      {showAddToHomeScreenModal && (
        <div className="loyalty-modal-overlay" onClick={() => setShowAddToHomeScreenModal(false)}>
          <div className="loyalty-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={20} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  {isTr ? 'Ana Ekrana Ekle' : isRu ? 'Добавить на главный экран' : 'Add to Home Screen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddToHomeScreenModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {isTr
                ? 'Sadakat kartınıza her ziyarette tek dokunuşla ulaşmak için telefonunuzun ana ekranına kısayol ekleyebilirsiniz:'
                : isRu
                ? 'Вы можете добавить ярлык на главный экран телефона для мгновенного доступа к карте:'
                : 'You can add a shortcut to your phone home screen for instant one-tap access:'}
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: '#a5b4fc' }}>iPhone (Safari):</strong>
              {isTr ? (
                <>
                  <div>1. Alt kısımdaki <strong>Paylaş</strong> simgesine dokunun.</div>
                  <div>2. Listeyi kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</div>
                </>
              ) : isRu ? (
                <>
                  <div>1. Нажмите значок <strong>«Поделиться»</strong> внизу экрана.</div>
                  <div>2. Прокрутите и выберите <strong>«На экран Домой»</strong>.</div>
                </>
              ) : (
                <>
                  <div>1. Tap the <strong>Share</strong> icon at the bottom.</div>
                  <div>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</div>
                </>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <strong style={{ color: '#a5b4fc' }}>Android (Chrome):</strong>
              </div>
              {isTr ? (
                <>
                  <div>1. Sağ üstteki <strong>üç nokta</strong> menüsüne dokunun.</div>
                  <div>2. <strong>"Ana ekrana ekle"</strong> veya <strong>"Uygulamayı yükle"</strong> seçeneğini seçin.</div>
                </>
              ) : isRu ? (
                <>
                  <div>1. Нажмите на <strong>три точки</strong> в правом верхнем углу.</div>
                  <div>2. Выберите <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>.</div>
                </>
              ) : (
                <>
                  <div>1. Tap the <strong>three dots</strong> menu at the top right.</div>
                  <div>2. Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAddToHomeScreenModal(false)}
              className="loyalty-primary-btn"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {isTr ? 'Anladım' : isRu ? 'Понятно' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Redeem Info Modal */}
      {showRedeemInfoModal && (
        <div className="loyalty-modal-overlay" onClick={() => setShowRedeemInfoModal(false)}>
          <div className="loyalty-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift size={20} color="#fbbf24" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  {isTr ? 'Ödülünüzü Teslim Alın' : isRu ? 'Получите вашу награду' : 'Claim Your Reward'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRedeemInfoModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                {program.reward_description}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {isTr
                  ? 'Bu ödülü kullanmak için işletme personeline veya kasaya kart kodunuzu veya QR kodunuzu gösterin.'
                  : isRu
                  ? 'Чтобы воспользоваться наградой, покажите персоналу заведения ваш код карты или QR-код.'
                  : 'To redeem this reward, present your card code or QR code to the staff at the checkout.'}
              </p>
              <div style={{
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: '12px',
                padding: '0.85rem',
                margin: '1rem 0',
                display: 'inline-block'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
                  {isTr ? 'Kart Doğrulama Kodu' : isRu ? 'Код подтверждения карты' : 'Card Verification Code'}
                </div>
                <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginTop: '2px' }}>
                  {card.card_code}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isTr
                  ? 'Personel ödülü onayladığında damgalarınız sıfırlanacak ve yeni bir ödül için damga biriktirmeye başlayacaksınız.'
                  : isRu
                  ? 'После подтверждения персоналом штампы обнулятся, и вы начнете копить на следующую награду.'
                  : 'Once confirmed by staff, your stamps will reset and you will start earning towards your next reward.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRedeemInfoModal(false)}
              className="loyalty-primary-btn"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {isTr ? 'Tamam' : isRu ? 'Понятно' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom info note */}
      <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {isTr
          ? 'Naponi Loyalty • Temassız Sadakat Sistemi'
          : isRu
          ? 'Naponi Loyalty • Бесконтактная программа лояльности'
          : 'Naponi Loyalty • Contactless Loyalty System'}
      </div>
    </div>
  );
};
