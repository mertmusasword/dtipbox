import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../i18n';
import { StoreProduct } from '../../types';
import { useToast } from '../../components/Toast';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Truck,
  ArrowRight,
  Layers,
  Sparkles,
  Save,
  X,
  Tag,
  Hash,
  DollarSign,
  Maximize2,
  Info,
  Upload,
  Image as ImageIcon,
  Loader2,
  Video,
  Play,
} from 'lucide-react';
import { convertCurrency, fetchLiveExchangeRates, ExchangeRates } from '../../utils/currency';
import { uploadImageToServer, uploadVideoToServer } from '../../utils/upload';

interface SizeOption {
  id: string;
  label: string;
  price: number;
  quantities?: number[];
  quantitiesInput?: string;
  prices?: Record<string, number>;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const AdminProductsPage: React.FC = () => {
  const { t, formatCurrency, language } = useLanguage();
  const { showToast } = useToast();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    TRY: 1,
    USD: 1 / 38.5,
    EUR: 1 / 41.8,
    GBP: 1 / 49.5,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [category, setCategory] = useState<string>('sticker');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(10);
  const [currency, setCurrency] = useState<string>('TRY');
  const [minQuantity, setMinQuantity] = useState<number>(24);
  const [quantityStep, setQuantityStep] = useState<number>(24);
  const [stock, setStock] = useState<number>(9999);
  const [badge, setBadge] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('/hardware/opaque-qr-sticker-en.jpg');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast('Video boyutu maksimum 50 MB olabilir', 'warning');
      return;
    }

    try {
      setUploadingVideo(true);
      showToast('Video işleniyor ve yükleniyor, lütfen bekleyin...', 'info');

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const uploadedUrl = await uploadVideoToServer(base64Data, 'products');
          setVideoUrl(uploadedUrl);
          showToast('Tanıtım videosu başarıyla yüklendi!', 'success');
        } catch (err: any) {
          showToast('Video yüklenirken hata oluştu: ' + (err?.message || 'Hata'), 'error');
        } finally {
          setUploadingVideo(false);
          if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingVideo(false);
      showToast('Video dosyası okunamadı', 'error');
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Görsel boyutu 8MB altında olmalıdır.', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setUploadingImage(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          let optimizedDataUrl = '';
          try {
            optimizedDataUrl = canvas.toDataURL('image/webp', 0.88);
          } catch {
            optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          }

          // Temporary immediate preview
          setImageUrl(optimizedDataUrl);

          // Upload to server
          try {
            const uploadedUrl = await uploadImageToServer(optimizedDataUrl, 'products');
            setImageUrl(uploadedUrl);
            showToast('Ürün görseli başarıyla yüklendi!', 'success');
          } catch (err: any) {
            showToast('Görsel sunucuya yüklenemedi: ' + (err?.message || 'Hata'), 'error');
          } finally {
            setUploadingImage(false);
          }
        };

