import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MessageCircle,
  Globe,
  Send,
  Star,
  Music,
  ExternalLink,
  Check,
} from 'lucide-react';
import { api } from '../api/client';

export interface SocialLinksSectionProps {
  smartQr?: {
    socialLinks?: {
      instagram?: string | null;
      facebook?: string | null;
      tiktok?: string | null;
      twitter?: string | null;
      youtube?: string | null;
      whatsapp?: string | null;
      website?: string | null;
    };
    socialInstagram?: string | null;
    socialFacebook?: string | null;
    socialTiktok?: string | null;
    socialTwitter?: string | null;
    socialYoutube?: string | null;
    socialWhatsapp?: string | null;
    socialWebsite?: string | null;
    customLinks?: any[];
  } | null;
  publicToken?: string;
  language?: string;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  style?: React.CSSProperties;
  title?: string;
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  smartQr,
  publicToken,
  language = 'tr',
  onToast,
  style,
  title,
}) => {
  const [copiedWechatId, setCopiedWechatId] = useState<string | null>(null);

  if (!smartQr) return null;

  const sl = smartQr.socialLinks || {
    instagram: smartQr.socialInstagram,
    facebook: smartQr.socialFacebook,
    tiktok: smartQr.socialTiktok,
    twitter: smartQr.socialTwitter,
    youtube: smartQr.socialYoutube,
    whatsapp: smartQr.socialWhatsapp,
    website: smartQr.socialWebsite,
  };

  const wechatIcon = (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.478 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.294.295a.34.34 0 0 0 .17-.05l1.925-1.107a.89.89 0 0 1 .68-.09c.89.243 1.83.376 2.845.376.339 0 .674-.015 1.004-.044a7.89 7.89 0 0 1-.303-2.158c0-4.053 3.891-7.343 8.69-7.343.34 0 .672.016 1.002.045C17.97 5.485 13.66 2.188 8.691 2.188zm-2.58 4.292c.627 0 1.135.508 1.135 1.136 0 .627-.508 1.135-1.135 1.135-.628 0-1.136-.508-1.136-1.135 0-.628.508-1.136 1.136-1.136zm5.16 0c.628 0 1.136.508 1.136 1.136 0 .627-.508 1.135-1.136 1.135-.627 0-1.135-.508-1.135-1.135 0-.628.508-1.136 1.135-1.136zM16.5 10.375c-4.088 0-7.402 2.766-7.402 6.177 0 1.884 1.007 3.58 2.583 4.717a.5.5 0 0 1 .182.567l-.333 1.26c-.016.06-.04.12-.04.182 0 .14.11.25.25.25a.3.3 0 0 0 .145-.042l1.644-.943a.75.75 0 0 1 .58-.077c.76.208 1.564.321 2.39.321 4.088 0 7.402-2.765 7.402-6.176 0-3.411-3.314-6.176-7.402-6.176zm-2.203 3.662c.535 0 .968.434.968.97 0 .535-.433.968-.968.968-.536 0-.97-.433-.97-.969 0-.535.434-.969.97-.969zm4.406 0c.535 0 .97.434.97.97 0 .535-.435.968-.97.968-.535 0-.968-.433-.968-.969 0-.535.433-.969.968-.969z" />
    </svg>
  );

  const standardPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: sl?.instagram,
      isWechat: false,
      color: '#E1306C',
      bg: 'rgba(225, 48, 108, 0.08)',
      border: 'rgba(225, 48, 108, 0.22)',
      icon: <Instagram size={19} />,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: sl?.facebook,
      isWechat: false,
      color: '#1877F2',
      bg: 'rgba(24, 119, 242, 0.08)',
      border: 'rgba(24, 119, 242, 0.22)',
      icon: <Facebook size={19} />,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: sl?.tiktok,
      isWechat: false,
      color: '#000000',
      bg: 'rgba(0, 0, 0, 0.06)',
      border: 'rgba(0, 0, 0, 0.16)',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-6.61 6.35 6.34 6.34 0 0 0 6.35 6.33c3.5 0 6.34-2.84 6.34-6.33V9a8.28 8.28 0 0 0 4.78 1.5v-3.45a4.85 4.85 0 0 1-1.6-.36z" />
        </svg>
      ),
    },
    {
      id: 'twitter',
      name: 'X',
      url: sl?.twitter,
      isWechat: false,
      color: '#0f1419',
      bg: 'rgba(15, 20, 25, 0.06)',
      border: 'rgba(15, 20, 25, 0.18)',
      icon: <Twitter size={18} />,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: sl?.youtube,
      isWechat: false,
      color: '#FF0000',
      bg: 'rgba(255, 0, 0, 0.07)',
      border: 'rgba(255, 0, 0, 0.22)',
      icon: <Youtube size={19} />,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: sl?.whatsapp,
      isWechat: false,
      color: '#25D366',
      bg: 'rgba(37, 211, 102, 0.09)',
      border: 'rgba(37, 211, 102, 0.26)',
      icon: <MessageCircle size={19} />,
    },
    {
      id: 'website',
      name: language === 'tr' ? 'Web Sitesi' : 'Website',
      url: sl?.website,
      isWechat: false,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)',
      border: 'rgba(5, 150, 105, 0.22)',
      icon: <Globe size={18} />,
    },
  ].filter((p): p is typeof p & { url: string } => Boolean(p.url && p.url.trim()));

  const rawCustomLinks = smartQr?.customLinks || [];
  const customItems = (Array.isArray(rawCustomLinks) ? rawCustomLinks : [])
    .filter((cl) => cl && cl.value && cl.value.trim())
    .map((cl) => {
      const platform = (cl.platform || 'custom').toLowerCase();
      const rawVal = cl.value.trim();
      const itemTitle =
        cl.title?.trim() ||
        (platform === 'wechat'
          ? 'WeChat'
          : platform === 'telegram'
          ? 'Telegram'
          : platform === 'tripadvisor'
          ? 'TripAdvisor'
          : platform === 'spotify'
          ? 'Spotify'
          : language === 'tr'
          ? 'Bağlantı'
          : 'Link');

      if (platform === 'wechat') {
        const handle = rawVal.replace(/^@+/, '').trim();
        return {
          id: cl.id || `cl_${handle}`,
          name: itemTitle,
          isWechat: true,
          wechatId: handle,
          url: '',
          color: '#07C160',
          bg: 'rgba(7, 193, 96, 0.09)',
          border: 'rgba(7, 193, 96, 0.26)',
          icon: wechatIcon,
        };
      }

      if (platform === 'telegram') {
        const handle = rawVal.replace(/^(?:https?:\/\/)?(?:www\.)?t\.me\/?/i, '').replace(/^@+/, '').trim();
        return {
          id: cl.id || `cl_tg_${handle}`,
          name: itemTitle,
          isWechat: false,
          url: `https://t.me/${handle}`,
          color: '#229ED9',
          bg: 'rgba(34, 158, 217, 0.09)',
          border: 'rgba(34, 158, 217, 0.26)',
          icon: <Send size={18} />,
        };
      }

      if (platform === 'tripadvisor') {
        const targetUrl = /^https?:\/\//i.test(rawVal) ? rawVal : `https://${rawVal}`;
        return {
          id: cl.id || `cl_ta_${itemTitle}`,
          name: itemTitle,
          isWechat: false,
          url: targetUrl,
          color: '#00AA6C',
          bg: 'rgba(0, 170, 108, 0.09)',
          border: 'rgba(0, 170, 108, 0.26)',
          icon: <Star size={18} />,
        };
      }

      if (platform === 'spotify') {
        const targetUrl = /^https?:\/\//i.test(rawVal) ? rawVal : `https://${rawVal}`;
        return {
          id: cl.id || `cl_sp_${itemTitle}`,
          name: itemTitle,
          isWechat: false,
          url: targetUrl,
          color: '#1DB954',
          bg: 'rgba(29, 185, 84, 0.09)',
          border: 'rgba(29, 185, 84, 0.26)',
          icon: <Music size={18} />,
        };
      }

      const targetUrl = /^https?:\/\//i.test(rawVal) ? rawVal : `https://${rawVal}`;
      return {
        id: cl.id || `cl_custom_${itemTitle}`,
        name: itemTitle,
        isWechat: false,
        url: targetUrl,
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.09)',
        border: 'rgba(139, 92, 246, 0.26)',
        icon: <ExternalLink size={18} />,
      };
    });

  const allItems = [...standardPlatforms, ...customItems];
  if (allItems.length === 0) return null;

  const headerText = title || (language === 'tr' ? 'Bizi Takip Edin' : 'Connect With Us');

  return (
    <div
      style={{
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#78716C',
          }}
        >
          {headerText}
        </span>
        <div style={{ flex: 1, height: '1px', background: '#E7E5E4' }} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          padding: '0.25rem 0',
        }}
      >
        {allItems.map((p) => {
          if (p.isWechat) {
            const wechatId = (p as any).wechatId || '';
            const isCopied = copiedWechatId === wechatId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={async () => {
                  try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(wechatId);
                    }
                    setCopiedWechatId(wechatId);
                    setTimeout(() => setCopiedWechatId(null), 3000);
                    if (onToast) {
                      onToast(
                        language === 'tr'
                          ? `WeChat ID panoya kopyalandı: ${wechatId}`
                          : `WeChat ID copied: ${wechatId}`,
                        'success'
                      );
                    }
                  } catch {
                    if (onToast) onToast(`WeChat ID: ${wechatId}`, 'info');
                  }
                  if (publicToken) {
                    api.post(`/smart-qr/public/${publicToken}/event`, {
                      event_type: 'SOCIAL_CLICK',
                      metadata: { platform: 'wechat', value: wechatId },
                    }).catch(() => {});
                  }
                }}
                title={`WeChat: ${wechatId}`}
                aria-label={`WeChat: ${wechatId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: isCopied ? 'rgba(7, 193, 96, 0.18)' : p.bg,
                  border: `1.5px solid ${isCopied ? '#07C160' : p.border}`,
                  color: p.color,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                }}
              >
                {isCopied ? <Check size={18} /> : p.icon}
              </button>
            );
          }

          let finalUrl = p.url.trim();
          if (p.id === 'instagram') {
            const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
            finalUrl = `https://instagram.com/${handle}`;
          } else if (p.id === 'tiktok') {
            const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
            finalUrl = `https://tiktok.com/@${handle}`;
          } else if (p.id === 'facebook') {
            const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?facebook\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
            finalUrl = `https://facebook.com/${handle}`;
          } else if (p.id === 'twitter') {
            const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
            finalUrl = `https://x.com/${handle}`;
          } else if (p.id === 'youtube') {
            const handle = finalUrl.replace(/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/?/i, '').replace(/^[@\/]+/, '').replace(/\/+$/, '').trim();
            finalUrl = (handle.startsWith('channel/') || handle.startsWith('c/') || handle.startsWith('user/'))
              ? `https://youtube.com/${handle}`
              : `https://youtube.com/@${handle}`;
          } else if (p.id === 'whatsapp') {
            const digits = finalUrl.replace(/[\s\-\(\)\+]/g, '').replace(/^(?:https?:\/\/)?(?:www\.)?wa\.me\/?/i, '');
            finalUrl = `https://wa.me/${digits}`;
          } else if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = `https://${finalUrl}`;
          }

          return (
            <a
              key={p.id}
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={p.name}
              aria-label={p.name}
              onClick={() => {
                if (publicToken) {
                  api.post(`/smart-qr/public/${publicToken}/event`, {
                    event_type: 'SOCIAL_CLICK',
                    metadata: { platform: p.id, url: finalUrl },
                  }).catch(() => {});
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: p.bg,
                border: `1.5px solid ${p.border}`,
                color: p.color,
                textDecoration: 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              }}
            >
              {p.icon}
            </a>
          );
        })}
      </div>
    </div>
  );
};
export default SocialLinksSection;
