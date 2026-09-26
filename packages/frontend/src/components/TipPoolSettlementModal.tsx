import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Coins,
  Check,
  Loader2,
  Calculator,
} from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../i18n';
import { useToast } from './Toast';
import { TipPoolSimulation, TipPoolDistribution } from '../types';

interface TipPoolSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  businessName?: string;
  onSettled?: () => void;
}

export const TipPoolSettlementModal: React.FC<TipPoolSettlementModalProps> = ({
  isOpen,
  onClose,
  currency = 'TRY',
  businessName,
  onSettled,
}) => {
  const { formatCurrency, formatDate, formatTime } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'simulate' | 'history'>('simulate');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [settling, setSettling] = useState(false);
  const [simulation, setSimulation] = useState<TipPoolSimulation | null>(null);
  const [historyList, setHistoryList] = useState<TipPoolDistribution[]>([]);
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState<string[]>([]);

  // Committed amounts currently reflected in simulation
  const [manualCash, setManualCash] = useState<string>('');
  const [manualPos, setManualPos] = useState<string>('');
  const [deductPosFeeFromManualPos, setDeductPosFeeFromManualPos] = useState<boolean>(true);

  // Local immediate input states for smooth, flicker-free typing
  const [cashInput, setCashInput] = useState<string>('');
  const [posInput, setPosInput] = useState<string>('');

  const [showManualInputs, setShowManualInputs] = useState<boolean>(false);
  const [note, setNote] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TipPoolDistribution | null>(null);
  const [markingShareId, setMarkingShareId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simulationRef = useRef<TipPoolSimulation | null>(null);
  simulationRef.current = simulation;

  // Fetch simulation with optional manual parameters
  const fetchSimulation = useCallback(
    async (
      excluded: string[] = excludedEmployeeIds,
      cashVal: string = manualCash,
      posVal: string = manualPos,
      deductFee: boolean = deductPosFeeFromManualPos,
      isInitial: boolean = false
    ) => {
      try {
        if (isInitial) {
          setInitialLoading(true);
        } else {
          setIsCalculating(true);
        }

        const params: any = {};
        const currentSim = simulationRef.current;
        if (excluded.length > 0 && currentSim) {
          const activeIds = currentSim.employees
            .filter((e) => !excluded.includes(e.employeeId))
            .map((e) => e.employeeId);
          params.activeEmployeeIds = activeIds.join(',');
        }
        const cashNum = parseFloat(cashVal);
        if (!isNaN(cashNum) && cashNum > 0) {
          params.manualCashAmount = cashNum;
        }
        const posNum = parseFloat(posVal);
        if (!isNaN(posNum) && posNum > 0) {
          params.manualPosAmount = posNum;
          params.deductPosFeeFromManualPos = deductFee;
        }

        const res = await api.get('/business/tip-pool/simulation', { params });
        if (res.data?.success && res.data.data) {
          setSimulation(res.data.data);
          setManualCash(cashVal);
          setManualPos(posVal);
        }
      } catch {
        showToast('Havuz simülasyonu yüklenemedi', 'error');
      } finally {
        if (isInitial) {
          setInitialLoading(false);
        }
        setIsCalculating(false);
      }
    },
    [excludedEmployeeIds, manualCash, manualPos, deductPosFeeFromManualPos, showToast]
  );

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
      setManualCash('');
      setManualPos('');
      setCashInput('');
      setPosInput('');
      setDeductPosFeeFromManualPos(true);
      setShowManualInputs(false);
      setNote('');
      setSelectedHistoryItem(null);
      fetchSimulation([], '', '', true, true);
      fetchHistory();
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, fetchHistory]);

  const commitManualValues = useCallback(
    (newCash: string, newPos: string, deductFee: boolean = deductPosFeeFromManualPos) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      fetchSimulation(excludedEmployeeIds, newCash, newPos, deductFee, false);
    },
    [excludedEmployeeIds, deductPosFeeFromManualPos, fetchSimulation]
  );

  const toggleEmployeeParticipation = (employeeId: string) => {
    const updated = excludedEmployeeIds.includes(employeeId)
      ? excludedEmployeeIds.filter((id) => id !== employeeId)
      : [...excludedEmployeeIds, employeeId];
    setExcludedEmployeeIds(updated);
    fetchSimulation(updated, cashInput, posInput, deductPosFeeFromManualPos, false);
  };

  const handleCashChange = (val: string) => {
    setCashInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      commitManualValues(val, posInput, deductPosFeeFromManualPos);
    }, 600);
  };

  const handlePosChange = (val: string) => {
    setPosInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      commitManualValues(cashInput, val, deductPosFeeFromManualPos);
    }, 600);
  };

  const handleInputBlurOrEnter = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (cashInput !== manualCash || posInput !== manualPos) {
      commitManualValues(cashInput, posInput, deductPosFeeFromManualPos);
    }
  };

  const handleDeductFeeChange = (val: boolean) => {
    setDeductPosFeeFromManualPos(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    commitManualValues(cashInput, posInput, val);
  };

  const handleToggleSharePaid = async (shareId: string, currentPaid: boolean) => {
    setMarkingShareId(shareId);
    try {
      await api.put(`/business/tip-pool/shares/${shareId}/pay`, {
        is_paid: !currentPaid,
      });
      if (selectedHistoryItem) {
        setSelectedHistoryItem({
          ...selectedHistoryItem,
          shares: (selectedHistoryItem.shares || []).map((s: any) =>
            s.id === shareId ? { ...s, is_paid: !currentPaid, paid_at: !currentPaid ? new Date().toISOString() : null } : s
          ),
        });
      }
      showToast(!currentPaid ? 'Personel payı ödendi olarak işaretlendi.' : 'Ödeme durumu geri alındı.');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'İşlem başarısız oldu.', 'error');
    } finally {
      setMarkingShareId(null);
    }
  };

  const handleMarkAllPaid = async (distributionId: string) => {
    if (!confirm('Bu kapanıştaki tüm personelin bahşiş paylarını ödendi olarak işaretlemek istediğinize emin misiniz?')) return;
    setMarkingAll(true);
    try {
      const res = await api.put(`/business/tip-pool/distributions/${distributionId}/pay-all`);
      if (res.data?.data) {
        setSelectedHistoryItem(res.data.data);
      }
      showToast('Tüm personel payları ödendi olarak işaretlendi.');
      fetchHistory();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'İşlem başarısız oldu.', 'error');
    } finally {
      setMarkingAll(false);
    }
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
      const cashNum = parseFloat(cashInput || manualCash);
      const posNum = parseFloat(posInput || manualPos);

      await api.post('/business/tip-pool/settle', {
        note: note.trim() || undefined,
        active_employee_ids: activeIds,
        manual_cash_amount: !isNaN(cashNum) && cashNum > 0 ? cashNum : undefined,
        manual_pos_amount: !isNaN(posNum) && posNum > 0 ? posNum : undefined,
        deduct_pos_fee_from_manual_pos: deductPosFeeFromManualPos,
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
    const isHistory = activeTab === 'history' && !!selectedHistoryItem;

    if (!isHistory && (!simulation || simulation.summary.grossAmount <= 0)) {
      showToast('Yazdırılacak aktif bahşiş veya hak ediş verisi bulunamadı.', 'error');
      return;
    }

    const title = isHistory
      ? 'KASA KAPANIŞ & PERSONEL HAK EDİŞ BORDROSU'
      : 'KASA KAPANIŞ & PERSONEL HAK EDİŞ BORDROSU';

    const bName = businessName || 'İşletme Bahşiş Kapanışı';
    const dateFormatted = isHistory
      ? `${formatDate(selectedHistoryItem!.created_at)} ${formatTime(selectedHistoryItem!.created_at)}`
      : `${formatDate(new Date())} ${formatTime(new Date())}`;

    const reportNote = isHistory
      ? selectedHistoryItem!.notes || '—'
      : note.trim() || 'Gün Sonu Kapanışı';

    const grossAmt = isHistory
      ? formatCurrency(Number(selectedHistoryItem!.gross_amount), currency)
      : formatCurrency(simulation!.summary.grossAmount, currency);

    const posFeeAmt = isHistory
      ? formatCurrency(Number(selectedHistoryItem!.pos_fee_amount), currency)
      : formatCurrency(simulation!.summary.posFeeAmount, currency);

    const taxFeeAmt = isHistory
      ? formatCurrency(Number(selectedHistoryItem!.tax_fee_amount), currency)
      : formatCurrency(simulation!.summary.taxFeeAmount, currency);

    const netDistributedAmt = isHistory
      ? formatCurrency(Number(selectedHistoryItem!.net_distributed_amount), currency)
      : formatCurrency(simulation!.summary.netDistributedAmount, currency);

    const cashPool = isHistory
      ? Number(selectedHistoryItem!.cash_amount || 0)
      : simulation!.summary.netCashPool || 0;

    const digitalPool = isHistory
      ? Number(selectedHistoryItem!.external_pos_amount || 0)
      : simulation!.summary.netDigitalPool || 0;

    const distributionModeText = !isHistory && simulation
      ? simulation.settings.mode === 'INDIVIDUAL'
        ? 'Bireysel Dağıtım (Direkt)'
        : simulation.settings.mode === 'EQUAL_POOL'
        ? 'Eşit Havuz (Pool)'
        : 'Puan / Rol Ağırlıklı Havuz'
      : 'Vardiya Havuz Dağıtımı';

    const rowsHtml = isHistory
      ? (selectedHistoryItem!.shares || [])
          .map((s, idx) => {
            const name = `${s.employee?.first_name || ''} ${s.employee?.last_name || ''}`.trim() || 'Personel';
            const pos = s.employee?.position || s.employee?.role_title || 'Servis Ekibi';
            const weight = `${Number(s.share_weight || 1).toFixed(2)}x`;
            const gross = formatCurrency(Number(s.gross_share || 0), currency);
            const net = formatCurrency(Number(s.net_share || 0), currency);
            const breakdown: string[] = [];
            if (Number(s.cash_share || 0) > 0) breakdown.push(`Nakit: ${formatCurrency(Number(s.cash_share), currency)}`);
            if (Number(s.digital_share || 0) > 0) breakdown.push(`Banka: ${formatCurrency(Number(s.digital_share), currency)}`);
            const status = s.is_paid ? '✓ Ödendi' : 'Bekliyor';

            return `
              <tr>
                <td style="text-align: center; color: #6b7280; font-weight: 600;">${idx + 1}</td>
                <td><strong>${name}</strong></td>
                <td>${pos}</td>
                <td style="text-align: center;">${weight}</td>
                <td style="text-align: right; color: #4b5563;">${gross}</td>
                <td style="text-align: right; font-weight: 800; color: #15803d;">
                  ${net}
                  ${breakdown.length > 0 ? `<div style="font-size: 8.5px; color: #6b7280; font-weight: 400;">(${breakdown.join(' • ')})</div>` : ''}
                </td>
                <td style="text-align: center; font-size: 9.5px;">${status}</td>
                <td style="height: 22px; border-bottom: 1px dotted #9ca3af;"></td>
              </tr>
            `;
          })
          .join('')
      : (simulation!.employees || [])
          .map((d, idx) => {
            const name = d.employeeName || 'Personel';
            const pos = d.position || d.roleTitle || 'Servis Ekibi';
            const weight = `${d.shareWeight.toFixed(2)}x`;
            const gross = formatCurrency(d.grossShare, currency);
            const deductions = formatCurrency(d.posFeeShare + d.taxFeeShare, currency);
            const net = formatCurrency(d.netShare, currency);
            const breakdown: string[] = [];
            if (d.cashShare > 0) breakdown.push(`Nakit: ${formatCurrency(d.cashShare, currency)}`);
            if (d.digitalShare > 0) breakdown.push(`Banka: ${formatCurrency(d.digitalShare, currency)}`);

            return `
              <tr>
                <td style="text-align: center; color: #6b7280; font-weight: 600;">${idx + 1}</td>
                <td><strong>${name}</strong></td>
                <td>${pos}</td>
                <td style="text-align: center;">${weight}</td>
                <td style="text-align: right; color: #4b5563;">${gross}</td>
                <td style="text-align: right; color: #dc2626;">-${deductions}</td>
                <td style="text-align: right; font-weight: 800; color: #15803d;">
                  ${net}
                  ${breakdown.length > 0 ? `<div style="font-size: 8.5px; color: #6b7280; font-weight: 400;">(${breakdown.join(' • ')})</div>` : ''}
                </td>
                <td style="height: 22px; border-bottom: 1px dotted #9ca3af;"></td>
              </tr>
            `;
          })
          .join('');

    const staffCount = isHistory
      ? selectedHistoryItem!.shares?.length || 0
      : simulation!.employees?.length || 0;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${bName} - Kasa Kapanis ve Hak Edis Bordrosu</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.3;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.2px;
          }
          .header .biz-name {
            font-size: 13px;
            font-weight: 700;
            color: #1e3a8a;
            margin-top: 2px;
          }
          .header .meta {
            text-align: right;
            font-size: 9.5px;
            color: #4b5563;
          }
          .header .meta strong {
            color: #111827;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
            margin-bottom: 8px;
          }
          .summary-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            padding: 5px 6px;
            text-align: center;
          }
          .summary-card.highlight {
            background: #f0fdf4;
            border: 1.5px solid #22c55e;
          }
          .summary-card .label {
            font-size: 8.5px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 700;
            margin-bottom: 2px;
          }
          .summary-card .value {
            font-size: 12px;
            font-weight: 800;
            color: #111827;
          }
          .summary-card.highlight .value {
            color: #15803d;
            font-size: 13px;
          }
          .info-bar {
            display: flex;
            justify-content: space-between;
            background: #f3f4f6;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 9px;
            margin-bottom: 8px;
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 4px 6px;
            font-weight: 700;
            text-align: left;
            font-size: 9px;
          }
          td {
            border: 1px solid #e5e7eb;
            padding: 3.5px 5px;
            vertical-align: middle;
          }
          .signatures {
            margin-top: 14px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            page-break-inside: avoid;
          }
          .sign-box {
            border-top: 1px dashed #6b7280;
            padding-top: 5px;
            text-align: center;
            font-size: 9.5px;
            color: #4b5563;
          }
          .footer-note {
            margin-top: 10px;
            padding-top: 4px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <div class="biz-name">${bName}</div>
          </div>
          <div class="meta">
            <div><strong>Tarih / Saat:</strong> ${dateFormatted}</div>
            <div><strong>Model:</strong> ${distributionModeText}</div>
            ${reportNote !== '—' ? `<div><strong>Vardiya Notu:</strong> ${reportNote}</div>` : ''}
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Brüt Bahşiş</div>
            <div class="value">${grossAmt}</div>
          </div>
          <div class="summary-card">
            <div class="label">Banka POS Kesintisi</div>
            <div class="value" style="color: #dc2626;">-${posFeeAmt}</div>
          </div>
          <div class="summary-card">
            <div class="label">Stopaj / Vergi</div>
            <div class="value" style="color: #d97706;">-${taxFeeAmt}</div>
          </div>
          <div class="summary-card">
            <div class="label">Nakit / POS Dağılımı</div>
            <div class="value" style="font-size: 9.5px; font-weight: 700;">
              ${cashPool > 0 ? `💵 ${formatCurrency(cashPool, currency)}` : ''}
              ${cashPool > 0 && digitalPool > 0 ? ' • ' : ''}
              ${digitalPool > 0 ? `💳 ${formatCurrency(digitalPool, currency)}` : ''}
              ${cashPool === 0 && digitalPool === 0 ? '—' : ''}
            </div>
          </div>
          <div class="summary-card highlight">
            <div class="label">Net Dağıtılan Toplam</div>
            <div class="value">${netDistributedAmt}</div>
          </div>
        </div>

        <div class="info-bar">
          <span>Toplam Personel: <strong>${staffCount} kişi</strong></span>
          <span>Kapanış Referansı: <strong>${isHistory ? selectedHistoryItem!.id.slice(0, 8).toUpperCase() : 'CANLI-KAPANIS'}</strong></span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th>Personel Adı Soyadı</th>
              <th>Görev / Rol</th>
              <th style="width: 50px; text-align: center;">Katsayı</th>
              <th style="width: 70px; text-align: right;">Brüt Pay</th>
              ${!isHistory ? '<th style="width: 65px; text-align: right;">Kesinti</th>' : ''}
              <th style="width: 105px; text-align: right;">Net Hak Ediş</th>
              ${isHistory ? '<th style="width: 60px; text-align: center;">Durum</th>' : ''}
              <th style="width: 100px; text-align: center;">İmza / Teslim Alan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sign-box">
            <strong>Kasayı Kapatan / Vardiya Sorumlusu</strong><br>
            İmza / Kaşe
          </div>
          <div class="sign-box">
            <strong>İşletme Yetkilisi / Muhasebe Onayı</strong><br>
            İmza
          </div>
        </div>

        <div class="footer-note">
          <span>Naponi Akıllı Bahşiş & Temassız Hizmet Platformu (www.naponi.com)</span>
          <span>Resmi Rapor Dökümü • Çıktı Alma Zamanı: ${new Date().toLocaleString('tr-TR')}</span>
        </div>
      </body>
      </html>
    `;

    // Create an invisible iframe for instant, isolated, single-page A4 printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Print iframe error:', e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 250);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tip-pool-modal-overlay">
      <div className="glass-card tip-pool-modal-card">
        {/* Modal Header */}
        <div className="tip-pool-modal-header">
          <div className="tip-pool-modal-header-main">
            <div className="tip-pool-modal-header-left">
              <div className="tip-pool-modal-icon">
                <Split size={18} />
              </div>
              <div className="tip-pool-modal-titles">
                <h3 className="tip-pool-modal-title">
                  Bahşiş Dağıtımı & Kasa Kapat
                </h3>
                <p className="tip-pool-modal-desc">
                  Kasadaki dağıtılmamış bahşişler ve personel hak ediş dökümü
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm tip-pool-modal-close-mobile"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="tip-pool-modal-header-actions">
            {/* Tabs */}
            <div className="tip-pool-modal-tabs">
              <button
                type="button"
                onClick={() => { setActiveTab('simulate'); setSelectedHistoryItem(null); }}
                className={`btn btn-sm ${activeTab === 'simulate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                Kasadaki Dağıtım
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <History size={13} /> Geçmiş Kapanışlar
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm tip-pool-modal-close-desktop"
              style={{ padding: '0.4rem', borderRadius: '8px' }}
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="tip-pool-modal-body">
          {activeTab === 'simulate' ? (
            initialLoading && !simulation ? (
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
                <div className="tip-pool-mode-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dağıtım Modeli:</span>
                    <span className="badge badge-accent" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {simulation.settings.mode === 'INDIVIDUAL' && 'Bireysel Dağıtım (Direkt)'}
                      {simulation.settings.mode === 'EQUAL_POOL' && 'Eşit Havuz (Pool)'}
                      {simulation.settings.mode === 'POINT_POOL' && 'Puan / Rol Ağırlıklı Havuz'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>
                      Banka Kart Kesintisi:{' '}
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
                <div className="tip-pool-accumulation-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Clock size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
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

                {/* Harici Nakit & Kendi POS Bahşişi Ekleme Butonu / Paneli */}
                {!showManualInputs ? (
                  <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      type="button"
                      onClick={() => setShowManualInputs(true)}
                      className="btn btn-secondary btn-sm tip-pool-add-external-btn"
                    >
                      <Coins size={15} />
                      + Fiziksel Tip Box (Nakit) veya Kendi POS Bahşişinizi Ekleyin
                    </button>
                  </div>
                ) : (
                  <div
                    className="glass-card"
                    style={{
                      padding: '1rem 1.25rem',
                      marginBottom: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
                        <Coins size={16} />
                        Harici Bahşiş Ekle (Fiziksel Tip Box & İşletme POS'u)
                        {isCalculating && (
                          <span style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500, marginLeft: '0.5rem' }}>
                            <Loader2 size={12} className="animate-spin" /> Hesaplanıyor...
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {(cashInput !== manualCash || posInput !== manualPos) && (
                          <button
                            type="button"
                            onClick={handleInputBlurOrEnter}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Calculator size={12} />
                            Şimdi Hesapla
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowManualInputs(false);
                            if (manualCash || manualPos || cashInput || posInput) {
                              setCashInput('');
                              setPosInput('');
                              setManualCash('');
                              setManualPos('');
                              fetchSimulation(excludedEmployeeIds, '', '', deductPosFeeFromManualPos, false);
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                        >
                          Temizle & Gizle
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          💵 Fiziksel Tip Box / Nakit Bahşiş ({currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Örn: 1250"
                          value={cashInput}
                          onChange={(e) => handleCashChange(e.target.value)}
                          onBlur={handleInputBlurOrEnter}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInputBlurOrEnter();
                            }
                          }}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#4ade80', marginTop: '0.3rem', display: 'block' }}>
                          ✓ Nakit paradan POS komisyonu kesilmez (%100 net elden dağıtılır).
                        </span>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          💳 Kendi POS'unuzdan Çekilen Bahşiş ({currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Örn: 400"
                          value={posInput}
                          onChange={(e) => handlePosChange(e.target.value)}
                          onBlur={handleInputBlurOrEnter}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInputBlurOrEnter();
                            }
                          }}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                        />
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            marginTop: '0.4rem',
                            cursor: 'pointer',
                            fontSize: '0.73rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={deductPosFeeFromManualPos}
                            onChange={(e) => handleDeductFeeChange(e.target.checked)}
                          />
                          <span>Banka kart takas maliyeti (%{simulation.settings.posFeeRate}) bu tutardan da düşülsün</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {simulation.summary.grossAmount <= 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                      Kasanızda Dağıtılmamış Bahşiş Bulunmuyor
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                      Önceki tüm bahşişler başarıyla dağıtıldı. Kutudaki nakit parayı veya kendi POS'unuzdan çekilen bahşişi dağıtmak için yukarıdaki butondan harici tutar ekleyebilirsiniz.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                      {!showManualInputs && (
                        <button
                          type="button"
                          onClick={() => setShowManualInputs(true)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Coins size={14} /> Nakit / Kendi POS Bahşişini Ekle
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <History size={14} /> Geçmiş Kapanışlar
                      </button>
                    </div>
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
                    opacity: isCalculating ? 0.65 : 1,
                    transition: 'opacity 0.2s ease',
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
                      {simulation.summary.manualCashAmount || simulation.summary.manualPosAmount ? (
                        <span>
                          Naponi: {formatCurrency(simulation.summary.digitalGrossAmount || 0, currency)}
                          {simulation.summary.manualCashAmount ? ` • Nakit: ${formatCurrency(simulation.summary.manualCashAmount, currency)}` : ''}
                          {simulation.summary.manualPosAmount ? ` • POS: ${formatCurrency(simulation.summary.manualPosAmount, currency)}` : ''}
                        </span>
                      ) : (
                        `${simulation.summary.tipCount} işlem`
                      )}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Banka Kart Kesintisi
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                      -{formatCurrency(simulation.summary.posFeeAmount, currency)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      %{simulation.settings.posFeeRate} (Yalnızca kartlı işlemler)
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
                      {simulation.summary.netCashPool && simulation.summary.netCashPool > 0 ? (
                        <span>
                          💵 {formatCurrency(simulation.summary.netCashPool, currency)} Nakit
                          {simulation.summary.netDigitalPool && simulation.summary.netDigitalPool > 0 ? ` • 💳 ${formatCurrency(simulation.summary.netDigitalPool, currency)} Banka` : ''}
                        </span>
                      ) : (
                        `${simulation.employees.length} aktif personel`
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Breakdown Table */}
                <div style={{ marginBottom: '1.25rem', opacity: isCalculating ? 0.65 : 1, transition: 'opacity 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={16} style={{ color: 'var(--primary)' }} />
                      Vardiyadaki Personel Hak Ediş Dağılımı
                      {isCalculating && (
                        <span style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500, marginLeft: '0.5rem' }}>
                          <Loader2 size={12} className="animate-spin" /> Güncelleniyor...
                        </span>
                      )}
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
                                <td className="text-right">
                                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4ade80' }}>
                                    {formatCurrency(emp.netShare, currency)}
                                  </div>
                                  {simulation.summary.netCashPool && simulation.summary.netCashPool > 0 ? (
                                    <div style={{ fontSize: '0.7rem', marginTop: '0.15rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: 'flex-end' }}>
                                      <span style={{ color: '#4ade80', fontWeight: 600 }}>💵 {formatCurrency(emp.cashShare, currency)} Nakit</span>
                                      {emp.digitalShare > 0 && (
                                        <span style={{ color: '#60a5fa' }}>💳 {formatCurrency(emp.digitalShare, currency)} Banka</span>
                                      )}
                                    </div>
                                  ) : null}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px' }}>
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
                      {Number(selectedHistoryItem.cash_amount || 0) > 0 && (
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nakit Bahşiş: </span>
                          <strong style={{ color: '#4ade80' }}>💵 {formatCurrency(Number(selectedHistoryItem.cash_amount), currency)}</strong>
                        </div>
                      )}
                      {Number(selectedHistoryItem.external_pos_amount || 0) > 0 && (
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Harici POS: </span>
                          <strong style={{ color: '#60a5fa' }}>💳 {formatCurrency(Number(selectedHistoryItem.external_pos_amount), currency)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Personel Pay Dağılımı</h4>
                    <button
                      type="button"
                      onClick={() => handleMarkAllPaid(selectedHistoryItem.id)}
                      disabled={markingAll || selectedHistoryItem.shares?.every((s: any) => s.is_paid)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{markingAll ? 'İşleniyor...' : 'Tümünü Ödendi Olarak İşaretle'}</span>
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Personel</th>
                          <th>Katsayı</th>
                          <th className="text-right">Brüt Pay</th>
                          <th className="text-right">Net Hak Ediş</th>
                          <th style={{ textAlign: 'center' }}>Ödeme Durumu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedHistoryItem.shares?.map((share: any) => (
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
                            <td className="text-right">
                              <div style={{ fontWeight: 800, color: '#4ade80' }}>
                                {formatCurrency(Number(share.net_share), currency)}
                              </div>
                              {Number(share.cash_share || 0) > 0 && (
                                <div style={{ fontSize: '0.7rem', marginTop: '0.15rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: 'flex-end' }}>
                                  <span style={{ color: '#4ade80', fontWeight: 600 }}>💵 {formatCurrency(Number(share.cash_share), currency)} Nakit</span>
                                  {Number(share.digital_share || 0) > 0 && (
                                    <span style={{ color: '#60a5fa' }}>💳 {formatCurrency(Number(share.digital_share), currency)} Banka</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {share.is_paid ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                                    ✓ Ödendi
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSharePaid(share.id, true)}
                                    disabled={markingShareId === share.id}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', color: 'var(--text-muted)' }}
                                    title="Ödeme durumunu geri al"
                                  >
                                    Geri Al
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleSharePaid(share.id, false)}
                                  disabled={markingShareId === share.id}
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <Check size={12} />
                                  <span>{markingShareId === share.id ? '...' : 'Ödendi Olarak İşaretle'}</span>
                                </button>
                              )}
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
        <div className="tip-pool-modal-footer">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary tip-pool-print-btn"
          >
            <Printer size={15} /> Yazdır / Rapor Çıktısı Al
          </button>

          {activeTab === 'simulate' && (
            <div className="tip-pool-modal-footer-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary tip-pool-cancel-btn" style={{ fontSize: '0.85rem' }}>
                İptal
              </button>
              <button
                type="button"
                onClick={handleSettle}
                disabled={settling || !simulation || simulation.summary.grossAmount <= 0}
                className="btn btn-primary tip-pool-settle-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
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