        img.onerror = () => {
          setUploadingImage(false);
          showToast('Görsel dosyası okunamadı.', 'error');
        };

        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingImage(false);
      showToast('Görsel işlenirken hata oluştu: ' + (err?.message || 'Hata'), 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Variants (Sizes & Pricing)
  const [hasSizes, setHasSizes] = useState<boolean>(true);
  const [useTieredQuantities, setUseTieredQuantities] = useState<boolean>(false);
  const [tierQuantities, setTierQuantities] = useState<number[]>([104, 208, 312, 416, 520, 1040]);
  const [tierQuantitiesInput, setTierQuantitiesInput] = useState<string>('104, 208, 312, 416, 520, 1040');
  const [sizesList, setSizesList] = useState<SizeOption[]>([
    { id: '3x3', label: '3x3 cm', price: 4.5 },
    { id: '4x6', label: '4x6 cm', price: 6.0 },
    { id: '5x5', label: '5x5 cm', price: 7.5 },
    { id: '5x7', label: '5x7 cm', price: 9.0 },
    { id: '7x7', label: '7x7 cm', price: 11.5 },
    { id: '10x10', label: '10x10 cm', price: 16.0 },
  ]);
  const [defaultSizeId, setDefaultSizeId] = useState<string>('7x7');

  // New size input temp state
  const [newSizeLabel, setNewSizeLabel] = useState<string>('');
  const [newSizePrice, setNewSizePrice] = useState<number>(15);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/store/admin/products');
      setProducts(res.data.data || []);
    } catch (err: any) {
      showToast('Ürünler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setCategory('sticker');
    setDescription('');
    setPrice(10);
    setCurrency('TRY');
    setMinQuantity(24);
    setQuantityStep(24);
    setStock(9999);
    setBadge('24 ve Katları');
    setImageUrl('/hardware/opaque-qr-sticker-en.jpg');
    setVideoUrl('');
    setIsActive(true);
    setSortOrder((products.length || 0) + 1);
    setFeatures([
      'Suya, Yağa ve Çizilmeye Dayanıklı UV Koruma',
      'Masaya / Menüye Özel Dinamik QR Entegrasyonu',
      'Kolay Sökülür, Masada Leke ve İz Bırakmaz',
    ]);
    setSizesList([
      { id: '3x3', label: '3x3 cm', price: 4.5 },
      { id: '4x6', label: '4x6 cm', price: 6.0 },
      { id: '5x5', label: '5x5 cm', price: 7.5 },
      { id: '5x7', label: '5x7 cm', price: 9.0 },
      { id: '7x7', label: '7x7 cm', price: 11.5 },
      { id: '10x10', label: '10x10 cm', price: 16.0 },
    ]);
    setDefaultSizeId('7x7');
    setHasSizes(true);
    setUseTieredQuantities(false);
    setTierQuantities([104, 208, 312, 416, 520, 1040]);
    setTierQuantitiesInput('104, 208, 312, 416, 520, 1040');
    setModalOpen(true);
  };

  const openEditModal = (prod: StoreProduct) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setName(prod.name || '');
    setSlug(prod.slug || '');
    setCategory(prod.category || 'sticker');
    setDescription(prod.description || '');
    setPrice(Number(prod.price) || 0);
    setCurrency(prod.currency || 'TRY');
    setMinQuantity(prod.min_quantity || 1);
    setQuantityStep(prod.quantity_step || 1);
    setStock(prod.stock ?? 9999);
    setBadge(prod.badge || '');
    setImageUrl(prod.image_url || '/hardware/opaque-qr-sticker-en.jpg');
    setVideoUrl(prod.video_url || '');
    setIsActive(prod.is_active ?? true);
    setSortOrder(prod.sort_order ?? 1);
    setFeatures(Array.isArray(prod.features) ? [...prod.features] : []);

    const variantsObj: any = prod.variants;
    if (variantsObj && Array.isArray(variantsObj.sizes) && variantsObj.sizes.length > 0) {
      setHasSizes(true);
      const isTiered = variantsObj.type === 'sizes_and_tiers' || (Array.isArray(variantsObj.quantities) && variantsObj.quantities.length > 0);
      setUseTieredQuantities(isTiered);
      if (Array.isArray(variantsObj.quantities) && variantsObj.quantities.length > 0) {
        setTierQuantities(variantsObj.quantities);
        setTierQuantitiesInput(variantsObj.quantities.join(', '));
      } else {
        setTierQuantities([104, 208, 312, 416, 520, 1040]);
        setTierQuantitiesInput('104, 208, 312, 416, 520, 1040');
      }

      setSizesList(
        variantsObj.sizes.map((s: any) => {
          const sQtys = Array.isArray(s.quantities) && s.quantities.length > 0
            ? s.quantities
            : (Array.isArray(variantsObj.quantities) && variantsObj.quantities.length > 0
                ? variantsObj.quantities
                : [104, 208, 312, 416, 520, 1040]);
          return {
            id: s.id || s.label?.replace(/[^a-zA-Z0-9]/g, '_') || 'size',
            label: s.label || '',
            price: Number(s.price) || 0,
            quantities: sQtys,
            quantitiesInput: sQtys.join(', '),
            prices: s.prices ? { ...s.prices } : {},
          };
        })
      );
      setDefaultSizeId(variantsObj.defaultSize || variantsObj.sizes[0]?.id || '');
    } else {
      setHasSizes(false);
      setUseTieredQuantities(false);
      setTierQuantities([104, 208, 312, 416, 520, 1040]);
      setTierQuantitiesInput('104, 208, 312, 416, 520, 1040');
      setSizesList([]);
      setDefaultSizeId('');
    }

    setModalOpen(true);
  };

