import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Lock,
  X,
} from 'lucide-react';
import { api } from '../api/client';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted?: () => void;
  forceRequired?: boolean;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  onClose,
  onAccepted,
  forceRequired = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreementData, setAgreementData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAcceptedLocally, setIsAcceptedLocally] = useState(false);
  const [acceptanceResult, setAcceptanceResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const MANDATORY_STATEMENT =
    "Okudum ve Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni kabul ediyorum.";

  useEffect(() => {
    if (isOpen) {
      fetchAgreement();
      setIsAcceptedLocally(false);
      setAcceptanceResult(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/agreements/active');
      if (res.data?.success) {
        setAgreementData(res.data.data);
        if (res.data.data.is_accepted) {
          setIsAcceptedLocally(true);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Sözleşme yüklenirken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAcceptedLocally) return;
    if (!agreementData?.version?.id) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.post('/agreements/accept', {
        versionId: agreementData.version.id,
        statement: MANDATORY_STATEMENT,
      });

      if (res.data?.success) {
        setAcceptanceResult(res.data.data);
        if (onAccepted) onAccepted();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Sözleşme onaylanırken bir hata oluştu.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 99999,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={forceRequired ? undefined : onClose}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #0f172a)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          padding: 0,
          color: 'var(--text-primary, #f8fafc)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--color-primary, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  Naponi İşletme Hizmet ve Kullanım Sözleşmesi
                </h2>
                {agreementData?.version && (
                  <span
                    className="badge badge-info"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      fontWeight: 700,
                    }}
                  >
                    v{agreementData.version.version}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', margin: '0.2rem 0 0 0' }}>
                Dijital Onay, Hukuki Yükümlülükler ve Elektronik İspat Kaydı (HMK m. 193)
              </p>
            </div>
          </div>

          {!forceRequired && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '0.75rem' }}>
              <div className="spinner" style={{ width: '32px', height: '32px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sözleşme yükleniyor...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 700, fontSize: '0.9rem' }}>Hata Oluştu</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</p>
                  <button
                    type="button"
                    onClick={fetchAgreement}
                    className="btn btn-secondary"
                    style={{ marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    Yeniden Dene
                  </button>
                </div>
              </div>
            </div>
          ) : acceptanceResult ? (
            /* Digital Confirmation Receipt Card */
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
                Sözleşme Başarıyla Onaylandı
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                Naponi İşletme Hizmet ve Kullanım Sözleşmesi elektronik imza ve zaman damgasıyla güvenli olarak kayıt altına alınmıştır.
              </p>

              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  background: 'var(--bg-input, rgba(255, 255, 255, 0.04))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  lineHeight: '1.8',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hukuki Delil Niteliği:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary, #6366f1)' }}>HMK m. 193 Kesin Delil</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sözleşme Versiyonu:</span>
                  <span style={{ fontWeight: 700 }}>v{acceptanceResult.acceptance?.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Onay Tarihi & Saati:</span>
                  <span>{new Date(acceptanceResult.acceptance?.accepted_at).toLocaleString('tr-TR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kaydedilen IP:</span>
                  <code style={{ fontFamily: 'monospace' }}>{acceptanceResult.acceptance?.ip_address}</code>
                </div>
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Belge SHA-256 Kriptografik Hash:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                    <code style={{ fontFamily: 'monospace', fontSize: '0.72rem', flex: 1, wordBreak: 'break-all' }}>
                      {acceptanceResult.verification?.content_hash || acceptanceResult.acceptance?.content_hash}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyHash(acceptanceResult.verification?.content_hash || acceptanceResult.acceptance?.content_hash)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Kopyala"
                    >
                      {copiedHash ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', padding: '0.65rem 2rem' }}
              >
                Tamam, Devam Et
              </button>
            </div>
          ) : (
            /* Agreement Reading & Confirmation View */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {agreementData?.is_accepted ? (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: '#10b981',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    <span>
                      Bu sözleşme versiyonu (v{agreementData.version?.version}) işletmeniz tarafından onaylanmıştır.
                    </span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Kabul Kaydı Aktif</span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span>Lütfen sözleşme maddelerini inceleyiniz.</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}>
                    <Lock size={14} /> Elektronik Onay Protokolü
                  </span>
                </div>
              )}

              {/* Scrollable Legal Content Area */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  minHeight: '340px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  padding: '1.25rem',
                  background: 'var(--bg-input, rgba(0, 0, 0, 0.25))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  lineHeight: '1.7',
                  color: 'var(--text-primary, #e2e8f0)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {agreementData?.content}
              </div>

              {/* Acceptance Actions */}
              {!agreementData?.is_accepted && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      marginBottom: '1rem',
                      lineHeight: '1.4',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAcceptedLocally}
                      onChange={(e) => setIsAcceptedLocally(e.target.checked)}
                      style={{
                        marginTop: '0.2rem',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary, #6366f1)',
                      }}
                    />
                    <span style={{ fontWeight: 600 }}>{MANDATORY_STATEMENT}</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, maxWidth: '420px', lineHeight: 1.4 }}>
                      Onayınız ile birlikte IP adresiniz, cihaz bilgisi ve SHA-256 belge özeti HMK m. 193 uyarınca bağlayıcı kayıt altına alınır.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {!forceRequired && (
                        <button
                          type="button"
                          onClick={onClose}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                        >
                          Kapat
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={!isAcceptedLocally || submitting}
                        className="btn btn-primary"
                        style={{
                          fontSize: '0.82rem',
                          padding: '0.5rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          opacity: !isAcceptedLocally || submitting ? 0.6 : 1,
                          cursor: !isAcceptedLocally || submitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {submitting ? (
                          <>
                            <div className="spinner" style={{ width: '14px', height: '14px' }} />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            <span>Sözleşmeyi Onayla</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
