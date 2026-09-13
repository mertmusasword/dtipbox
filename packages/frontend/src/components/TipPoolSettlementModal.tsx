import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Split,
  Printer,
  CheckCircle2,
  Calendar,
  Users,
  Percent,
  Clock,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
  History,
  Info,
} from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../i18n';
import { useToast } from './Toast';
import { TipPoolSimulation, TipPoolDistribution } from '../types';

interface TipPoolSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  onSettled?: () => void;
}

export const TipPoolSettlementModal: React.FC<TipPoolSettlementModalProps> = ({
  isOpen,
  onClose,
  currency = 'TRY',
  onSettled,
}) => {
  const { formatCurrency, formatDate, formatTime } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'simulate' | 'history'>('simulate');
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [simulation, setSimulation] = useState<TipPoolSimulation | null>(null);
  const [historyList, setHistoryList] = useState<TipPoolDistribution[]>([]);
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TipPoolDistribution | null>(null);

  // Fetch simulation
  const fetchSimulation = useCallback(async (excluded: string[] = []) => {
    try {
      setLoading(true);
      const res = await api.get('/business/tip-pool/simulation');
      if (res.data?.success && res.data.data) {
        const sim: TipPoolSimulation = res.data.data;
        if (excluded.length > 0) {
          const activeIds = sim.employees
            .filter((e) => !excluded.includes(e.employeeId))
            .map((e) => e.employeeId);
          const filteredRes = await api.get('/business/tip-pool/simulation', {
            params: { activeEmployeeIds: activeIds.join(',') },
          });
          setSimulation(filteredRes.data.data);
        } else {
          setSimulation(sim);
        }
      }
    } catch {
      showToast('Havuz simülasyonu yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch past settlements
  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/business/tip-pool/history', { params: { page: 1, limit: 15 } });
      if (res.data?.success) {
        setHistoryList(res.data.data.items || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setExcludedEmployeeIds([]);
      setNote('');
      setSelectedHistoryItem(null);
      fetchSimulation([]);
      fetchHistory();
    }
  }, [isOpen, fetchSimulation, fetchHistory]);

  const toggleEmployeeParticipation = (employeeId: string) => {
    const updated = excludedEmployeeIds.includes(employeeId)
      ? excludedEmployeeIds.filter((id) => id !== employeeId)
      : [...excludedEmployeeIds, employeeId];
    setExcludedEmployeeIds(updated);
    fetchSimulation(updated);
  };

  const handleSettle = async () => {
    if (!simulation || simulation.summary.grossAmount <= 0) {
      showToast('Dağıtılacak bahşiş bulunmamaktadır.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Kasada biriken net bahşişi (${formatCurrency(simulation.summary.netDistributedAmount, currency)}) seçili ${simulation.employees.length} personele paylaştırıp kasayı kapatmak istediğinize emin misiniz?`
    );
    if (!confirmed) return;

    try {
      setSettling(true);
      const activeIds = simulation.employees.map((e) => e.employeeId);
      await api.post('/business/tip-pool/settle', {
        note: note.trim() || undefined,
        active_employee_ids: activeIds,
      });

      showToast('Bahşişler personele başarıyla paylaştırıldı ve kasa kapatıldı!');
      fetchHistory();
      setActiveTab('history');
      if (onSettled) onSettled();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Kasa kapatma işlemi başarısız oldu.', 'error');
    } finally {
      setSettling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Split size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Bahşiş Dağıtımı & Kasa Kapat
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Kasadaki dağıtılmamış bahşişler, kesintiler ve personel hak ediş dökümü
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '8px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('simulate'); setSelectedHistoryItem(null); }}
                className={`btn btn-sm ${activeTab === 'simulate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Kasadaki Dağıtım
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <History size={13} /> Geçmiş Kapanışlar
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', borderRadius: '8px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'simulate' ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hesaplanıyor...</div>
              </div>
            ) : !simulation ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <AlertCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Veriler alınamadı.</p>
              </div>
            ) : (
              <div>
                {/* Mode & Rule Badge Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dağıtım Modeli:</span>
                    <span className="badge badge-accent" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {simulation.settings.mode === 'INDIVIDUAL' && 'Bireysel Dağıtım (Direkt)'}
                      {simulation.settings.mode === 'EQUAL_POOL' && 'Eşit Havuz (Pool)'}
                      {simulation.settings.mode === 'POINT_POOL' && 'Puan / Rol Ağırlıklı Havuz'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>
                      POS Kesintisi:{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {simulation.settings.posFeePayer === 'STAFF'
                          ? `%${simulation.settings.posFeeRate} (Personelden)`
                          : simulation.settings.posFeePayer === 'BUSINESS'
                          ? 'İşletme Karşılıyor'
                          : 'Müşteri Ödüyor'}
                      </strong>
                    </span>
                    {simulation.settings.taxDeductionEnabled && (
                      <span>
                        Stopaj:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          %{simulation.settings.taxFeeRate}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Kasadaki Birikim Bilgisi Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Clock size={16} style={{ color: '#60a5fa' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {simulation.period.accumulationNote || 'Kasadaki Dağıtılmamış Bahşişler'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {simulation.period.lastSettlementAt
                      ? `Son Kasa Kapanışı: ${formatDate(simulation.period.lastSettlementAt)} ${formatTime(simulation.period.lastSettlementAt)}`
                      : 'İlk Kasa Kapanışı'}
                  </div>
                </div>

                {simulation.summary.grossAmount <= 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                      }}
                    >
                      <CheckCircle2 size={30} />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Kasanızda Dağıtılmamış Yeni Bahşiş Bulunmuyor
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                      Önceki tüm bahşişler başarıyla dağıtıldı ve kasalar kapatıldı. Yeni dijital bahşişler alındıkça otomatik olarak burada birikecektir.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <History size={14} /> Geçmiş Kapanış Raporlarını İncele
                    </button>
                  </div>
                ) : (
                  <>
                {/* Financial Breakdown Grid (Gross -> POS -> Tax -> Net) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Brüt Bahşiş Toplamı
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(simulation.summary.grossAmount, currency)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {simulation.summary.tipCount} işlem
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      POS Komisyonu
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                      -{formatCurrency(simulation.summary.posFeeAmount, currency)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      %{simulation.settings.posFeeRate}
                    </div>
                  </div>

                  {simulation.settings.taxDeductionEnabled && (
                    <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Stopaj / Vergi
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
                        -{formatCurrency(simulation.summary.taxFeeAmount, currency)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        %{simulation.settings.taxFeeRate} oran
                      </div>
                    </div>
                  )}

                  <div
                    className="glass-card"
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Dağıtılabilir Net Havuz
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4ade80' }}>
                      {formatCurrency(simulation.summary.netDistributedAmount, currency)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {simulation.employees.length} aktif personel
                    </div>
                  </div>
                </div>

                {/* Staff Breakdown Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={16} style={{ color: 'var(--primary)' }} />
                      Vardiyadaki Personel Hak Ediş Dağılımı
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Vardiyada olmayan personelin yanındaki işareti kaldırabilirsiniz
                    </div>
                  </div>

                  {simulation.employees.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Aktif personel bulunamadı. Lütfen Personel sayfasından çalışan ekleyin.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
                      <table className="data-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: '38px', textAlign: 'center' }}>Vardiya</th>
                            <th>Personel & Görev</th>
                            <th>Havuz Payı</th>
                            <th className="text-right">Brüt Pay</th>
                            <th className="text-right">Kesintiler</th>
                            <th className="text-right">Net Hak Ediş</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simulation.employees.map((emp) => {
                            const isExcluded = excludedEmployeeIds.includes(emp.employeeId);
                            const totalDeduction = Number((emp.posFeeShare + emp.taxFeeShare).toFixed(2));
                            return (
                              <tr key={emp.employeeId} style={{ opacity: isExcluded ? 0.45 : 1 }}>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={!isExcluded}
                                    onChange={() => toggleEmployeeParticipation(emp.employeeId)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.employeeName}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {emp.position || emp.roleTitle || 'Personel'}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                                    🎯 {emp.shareWeight.toFixed(2)}x
                                  </span>
                                </td>
                                <td className="text-right" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  {formatCurrency(emp.grossShare, currency)}
                                </td>
                                <td className="text-right" style={{ fontSize: '0.85rem', color: '#f87171' }}>
                                  -{formatCurrency(totalDeduction, currency)}
                                </td>
                                <td className="text-right" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4ade80' }}>
                                  {formatCurrency(emp.netShare, currency)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Optional Note */}
                <div className="form-group mb-0" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Kapanış Notu / Vardiya Açıklaması (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: Akşam Kapanışı - Kasa 1"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </>
            )}
          </div>
        )
      ) : (
            /* History Tab */
            <div>
              {selectedHistoryItem ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryItem(null)}
                    className="btn btn-secondary btn-sm mb-4"
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    ← Geçmiş Listesine Dön
                  </button>

                  <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kapanış Tarihi</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                          {formatDate(selectedHistoryItem.created_at)} {formatTime(selectedHistoryItem.created_at)}
                        </div>
                        {selectedHistoryItem.notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                            Not: {selectedHistoryItem.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dağıtılan Net Tutar</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4ade80' }}>
                          {formatCurrency(Number(selectedHistoryItem.net_distributed_amount), currency)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Brüt: </span>
                        <strong>{formatCurrency(Number(selectedHistoryItem.gross_amount), currency)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POS Kesintisi: </span>
                        <strong style={{ color: '#f87171' }}>-{formatCurrency(Number(selectedHistoryItem.pos_fee_amount), currency)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stopaj: </span>
                        <strong style={{ color: '#fbbf24' }}>-{formatCurrency(Number(selectedHistoryItem.tax_fee_amount), currency)}</strong>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Personel Pay Dağılımı</h4>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Personel</th>
                          <th>Katsayı</th>
                          <th className="text-right">Brüt Pay</th>
                          <th className="text-right">Net Hak Ediş</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedHistoryItem.shares?.map((share) => (
                          <tr key={share.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {share.employee?.first_name} {share.employee?.last_name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {share.employee?.position || share.employee?.role_title || 'Personel'}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-accent">🎯 {Number(share.share_weight).toFixed(2)}x</span>
                            </td>
                            <td className="text-right" style={{ color: 'var(--text-muted)' }}>
                              {formatCurrency(Number(share.gross_share), currency)}
                            </td>
                            <td className="text-right" style={{ fontWeight: 800, color: '#4ade80' }}>
                              {formatCurrency(Number(share.net_share), currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Henüz kaydedilmiş bir kasa kapatma / havuz dağıtımı bulunmuyor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistoryItem(item)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} style={{ color: 'var(--primary)' }} />
                          {formatDate(item.created_at)} {formatTime(item.created_at)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {item.notes || 'Gün Sonu Kapanışı'} • {item.shares?.length || 0} personel
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80' }}>
                            {formatCurrency(Number(item.net_distributed_amount), currency)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Brüt: {formatCurrency(Number(item.gross_amount), currency)}
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} /> Yazdır / Rapor Çıktısı Al
          </button>

          {activeTab === 'simulate' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                İptal
              </button>
              <button
                type="button"
                onClick={handleSettle}
                disabled={settling || !simulation || simulation.summary.grossAmount <= 0}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#059669',
                }}
              >
                <CheckCircle2 size={15} />
                {settling ? 'Kaydediliyor...' : 'Kasayı Kapat & Bahşişleri Dağıt'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
