import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { StoreProduct, StoreOrder, Employee } from '../../types';
import { convertCurrency, fetchLiveExchangeRates, ExchangeRates } from '../../utils/currency';
import { uploadImageToServer } from '../../utils/upload';
import { useAuth } from '../../contexts/AuthContext';
import { getLocalizedProduct, getLocalizedQrTypeOptions } from '../../i18n/storeProductLocales';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Plus,
  Minus,
  Trash2,
  Play,
  X,
  CreditCard,
  Building,
  Truck,
  Copy,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Users,
  Radio,
  Maximize2,
  QrCode,
  Loader2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface CartItem {
  product: StoreProduct;
  quantity: number;
  unitPrice?: number;
  customization: {
    size?: string;
    color?: string;
    sizePrice?: number;
    qrType?: string;
    qrTypeLabel?: string;
    customQrImageUrl?: string;
    tableStart?: number;
    tableEnd?: number;
    useLogo?: boolean;
    staffIds?: string[];
    notes?: string;
  };
}

const IMAGES_ILLUSTRATIVE_NOTE = {
  tr: 'Görseller temsilidir.',
  en: 'Images are for illustration purposes only.',
  de: 'Die Abbildungen sind symbolisch.',
  fr: 'Les images sont non contractuelles.',
  es: 'Las imágenes son ilustrativas.',
  pt: 'As imagens são meramente ilustrativas.',
  ru: 'Изображения носят иллюстративный характер.',
  ar: 'الصور تمثيلية فقط.',
  zh: '图片仅供参考。',
  id: 'Gambar hanya sebagai ilustrasi.',
  ja: '画像はイメージです。',
};

