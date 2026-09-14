import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import {
  Award,
  QrCode,
  Keyboard,
  Gift,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface StampResult {
  previousStamps: number;
  newStamps: number;
  targetStamps: number;
  rewardEarned: boolean;
  rewardDescription: string;
  customerName?: string;
  customerEmail: string;
}

export const StaffLoyaltyScanPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'scan' | 'code' | 'redeem'>('scan');

  // Camera & Scan
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualQrToken, setManualQrToken] = useState('');
  const [processingScan, setProcessingScan] = useState(false);

  // Code tab
  const [cardCode, setCardCode] = useState('');
  const [processingCode, setProcessingCode] = useState(false);

  // Redeem tab
  const [redeemCardCode, setRedeemCardCode] = useState('');
  const [redeemVerifCode, setRedeemVerifCode] = useState('');
  const [processingRedeem, setProcessingRedeem] = useState(false);

  // Result Feedback Modal
  const [stampResult, setStampResult] = useState<StampResult | null>(null);
  const stampResultRef = useRef<StampResult | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ reward: string; customer: string } | null>(null);

  // Scanning debounce / lock ref
  const isScanningLockedRef = useRef(false);
  const lastScannedTokenRef = useRef<string>('');

  const updateStampResult = (result: StampResult | null) => {
    stampResultRef.current = result;
    setStampResult(result);
  };

  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not permitted, ignore
    }
  };

  const handleCloseStampModal = () => {
    updateStampResult(null);
    setManualQrToken('');
    // Clear lock quickly so next scan is recognized immediately
    setTimeout(() => {
      isScanningLockedRef.current = false;
      lastScannedTokenRef.current = '';
    }, 400);
  };

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera erişimi bu tarayıcıda desteklenmiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Kamera izni verilmedi veya kamera bulunamadı. Lütfen kamera iznini onaylayın veya QR kodunu el ile girin.');
      setCameraActive(false);
    }
  }, []);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  // BarcodeDetector loop if supported
  useEffect(() => {
    if (!cameraActive || activeTab !== 'scan') return;

    let animFrame: number;
    let barcodeDetector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        });
      } catch (e) {
        console.warn('BarcodeDetector initialization error:', e);
      }
    }

    const checkFrame = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        barcodeDetector &&
        !isScanningLockedRef.current &&
        !stampResultRef.current
      ) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const qrRawValue = barcodes[0].rawValue;
            if (
              qrRawValue &&
              qrRawValue !== lastScannedTokenRef.current &&
              !isScanningLockedRef.current &&
              !stampResultRef.current
            ) {
              isScanningLockedRef.current = true;
              lastScannedTokenRef.current = qrRawValue;
              handleProcessQrToken(qrRawValue);
            }
          }
        } catch (err) {
          // Frame detection drop, ignore
        }
      }

      // Loop continues seamlessly for the entire duration of the camera session
      animFrame = requestAnimationFrame(checkFrame);
    };

    if (barcodeDetector) {
      animFrame = requestAnimationFrame(checkFrame);
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [cameraActive, activeTab]);

  // QR Token Processing
  const handleProcessQrToken = async (tokenString: string) => {
    const trimmed = tokenString.trim();
    if (!trimmed) {
      isScanningLockedRef.current = false;
      return;
    }

    isScanningLockedRef.current = true;
    setProcessingScan(true);
    try {
      const res = await api.post('/loyalty/staff/stamp-qr', { token: trimmed });
      const data = res.data.data;
      playSuccessBeep();
      updateStampResult({
        previousStamps: data.card?.previous_stamps ?? data.previousStamps ?? (data.card?.current_stamps ? data.card.current_stamps - 1 : 0),
        newStamps: data.card?.current_stamps ?? data.currentStamps,
        targetStamps: data.program?.target_stamps ?? data.targetStamps,
        rewardEarned: data.rewardEarned,
        rewardDescription: data.program?.reward_description ?? data.rewardDescription,
        customerName: data.card?.customer_name ?? data.customerName,
        customerEmail: data.card?.customer_email ?? data.customerEmail,
      });
      setManualQrToken('');
      showToast('Damga başarıyla eklendi!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'QR damgalama başarısız oldu.', 'error');
      setTimeout(() => {
        isScanningLockedRef.current = false;
        lastScannedTokenRef.current = '';
      }, 2000);
    } finally {
      setProcessingScan(false);
    }
  };

  // Card Code Stamp
  const handleStampByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = cardCode.trim().toUpperCase();
    if (!code) {
      showToast('Lütfen kart kodunu girin', 'warning');
      return;
    }

    setProcessingCode(true);
    try {
      const res = await api.post('/loyalty/staff/stamp-code', { card_code: code });
      const data = res.data.data;
      playSuccessBeep();
      updateStampResult({
        previousStamps: data.card?.previous_stamps ?? data.previousStamps ?? (data.card?.current_stamps ? data.card.current_stamps - 1 : 0),
        newStamps: data.card?.current_stamps ?? data.currentStamps,
        targetStamps: data.program?.target_stamps ?? data.targetStamps,
        rewardEarned: data.rewardEarned,
        rewardDescription: data.program?.reward_description ?? data.rewardDescription,
        customerName: data.card?.customer_name ?? data.customerName,
        customerEmail: data.card?.customer_email ?? data.customerEmail,
      });
      setCardCode('');
      showToast('Damga başarıyla eklendi!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Kod ile damgalama başarısız oldu.', 'error');
    } finally {
      setProcessingCode(false);
    }
  };

  // Redeem Reward
  const handleRedeemReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = redeemCardCode.trim().toUpperCase();
    const verifCode = redeemVerifCode.trim().toUpperCase();
    if (!code && !verifCode) {
      showToast('Lütfen kart kodunu veya ödül doğrulama kodunu girin', 'warning');
      return;
    }

    setProcessingRedeem(true);
    try {
      const res = await api.post('/loyalty/staff/redeem', {
        card_code: code || undefined,
        cardCode: code || undefined,
        reward_verification_code: verifCode || undefined,
        rewardVerificationCode: verifCode || undefined,
        code: verifCode || code,
      });
      const data = res.data.data;
      setRedeemSuccess({
        reward: data.rewardTitle || data.program?.reward_description || 'Ödül',
        customer: data.customerName || data.customerEmail || data.card?.customer_name || data.card?.customer_email || 'Müşteri',
      });
      setRedeemCardCode('');
      setRedeemVerifCode('');
      showToast('Ödül başarıyla teslim edildi!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Ödül teslim işlemi başarısız.', 'error');
    } finally {
      setProcessingRedeem(false);
    }
  };

  return (
    <div className="page-wrapper loyalty-staff-page">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
          }}>
            <Award size={22} />
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.65rem' }}>Damga Bas & Ödül Teslim</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0' }}>
              Müşterinin dinamik QR kodunu tarayın veya 6 haneli kart kodunu girin.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="loyalty-staff-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`loyalty-staff-tab-btn ${activeTab === 'scan' ? 'tab--active' : ''}`}
        >
          <QrCode size={18} />
          <span>QR Kod Tara</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`loyalty-staff-tab-btn ${activeTab === 'code' ? 'tab--active' : ''}`}
        >
          <Keyboard size={18} />
          <span>Kod ile İşlem</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('redeem')}
          className={`loyalty-staff-tab-btn ${activeTab === 'redeem' ? 'tab--active' : ''}`}
        >
          <Gift size={18} />
          <span>Ödül Teslim Et</span>
        </button>
      </div>

      {/* TAB 1: QR SCANNER */}
      {activeTab === 'scan' && (
        <div className="loyalty-card-wrapper" style={{ padding: '1.5rem', maxWidth: '520px', margin: '0 auto' }}>
          <div className="loyalty-scanner-viewport">
            <video ref={videoRef} className="loyalty-video-feed" playsInline muted />
            <div className="loyalty-viewfinder-overlay">
              <div className="viewfinder-box">
                <div className="viewfinder-corner tl" />
                <div className="viewfinder-corner tr" />
                <div className="viewfinder-corner bl" />
                <div className="viewfinder-corner br" />
                <div className="viewfinder-scan-line" />
              </div>
            </div>
          </div>

          {cameraError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#fca5a5',
              fontSize: '0.82rem',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Manual QR paste or handheld scanner input */}
          <div style={{ marginTop: '1.25rem' }}>
            <label className="loyalty-input-label">
              El Tipi Barkod Okuyucu veya QR Metni:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder="QR token kodunu yapıştırın..."
                value={manualQrToken}
                onChange={(e) => setManualQrToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleProcessQrToken(manualQrToken);
                  }
                }}
              />
              <button
                type="button"
                disabled={processingScan || !manualQrToken.trim()}
                onClick={() => handleProcessQrToken(manualQrToken)}
                className="loyalty-primary-btn"
                style={{ padding: '0 1.25rem', whiteSpace: 'nowrap' }}
              >
                {processingScan ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Müşterinin telefonundaki 30 saniyelik dinamik QR kodu okutun.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CODE INPUT */}
      {activeTab === 'code' && (
        <div className="loyalty-card-wrapper" style={{ padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              margin: '0 auto 0.75rem'
            }}>
              <Keyboard size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem', fontWeight: 700 }}>6 Haneli Kart Kodu</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Müşterinin kartında yazan benzersiz kodu girin.
            </p>
          </div>

          <form onSubmit={handleStampByCode}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="loyalty-code-input"
                placeholder="Örn: 8F42K7"
                maxLength={8}
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={processingCode || !cardCode.trim()}
              className="loyalty-primary-btn"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Zap size={18} />
              {processingCode ? 'Damga Basılıyor...' : '+1 Damga Ekle'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: REDEEM REWARD */}
      {activeTab === 'redeem' && (
        <div className="loyalty-card-wrapper" style={{ padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(251,191,36,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              margin: '0 auto 0.75rem'
            }}>
              <Gift size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem', fontWeight: 700 }}>Ödül Teslim Et</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Hedef damgaya ulaşan müşterinin ödülünü onaylayıp kartını sıfırlayın.
            </p>
          </div>

          <form onSubmit={handleRedeemReward}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">Müşteri Kart Kodu</label>
              <input
                type="text"
                className="loyalty-code-input"
                placeholder="8F42K7"
                maxLength={8}
                value={redeemCardCode}
                onChange={(e) => setRedeemCardCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="loyalty-input-label">Ödül Doğrulama Kodu (Varsa)</label>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder="Örn: 82YR34 veya isteğe bağlı"
                value={redeemVerifCode}
                onChange={(e) => setRedeemVerifCode(e.target.value.toUpperCase())}
              />
            </div>

            <button
              type="submit"
              disabled={processingRedeem || (!redeemCardCode.trim() && !redeemVerifCode.trim())}
              className="loyalty-primary-btn"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Gift size={18} />
              {processingRedeem ? 'Onaylanıyor...' : 'Ödülü Teslim Et & Sıfırla'}
            </button>
          </form>
        </div>
      )}

      {/* RESULT FEEDBACK MODAL (STAMP SUCCESS) */}
      {stampResult && (
        <div className="loyalty-modal-overlay" onClick={handleCloseStampModal}>
          <div className="loyalty-modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: stampResult.rewardEarned ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)',
              color: stampResult.rewardEarned ? '#fbbf24' : '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              {stampResult.rewardEarned ? <Gift size={36} /> : <CheckCircle2 size={36} />}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              {stampResult.rewardEarned ? '🎉 Ödül Kazanıldı!' : 'Damga Eklendi!'}
            </h3>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {stampResult.customerName || stampResult.customerEmail}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Damga İlerlemesi
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0.25rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>{stampResult.previousStamps}</span>
                {' → '}
                <span style={{ color: stampResult.rewardEarned ? '#fbbf24' : '#34d399' }}>
                  {stampResult.newStamps}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {stampResult.targetStamps}</span>
              </div>

              {stampResult.rewardEarned && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: 'rgba(251,191,36,0.15)',
                  color: '#fef3c7',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}>
                  🎁 Hak Edilen: {stampResult.rewardDescription}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseStampModal}
              className="loyalty-primary-btn"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* REDEEM SUCCESS MODAL */}
      {redeemSuccess && (
        <div className="loyalty-modal-overlay" onClick={() => setRedeemSuccess(null)}>
          <div className="loyalty-modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.2)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Ödül Teslim Edildi!
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
              <strong style={{ color: '#fff' }}>{redeemSuccess.reward}</strong> ödülü müşteriye başarıyla teslim edildi ve kartındaki damgalar sıfırlandı.
            </p>

            <button
              type="button"
              onClick={() => setRedeemSuccess(null)}
              className="loyalty-primary-btn"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
