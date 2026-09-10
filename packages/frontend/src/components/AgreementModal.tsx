import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  X,
} from 'lucide-react';
import { api } from '../api/client';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted?: () => void;
  forceRequired?: boolean; // When true, modal cannot be simply dismissed without accepting
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
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [acceptanceResult, setAcceptanceResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const MANDATORY_STATEMENT =
    "Okudum ve Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni kabul ediyorum.";

  useEffect(() => {
    if (isOpen) {
      fetchAgreement();
      setIsAcceptedLocally(false);
      setIsScrolledToBottom(false);
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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // User reached near bottom (within 40px)
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      setIsScrolledToBottom(true);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={forceRequired ? undefined : onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Naponi İşletme Hizmet ve Kullanım Sözleşmesi
                </h2>
                {agreementData?.version && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    v{agreementData.version.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dijital Onay, Hukuki Yükümlülükler ve Elektronik İspat Kaydı (HMK m. 193)
              </p>
            </div>
          </div>

          {!forceRequired && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Sözleşme yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Hata Oluştu</h4>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchAgreement}
                  className="mt-3 text-xs font-semibold underline hover:no-underline"
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          ) : acceptanceResult ? (
            /* Digital Confirmation Receipt Card */
            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold mb-1">
                Sözleşme Başarıyla Onaylandı
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                Naponi İşletme Hizmet ve Kullanım Sözleşmesi elektronik imza ve zaman damgasıyla kayıt altına alınmıştır.
              </p>

              <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl p-5 text-left text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-sans font-medium">Doğrulama Protokolü:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 font-sans">
                    HMK m. 193 Kesin Delil
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Sözleşme Versiyonu:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    v{acceptanceResult.acceptance?.version}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Onay Zamanı (UTC):</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {new Date(acceptanceResult.acceptance?.accepted_at).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Kaydedilen IP:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {acceptanceResult.acceptance?.ip_address}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block mb-1">Belge SHA-256 Kriptografik Hash:</span>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                    <span className="truncate select-all text-[11px] text-slate-700 dark:text-slate-300">
                      {acceptanceResult.verification?.content_hash || acceptanceResult.acceptance?.content_hash}
                    </span>
                    <button
                      onClick={() => copyHash(acceptanceResult.verification?.content_hash || acceptanceResult.acceptance?.content_hash)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0"
                      title="Hash'i Kopyala"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/25"
                >
                  Tamam, Devam Et
                </button>
              </div>
            </div>
          ) : (
            /* Agreement Reading & Confirmation View */
            <>
              {agreementData?.is_accepted ? (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Bu sözleşme versiyonu (v{agreementData.version.version}) işletmeniz tarafından{' '}
                      <strong>{new Date(agreementData.accepted_at).toLocaleDateString('tr-TR')}</strong> tarihinde dijital olarak kabul edilmiştir.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                    Kabul Kaydı Aktif
                  </span>
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Lütfen sözleşme metnini sonuna kadar inceleyiniz.</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Elektronik İspat ve Onay Protokolü</span>
                  </div>
                </div>
              )}

              {/* Scrollable Text View */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed font-sans text-slate-800 dark:text-slate-200 selection:bg-blue-500/20"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="whitespace-pre-wrap font-sans space-y-4">
                  {agreementData?.content}
                </div>
              </div>

              {/* Acceptance Actions */}
              {!agreementData?.is_accepted && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={isAcceptedLocally}
                      onChange={(e) => setIsAcceptedLocally(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {MANDATORY_STATEMENT}
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm">
                      Onayınız ile birlikte IP adresiniz, tarayıcı bilgisi ve SHA-256 belge özeti HMK m. 193 uyarınca bağlayıcı kayıt altına alınır.
                    </p>

                    <div className="flex items-center gap-3">
                      {!forceRequired && (
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          Vazgeç
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={!isAcceptedLocally || submitting}
                        className={`px-5 py-2.5 rounded-xl font-medium text-xs transition-all flex items-center gap-2 ${
                          isAcceptedLocally && !submitting
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {submitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Sözleşmeyi Onayla</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