export const BusinessStorePage: React.FC = () => {
  const { t, formatCurrency, language } = useLanguage();
  const qrTypeOptions = getLocalizedQrTypeOptions(language);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const currentBusiness = user?.business;

  // Active Tab: 'catalog' | 'orders'
  const activeTab = searchParams.get('tab') === 'orders' ? 'orders' : 'catalog';

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Currency State - Defaults to business's registered currency if set (TRY, USD, EUR), else saved preference, else TRY
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    const savedCur = localStorage.getItem('naponi_store_currency');
    if (savedCur && ['TRY', 'USD', 'EUR'].includes(savedCur.toUpperCase())) {
      return savedCur.toUpperCase();
    }
    if (savedCur) localStorage.removeItem('naponi_store_currency');

    const bizCur = user?.business?.currency?.toUpperCase();
    if (bizCur && ['TRY', 'USD', 'EUR'].includes(bizCur)) {
      return bizCur;
    }
    const bizCountry = user?.business?.country?.toUpperCase();
    if (bizCountry && bizCountry !== 'TR' && bizCountry !== 'TURKEY' && bizCountry !== 'TÜRKİYE') {
      if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'GR', 'IE', 'FI'].includes(bizCountry)) return 'EUR';
      return 'USD';
    }
    return 'TRY';
  });
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    TRY: 1,
    USD: 1 / 38.5,
    EUR: 1 / 41.8,
  });

  const displayPrice = (amountInTRY: number): string => {
    const converted = convertCurrency(amountInTRY, 'TRY', selectedCurrency, exchangeRates);
    return formatCurrency(converted, selectedCurrency);
  };

  // Helper to dynamically calculate the lowest / starting price for a product across all sizes and tiers
  const getProductStartingPrice = (product: StoreProduct): { price: number; isStarting: boolean; isPackage: boolean } => {
    const variantsObj: any = product.variants;
    const sizes: any[] = variantsObj?.sizes || [];
    const basePrice = Number(product.price) || 0;

    if (!sizes || sizes.length === 0) {
      return { price: basePrice, isStarting: false, isPackage: false };
    }

    const tierPrices: number[] = [];
    const unitPrices: number[] = [];

    sizes.forEach((s) => {
      if (s.prices && typeof s.prices === 'object') {
        Object.values(s.prices).forEach((val) => {
          const num = Number(val);
          if (!isNaN(num) && num > 0) {
            tierPrices.push(num);
          }
        });
      }
      if (typeof s.price === 'number' && s.price > 0) {
        unitPrices.push(s.price);
      }
    });

    // If there are package tier prices (e.g. stickers in fixed packs)
    if (tierPrices.length > 0) {
      const minTier = Math.min(...tierPrices);
      return { price: minTier, isStarting: true, isPackage: true };
    }

    // Otherwise use minimum unit price across sizes
    if (unitPrices.length > 0) {
      const minUnit = Math.min(...unitPrices);
      return {
        price: minUnit,
        isStarting: minUnit !== basePrice || sizes.length > 1,
        isPackage: false,
      };
    }

    return { price: basePrice, isStarting: false, isPackage: false };
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Video Preview Modal
  const [videoModalProduct, setVideoModalProduct] = useState<StoreProduct | null>(null);

  // Customization Modal for a single product before adding
  const [customizingProduct, setCustomizingProduct] = useState<StoreProduct | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [tempQrType, setTempQrType] = useState<string>('table');
  const [tempCustomQrImage, setTempCustomQrImage] = useState<string>('');
  const [uploadingCustomQr, setUploadingCustomQr] = useState<boolean>(false);
  const qrFileInputRef = React.useRef<HTMLInputElement>(null);
  const [tempTableStart, setTempTableStart] = useState<number>(1);
  const [tempTableEnd, setTempTableEnd] = useState<number>(20);
  const [tempUseLogo, setTempUseLogo] = useState<boolean>(true);
  const [tempSelectedStaff, setTempSelectedStaff] = useState<string[]>([]);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [tempSelectedSize, setTempSelectedSize] = useState<string>('');
  const [tempSizePrice, setTempSizePrice] = useState<number>(0);
  const [tempColor, setTempColor] = useState<string>('Gümüş');

  // Checkout Form State - Pre-filled from business registration data
  const [shippingCountry, setShippingCountry] = useState<string>(() => {
    const bizCountry = user?.business?.country?.toUpperCase();
    if (bizCountry) {
      return (bizCountry === 'TR' || bizCountry === 'TURKEY' || bizCountry === 'TÜRKİYE') ? 'TR' : 'ABROAD';
    }
    return 'TR';
  });
  const [recipientName, setRecipientName] = useState<string>(() => user?.business?.name || '');
  const [phone, setPhone] = useState<string>(() => user?.business?.phone || '');
  const [addressLine, setAddressLine] = useState<string>(() => user?.business?.address || '');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>(() => user?.business?.name || '');
  const [taxOffice, setTaxOffice] = useState<string>('');
  const [taxNumber, setTaxNumber] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER'>('CREDIT_CARD');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Wire Instructions Modal (Shown after order placement or from orders list)
  const [wireModalData, setWireModalData] = useState<{
    order: StoreOrder;
    accounts: any[];
  } | null>(null);
  const [transferNotifying, setTransferNotifying] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Fullscreen Image Lightbox Preview
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    badge?: string | null;
    price?: number | string;
    currency?: string;
    isStarting?: boolean;
    isPackage?: boolean;
  } | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) setPreviewImage(null);
        if (videoModalProduct) setVideoModalProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, videoModalProduct]);

  const paymentProcessedRef = React.useRef(false);

  // Handle Lemon Squeezy return redirect (?payment=success)
  useEffect(() => {
    if (searchParams.get('payment') === 'success' && !paymentProcessedRef.current) {
      paymentProcessedRef.current = true;
      showToast('Kredi kartı ile ödemeniz başarıyla alındı! Siparişiniz hazırlanma aşamasında.', 'success');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('payment');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, showToast]);

  // Load initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [prodsRes, ordersRes, empsRes, bizRes, liveRates] = await Promise.all([
        api.get<any>('/store/products'),
        api.get<any>('/store/orders/my-orders').catch(() => ({ data: { data: [] } })),
        api.get<any>('/business/employees').catch(() => ({ data: { data: [] } })),
        api.get<any>('/business/profile').catch(() => ({ data: { data: null } })),
        fetchLiveExchangeRates().catch(() => null),
      ]);

      if (liveRates) {
        setExchangeRates(liveRates);
      }

      setProducts(prodsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setEmployees(empsRes.data.data || []);

      const biz = bizRes.data?.data || user?.business;
      if (biz) {
        setRecipientName((prev) => prev || biz.name || '');
        setPhone((prev) => prev || biz.phone || '');
        setAddressLine((prev) => prev || biz.address || '');
        setCompanyName((prev) => prev || biz.name || '');

        const bCountry = (biz.country || '').toUpperCase();
        const isTrBiz = !bCountry || bCountry === 'TR' || bCountry === 'TURKEY' || bCountry === 'TÜRKİYE';

        const savedCur = localStorage.getItem('naponi_store_currency');
        if (savedCur && ['TRY', 'USD', 'EUR'].includes(savedCur.toUpperCase())) {
          setSelectedCurrency(savedCur.toUpperCase());
          setShippingCountry(savedCur.toUpperCase() === 'TRY' ? (isTrBiz ? 'TR' : 'ABROAD') : 'ABROAD');
        } else {
          if (savedCur) localStorage.removeItem('naponi_store_currency');
          const bizCur = (biz.currency || '').toUpperCase();
          if (['TRY', 'USD', 'EUR'].includes(bizCur)) {
            setSelectedCurrency(bizCur);
            setShippingCountry(isTrBiz && bizCur === 'TRY' ? 'TR' : 'ABROAD');
          } else {
            if (isTrBiz) {
              setSelectedCurrency('TRY');
              setShippingCountry('TR');
            } else if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'GR', 'IE', 'FI'].includes(bCountry)) {
              setSelectedCurrency('EUR');
              setShippingCountry('ABROAD');
            } else {
              setSelectedCurrency('USD');
              setShippingCountry('ABROAD');
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products by category or sticker type & apply 11-language localization
  const filteredProducts = products
    .map((p) => getLocalizedProduct(p, language))
    .filter((p) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'opaque') return p.slug.includes('opaque');
      if (selectedCategory === 'transparent') return p.slug.includes('transparent');
      return p.category === selectedCategory;
    });

  // Calculate cart subtotal (in base TRY)
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice ?? Number(item.product.price)) * item.quantity,
    0
  );

  const isDomestic = shippingCountry === 'TR' || shippingCountry === 'TÜRKİYE' || shippingCountry === 'TURKEY';

  // Shipping fee calculation based on destination & active currency
  const getShippingInfo = () => {
    if (isDomestic) {
      if (selectedCurrency === 'TRY') {
        return {
          feeInActiveCurrency: 200,
          feeInTRY: 200,
          label: '200 ₺',
        };
      }
      const converted = convertCurrency(200, 'TRY', selectedCurrency, exchangeRates);
      return {
        feeInActiveCurrency: converted,
        feeInTRY: 200,
        label: formatCurrency(converted, selectedCurrency),
      };
    } else {
      // International / Abroad: Flat 15 in chosen foreign currency (USD or EUR)
      if (['USD', 'EUR'].includes(selectedCurrency)) {
        const rate = exchangeRates[selectedCurrency] || (selectedCurrency === 'USD' ? 1 / 38.5 : 1 / 41.8);
        return {
          feeInActiveCurrency: 15,
          feeInTRY: Math.round(15 / rate),
          label: formatCurrency(15, selectedCurrency),
        };
      }
      // If selectedCurrency is TRY for an international destination:
      const usdRate = exchangeRates.USD || (1 / 38.5);
      const tryAmt = Math.round(15 / usdRate);
      return {
        feeInActiveCurrency: tryAmt,
        feeInTRY: tryAmt,
        label: `${formatCurrency(tryAmt, 'TRY')} (15 $)`,
      };
    }
  };

  const shippingInfo = getShippingInfo();
  const subtotalInActiveCurrency = convertCurrency(cartSubtotal, 'TRY', selectedCurrency, exchangeRates);
  const grandTotalInActiveCurrency = subtotalInActiveCurrency + (cart.length > 0 ? shippingInfo.feeInActiveCurrency : 0);

  // Open customization modal
  const openCustomizer = (product: StoreProduct) => {
    setCustomizingProduct(product);
    const variantsObj: any = product.variants;
    const initialQty = variantsObj?.defaultQuantity || variantsObj?.quantities?.[0] || product.min_quantity || 1;
    setTempQuantity(initialQty);
    setTempTableStart(1);
    setTempTableEnd(20);
    setTempUseLogo(true);
    setTempSelectedStaff([]);
    setTempNotes('');
    setTempColor('Gümüş');

    if (product.category === 'badge') {
      setTempQrType('staff');
    } else {
      setTempQrType('table');
    }
    setTempCustomQrImage('');

    if (variantsObj?.sizes && variantsObj.sizes.length > 0) {
      const defaultSizeObj = variantsObj.sizes.find(
        (s: any) => s.id === variantsObj?.defaultSize || s.label === variantsObj?.defaultSize
      ) || variantsObj.sizes[0];
      setTempSelectedSize(defaultSizeObj.label);
      setTempSizePrice(defaultSizeObj.price || 0);
      const startingQty = defaultSizeObj.quantities?.[0] || variantsObj?.defaultQuantity || variantsObj?.quantities?.[0] || product.min_quantity || 1;
      setTempQuantity(startingQty);
    } else {
      setTempSelectedSize('');
      setTempSizePrice(Number(product.price));
      const startingQty = variantsObj?.defaultQuantity || variantsObj?.quantities?.[0] || product.min_quantity || 1;
      setTempQuantity(startingQty);
    }
  };

  // Upload custom QR or artwork image from computer
  const handleCustomQrFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      showToast('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, SVG, WebP)', 'warning');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Görsel boyutu maksimum 15MB olabilir', 'warning');
      return;
    }

    try {
      setUploadingCustomQr(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const uploadedUrl = await uploadImageToServer(base64, 'general');
          setTempCustomQrImage(uploadedUrl || base64);
          showToast('Özel QR / baskı görseliniz başarıyla yüklendi!', 'success');
        } catch {
          setTempCustomQrImage(base64);
          showToast('Görsel eklendi.', 'info');
        } finally {
          setUploadingCustomQr(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingCustomQr(false);
      showToast('Dosya okunurken bir hata oluştu', 'error');
    }
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!customizingProduct) return;

    const variantsObj: any = customizingProduct.variants;
    const currentSizeObj = variantsObj?.sizes?.find(
      (s: any) => s.label === tempSelectedSize || s.id === tempSelectedSize
    );

    let totalPrice: number = 0;
    if (currentSizeObj?.prices && currentSizeObj.prices[tempQuantity]) {
      totalPrice = Number(currentSizeObj.prices[tempQuantity]);
    } else if (tempSizePrice > 0) {
      totalPrice = tempSizePrice * tempQuantity;
    } else {
      totalPrice = Number(customizingProduct.price) * tempQuantity;
    }

    const calculatedUnitPrice = tempQuantity > 0 ? totalPrice / tempQuantity : totalPrice;

    const newItem: CartItem = {
      product: customizingProduct,
      quantity: tempQuantity,
      unitPrice: calculatedUnitPrice,
      customization: {
        size: tempSelectedSize || undefined,
        color: ['metal_plate', 'pleksi_stand'].includes(customizingProduct.category) ? tempColor : undefined,
        sizePrice: tempSizePrice > 0 ? tempSizePrice : undefined,
        qrType: tempQrType,
        qrTypeLabel: qrTypeOptions.find((o) => o.id === tempQrType)?.label || tempQrType,
        customQrImageUrl: tempCustomQrImage || undefined,
        tableStart: tempQrType === 'table' ? tempTableStart : undefined,
        tableEnd: tempQrType === 'table' ? tempTableEnd : undefined,
        useLogo: tempUseLogo,
        staffIds: tempQrType === 'staff' ? tempSelectedStaff : undefined,
        notes: ['metal_plate', 'pleksi_stand'].includes(customizingProduct.category)
          ? [`Renk: ${tempColor}`, tempNotes].filter(Boolean).join(' | ')
          : tempNotes || undefined,
      },
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingProduct(null);
    showToast(t('store.addedToCart') || 'Sepete Eklendi!', 'success');
  };

  // Remove item from cart
  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!recipientName.trim() || !phone.trim() || !addressLine.trim() || !city.trim()) {
      showToast('Lütfen teslimat adresi ve iletişim bilgilerini eksiksiz doldurun.', 'warning');
      return;
    }

    try {
      setSubmittingOrder(true);

      const payload = {
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          customization: i.customization,
        })),
        recipientName,
        phone,
        addressLine,
        city,
        postalCode,
        country: isDomestic ? 'TR' : 'ABROAD',
        companyName,
        taxOffice,
        taxNumber,
        notes: orderNotes,
        currency: selectedCurrency,
        paymentMethod,
      };

      const res = await api.post<any>('/store/orders', payload);
      const data = res.data.data;

      // Clear cart & close checkout
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);

      if (paymentMethod === 'CREDIT_CARD' && data.checkoutUrl) {
        showToast('Güvenli ödeme sayfasına yönlendiriliyorsunuz...', 'info');
        window.location.href = data.checkoutUrl;
        return;
      }

      // If bank transfer: Open wire instructions
      setWireModalData({
        order: data.order,
        accounts: data.wireInstructions.accounts,
      });

      // Refresh orders list
      fetchData();
      showToast(t('store.orderSuccessTitle') || 'Siparişiniz Başarıyla Alındı!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Sipariş oluşturulamadı', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Notify that bank wire transfer is done
  const handleNotifyTransferSent = async (orderId: string) => {
    try {
      setTransferNotifying(true);
      await api.post(`/store/orders/${orderId}/transfer-sent`, {
        note: 'Banka transferi işletme tarafından yapıldı olarak işaretlendi.',
      });
      // Close modal and navigate to orders tab immediately
      setWireModalData(null);
      setSearchParams({ tab: 'orders' });
      showToast('Havale bildiriminiz başarıyla iletildi! Ödemeniz onaylandığında siparişiniz hazırlanacaktır.', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Bildirim iletilemedi', 'error');
    } finally {
      setTransferNotifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading && products.length === 0) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (error && products.length === 0) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="store-page-container">
      {/* Header Banner */}
      <div className="glass-card store-banner-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={14} />
              <span>NAPONI QR ETİKET & BASKI</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {t('store.pageTitle') || 'Naponi QR Etiket Mağazası'}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Masalarınız, menüleriniz ve tezgahlarınız için suya ve sıvıya tam dayanıklı Opak ve Şeffaf QR etiketler sipariş edin.
            </p>
          </div>

          {/* Action Tabs & Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', padding: '4px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'catalog' })}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'catalog' ? 'rgba(99, 102, 241, 0.9)' : 'transparent',
                  color: activeTab === 'catalog' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {t('store.tabCatalog') || 'Ürün Kataloğu'}
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'orders' })}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'orders' ? 'rgba(99, 102, 241, 0.9)' : 'transparent',
                  color: activeTab === 'orders' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{t('store.tabOrders') || 'Siparişlerim'}</span>
                {orders.length > 0 && (
                  <span style={{ padding: '1px 6px', background: '#38bdf8', color: '#0f172a', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Currency Selector & Business Registered Info */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {currentBusiness && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                  }}
                  title={`Kayıtlı İşletme Konumu: ${currentBusiness.country || 'TR'} • Para Birimi: ${currentBusiness.currency || 'TRY'}`}
                >
                  <Building size={13} style={{ color: '#38bdf8' }} />
                  <span>Kayıtlı:</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{currentBusiness.country || 'TR'}</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>{currentBusiness.currency || 'TRY'}</span>
                </div>
              )}

              {/* Currency Selector Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {(['TRY', 'USD', 'EUR'] as const).map((curr) => {
                  const isActive = selectedCurrency === curr;
                  const labels: Record<string, string> = {
                    TRY: '₺ TRY',
                    USD: '$ USD',
                    EUR: '€ EUR',
                  };
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        localStorage.setItem('naponi_store_currency', curr);
                        if (curr === 'TRY') {
                          setShippingCountry('TR');
                        } else {
                          setShippingCountry('ABROAD');
                        }
                      }}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                      }}
                      title={`${curr} para biriminde görüntüle (otomatik kur çevirisi)`}
                    >
                      {labels[curr]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                background: cart.length > 0 ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'rgba(30, 41, 59, 0.8)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: cart.length > 0 ? '0 4px 18px rgba(99, 102, 241, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ShoppingBag size={18} />
              <span>{t('store.cartTitle') || 'Sepetim'}</span>
              {cart.length > 0 && (
                <span style={{ padding: '2px 8px', background: '#ffffff', color: '#4338ca', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {cart.reduce((n, i) => n + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: CATALOG ================= */}
      {activeTab === 'catalog' && (
        <>
          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '1.75rem',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {[
              { id: 'all', label: 'Tüm Ürünler' },
              { id: 'opaque', label: 'Opak QR Etiket' },
              { id: 'transparent', label: 'Şeffaf QR Etiket' },
              { id: 'metal_stand', label: 'Metal QR Stand' },
              { id: 'metal_plate', label: 'Metal QR Kod' },
              { id: 'pleksi_stand', label: 'Pleksi QR Stand' },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '10px',
                    border: active ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: active ? '#ffffff' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="store-product-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                {/* Media Preview Area (Click to open full high-res preview) */}
                <div
                  onClick={() => {
                    const { price: startingPrice, isStarting, isPackage } = getProductStartingPrice(product);
                    setPreviewImage({
                      url: product.image_url || '/hardware/opaque-qr-sticker-en.jpg',
                      title: product.name,
                      badge: product.badge,
                      price: startingPrice,
                      currency: product.currency,
                      isStarting,
                      isPackage,
                    });
                  }}
                  title="Görseli büyük boyutta incelemek için tıklayın"
                  style={{
                    height: '220px',
                    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'zoom-in',
                  }}
                >
                  <img
                    src={product.image_url || '/hardware/opaque-qr-sticker-en.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = '/naponi-brand.svg';
                      target.style.objectFit = 'contain';
                      target.style.width = '70%';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: product.image_url?.endsWith('.svg') ? 'contain' : 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />

                  {/* Gradient Shadow Overlay for Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.1) 45%, rgba(15, 23, 42, 0.4) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        zIndex: 2,
                      }}
                    >
                      {product.badge}
                    </div>
                  )}

                  {/* Zoom hint badge (top-right) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#cbd5e1',
                      zIndex: 2,
                      transition: 'all 0.2s ease',
                    }}
                    title="Görseli Büyüt"
                  >
                    <Maximize2 size={14} />
                  </div>

                  {/* Badges Bar (Bottom) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      right: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      zIndex: 3,
                      pointerEvents: 'none',
                    }}
                  >
                    {/* QR Badge Indicator */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#38bdf8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'auto',
                      }}
                    >
                      <QrCode size={12} style={{ color: '#38bdf8' }} />
                      <span>Dinamik QR</span>
                    </div>

                    {/* Video Showcase Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoModalProduct(product);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#38bdf8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'auto',
                      }}
                    >
                      <Play size={11} fill="#38bdf8" />
                      <span>{t('store.watchVideo') || 'Video'}</span>
                    </button>
                  </div>
                </div>

                {/* Illustrative images disclaimer */}
                <div style={{ padding: '0.35rem 1rem', fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)' }}>
                  {IMAGES_ILLUSTRATIVE_NOTE[language as keyof typeof IMAGES_ILLUSTRATIVE_NOTE] || IMAGES_ILLUSTRATIVE_NOTE.en}
                </div>

                {/* Content Area */}
                <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ minWidth: 0, width: '100%' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc', wordBreak: 'break-word' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {product.description}
                    </p>

                    {/* Features list */}
                    {product.features && product.features.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.1rem', width: '100%' }}>
                        {product.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Size Variants Preview Pills */}
                    {product.variants?.sizes && product.variants.sizes.length > 0 && (
                      <div style={{ marginBottom: '1rem', width: '100%' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                          Ölçü Seçenekleri:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', width: '100%' }}>
                          {product.variants.sizes.map((s) => (
                            <span
                              key={s.id}
                              style={{
                                padding: '3px 7px',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.08)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                color: '#e2e8f0',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Step Info Badge (only for non-size products) */}
                    {(product.quantity_step || 1) > 1 && (!product.variants?.sizes || product.variants.sizes.length === 0) && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: '#fbbf24',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        <Info size={13} />
                        <span>Min. {product.min_quantity} Adet ({product.quantity_step} ve katları)</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Cart button */}
                  {(() => {
                    const { price: startingPrice, isStarting, isPackage } = getProductStartingPrice(product);
                    return (
                      <div
                        style={{
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div style={{ minWidth: '110px' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                            {isStarting ? 'Başlayan Fiyatla' : (t('common.amount') || 'Birim Fiyat')}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                            {displayPrice(startingPrice)}
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>
                              {isPackage ? '/ paket' : '/ adet'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openCustomizer(product)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            padding: '0.65rem 1rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          <Plus size={16} />
                          <span>{t('store.addToCart') || 'Sepete Ekle'}</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= TAB 2: MY ORDERS ================= */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
              <Package size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
                {t('store.ordersEmpty') || 'Henüz verilmiş bir siparişiniz bulunmuyor.'}
              </h3>
              <p style={{ color: '#94a3b8', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Masalarınız ve ekibiniz için donanım kataloğumuzdaki ürünleri inceleyip sipariş oluşturabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setSearchParams({ tab: 'catalog' })}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                {t('store.tabCatalog') || 'Kataloğu Görüntüle'}
              </button>
            </div>
          ) : (
            orders.map((ord) => {
              // Status Badge Helper
              const getStatusMeta = (status: string, ordItem?: StoreOrder) => {
                if (status === 'PENDING_PAYMENT' && ((ordItem as any)?.payment_status === 'TRANSFER_NOTIFIED' || (ordItem as any)?.transfer_sender_note)) {
                  return { label: 'Havale Bildirildi (Onay Bekleniyor)', bg: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
                }
                switch (status) {
                  case 'PAID':
                    return { label: t('store.statusPaid') || 'Ödeme Alındı', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
                  case 'PREPARING':
                    return { label: t('store.statusPreparing') || 'Hazırlanıyor / Baskıda', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
                  case 'SHIPPED':
                    return { label: t('store.statusShipped') || 'Kargoya Verildi', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
                  case 'DELIVERED':
                    return { label: t('store.statusDelivered') || 'Teslim Edildi', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
                  case 'CANCELLED':
                    return { label: t('store.statusCancelled') || 'İptal Edildi', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
                  case 'PENDING_PAYMENT':
                  default:
                    return { label: t('store.statusPending') || 'Ödeme Bekleniyor', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
                }
              };

              const meta = getStatusMeta(ord.status, ord);

              return (
                <div
                  key={ord.id}
                  className="glass-card"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                          {ord.order_number}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(ord.created_at).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                        {t('common.amount') || 'Toplam'}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                        {formatCurrency(Number(ord.total_amount), ord.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {ord.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          background: 'rgba(30, 41, 59, 0.4)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, color: '#818cf8' }}>{item.quantity}x</span>
                          <span style={{ color: '#f1f5f9' }}>{item.product?.name || 'Ürün'}</span>
                          {item.customization && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              ({(item.customization as any).qrTypeLabel ? `${(item.customization as any).qrTypeLabel} • ` : ''}
                              {item.customization.size ? `Ölçü: ${item.customization.size}` : ''}
                              {item.customization.tableStart && item.customization.tableEnd ? ` • Masa ${item.customization.tableStart}-${item.customization.tableEnd}` : ''}
                              {item.customization.useLogo ? ' • Logolu' : ''}
                              {(item.customization as any).customQrImageUrl ? ' • Özel Görsel/QR Ekli' : ''})
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                          {formatCurrency(Number(item.unit_price) * item.quantity, ord.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping / Tracking Info if Shipped */}
                  {ord.tracking_number && (
                    <div
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.85rem' }}>
                        <Truck size={18} />
                        <span><strong>{ord.carrier || 'Kargo'}:</strong> {ord.tracking_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                    {ord.payment_status === 'UNPAID' && ord.payment_method === 'CREDIT_CARD' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.get<any>(`/store/orders/${ord.id}`);
                            if (res.data.data.checkoutUrl) {
                              window.location.href = res.data.data.checkoutUrl;
                            } else {
                              showToast('Ödeme oturumu alınamadı.', 'error');
                            }
                          } catch {
                            showToast('Ödeme sayfası başlatılamadı.', 'error');
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)',
                        }}
                      >
                        <CreditCard size={14} />
                        <span>Kartla Ödemeyi Tamamla</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await api.get<any>(`/store/orders/${ord.id}`);
                          setWireModalData({
                            order: res.data.data.order,
                            accounts: res.data.data.wireInstructions.accounts,
                          });
                        } catch {
                          showToast('Sipariş detayları yüklenemedi', 'error');
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Building size={14} />
                      <span>{t('store.viewWireDetails') || 'Havale Bilgilerini Gör'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= MODAL: CUSTOMIZATION & ADD TO CART ================= */}
      {customizingProduct && (
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
              maxWidth: '560px',
              borderRadius: '20px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#ffffff' }}>
                  {customizingProduct.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {t('store.customization') || 'Özelleştirme Seçenekleri'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Size Variants Selection (Ölçü Seçenekleri) */}
            {customizingProduct.variants?.sizes && customizingProduct.variants.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Ölçü Seçenekleri:
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>
                    Seçilen: {tempSelectedSize}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {customizingProduct.variants.sizes.map((s) => {
                    const isSelected = tempSelectedSize === s.label || tempSelectedSize === s.id;
                    const startingQty = s.quantities?.[0] || customizingProduct.variants?.quantities?.[0] || tempQuantity;
                    const tierPrice = s.prices?.[startingQty];

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setTempSelectedSize(s.label);
                          setTempSizePrice(s.price || 0);
                          const sizeQtys = s.quantities && s.quantities.length > 0 ? s.quantities : customizingProduct.variants?.quantities;
                          if (sizeQtys && sizeQtys.length > 0) {
                            if (!sizeQtys.includes(tempQuantity)) {
                              setTempQuantity(sizeQtys[0]);
                            }
                          }
                        }}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{s.label}</div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? '#38bdf8' : '#94a3b8', marginTop: '3px', fontWeight: 600 }}>
                          {tierPrice
                            ? `${displayPrice(tierPrice)}${s.quantities?.[0] ? ` (${s.quantities[0]} ad.)` : ''}`
                            : `${displayPrice(s.price || 0)} / adet`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selection (metal plate only) */}
            {['metal_plate', 'pleksi_stand'].includes(customizingProduct.category) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Renk Seçeneği:
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>
                    Seçilen: {tempColor}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {[
                    { name: 'Gümüş', hex: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)' },
                    { name: 'Altın', hex: 'linear-gradient(135deg, #fde68a 0%, #b8860b 100%)' },
                    { name: 'Bronz', hex: 'linear-gradient(135deg, #d9a066 0%, #8a5a2b 100%)' },
                    { name: 'Beyaz', hex: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)' },
                  ].map((c) => {
                    const isSel = tempColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setTempColor(c.name)}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '12px',
                          border: isSel ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: isSel ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                          color: isSel ? '#ffffff' : '#cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(255,255,255,0.35)' }} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector: Fixed Cards or Step Counter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                  {t('store.quantity') || 'Sipariş Adedi'}
                </label>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  Seçilen: {tempQuantity} Adet
                </span>
              </div>

              {/* If product or selected size has fixed quantities, render fixed cards */}
              {(() => {
                const currentSizeObj = customizingProduct.variants?.sizes?.find(
                  (s: any) => s.label === tempSelectedSize || s.id === tempSelectedSize
                );
                const activeQuantities = currentSizeObj?.quantities && currentSizeObj.quantities.length > 0
                  ? currentSizeObj.quantities
                  : customizingProduct.variants?.quantities;

                if (activeQuantities && activeQuantities.length > 0) {
                  return (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {activeQuantities.map((qty: number) => {
                          const isSelected = tempQuantity === qty;
                          const tierPrice = currentSizeObj?.prices?.[qty];

                          return (
                            <button
                              key={qty}
                              type="button"
                              onClick={() => setTempQuantity(qty)}
                              style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.12)',
                                background: isSelected ? '#0284c7' : 'rgba(30, 41, 59, 0.55)',
                                color: isSelected ? '#ffffff' : '#f8fafc',
                                cursor: 'pointer',
                                textAlign: 'left',
                                boxShadow: isSelected ? '0 4px 15px rgba(2, 132, 199, 0.45)' : 'none',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}
                            >
                              <div style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.1 }}>
                                {qty}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255, 255, 255, 0.85)' : '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                                Adet
                              </div>
                              {tierPrice && (
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#ffffff' : '#38bdf8', marginTop: '5px' }}>
                                  {displayPrice(tierPrice)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        💡 <strong>{tempSelectedSize}</strong> ölçüsüne özel kalıp ve baskı standart paket adetleri uygulanmaktadır.
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(30, 41, 59, 0.6)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const step = customizingProduct.quantity_step || 1;
                          const min = customizingProduct.min_quantity || 1;
                          setTempQuantity(Math.max(min, tempQuantity - step));
                        }}
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, minWidth: '45px', textAlign: 'center', color: '#38bdf8' }}>
                        {tempQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const step = customizingProduct.quantity_step || 1;
                          setTempQuantity(tempQuantity + step);
                        }}
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {(customizingProduct.quantity_step || 1) > 1 && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.45rem' }}>
                        💡 Bu ürün baskı standardı gereği <strong>{customizingProduct.quantity_step} ve katları</strong> şeklinde sipariş verilebilir.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* QR Code Type & Purpose Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                  QR Kodu Türü & Baskı Amacı
                </label>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                  {qrTypeOptions.find((o) => o.id === tempQrType)?.label}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {qrTypeOptions.map((qt) => {
                  const isSelected = tempQrType === qt.id;
                  return (
                    <button
                      key={qt.id}
                      type="button"
                      onClick={() => setTempQrType(qt.id)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.45)',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title={qt.desc}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{qt.icon}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#ffffff' : '#e2e8f0', lineHeight: 1.2 }}>
                        {qt.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table range if Table QR */}
            {tempQrType === 'table' && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  🍽️ Masa Numarası Aralığı
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' }}>Başlangıç Masası</label>
                    <input
                      type="number"
                      min={1}
                      value={tempTableStart}
                      onChange={(e) => setTempTableStart(Number(e.target.value))}
                      className="input"
                      style={{ width: '100%', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' }}>Bitiş Masası</label>
                    <input
                      type="number"
                      min={tempTableStart}
                      value={tempTableEnd}
                      onChange={(e) => setTempTableEnd(Number(e.target.value))}
                      className="input"
                      style={{ width: '100%', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '0.45rem' }}>
                  💡 Masa {tempTableStart} ile Masa {tempTableEnd} arası ({Math.max(1, tempTableEnd - tempTableStart + 1)} adet) numaralı masa QR kodları üretilip basılacaktır.
                </div>
              </div>
            )}

            {/* Staff selection if Staff QR or badge */}
            {(tempQrType === 'staff' || customizingProduct.category === 'badge') && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  👔 Yaka Kartı / QR Basılacak Personeller
                </label>
                {employees.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Sistemde kayıtlı personel bulunamadı. Genel servis QR kodu olarak basılacaktır.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '130px', overflowY: 'auto' }}>
                    {employees.map((emp) => {
                      const isChecked = tempSelectedStaff.includes(emp.id);
                      return (
                        <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTempSelectedStaff([...tempSelectedStaff, emp.id]);
                              } else {
                                setTempSelectedStaff(tempSelectedStaff.filter((id) => id !== emp.id));
                              }
                            }}
                          />
                          <span>{emp.first_name} {emp.last_name} ({emp.position || emp.role_title || 'Servis'})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Explanatory notes for specific QR types */}
            {['pool', 'menu', 'smart_hub', 'review'].includes(tempQrType) && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.78rem', color: '#c7d2fe' }}>
                {tempQrType === 'pool' && '💼 Bu ürün tüm ekip için ortak bahşiş havuzuna (Tip Box) bağlanacak genel QR kod ile basılacaktır.'}
                {tempQrType === 'menu' && '📖 Bu ürün müşterileri doğrudan işletmenizin dijital menü sayfasına yönlendirecek QR kod ile basılacaktır.'}
                {tempQrType === 'smart_hub' && '⚡ Bu ürün Wi-Fi + Menü + Bahşiş + Puanlama özelliklerini içeren Naponi Smart Hub karşılama ekranına bağlanacaktır.'}
                {tempQrType === 'review' && '⭐ Bu ürün müşterilerinizi doğrudan Google Haritalar 5 yıldızlı yorum sayfanıza yönlendirecek QR kod ile basılacaktır.'}
              </div>
            )}

            {/* Custom QR / Artwork Image Upload */}
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.85rem',
                background: 'rgba(30, 41, 59, 0.45)',
                borderRadius: '12px',
                border: tempCustomQrImage ? '1px solid #38bdf8' : '1px dashed rgba(255, 255, 255, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                  {tempQrType === 'custom' ? '🎨 Kendi Özel QR / Tasarım Dosyanız *' : '📎 Kendi QR Kod veya Logonuzu Yükleyin (İsteğe Bağlı)'}
                </label>
                {tempCustomQrImage && (
                  <button
                    type="button"
                    onClick={() => setTempCustomQrImage('')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Görseli Kaldır
                  </button>
                )}
              </div>

              {tempCustomQrImage ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
                  <img
                    src={tempCustomQrImage}
                    alt="Custom QR Preview"
                    style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', padding: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>✓ Özel Görsel Yüklendi</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Baskı bu görsel ve dosya referans alınarak üretilecektir.</div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={qrFileInputRef}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleCustomQrFileSelect}
                  />
                  <button
                    type="button"
                    disabled={uploadingCustomQr}
                    onClick={() => qrFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {uploadingCustomQr ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Görsel Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={15} style={{ color: '#38bdf8' }} />
                        <span>Bilgisayardan Özel QR / Vektörel Görsel Seç (PNG, JPG, SVG)</span>
                      </>
                    )}
                  </button>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem', textAlign: 'center' }}>
                    İsteğe bağlı: Kendi hazırladığınız özel QR kod veya grafik dosyanız varsa yükleyebilirsiniz.
                  </div>
                </div>
              )}
            </div>

            {/* Logo option & Notes */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tempUseLogo}
                  onChange={(e) => setTempUseLogo(e.target.checked)}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span>İşletme logom baskıya eklensin (Profildeki vektör logo kullanılır)</span>
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '3px' }}>
                  Baskı & Tasarım Notu (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Masalara beyaz yazı, siyah zemin rica ediyoruz..."
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="input"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                />
              </div>
            </div>

            {/* Price Preview & Add Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {(() => {
                const variantsObj: any = customizingProduct.variants;
                const currentSizeObj = variantsObj?.sizes?.find(
                  (s: any) => s.label === tempSelectedSize || s.id === tempSelectedSize
                );
                const isTiered = currentSizeObj?.prices && currentSizeObj.prices[tempQuantity];
                const totalAmount = isTiered
                  ? Number(currentSizeObj.prices[tempQuantity])
                  : (tempSizePrice > 0 ? tempSizePrice : Number(customizingProduct.price)) * tempQuantity;

                return (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {isTiered
                        ? `${tempSelectedSize} — ${tempQuantity} Adet Paket Toplamı`
                        : `Birim: ${displayPrice(tempSizePrice > 0 ? tempSizePrice : Number(customizingProduct.price))} x ${tempQuantity} adet`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8' }}>
                        {displayPrice(totalAmount)}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                        {t('store.vatIncludedShort') || 'KDV Dahil'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
              >
                {t('store.addToCart') || 'Sepete Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIDEO PREVIEW ================= */}
      {videoModalProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              borderRadius: '20px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '1.75rem',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={18} fill="#38bdf8" color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  {videoModalProduct.name} — {t('store.watchVideo') || 'Tanıtım Videosu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalProduct(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player or Showcase Placeholder */}
            {videoModalProduct.video_url ? (
              videoModalProduct.video_url.endsWith('.mp4') || videoModalProduct.video_url.endsWith('.webm') || videoModalProduct.video_url.startsWith('/hardware') ? (
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center' }}>
                  <video
                    src={videoModalProduct.video_url}
                    controls
                    autoPlay
                    loop
                    playsInline
                    style={{ width: '100%', maxHeight: '480px', borderRadius: '12px', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                  <iframe
                    src={videoModalProduct.video_url}
                    title={videoModalProduct.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            ) : (
              <div
                style={{
                  height: '320px',
                  borderRadius: '12px',
                  background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <Package size={56} style={{ color: '#818cf8', marginBottom: '1rem', filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
                  {videoModalProduct.name}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 0 1.25rem' }}>
                  {t('store.noVideo') || 'Bu ürün için 360 derece tanıtım ve kullanım videosu yakında buraya eklenecektir.'}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Sparkles size={14} />
                  <span>Dinamik QR Kod Canlı Baskı Örneği</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DRAWER: CART ================= */}
      {cartOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              background: '#0f172a',
              borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
            }}
          >
            {/* Cart Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} style={{ color: '#818cf8' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  {t('store.cartTitle') || 'Sepetim'}
                </h3>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {t('store.vatIncludedShort') || 'KDV Dahil'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <ShoppingBag size={40} style={{ margin: '0 auto 0.75rem', color: '#475569' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>{t('store.cartEmpty') || 'Sepetiniz henüz boş'}</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                          {item.product.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {item.quantity} adet x {displayPrice(item.unitPrice || Number(item.product.price))} <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 600 }}>({t('store.vatIncludedShort') || 'KDV Dahil'})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Customization pills */}
                    <div style={{ fontSize: '0.75rem', color: '#a5b4fc', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                      {item.customization.qrTypeLabel && (
                        <span style={{ padding: '2px 8px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderRadius: '4px', fontWeight: 700 }}>
                          {item.customization.qrTypeLabel}
                        </span>
                      )}
                      {item.customization.color && (
                        <span style={{ padding: '2px 8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: '4px', fontWeight: 700 }}>
                          Renk: {item.customization.color}
                        </span>
                      )}
                      {item.customization.size && (
                        <span style={{ padding: '2px 8px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700 }}>
                          Ölçü: {item.customization.size}
                        </span>
                      )}
                      {item.customization.tableStart && item.customization.tableEnd && (
                        <span style={{ padding: '2px 6px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '4px' }}>
                          Masa: {item.customization.tableStart}-{item.customization.tableEnd}
                        </span>
                      )}
                      {item.customization.useLogo && (
                        <span style={{ padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '4px' }}>
                          Logolu Baskı
                        </span>
                      )}
                      {item.customization.customQrImageUrl && (
                        <span style={{ padding: '2px 6px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderRadius: '4px' }}>
                          Özel Görsel/QR Ekli
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* Destination Selector in Cart Drawer */}
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>
                      <Truck size={14} style={{ color: '#38bdf8' }} />
                      <span>Teslimat Bölgesi</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDomestic ? '#34d399' : '#818cf8' }}>
                      {isDomestic ? '200 TL Kargo' : (['USD', 'EUR'].includes(selectedCurrency) ? `15 ${selectedCurrency} Kargo` : '15 $ Kargo')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setShippingCountry('TR')}
                      style={{
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        border: isDomestic ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isDomestic ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                        color: isDomestic ? '#ffffff' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span>🇹🇷</span>
                      <span>Türkiye</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingCountry('ABROAD')}
                      style={{
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        border: !isDomestic ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: !isDomestic ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.4)',
                        color: !isDomestic ? '#ffffff' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span>🌍</span>
                      <span>Yurtdışı</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>{t('store.subtotal') || 'Ara Toplam'}:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(subtotalInActiveCurrency, selectedCurrency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>{t('store.shipping') || 'Kargo'} ({isDomestic ? 'Türkiye' : 'Yurtdışı'}):</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{shippingInfo.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{t('store.total') || 'Toplam'}:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>{formatCurrency(grandTotalInActiveCurrency, selectedCurrency)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>{t('store.vatIncluded') || 'Fiyatlara KDV Dahildir'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  {t('store.checkout') || 'Siparişi Tamamla'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CHECKOUT & ADDRESS ================= */}
      {checkoutOpen && (
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
              maxWidth: '620px',
              borderRadius: '20px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#ffffff' }}>
                  {t('store.checkout') || 'Siparişi Tamamla'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {t('store.deliveryInfo') || 'Teslimat & İletişim Bilgileri'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder}>
              {/* Delivery Destination (Turkey vs Abroad) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Teslimat Bölgesi / Ülkesi *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: isDomestic ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isDomestic ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingCountry"
                      checked={isDomestic}
                      onChange={() => setShippingCountry('TR')}
                      style={{ accentColor: '#38bdf8', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>🇹🇷 Türkiye İçi</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>200 TL Kargo Ücreti</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: !isDomestic ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: !isDomestic ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingCountry"
                      checked={!isDomestic}
                      onChange={() => setShippingCountry('ABROAD')}
                      style={{ accentColor: '#818cf8', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>🌍 Yurtdışı</div>
                      <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                        {['USD', 'EUR'].includes(selectedCurrency) ? `Sabit 15 ${selectedCurrency} Kargo` : 'Sabit 15 $ Kargo'}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Business registration reference pill */}
                {currentBusiness && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginTop: '0.5rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                    }}
                  >
                    <Building size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <span>
                      Kayıtlı İşletmeniz: <strong style={{ color: '#f8fafc' }}>{currentBusiness.name}</strong> • Konum: <strong style={{ color: '#38bdf8' }}>{currentBusiness.country || 'TR'}</strong> (Varsayılan: <strong>{currentBusiness.currency || 'TRY'}</strong>)
                    </span>
                  </div>
                )}
              </div>

              {/* Recipient & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    {t('store.recipientName') || 'Teslim Alacak Yetkili'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    {t('store.phone') || 'İletişim Telefonu'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Address Line */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  {t('store.address') || 'Teslimat Adresi'} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* City & Postal Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    {t('store.city') || 'Şehir / İlçe'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    {t('store.postalCode') || 'Posta Kodu'}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
                  {t('store.paymentMethod') || 'Ödeme Yöntemi'} *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Option 1: Credit Card / Apple Pay / Google Pay (Default / Global) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'CREDIT_CARD' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: paymentMethod === 'CREDIT_CARD' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.45)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      style={{ marginTop: '3px', accentColor: '#38bdf8' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                          <CreditCard size={18} style={{ color: '#38bdf8' }} />
                          <span>Kredi & Banka Kartı / Apple Pay / Google Pay</span>
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
                          Anında Onay
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        Tüm yerli ve uluslararası kartlar (Visa, Mastercard, AMEX), Apple Pay ve Google Pay ile anında küresel güvenli ödeme.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                        <ShieldCheck size={14} />
                        <span>Global Stripe / Lemon Squeezy Altyapısı</span>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Bank Transfer / SWIFT */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'BANK_TRANSFER' ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: paymentMethod === 'BANK_TRANSFER' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(30, 41, 59, 0.45)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      style={{ marginTop: '3px', accentColor: '#818cf8' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                          <Building size={18} style={{ color: '#818cf8' }} />
                          <span>{t('store.bankTransferTitle') || 'Banka Havalesi / FAST / EFT / SWIFT'}</span>
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
                          {t('store.zeroCommissionBadge') || 'Sıfır Komisyon'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {t('store.bankTransferDesc') || 'Siparişinizi oluşturduktan sonra belirtilen hesaplara referans koduyla transfer yapın.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Ara Toplam: {formatCurrency(subtotalInActiveCurrency, selectedCurrency)} + Kargo ({isDomestic ? 'Türkiye' : 'Yurtdışı'}): {shippingInfo.label}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.15, marginTop: '2px' }}>
                    {formatCurrency(grandTotalInActiveCurrency, selectedCurrency)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '3px' }}>
                    <CheckCircle2 size={12} />
                    <span>{t('store.vatIncluded') || 'Fiyatlara KDV Dahildir'}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('common.saving') || 'İşleniyor...'}</span>
                    </>
                  ) : paymentMethod === 'CREDIT_CARD' ? (
                    <>
                      <CreditCard size={16} />
                      <span>Kartla Güvenli Öde</span>
                    </>
                  ) : (
                    <span>{t('store.placeOrder') || 'Siparişi Onayla'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WIRE TRANSFER INSTRUCTIONS ================= */}
      {wireModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '20px',
              background: '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#34d399',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#ffffff' }}>
                {t('store.orderSuccessTitle') || 'Siparişiniz Başarıyla Alındı!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                {t('store.orderSuccessDesc') || 'Siparişinizin hazırlanabilmesi için lütfen aşağıdaki banka hesabına havale/FAST transferini yapınız.'}
              </p>
            </div>

            {/* Reference Code Box */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {t('store.refCode') || 'Zorunlu Havale Açıklama Kodu'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  {wireModalData.order.bank_reference_code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(wireModalData.order.bank_reference_code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  <span>{copiedCode ? (t('common.copied') || 'Kopyalandı') : (t('common.copy') || 'Kopyala')}</span>
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                ⚠️ {t('store.refCodeWarning') || 'Lütfen transfer açıklamasına bu kodu yazmayı unutmayınız.'}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Ödenecek Tutar:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{formatCurrency(Number(wireModalData.order.total_amount), wireModalData.order.currency)}</span>
                <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>({t('store.vatIncludedShort') || 'KDV Dahil'})</span>
              </div>
            </div>

            {/* Bank Accounts */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>
                {t('store.bankAccounts') || 'Havale Yapabileceğiniz Hesaplarımız'}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {wireModalData.accounts.map((acc: any, idx: number) => {
                  const isMatchingCurrency = acc.currency === wireModalData.order.currency;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        background: isMatchingCurrency ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '10px',
                        border: isMatchingCurrency ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.82rem',
                        position: 'relative',
                      }}
                    >
                      {isMatchingCurrency && (
                        <div
                          style={{
                            display: 'inline-block',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                          }}
                        >
                          ⭐ Bu Sipariş İçin Önerilen Hesap ({acc.currency})
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, color: '#ffffff' }}>{acc.label}</span>
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>{acc.bankName}</span>
                      </div>
                      <div style={{ color: '#94a3b8', marginBottom: '0.2rem' }}>
                        <strong>Alıcı:</strong> {acc.companyName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span><strong>IBAN:</strong> {acc.iban}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(acc.iban)}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {t('common.copy') || 'Kopyala'}
                        </button>
                      </div>
                      {acc.swiftCode && (
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                          <strong>SWIFT/BIC:</strong> {acc.swiftCode}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transfer Sent Button & Close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                type="button"
                onClick={() => {
                  setWireModalData(null);
                  setSearchParams({ tab: 'orders' });
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('common.close') || 'Kapat ve Siparişlere Git'}
              </button>

              <button
                type="button"
                disabled={transferNotifying}
                onClick={() => handleNotifyTransferSent(wireModalData.order.id)}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.5rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {transferNotifying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{t('store.transferSentBtn') || 'Banka Transferini Yaptım'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX IMAGE PREVIEW MODAL ================= */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 24, 0.92)',
            backdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {previewImage.title}
                </h3>
                {previewImage.badge && (
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {previewImage.badge}
                  </span>
                )}
                {previewImage.price !== undefined && previewImage.price !== null && (
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                    }}
                  >
                    {previewImage.isStarting ? 'Başlayan Fiyatla ' : ''}
                    {displayPrice(Number(previewImage.price))}
                    {previewImage.isPackage ? ' / paket' : ' / adet'}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                title="Kapat (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stage: High-Resolution Photo Display */}
            <div
              style={{
                position: 'relative',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1e293b 0%, #070d17 100%)',
                minHeight: '360px',
                maxHeight: '68vh',
                overflow: 'hidden',
              }}
            >
              <img
                src={previewImage.url}
                alt={previewImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '62vh',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                }}
              />
            </div>

            {/* Footer with hint */}
            <div
              style={{
                padding: '0.9rem 1.5rem',
                background: 'rgba(15, 23, 42, 0.85)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.82rem',
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={15} style={{ color: '#818cf8' }} />
                <span>Naponi Smart QR & NFC Donanım Serisi</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Kapatmak için dışarı tıklayabilir veya Esc tuşuna basabilirsiniz
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.close') || 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