  const handleToggleActive = async (prod: StoreProduct) => {
    try {
      const nextStatus = !prod.is_active;
      await api.put(`/store/admin/products/${prod.id}`, { is_active: nextStatus });
      showToast(nextStatus ? 'Ürün satışa açıldı' : 'Ürün satıştan kaldırıldı (pasif yapıldı)', 'success');
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_active: nextStatus } : p))
      );
    } catch (err: any) {
      showToast('Durum güncellenirken hata oluştu', 'error');
    }
  };

  const handleDeleteProduct = async (prod: StoreProduct) => {
    if (!window.confirm(`"${prod.name}" ürününü silmek veya pasife almak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await api.delete(`/store/admin/products/${prod.id}`);
      showToast('Ürün silindi / pasife alındı', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Silme işlemi başarısız', 'error');
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSize = () => {
    if (!newSizeLabel.trim()) return;
    const cleanId = newSizeLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const defaultQtys = [...tierQuantities];
    const defaultPrices: Record<string, number> = {};
    if (useTieredQuantities) {
      defaultQtys.forEach((qty) => {
        defaultPrices[qty] = Math.round(Number(newSizePrice) * qty);
      });
    }
    const newOption: SizeOption = {
      id: cleanId || `size_${Date.now()}`,
      label: newSizeLabel.trim(),
      price: Number(newSizePrice) || 0,
      quantities: defaultQtys,
      quantitiesInput: defaultQtys.join(', '),
      prices: defaultPrices,
    };
    setSizesList((prev) => [...prev, newOption]);
    if (!defaultSizeId) setDefaultSizeId(newOption.id);
    setNewSizeLabel('');
    setNewSizePrice(10);
  };

  const handleRemoveSize = (idToRemove: string) => {
    setSizesList((prev) => {
      const filtered = prev.filter((s) => s.id !== idToRemove);
      if (defaultSizeId === idToRemove && filtered.length > 0) {
        setDefaultSizeId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleUpdateSizePrice = (id: string, newPrice: number) => {
    setSizesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s))
    );
  };

  const handleUpdateSizeLabel = (id: string, newLabel: string) => {
    setSizesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label: newLabel } : s))
    );
  };

  const handleUpdateTierPrice = (sizeId: string, qty: number, newPrice: number) => {
    setSizesList((prev) =>
      prev.map((s) => {
        if (s.id !== sizeId) return s;
        const updatedPrices = { ...(s.prices || {}) };
        updatedPrices[qty] = newPrice;
        return { ...s, prices: updatedPrices };
      })
    );
  };

  const handleUpdateSizeQuantities = (sizeId: string, inputStr: string) => {
    setSizesList((prev) =>
      prev.map((s) => {
        if (s.id !== sizeId) return s;
        const parsed = inputStr
          .split(',')
          .map((item) => parseInt(item.trim(), 10))
          .filter((num) => !isNaN(num) && num > 0);
        return {
          ...s,
          quantitiesInput: inputStr,
          quantities: parsed.length > 0 ? parsed : s.quantities,
        };
      })
    );
  };

  const handleApplyQuantitiesToAll = (templateStr: string) => {
    const parsed = templateStr
      .split(',')
      .map((item) => parseInt(item.trim(), 10))
      .filter((num) => !isNaN(num) && num > 0);
    if (parsed.length === 0) return;
    setSizesList((prev) =>
      prev.map((s) => ({
        ...s,
        quantities: [...parsed],
        quantitiesInput: templateStr,
      }))
    );
    showToast('Paket adet şablonu tüm ölçülere uygulandı!', 'info');
  };

  const handleTierQuantitiesChange = (inputStr: string) => {
    setTierQuantitiesInput(inputStr);
    const parsed = inputStr
      .split(',')
      .map((item) => parseInt(item.trim(), 10))
      .filter((num) => !isNaN(num) && num > 0);
    if (parsed.length > 0) {
      setTierQuantities(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Lütfen ürün adını giriniz', 'warning');
      return;
    }

    const payloadVariants = hasSizes && sizesList.length > 0
      ? {
          type: useTieredQuantities ? 'sizes_and_tiers' : 'sizes',
          defaultSize: defaultSizeId || sizesList[0]?.id,
          ...(useTieredQuantities
            ? {
                defaultQuantity: tierQuantities[0] || 104,
                quantities: tierQuantities,
              }
            : {}),
          sizes: sizesList.map((s) => {
            const currentSizeQtys = s.quantities && s.quantities.length > 0 ? s.quantities : tierQuantities;
            return {
              id: s.id,
              label: s.label,
              price: Number(s.price),
              ...(useTieredQuantities
                ? {
                    quantities: currentSizeQtys,
                    prices: s.prices || {},
                  }
                : {}),
            };
          }),
        }
      : null;

    const finalMinQuantity = useTieredQuantities
      ? (sizesList[0]?.quantities?.[0] || tierQuantities[0] || 104)
      : (Number(minQuantity) || 1);
    const finalQuantityStep = useTieredQuantities
      ? (sizesList[0]?.quantities?.[0] || tierQuantities[0] || 104)
      : (Number(quantityStep) || 1);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      category,
      description: description.trim(),
      price: Number(price),
      currency,
      min_quantity: finalMinQuantity,
      quantity_step: finalQuantityStep,
      stock: Number(stock) || 9999,
      badge: badge.trim() || null,
      image_url: imageUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      is_active: isActive,
      sort_order: Number(sortOrder) || 1,
      features,
      variants: payloadVariants,
    };

    try {
      setSaving(true);
      if (isEditing && editingId) {
        await api.put(`/store/admin/products/${editingId}`, payload);
        showToast('Ürün başarıyla güncellendi!', 'success');
      } else {
        await api.post('/store/admin/products', payload);
        showToast('Yeni ürün başarıyla oluşturuldu!', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Kayıt sırasında bir hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header & Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '10px', color: '#38bdf8' }}>
              <ShoppingBag size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Mağaza Ürünleri Yönetimi
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            İşletmelerin sipariş edebileceği QR etiket ve donanım ürünlerini, ölçü fiyatlarını ve adet kurallarını yönetin.
          </p>
        </div>

        {/* Tab Switcher & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Link
              to="/admin/products"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
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
              <Package size={15} />
              Ürünler ({products.length})
            </Link>
            <Link
              to="/admin/orders"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                color: '#94a3b8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Truck size={15} />
              Gelen Siparişler
            </Link>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '10px',
            }}
          >
            <Plus size={18} />
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          Ürünler yükleniyor...
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>Henüz Ürün Bulunmuyor</h3>
          <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>İşletmelerin sipariş edebilmesi için ilk ürününüzü hemen ekleyin.</p>
          <button type="button" onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Ürün Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {products.map((prod) => {
            const variantsObj: any = prod.variants;
            const sizes: SizeOption[] = variantsObj?.sizes || [];

            return (
              <div
                key={prod.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: prod.is_active ? '1px solid rgba(255, 255, 255, 0.12)' : '1px dashed rgba(239, 68, 68, 0.3)',
                  overflow: 'hidden',
                  background: prod.is_active ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.45)',
                  position: 'relative',
                }}
              >
                {/* Product Header / Banner Image */}
                <div
                  style={{
                    height: '210px',
                    position: 'relative',
                    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <img
                    src={prod.image_url || '/hardware/opaque-qr-sticker-en.jpg'}
                    alt={prod.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: prod.is_active ? 1 : 0.45,
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/naponi-brand.svg';
                    }}
                  />

                  {/* Top Badges */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: prod.is_active ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.85)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {prod.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {prod.is_active ? 'Satışta (Aktif)' : 'Pasif (Gizli)'}
                    </span>

                    {prod.badge && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: 'rgba(56, 189, 248, 0.25)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.5)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  {/* Order Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      padding: '3px 8px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                    }}
                  >
                    Sıra: #{prod.sort_order}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                        {prod.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Kategori: <strong style={{ color: '#cbd5e1' }}>{prod.category}</strong>
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Temel Birim</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8' }}>
                        {formatCurrency(Number(prod.price), prod.currency)}
                      </div>
                    </div>
                  </div>

                  {prod.description && (
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '1rem' }}>
                      {prod.description}
                    </p>
                  )}

                  {/* Order Rule Tags */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {sizes.length > 0 ? (
                      <div
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: '#38bdf8',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Sparkles size={13} />
                        <span>🎯 Sabit Paket Modu ({sizes.length} Ölçü Seçeneği)</span>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: '#cbd5e1',
                          }}
                        >
                          📦 Min: <strong>{prod.min_quantity} adet</strong>
                        </div>

                        <div
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: '#cbd5e1',
                          }}
                        >
                          🔄 Artış: <strong>{prod.quantity_step} ve katları</strong>
                        </div>
                      </>
                    )}

                    {prod.video_url && (
                      <div
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(99, 102, 241, 0.12)',
                          border: '1px solid rgba(99, 102, 241, 0.28)',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          color: '#a5b4fc',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Video size={13} />
                        <span>🎬 Tanıtım Videosu Mevcut</span>
                      </div>
                    )}
                  </div>

                  {/* Size Variants Pricing Table (if configured) */}
                  {sizes.length > 0 && (
                    <div
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layers size={13} style={{ color: '#38bdf8' }} />
                          {variantsObj?.quantities ? `Sabit Paket Fiyatları (${sizes.length} Ölçü)` : `Ölçü Seçenekleri ve Fiyat Listesi (${sizes.length})`}
                        </span>
                        {variantsObj?.quantities && (
                          <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {variantsObj.quantities.join(', ')} Adet
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
                        {sizes.map((s) => {
                          const sizeQtys = s.quantities && s.quantities.length > 0 ? s.quantities : variantsObj?.quantities;
                          const firstQty = sizeQtys?.[0];
                          const hasTiers = sizeQtys && s.prices;
                          const displayPrice = hasTiers && firstQty
                            ? s.prices?.[firstQty] ?? s.price
                            : s.price;
                          return (
                            <div
                              key={s.id}
                              style={{
                                padding: '5px 8px',
                                background: 'rgba(15, 23, 42, 0.6)',
                                borderRadius: '6px',
                                border: s.id === variantsObj?.defaultSize ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
                                fontSize: '0.75rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{s.label}</span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{formatCurrency(Number(displayPrice), prod.currency)}</span>
                                {hasTiers && firstQty && (
                                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', lineHeight: 1 }}>
                                    {firstQty} ad.
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleActive(prod)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: prod.is_active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: prod.is_active ? '#f87171' : '#34d399',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {prod.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      {prod.is_active ? 'Satıştan Kaldır' : 'Satışa Aç'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="btn btn-primary"
                        style={{
                          padding: '0.45rem 1rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Edit2 size={14} />
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod)}
                        style={{
                          padding: '0.45rem 0.65rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                        title="Ürünü Sil / Pasife Al"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Product Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#0f172a',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {isEditing ? 'Ürün Bilgilerini & Fiyatlarını Düzenle' : 'Yeni Mağaza Ürünü Ekle'}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {isEditing ? `ID: ${editingId}` : 'İşletmelerin panelinde anında görünecektir.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Row 1: Product Name (Slug is auto-managed in background) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!isEditing) {
                      setSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="Örn: Opak QR Etiket Sticker"
                  className="input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {/* Row 2: Category, Badge, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="sticker">Sticker / Etiket</option>
                    <option value="table_stand">Masa Standı (Akrilik)</option>
                    <option value="badge">Yaka Kartı</option>
                    <option value="bundle">Paket Set</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    Rozet (Badge Metni)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Örn: 24 ve Katları / Popüler"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    Satış Durumu
                  </label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="active">🟢 Satışta (Aktif)</option>
                    <option value="inactive">🔴 Satışa Kapalı (Pasif)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Ürün Açıklaması
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ürünün malzeme, kullanım ve baskı özelliklerini açıklayın..."
                  className="input"
                  rows={2}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Row 4: Base Price, Currency, Min Quantity, Step */}
              <div style={{ display: 'grid', gridTemplateColumns: useTieredQuantities ? '1.2fr 1fr 2fr' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    {useTieredQuantities ? 'Temel / Başlangıç Fiyatı' : 'Varsayılan Birim Fiyat *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                    required
                  />
                  {currency === 'TRY' && price > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '3px', fontWeight: 600 }}>
                      ≈ ${convertCurrency(price, 'TRY', 'USD', exchangeRates)} USD • €{convertCurrency(price, 'TRY', 'EUR', exchangeRates)} EUR
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    Para Birimi
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="TRY">TRY (₺) - TL Girin</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                    TL girildiğinde yabancı işletmelere otomatik çevrilir
                  </div>
                </div>

                {useTieredQuantities ? (
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                      <strong style={{ color: '#38bdf8' }}>Sabit Paket Modu:</strong> Min. sipariş adedi ve artış adımı elle girilmez; aşağıdaki paket kartlarından ({sizesList[0]?.quantities?.[0] || tierQuantities[0] || 104}, {sizesList[0]?.quantities?.[1] || tierQuantities[1] || 208}...) otomatik yönetilir.
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        Min. Sipariş Adedi *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                        className="input"
                        style={{ width: '100%' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        Adet Artış Adımı *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantityStep}
                        onChange={(e) => setQuantityStep(parseInt(e.target.value) || 1)}
                        className="input"
                        style={{ width: '100%' }}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {/* DYNAMIC SIZES & PRICING SECTION */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  background: 'rgba(30, 41, 59, 0.45)',
                  borderRadius: '14px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={16} />
                      Ölçü Seçenekleri ve Fiyatlandırma
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      İşletme ölçü ve adet seçtiğinde buradaki paket veya birim fiyatlar otomatik uygulanır.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasSizes}
                        onChange={(e) => setHasSizes(e.target.checked)}
                      />
                      <span>Ölçü Seçenekleri Aktif</span>
                    </label>

                    {hasSizes && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer', fontWeight: 700 }}>
                        <input
                          type="checkbox"
                          checked={useTieredQuantities}
                          onChange={(e) => setUseTieredQuantities(e.target.checked)}
                        />
                        <span>🎯 Sabit Paket Adetleri (Tiered)</span>
                      </label>
                    )}
                  </div>
                </div>

                {hasSizes && (
                  <div>
                    {/* If Tiered Quantities is enabled, show the template quantities configuration input */}
                    {useTieredQuantities && (
                      <div
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem 1rem',
                          background: 'rgba(2, 132, 199, 0.1)',
                          border: '1px solid rgba(2, 132, 199, 0.3)',
                          borderRadius: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                            ⚡ Genel Şablon Adetler (Aşağıdaki her ölçü için ayrı adetler belirleyebilirsiniz):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyQuantitiesToAll(tierQuantitiesInput)}
                            className="btn btn-secondary"
                            style={{ padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            📋 Tüm Ölçülere Uygula
                          </button>
                        </div>
                        <input
                          type="text"
                          value={tierQuantitiesInput}
                          onChange={(e) => handleTierQuantitiesChange(e.target.value)}
                          placeholder="104, 208, 312, 416, 520, 1040"
                          className="input"
                          style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}
                        />
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                          ℹ️ Her ölçünün kendine ait kalıp baskı adetleri (örn: 3x3 için 250, 500.. 7x7 için 104, 208.. 10x10 için 52, 104..) aşağıdaki kartlarda bağımsız olarak tanımlanabilir.
                        </div>
                      </div>
                    )}

                    {/* Existing Sizes List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      {sizesList.map((s) => {
                        const currentSizeQtys = s.quantities && s.quantities.length > 0 ? s.quantities : tierQuantities;
                        const currentSizeQtysInput = s.quantitiesInput ?? currentSizeQtys.join(', ');

                        return (
                          <div
                            key={s.id}
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(15, 23, 42, 0.6)',
                              borderRadius: '10px',
                              border: s.id === defaultSizeId ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ flex: 2 }}>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Ölçü Adı / Etiket</span>
                                <input
                                  type="text"
                                  value={s.label}
                                  onChange={(e) => handleUpdateSizeLabel(s.id, e.target.value)}
                                  className="input"
                                  style={{ width: '100%', padding: '4px 8px', fontSize: '0.85rem' }}
                                />
                              </div>

                              {!useTieredQuantities && (
                                <div style={{ flex: 1.5 }}>
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Birim Fiyat ({currency})</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={s.price}
                                    onChange={(e) => handleUpdateSizePrice(s.id, parseFloat(e.target.value) || 0)}
                                    className="input"
                                    style={{ width: '100%', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}
                                  />
                                </div>
                              )}

                              {useTieredQuantities && (
                                <div style={{ flex: 1.5 }}>
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Başlangıç Paket Fiyatı ({currentSizeQtys[0] || 104} Adet)</span>
                                  <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={s.prices?.[currentSizeQtys[0] || 104] ?? s.price}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      handleUpdateSizePrice(s.id, val);
                                      if (currentSizeQtys[0]) {
                                        handleUpdateTierPrice(s.id, currentSizeQtys[0], val);
                                      }
                                    }}
                                    className="input"
                                    style={{ width: '100%', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}
                                  />
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                                <button
                                  type="button"
                                  onClick={() => setDefaultSizeId(s.id)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.72rem',
                                    borderRadius: '6px',
                                    background: s.id === defaultSizeId ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                                    color: s.id === defaultSizeId ? '#0f172a' : '#cbd5e1',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {s.id === defaultSizeId ? '★ Varsayılan' : 'Varsayılan Yap'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSize(s.id)}
                                  style={{
                                    padding: '4px 8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                  title="Ölçüyü Sil"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Tiered package prices matrix for this specific size */}
                            {useTieredQuantities && (
                              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>📦 <strong>{s.label}</strong> İçin Paket Adetleri (Virgülle ayrılmış):</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={currentSizeQtysInput}
                                    onChange={(e) => handleUpdateSizeQuantities(s.id, e.target.value)}
                                    placeholder="Örn: 104, 208, 312, 416, 520, 1040"
                                    className="input"
                                    style={{ width: '280px', padding: '3px 8px', fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}
                                  />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '8px' }}>
                                  {currentSizeQtys.map((qty) => {
                                    const firstQty = currentSizeQtys[0] || 1;
                                    const currentVal = s.prices?.[qty] ?? Math.round(Number(s.price || 1) * (qty / firstQty));
                                    return (
                                      <div
                                        key={qty}
                                        style={{
                                          background: 'rgba(30, 41, 59, 0.5)',
                                          padding: '6px 8px',
                                          borderRadius: '8px',
                                          border: '1px solid rgba(255, 255, 255, 0.06)',
                                        }}
                                      >
                                        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>
                                          {qty} Adet
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                          <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={currentVal}
                                            onChange={(e) => handleUpdateTierPrice(s.id, qty, parseFloat(e.target.value) || 0)}
                                            className="input"
                                            style={{ width: '100%', padding: '2px 4px', fontSize: '0.8rem', fontWeight: 700 }}
                                          />
                                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>₺</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add New Size Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.3)', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.12)' }}>
                      <input
                        type="text"
                        placeholder="Yeni Ölçü (Örn: 12x12 cm)"
                        value={newSizeLabel}
                        onChange={(e) => setNewSizeLabel(e.target.value)}
                        className="input"
                        style={{ flex: 2, padding: '6px 10px', fontSize: '0.85rem' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Fiyat"
                        value={newSizePrice}
                        onChange={(e) => setNewSizePrice(parseFloat(e.target.value) || 0)}
                        className="input"
                        style={{ flex: 1.5, padding: '6px 10px', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} />
                        Ölçü Ekle
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Product Image (File Upload & Preview) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Ürün Görseli
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileSelect}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Image Preview Box */}
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/naponi-brand.svg';
                        }}
                      />
                    ) : (
                      <ImageIcon size={32} style={{ color: '#475569' }} />
                    )}

                    {uploadingImage && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15, 23, 42, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Loader2 size={24} className="animate-spin" style={{ color: '#38bdf8' }} />
                      </div>
                    )}
                  </div>

                  {/* Actions & Upload Button */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="btn btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.55rem 1rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Görsel Yükleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Bilgisayardan Resim Yükle</span>
                          </>
                        )}
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.55rem 0.85rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Görseli Kaldır</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      PNG, JPG, WEBP veya SVG formatında yüksek kaliteli ürün görseli seçebilirsiniz.
                    </div>

                    {/* Quick Presets for Stickers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Hızlı Şablonlar:</span>
                      <button
                        type="button"
                        onClick={() => setImageUrl('/hardware/opaque-qr-sticker-en.jpg')}
                        style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Opak Sticker
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('/hardware/transparent-qr-sticker-en.jpg')}
                        style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Şeffaf Sticker
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5.5: Product Showcase Video */}
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  background: 'rgba(30, 41, 59, 0.45)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
                    <Video size={16} style={{ color: '#818cf8' }} />
                    <span>Tanıtım Videosu (Opsiyonel)</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    İşletme mağazasında "▶ Tanıtım Videosu" butonuna basınca açılır
                  </span>
                </div>

                {/* Hidden File Input for Video */}
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Video Upload & Input Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.55rem 1rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        color: '#a5b4fc',
                        cursor: uploadingVideo ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploadingVideo ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Video Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Bilgisayardan Video Yükle (.mp4, .webm)</span>
                        </>
                      )}
                    </button>

                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Videoyu Kaldır</span>
                      </button>
                    )}
                  </div>

                  {/* Direct URL / Path input */}
                  <div>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Veya doğrudan video URL / dosya yolu girin (Örn: /hardware/opaque-qr-sticker.mp4 veya YouTube)"
                      className="input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* Fast Presets for Existing Local Hardware Videos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Hazır Videolar:</span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('/hardware/opaque-qr-sticker.mp4')}
                      style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Opak QR Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('/hardware/transparent-qr-sticker.mp4')}
                      style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Şeffaf QR Video
                    </button>
                  </div>

                  {/* Live Video Preview if videoUrl is set */}
                  {videoUrl && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: '#090d16',
                        borderRadius: '10px',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                        <Play size={13} fill="#38bdf8" />
                        <span>Canlı Video Önizleme</span>
                      </div>
                      {videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.startsWith('/hardware') ? (
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', background: '#000', display: 'block' }}
                        />
                      ) : (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                          <iframe
                            src={videoUrl}
                            title="Video Preview"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Bullet Point Features */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Öne Çıkan Özellik Maddeleri
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 10px',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span>✓ {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Özellik ekleyin (Örn: Çizilmeye Dayanıklı UV Kaplama)"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="input"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600 }}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.75rem', fontWeight: 700 }}
                >
                  <Save size={16} />
                  {saving ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
