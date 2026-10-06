import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { StoreOrder, StoreOrderStatus } from '../../types';
import { useToast } from '../../components/Toast';
import {
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronDown,
  Building,
  User,
  Phone,
  MapPin,
  Edit2,
  X,
  FileText,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { t, formatCurrency, language } = useLanguage();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Edit/Status Modal
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null);
  const [newStatus, setNewStatus] = useState<StoreOrderStatus>('PENDING_PAYMENT');
  const [carrier, setCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/store/admin/orders');
      setOrders(res.data.data || []);
    } catch (err: any) {
      showToast('Siparişler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setSavingStatus(true);
      await api.patch(`/store/admin/orders/${editingOrder.id}/status`, {
        status: newStatus,
        payment_status: newStatus === 'PENDING_PAYMENT' ? 'UNPAID' : 'PAID',
        carrier: carrier.trim() || undefined,
        tracking_number: trackingNumber.trim() || undefined,
      });

      showToast('Sipariş durumu güncellendi', 'success');
      setEditingOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Güncelleme başarısız', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      ord.order_number.toLowerCase().includes(q) ||
      ord.bank_reference_code.toLowerCase().includes(q) ||
      ord.recipient_name.toLowerCase().includes(q) ||
      (ord.company_name && ord.company_name.toLowerCase().includes(q)) ||
      (ord.business?.name && ord.business.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Mağaza & Donanım Siparişleri</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            İşletmelerden gelen masa standı, yaka kartı ve donanım siparişlerini yönetin
          </p>
        </div>

        {/* Tab Switcher & Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Link
              to="/admin/products"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '8px',
                color: '#94a3b8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShoppingBag size={14} />
              Ürünleri Yönet
            </Link>
            <Link
              to="/admin/orders"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#38bdf8',
                color: '#0f172a',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Truck size={14} />
              Gelen Siparişler
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Sipariş / İşletme Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '36px', width: '220px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
            style={{ width: '160px' }}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PENDING_PAYMENT">Ödeme Bekleniyor</option>
            <option value="PAID">Ödeme Alındı</option>
            <option value="PREPARING">Baskıda / Hazırlanıyor</option>
            <option value="SHIPPED">Kargoya Verildi</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Siparişler yükleniyor...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Kriterlere uygun sipariş bulunamadı.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>İşletme / Alıcı</th>
                  <th>Ürünler</th>
                  <th>Tutar</th>
                  <th>Ref Kodu</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#f1f5f9' }}>{ord.order_number}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(ord.created_at).toLocaleDateString(language)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {ord.business?.name || ord.company_name || 'İşletme'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {ord.recipient_name} ({ord.phone})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {ord.items?.map((i) => `${i.quantity}x ${i.product?.name || 'Ürün'}`).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#38bdf8' }}>
                        {formatCurrency(Number(ord.total_amount), ord.currency)}
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '2px 6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {ord.bank_reference_code}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            ord.status === 'DELIVERED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : ord.status === 'SHIPPED'
                              ? 'rgba(99, 102, 241, 0.15)'
                              : ord.status === 'PREPARING'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : ord.status === 'PAID'
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            ord.status === 'DELIVERED'
                              ? '#34d399'
                              : ord.status === 'SHIPPED'
                              ? '#818cf8'
                              : ord.status === 'PREPARING'
                              ? '#c084fc'
                              : ord.status === 'PAID'
                              ? '#38bdf8'
                              : '#fbbf24',
                        }}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrder(ord);
                          setNewStatus(ord.status);
                          setCarrier(ord.carrier || '');
                          setTrackingNumber(ord.tracking_number || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Edit2 size={13} />
                        <span>Düzenle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '20px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#ffffff' }}>
                  Sipariş Durumu: {editingOrder.order_number}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {editingOrder.recipient_name} — {formatCurrency(Number(editingOrder.total_amount), editingOrder.currency)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              {/* Status Select */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Sipariş Aşaması
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StoreOrderStatus)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="PENDING_PAYMENT">Ödeme Bekleniyor (Awaiting Wire)</option>
                  <option value="PAID">Ödeme Alındı (Payment Confirmed)</option>
                  <option value="PREPARING">Baskıda / Hazırlanıyor (In Production)</option>
                  <option value="SHIPPED">Kargoya Verildi (Shipped)</option>
                  <option value="DELIVERED">Teslim Edildi (Delivered)</option>
                  <option value="CANCELLED">İptal Edildi (Cancelled)</option>
                </select>
              </div>

              {/* Carrier */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Kargo Firması
                </label>
                <input
                  type="text"
                  placeholder="Yurtiçi Kargo, Aras, DHL, UPS vb."
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Tracking Number */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Kargo Takip Numarası
                </label>
                <input
                  type="text"
                  placeholder="Kargo takip kodu"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Address preview */}
              <div style={{ padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '10px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>Teslimat Adresi:</div>
                <div>{editingOrder.address_line} {editingOrder.city} {editingOrder.postal_code || ''}</div>
                <div>Yetkili: {editingOrder.recipient_name} ({editingOrder.phone})</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="btn btn-primary"
                >
                  {savingStatus ? 'Kaydediliyor...' : 'Durumu Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
