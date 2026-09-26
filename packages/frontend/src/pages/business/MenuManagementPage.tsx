import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { MenuCategory, MenuItem, MenuConfig, BusinessMenuResponse, MenuThemeKey } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import { uploadImageToServer } from '../../utils/upload';
import { ALLERGEN_CATALOG, getAllergenLabel, getAllergenIcon, getAllergenDetail } from '../../constants/allergens';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  EyeOff,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Search,
  Check,
  AlertTriangle,
  QrCode,
  Smartphone,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Palette,
  Eye,
  Star,
} from 'lucide-react';

const MENU_THEMES: Array<{
  id: MenuThemeKey;
  title: string;
  subtitle: { tr: string; en: string };
  badge: { tr: string; en: string };
  colors: [string, string, string];
  desc: { tr: string; en: string };
}> = [
  {
    id: 'DARK_LUXURY',
    title: 'Dark Luxury & Gold',
    subtitle: {
      tr: 'Fine Dining, Steakhouse, Lounge & Bar',
      en: 'Fine Dining, Steakhouse, Lounge & Bar',
    },
    badge: {
      tr: 'Popüler & Lüks',
      en: 'Popular & Luxury',
    },
    colors: ['#0D0D11', '#D4AF37', '#1E1E24'],
    desc: {
      tr: 'Koyu antrasit ve füme cam zemin üzerinde altın/bronz detaylar, gece mekanları için büyüleyici atmosfer.',
      en: 'Deep charcoal and smoked glass base with gold/bronze accents, captivating atmosphere for evening venues.',
    },
  },
  {
    id: 'WARM_ARTISAN',
    title: 'Warm Artisan & Bakery',
    subtitle: {
      tr: 'Butik Kafe, Fırın, Kahvaltı & Brunch',
      en: 'Boutique Cafe, Bakery, Breakfast & Brunch',
    },
    badge: {
      tr: 'Sıcak & Doğal',
      en: 'Warm & Natural',
    },
    colors: ['#FBF8F3', '#C27803', '#FFFFFF'],
    desc: {
      tr: 'Sıcak krem, kum ve pişmiş toprak tonları. Butik kahveciler ve fırınlar için organik, editoryal şıklık.',
      en: 'Warm cream, sand, and terracotta tones. Organic, editorial elegance for boutique cafes and bakeries.',
    },
  },
  {
    id: 'MODERN_EMERALD',
    title: 'Modern Emerald & Fresh',
    subtitle: {
      tr: 'Bistro, Vegan, Sağlıklı Yaşam & Bahçe',
      en: 'Bistro, Vegan, Healthy Living & Garden',
    },
    badge: {
      tr: 'Ferah & Taze',
      en: 'Fresh & Vibrant',
    },
    colors: ['#F8FAFC', '#059669', '#FFFFFF'],
    desc: {
      tr: 'Canlı zümrüt yeşili ve temiz zemin. Taze, sağlıklı lezzetler sunan modern mutfaklar için birebir.',
      en: 'Vibrant emerald green and crisp backgrounds. Perfect for modern kitchens offering fresh, healthy dishes.',
    },
  },
  {
    id: 'MIDNIGHT_ROSE',
    title: 'Midnight Velvet & Rose',
    subtitle: {
      tr: 'Kokteyl Bar, Şarap Evi, Romantik Restoran',
      en: 'Cocktail Bar, Wine Bar, Romantic Dining',
    },
    badge: {
      tr: 'Zarif & Romantik',
      en: 'Elegant & Romantic',
    },
    colors: ['#140D14', '#FB7185', '#281726'],
    desc: {
      tr: 'Derin kadife mürdüm ve gül kurusu vurgular. Özel akşamlar ve şık kokteyl barlar için büyüleyici bir aura.',
      en: 'Deep velvet plum and dusty rose accents. Enchanting aura for special evenings and upscale cocktail bars.',
    },
  },
];

export const MenuManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatCurrency, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu Data State
  const [menuConfig, setMenuConfig] = useState<MenuConfig>({
    menu_mode: 'NATIVE',
    primary_action: 'TIP',
    menu_url: '',
    menu_title: '',
    menu_theme: 'DARK_LUXURY',
    menu_cover_image: '',
    menu_cover_position: 50,
    enable_item_stories: true,
    enable_menu: true,
  });
  const [businessCurrency, setBusinessCurrency] = useState('TRY');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [masterQrToken, setMasterQrToken] = useState<string | null>(null);

  // Saving state for config
  const [savingConfig, setSavingConfig] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCurrency, setProductCurrency] = useState('TRY');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productIsActive, setProductIsActive] = useState(true);
  const [productIsFeatured, setProductIsFeatured] = useState(false);
  const [productAllergens, setProductAllergens] = useState<string[]>([]);
  const [productTags, setProductTags] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Product Image Upload / URL Mode State
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [dragOverPhoto, setDragOverPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Cover Image State
  const [coverImageInputMode, setCoverImageInputMode] = useState<'upload' | 'url'>('upload');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const coverFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Product Search within category
  const [productSearch, setProductSearch] = useState('');

  // Cover Photo Upload Handler (Canvas compression up to 1200x500)
  const handleCoverImageUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast(language === 'tr' ? 'Lütfen geçerli bir görsel formatı seçiniz (PNG, JPG veya WebP).' : 'Please select a valid image format.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(language === 'tr' ? 'Görsel boyutu en fazla 10 MB olabilir.' : 'Image size must be under 10 MB.', 'error');
      return;
    }

    setIsProcessingCover(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

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
          setIsProcessingCover(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let optimized = '';
        try {
          optimized = canvas.toDataURL('image/webp', 0.85);
        } catch {
          optimized = canvas.toDataURL('image/jpeg', 0.85);
        }
        setMenuConfig((prev) => ({ ...prev, menu_cover_image: optimized }));
        setIsProcessingCover(true);

        uploadImageToServer(optimized, 'menu')
          .then((uploadedUrl) => {
            setMenuConfig((prev) => ({ ...prev, menu_cover_image: uploadedUrl }));
            handleSaveConfig({ menu_cover_image: uploadedUrl });
            showToast(language === 'tr' ? 'Mekan kapak görseli başarıyla yüklendi' : 'Cover image uploaded successfully');
          })
          .catch(() => {
            showToast(language === 'tr' ? 'Kapak görseli sunucuya yüklenemedi' : 'Failed to upload cover image', 'error');
          })
          .finally(() => {
            setIsProcessingCover(false);
          });
      };
      img.onerror = () => {
        setIsProcessingCover(false);
        showToast(language === 'tr' ? 'Görsel işlenirken hata oluştu' : 'Failed to process cover image', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load Menu and QR Token
  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menuRes, qrRes] = await Promise.all([
        api.get<any>('/business/menu'),
        api.get<any>('/business/qr').catch(() => null),
      ]);

      const data: BusinessMenuResponse = menuRes.data.data;
      setMenuConfig({
        ...data.config,
        menu_theme: data.config?.menu_theme || 'DARK_LUXURY',
        menu_cover_position: data.config?.menu_cover_position ?? 50,
        enable_item_stories: data.config?.enable_item_stories ?? true,
      });
      if (data.config?.menu_cover_image && !data.config.menu_cover_image.startsWith('data:')) {
        setCoverUrlInput(data.config.menu_cover_image);
      }
      setBusinessCurrency(data.businessCurrency || 'TRY');
      setCategories(data.categories || []);

      if (data.categories && data.categories.length > 0) {
        setActiveCategoryId((prev) => (prev && data.categories.some((c) => c.id === prev) ? prev : data.categories[0].id));
      } else {
        setActiveCategoryId(null);
      }

      // Find first usable public token for preview
      if (qrRes?.data?.data && Array.isArray(qrRes.data.data) && qrRes.data.data.length > 0) {
        setMasterQrToken(qrRes.data.data[0].public_token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Update Config Mode or Inputs
  const handleSaveConfig = async (newConfig?: Partial<MenuConfig>) => {
    setSavingConfig(true);
    const payload = {
      menu_mode: newConfig?.menu_mode ?? menuConfig.menu_mode,
      primary_action: newConfig?.primary_action ?? menuConfig.primary_action,
      menu_url: newConfig?.menu_url !== undefined ? newConfig.menu_url : menuConfig.menu_url,
      menu_title: newConfig?.menu_title !== undefined ? newConfig.menu_title : menuConfig.menu_title,
      menu_theme: newConfig?.menu_theme !== undefined ? newConfig.menu_theme : (menuConfig.menu_theme || 'DARK_LUXURY'),
      menu_cover_image: newConfig?.menu_cover_image !== undefined ? newConfig.menu_cover_image : (menuConfig.menu_cover_image || null),
      menu_cover_position: newConfig?.menu_cover_position !== undefined ? newConfig.menu_cover_position : (menuConfig.menu_cover_position ?? 50),
      enable_item_stories: newConfig?.enable_item_stories !== undefined ? newConfig.enable_item_stories : (menuConfig.enable_item_stories ?? true),
    };

    try {
      const res = await api.put('/business/menu/config', payload);
      setMenuConfig(res.data.data);
      showToast(t('menu.savedSuccess') || 'Menu settings updated');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update menu configuration', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Category Actions
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    setSubmittingCategory(true);
    try {
      if (editingCategory) {
        await api.put(`/business/menu/categories/${editingCategory.id}`, {
          name: categoryName.trim(),
          description: categoryDesc.trim() || null,
        });
        showToast(`Category "${categoryName}" updated`);
      } else {
        const res = await api.post('/business/menu/categories', {
          name: categoryName.trim(),
          description: categoryDesc.trim() || null,
        });
        showToast(`Category "${categoryName}" created`);
        setActiveCategoryId(res.data.data.id);
      }
      setIsCategoryModalOpen(false);
      await loadMenu();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: MenuCategory) => {
    const itemCount = cat.items?.length || 0;
    const confirmMsg = itemCount > 0
      ? (language === 'tr'
          ? `"${cat.name}" kategorisinde ${itemCount} adet ürün var. Bu kategoriyi ve içerisindeki TÜM ürünleri kalıcı olarak silmek istediğinize emin misiniz?`
          : `Category "${cat.name}" contains ${itemCount} items. Are you sure you want to permanently delete it and all its items?`)
      : (t('menu.deleteCategoryConfirm') || (language === 'tr' ? `"${cat.name}" kategorisini silmek istediğinize emin misiniz?` : `Delete category "${cat.name}"?`));

    if (!confirm(confirmMsg)) return;
    try {
      await api.delete(`/business/menu/categories/${cat.id}?force=true`);
      showToast(language === 'tr' ? `"${cat.name}" kategorisi silindi` : `Category "${cat.name}" deleted`);
      await loadMenu();
    } catch (err: any) {
      showToast(err.response?.data?.error || (language === 'tr' ? 'Kategori silinemedi' : 'Failed to delete category'), 'error');
    }
  };

  const handleMoveCategory = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setCategories(reordered);
    try {
      await api.put('/business/menu/categories/reorder', {
        categoryIds: reordered.map((c) => c.id),
      });
    } catch {
      loadMenu();
    }
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!activeCategory) return;
    const items = activeCategory.items || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reorderedItems = [...items];
    const [moved] = reorderedItems.splice(index, 1);
    reorderedItems.splice(targetIndex, 0, moved);

    setCategories((prev) =>
      prev.map((c) => (c.id === activeCategory.id ? { ...c, items: reorderedItems } : c))
    );

    try {
      await api.put('/business/menu/items/reorder', {
        itemIds: reorderedItems.map((i) => i.id),
      });
    } catch {
      loadMenu();
    }
  };

  // Product Photo Upload Handler
  const handleProductImageUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast(language === 'tr' ? 'Lütfen geçerli bir görsel formatı seçiniz (PNG, JPG veya WebP).' : 'Please select a valid image format (PNG, JPG, or WebP).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(language === 'tr' ? 'Görsel boyutu en fazla 10 MB olabilir.' : 'Image size must be under 10 MB.', 'error');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

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
          setIsProcessingImage(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let optimized = '';
        try {
          optimized = canvas.toDataURL('image/webp', 0.85);
        } catch {
          optimized = canvas.toDataURL('image/jpeg', 0.85);
        }
        setProductImageUrl(optimized);
        setIsProcessingImage(true);

        uploadImageToServer(optimized, 'menu')
          .then((uploadedUrl) => {
            setProductImageUrl(uploadedUrl);
            showToast(language === 'tr' ? 'Ürün fotoğrafı başarıyla yüklendi' : 'Product photo uploaded successfully');
          })
          .catch(() => {
            showToast(language === 'tr' ? 'Görsel sunucuya yüklenirken hata oluştu' : 'Failed to upload photo', 'error');
          })
          .finally(() => {
            setIsProcessingImage(false);
          });
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        showToast(language === 'tr' ? 'Görsel işlenirken hata oluştu' : 'Failed to process image', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      showToast(language === 'tr' ? 'Dosya okunamadı' : 'Failed to read file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Product Actions
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductName('');
    setProductDesc('');
    setProductPrice('');
    setProductCurrency(businessCurrency);
    setProductImageUrl('');
    setImageInputMode('upload');
    setProductCategoryId(activeCategoryId || (categories[0]?.id ?? ''));
    setProductIsActive(true);
    setProductIsFeatured(false);
    setProductAllergens([]);
    setProductTags('');
    setIsProductModalOpen(true);
  };

  const openEditProduct = (item: MenuItem) => {
    setEditingProduct(item);
    setProductName(item.name);
    setProductDesc(item.description || '');
    setProductPrice(String(item.price));
    setProductCurrency(item.currency || businessCurrency);
    setProductImageUrl(item.image_url || '');
    setImageInputMode(item.image_url?.startsWith('data:') ? 'upload' : (item.image_url ? 'url' : 'upload'));
    setProductCategoryId(item.category_id);
    setProductIsActive(item.is_active);
    setProductIsFeatured(Boolean(item.is_featured));
    setProductAllergens(item.allergens || []);
    setProductTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
    setIsProductModalOpen(true);
  };

  const handleToggleProductStatus = async (item: MenuItem) => {
    const newStatus = !item.is_active;
    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i)),
      }))
    );

    try {
      await api.patch(`/business/menu/items/${item.id}/status`, { is_active: newStatus });
      showToast(newStatus ? `"${item.name}" aktif edildi` : `"${item.name}" geçici olarak gizlendi`);
    } catch (err: any) {
      showToast('Durum güncellenemedi', 'error');
      loadMenu();
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Valid price is required', 'error');
      return;
    }

    setSubmittingProduct(true);
    const tagsArray = productTags
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const payload = {
      category_id: productCategoryId,
      name: productName.trim(),
      description: productDesc.trim() || null,
      price: priceNum,
      currency: productCurrency,
      image_url: productImageUrl.trim() || null,
      is_active: productIsActive,
      is_featured: productIsFeatured,
      allergens: productAllergens,
      tags: tagsArray,
    };

    try {
      if (editingProduct) {
        await api.put(`/business/menu/items/${editingProduct.id}`, payload);
        showToast(language === 'tr' ? `"${productName}" ürünü güncellendi` : `Product "${productName}" updated`);
      } else {
        await api.post('/business/menu/items', payload);
        showToast(language === 'tr' ? `"${productName}" ürünü eklendi` : `Product "${productName}" created`);
      }
      setIsProductModalOpen(false);
      await loadMenu();
    } catch (err: any) {
      showToast(err.response?.data?.error || (language === 'tr' ? 'İşlem başarısız oldu' : 'Operation failed'), 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (item: MenuItem) => {
    if (!confirm(t('menu.deleteProductConfirm') || (language === 'tr' ? `"${item.name}" ürününü silmek istediğinize emin misiniz?` : `Delete product "${item.name}"?`))) return;
    try {
      await api.delete(`/business/menu/items/${item.id}`);
      showToast(language === 'tr' ? `"${item.name}" ürünü silindi` : `Product "${item.name}" deleted`);
      await loadMenu();
    } catch (err: any) {
      showToast(err.response?.data?.error || (language === 'tr' ? 'Ürün silinemedi' : 'Failed to delete product'), 'error');
    }
  };

  const toggleAllergen = (id: string) => {
    setProductAllergens((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const filteredItems = (activeCategory?.items || []).filter((item) => {
    if (!productSearch.trim()) return true;
    const query = productSearch.toLowerCase();
    return item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadMenu} />;

  return (
    <div className="menu-management-page" style={{ paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <UtensilsCrossed size={22} />
            </div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              {t('menu.title')}
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
            {t('menu.subtitle')}
          </p>
        </div>

        {/* Action Button: Live Preview */}
        {masterQrToken && menuConfig.menu_mode === 'NATIVE' && (
          <a
            href={`/menu/${masterQrToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              fontSize: '0.86rem',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: '#34d399',
            }}
          >
            <Smartphone size={16} />
            <span>{t('menu.previewMenu')}</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* SECTION 1: Menu Usage Mode Selector (3 Cards) */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
          {t('menu.menuUsageMode')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
          {language === 'tr'
            ? "İşletmenizin ihtiyacına uygun menü seçeneğini belirleyin. Tüm ayarlar anında Smart QR'ınıza yansır."
            : 'Select the menu option that fits your business needs. All changes reflect instantly on your Smart QR.'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Option 1: Native Menu (Recommended) */}
          <div
            onClick={() => handleSaveConfig({ menu_mode: 'NATIVE' })}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: menuConfig.menu_mode === 'NATIVE' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
              background:
                menuConfig.menu_mode === 'NATIVE'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))'
                  : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: '#10b981' }} />
                <strong style={{ fontSize: '0.98rem' }}>{t('menu.modeNative')}</strong>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                {language === 'tr' ? 'ÖNERİLEN' : 'RECOMMENDED'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('menu.modeNativeDesc')}
            </p>
          </div>

          {/* Option 2: External Menu URL */}
          <div
            onClick={() => handleSaveConfig({ menu_mode: 'EXTERNAL_URL' })}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: menuConfig.menu_mode === 'EXTERNAL_URL' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
              background:
                menuConfig.menu_mode === 'EXTERNAL_URL'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(14, 165, 233, 0.08))'
                  : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <ExternalLink size={20} style={{ color: '#38bdf8' }} />
              <strong style={{ fontSize: '0.98rem' }}>{t('menu.modeExternal')}</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('menu.modeExternalDesc')}
            </p>
          </div>

          {/* Option 3: Disabled */}
          <div
            onClick={() => handleSaveConfig({ menu_mode: 'DISABLED' })}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: menuConfig.menu_mode === 'DISABLED' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
              background:
                menuConfig.menu_mode === 'DISABLED'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <EyeOff size={20} style={{ color: 'var(--text-muted)' }} />
              <strong style={{ fontSize: '0.98rem' }}>{t('menu.modeDisabled')}</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('menu.modeDisabledDesc')}
            </p>
          </div>
        </div>

        {/* Sub-form: External URL Settings */}
        {menuConfig.menu_mode === 'EXTERNAL_URL' && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {t('menu.externalUrlLabel')}
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder={t('menu.externalUrlPlaceholder') || 'https://...'}
                  value={menuConfig.menu_url || ''}
                  onChange={(e) => setMenuConfig({ ...menuConfig, menu_url: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {t('menu.buttonTitleLabel')}
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('menu.buttonTitlePlaceholder') || (language === 'tr' ? 'Örn: Menüyü Gör' : 'e.g. View Menu')}
                  value={menuConfig.menu_title || ''}
                  onChange={(e) => setMenuConfig({ ...menuConfig, menu_title: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSaveConfig()}
                disabled={savingConfig}
              >
                {savingConfig ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : t('menu.saveChanges')}
              </button>
              {menuConfig.menu_url && (
                <a
                  href={menuConfig.menu_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} />
                  <span>{language === 'tr' ? 'Linki Test Et' : 'Test Link'}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sub-form: Native Menu Primary Action Switcher */}
        {menuConfig.menu_mode === 'NATIVE' && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {t('menu.primaryActionLabel')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: menuConfig.primary_action === 'TIP' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                  background: menuConfig.primary_action === 'TIP' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="primary_action"
                  value="TIP"
                  checked={menuConfig.primary_action === 'TIP'}
                  onChange={() => handleSaveConfig({ primary_action: 'TIP' })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <span>{t('menu.primaryActionTip')}</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: menuConfig.primary_action === 'MENU' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                  background: menuConfig.primary_action === 'MENU' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="primary_action"
                  value="MENU"
                  checked={menuConfig.primary_action === 'MENU'}
                  onChange={() => handleSaveConfig({ primary_action: 'MENU' })}
                  style={{ accentColor: '#10b981' }}
                />
                <span>{t('menu.primaryActionMenu')}</span>
              </label>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {language === 'tr'
                ? '💡 Not: Her iki modda da misafir tek dokunuşla menü ve bahşiş ekranları arasında sorunsuzca geçiş yapabilir.'
                : '💡 Note: In both modes, guests can switch seamlessly between the menu and tipping screen with a single tap.'}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 1.5: Menu Themes & Appearance Customization */}
      {menuConfig.menu_mode === 'NATIVE' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Palette size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {language === 'tr' ? 'Menü Tasarımı & Görünüm Temaları' : 'Menu Design & Themes'}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {language === 'tr' ? 'Mekanınızın tarzına en uygun lüks temayı seçin, kapak görselinizi ve vitrin ayarlarınızı belirleyin.' : 'Select the theme that matches your venue aesthetic and customize your cover banner.'}
                </p>
              </div>
            </div>

            {masterQrToken && (
              <a
                href={`/menu/${masterQrToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  color: '#fbbf24',
                }}
              >
                <Eye size={15} />
                <span>{language === 'tr' ? 'Canlı Menüyü Gör' : 'View Live Menu'}</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* THEME PRESET CARDS (4 PRESETS) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {MENU_THEMES.map((theme) => {
              const isSelected = (menuConfig.menu_theme || 'DARK_LUXURY') === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSaveConfig({ menu_theme: theme.id })}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                    background: isSelected
                      ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.15), rgba(212, 175, 55, 0.08))'
                      : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
                  }}
                >
                  {/* Swatches preview & badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {theme.colors.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: c,
                            border: '1.5px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      }}
                    >
                      {language === 'tr' ? theme.badge.tr : theme.badge.en}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {theme.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {language === 'tr' ? theme.subtitle.tr : theme.subtitle.en}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {language === 'tr' ? theme.desc.tr : theme.desc.en}
                  </p>
                </div>
              );
            })}
          </div>

          {/* COVER BANNER & STORIES ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Left: Cover Banner Image */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0 }}>
                  🖼️ {language === 'tr' ? 'Mekan Kapak Fotoğrafı (Hero Banner)' : 'Venue Cover Banner'}
                </label>
                {/* Upload or URL mode */}
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setCoverImageInputMode('upload')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: coverImageInputMode === 'upload' ? 'var(--accent-primary)' : 'transparent',
                      color: coverImageInputMode === 'upload' ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    <Upload size={11} />
                    <span>{language === 'tr' ? 'Yükle' : 'Upload'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageInputMode('url');
                      if (!coverUrlInput && menuConfig.menu_cover_image && !menuConfig.menu_cover_image.startsWith('data:')) {
                        setCoverUrlInput(menuConfig.menu_cover_image);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: coverImageInputMode === 'url' ? 'var(--accent-primary)' : 'transparent',
                      color: coverImageInputMode === 'url' ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    <ExternalLink size={11} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/jpg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCoverImageUpload(file);
                    e.target.value = '';
                  }
                }}
              />

              {/* If in upload mode and cover exists -> Show preview with Replace & Remove */}
              {coverImageInputMode === 'upload' && menuConfig.menu_cover_image ? (
                <div
                  style={{
                    position: 'relative',
                    height: '115px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <img
                    src={menuConfig.menu_cover_image}
                    alt="Cover preview"
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `center ${menuConfig.menu_cover_position ?? 50}%`,
                      transition: 'object-position 0.15s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>
                      ✓ {language === 'tr' ? 'Mevcut Kapak Görseli' : 'Current Cover'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        {language === 'tr' ? 'Değiştir' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuConfig({ ...menuConfig, menu_cover_image: null });
                          setCoverUrlInput('');
                          handleSaveConfig({ menu_cover_image: null });
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#f87171' }}
                      >
                        {language === 'tr' ? 'Kaldır' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : coverImageInputMode === 'upload' ? (
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: '10px',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {isProcessingCover ? (
                    <div className="spinner-small" style={{ margin: '0 auto 0.5rem' }} />
                  ) : (
                    <Camera size={20} style={{ margin: '0 auto 0.4rem', color: 'var(--text-muted)' }} />
                  )}
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isProcessingCover
                      ? language === 'tr'
                        ? 'Kapak görseli işleniyor...'
                        : 'Processing cover image...'
                      : language === 'tr'
                      ? 'Kapak Fotoğrafı Yükle'
                      : 'Upload Cover Photo'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {language === 'tr'
                      ? 'Menünün en tepesinde sinematik karşılama görseli olarak gösterilir.'
                      : 'Displayed as a hero welcome banner at top of menu.'}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginTop: '0.45rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: 'var(--accent-primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>📐</span>
                    <span>1200 × 500 px ({language === 'tr' ? '16:9 veya 21:9' : '16:9 or 21:9'})</span>
                  </div>
                </div>
              ) : (
                /* URL MODE */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="input"
                      placeholder={language === 'tr' ? 'https://... görsel bağlantısı yapıştırın' : 'https://... paste image URL'}
                      value={coverUrlInput}
                      onChange={(e) => setCoverUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = coverUrlInput.trim();
                          setMenuConfig((prev) => ({ ...prev, menu_cover_image: url || null }));
                          handleSaveConfig({ menu_cover_image: url || null });
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={savingConfig || !coverUrlInput.trim()}
                      onClick={() => {
                        const url = coverUrlInput.trim();
                        if (!url) {
                          showToast(language === 'tr' ? 'Lütfen geçerli bir görsel URL adresi giriniz' : 'Please enter a valid URL', 'error');
                          return;
                        }
                        setMenuConfig((prev) => ({ ...prev, menu_cover_image: url }));
                        handleSaveConfig({ menu_cover_image: url });
                      }}
                      style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0 0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Check size={14} />
                      <span>{savingConfig ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (language === 'tr' ? 'Kaydet & Uygula' : 'Save & Apply')}</span>
                    </button>
                  </div>

                  {/* URL Live Preview Card */}
                  {(coverUrlInput.trim() || menuConfig.menu_cover_image) && (
                    <div
                      style={{
                        position: 'relative',
                        height: '100px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: '#18181b',
                      }}
                    >
                      <img
                        src={coverUrlInput.trim() || menuConfig.menu_cover_image || ''}
                        alt="URL Preview"
                        referrerPolicy="no-referrer"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: `center ${menuConfig.menu_cover_position ?? 50}%`,
                          transition: 'object-position 0.15s ease',
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>
                          {coverUrlInput.trim() === menuConfig.menu_cover_image
                            ? '✓ ' + (language === 'tr' ? 'Menüde Aktif & Kayıtlı' : 'Saved & Active on Menu')
                            : '⚠️ ' + (language === 'tr' ? 'Kaydedilmedi - Lütfen "Kaydet & Uygula" butonuna basınız' : 'Not saved yet - click "Save & Apply"')}
                        </span>
                        {menuConfig.menu_cover_image && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverUrlInput('');
                              setMenuConfig({ ...menuConfig, menu_cover_image: null });
                              handleSaveConfig({ menu_cover_image: null });
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#f87171' }}
                          >
                            {language === 'tr' ? 'Kaldır' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Vertical Alignment / Reposition Bar */}
              {(menuConfig.menu_cover_image || (coverImageInputMode === 'url' && coverUrlInput.trim())) && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <ArrowUpDown size={13} style={{ color: 'var(--accent-primary)' }} />
                      <span>{language === 'tr' ? 'Görsel Dikey Hizalama / Odak Noktası' : 'Vertical Focus & Alignment'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[
                        { label: language === 'tr' ? '⬆️ Üst' : '⬆️ Top', val: 20 },
                        { label: language === 'tr' ? '⏺️ Orta' : '⏺️ Center', val: 50 },
                        { label: language === 'tr' ? '⬇️ Alt' : '⬇️ Bottom', val: 80 },
                      ].map((preset) => {
                        const isActive = (menuConfig.menu_cover_position ?? 50) === preset.val;
                        return (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => {
                              setMenuConfig((prev) => ({ ...prev, menu_cover_position: preset.val }));
                              handleSaveConfig({ menu_cover_position: preset.val });
                            }}
                            style={{
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.68rem',
                              borderRadius: '4px',
                              border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                              background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontWeight: isActive ? 700 : 500,
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {language === 'tr' ? 'Üst (%0)' : 'Top (0%)'}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={menuConfig.menu_cover_position ?? 50}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMenuConfig((prev) => ({ ...prev, menu_cover_position: val }));
                      }}
                      onMouseUp={() => handleSaveConfig({ menu_cover_position: menuConfig.menu_cover_position ?? 50 })}
                      onTouchEnd={() => handleSaveConfig({ menu_cover_position: menuConfig.menu_cover_position ?? 50 })}
                      style={{
                        flex: 1,
                        accentColor: 'var(--accent-primary)',
                        cursor: 'pointer',
                        height: '4px',
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {language === 'tr' ? 'Alt (%100)' : 'Bottom (100%)'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        minWidth: '2.4rem',
                        textAlign: 'right',
                      }}
                    >
                      %{menuConfig.menu_cover_position ?? 50}
                    </span>
                  </div>
                </div>
              )}

              {/* Recommended Dimensions & Format Advice */}
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.45,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span>💡</span>
                  <span>{language === 'tr' ? 'Tavsiye Edilen Ölçüler & İpuçları' : 'Recommended Dimensions & Tips'}</span>
                </div>
                <div>
                  • <strong>{language === 'tr' ? 'İdeal Çözünürlük' : 'Ideal Resolution'}:</strong> 1200 × 500 px ({language === 'tr' ? 'veya 16:9 yatay geniş açı' : 'or 16:9 widescreen'})
                </div>
                <div style={{ marginTop: '0.15rem' }}>
                  • <strong>{language === 'tr' ? 'Format' : 'Format'}:</strong> JPG, PNG, WebP ({language === 'tr' ? 'Yüklenirken otomatik optimize edilir' : 'Auto-compressed on upload'})
                </div>
                <div style={{ marginTop: '0.15rem', opacity: 0.85 }}>
                  • {language === 'tr' ? 'Mekan tabelası veya ana odağı görselin merkezine yerleştirmeniz en iyi sonucu verir.' : 'Placing your signage/focal point in the upper center gives the best result.'}
                </div>
              </div>
            </div>

            {/* Right: Stories (Chef's Highlights) Switch */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                onClick={() => {
                  const newVal = !(menuConfig.enable_item_stories ?? true);
                  setMenuConfig({ ...menuConfig, enable_item_stories: newVal });
                  handleSaveConfig({ enable_item_stories: newVal });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: (menuConfig.enable_item_stories ?? true) ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                  background: (menuConfig.enable_item_stories ?? true) ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: (menuConfig.enable_item_stories ?? true) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: (menuConfig.enable_item_stories ?? true) ? '#34d399' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>
                      {language === 'tr' ? 'Şefin Seçtikleri (Stories) Vitrini' : "Chef's Highlights Stories"}
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {language === 'tr' ? 'Üstte Instagram hikayeleri formatında popüler lezzetleri öne çıkarır.' : 'Displays circular highlighted dishes at top like Instagram stories.'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={menuConfig.enable_item_stories ?? true}
                  readOnly
                  style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Native Menu Builder (Categories & Products) */}
      {menuConfig.menu_mode === 'NATIVE' && (
        <div className="native-menu-builder">
          {/* Categories Navigation Bar */}
          <div
            className="glass-card"
            style={{
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  {t('menu.categories')} ({categories.length})
                </h3>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateCategory}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem' }}
              >
                <Plus size={16} />
                <span>{t('menu.addCategory')}</span>
              </button>
            </div>

            {/* Category Pills / Tabs */}
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Layers size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t('menu.noCategoriesYet')}</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{t('menu.noCategoriesDesc')}</div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'thin',
                }}
              >
                {categories.map((cat, idx) => {
                  const isSelected = cat.id === activeCategoryId;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '999px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: '1px solid',
                        transition: 'all 0.2s',
                        background: isSelected
                          ? 'linear-gradient(135deg, var(--accent-primary), #4f46e5)'
                          : 'rgba(255, 255, 255, 0.04)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      }}
                      onClick={() => setActiveCategoryId(cat.id)}
                    >
                      <span>{cat.name}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        {cat.items?.length || 0}
                      </span>

                      {/* Reorder Buttons & Edit for Active Category */}
                      {isSelected && (
                        <div
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.25rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveCategory(idx, 'left')}
                              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}
                              title={language === 'tr' ? 'Sola Taşı' : 'Move Left'}
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          {idx < categories.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveCategory(idx, 'right')}
                              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}
                              title={language === 'tr' ? 'Sağa Taşı' : 'Move Right'}
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditCategory(cat)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2 }}
                            title={t('menu.editCategory') || (language === 'tr' ? 'Kategoriyi Düzenle' : 'Edit Category')}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 2 }}
                            title={t('menu.deleteCategory') || (language === 'tr' ? 'Kategoriyi Sil' : 'Delete Category')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Products List for Active Category */}
          {activeCategory && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    {activeCategory.name}
                  </h3>
                  {activeCategory.description && (
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {activeCategory.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Search Bar */}
                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder={t('menu.searchPlaceholder') || (language === 'tr' ? 'Ürün ara...' : 'Search items...')}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateProduct}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.84rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderColor: '#10b981',
                    }}
                  >
                    <Plus size={16} />
                    <span>{t('menu.addProduct')}</span>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <UtensilsCrossed size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {productSearch
                      ? (language === 'tr' ? 'Aramaya uygun ürün bulunamadı' : 'No items match your search')
                      : (language === 'tr' ? 'Bu kategoride henüz ürün yok' : 'No products in this category yet')}
                  </div>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
                    {language === 'tr'
                      ? 'Yukarıdaki "+ Yeni Ürün Ekle" butonunu kullanarak ilk ürününüzü ekleyin.'
                      : 'Use the "+ Add Product" button above to add your first item.'}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {filteredItems.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: item.is_active ? 1 : 0.65,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div>
                        {/* Image + Title Row */}
                        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.75rem' }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%2327272a"><rect width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2371717a" font-size="9">Photo</text></svg>';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-muted)',
                                flexShrink: 0,
                              }}
                            >
                              <UtensilsCrossed size={22} />
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
                                  {item.name}
                                </h4>
                                {item.is_featured && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      fontSize: '0.66rem',
                                      fontWeight: 800,
                                      padding: '1px 6px',
                                      borderRadius: '999px',
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      color: '#fbbf24',
                                      border: '1px solid rgba(245, 158, 11, 0.35)',
                                    }}
                                  >
                                    <Sparkles size={10} />
                                    <span>{language === 'tr' ? 'Şefin Seçimi' : "Chef's Choice"}</span>
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 800,
                                  color: '#34d399',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {formatCurrency(Number(item.price), item.currency)}
                              </div>
                            </div>
                            {item.description && (
                              <p
                                style={{
                                  margin: '0.35rem 0 0',
                                  fontSize: '0.78rem',
                                  color: 'var(--text-secondary)',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Allergen Badges */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                            {item.allergens.map((algId) => (
                              <span
                                key={algId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                                title={getAllergenDetail(algId, language)}
                              >
                                <span>{getAllergenIcon(algId)}</span>
                                <span>{getAllergenLabel(algId, language)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                            {item.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: '#a5b4fc',
                                  fontWeight: 700,
                                  letterSpacing: '0.03em',
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Stock Switch + Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          marginTop: '0.5rem',
                        }}
                      >
                        {/* Stock Toggle Switch */}
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: item.is_active ? '#34d399' : 'var(--text-muted)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={() => handleToggleProductStatus(item)}
                            style={{ accentColor: '#10b981', cursor: 'pointer' }}
                          />
                          <span>{item.is_active ? (language === 'tr' ? 'Stokta Var' : 'In Stock') : (language === 'tr' ? 'Tükendi' : 'Sold Out')}</span>
                        </label>

                        {/* Actions (Reorder Up/Down + Edit + Delete) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {filteredItems.length === (activeCategory.items?.length || 0) && (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={itemIdx === 0}
                                onClick={() => handleMoveItem(itemIdx, 'up')}
                                style={{
                                  padding: '0.3rem 0.45rem',
                                  fontSize: '0.75rem',
                                  opacity: itemIdx === 0 ? 0.35 : 1,
                                  cursor: itemIdx === 0 ? 'not-allowed' : 'pointer',
                                }}
                                title={language === 'tr' ? 'Yukarı Taşı' : 'Move Up'}
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={itemIdx === (activeCategory.items?.length || 0) - 1}
                                onClick={() => handleMoveItem(itemIdx, 'down')}
                                style={{
                                  padding: '0.3rem 0.45rem',
                                  fontSize: '0.75rem',
                                  opacity: itemIdx === (activeCategory.items?.length || 0) - 1 ? 0.35 : 1,
                                  cursor: itemIdx === (activeCategory.items?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                                }}
                                title={language === 'tr' ? 'Aşağı Taşı' : 'Move Down'}
                              >
                                <ChevronDown size={13} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => openEditProduct(item)}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                            title={t('common.edit') || (language === 'tr' ? 'Düzenle' : 'Edit')}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleDeleteProduct(item)}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', color: '#f87171' }}
                            title={t('common.delete') || (language === 'tr' ? 'Sil' : 'Delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? t('menu.editCategory') : t('menu.addCategory')}
        maxWidth="480px"
      >
        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {t('menu.categoryName')} *
            </label>
            <input
              type="text"
              className="input"
              required
              placeholder={t('menu.categoryNamePlaceholder') || 'Örn: Sıcak İçecekler'}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {t('menu.categoryDesc')}
            </label>
            <textarea
              className="input"
              rows={2}
              placeholder={t('menu.categoryDescPlaceholder') || 'Açıklama'}
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={submittingCategory}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingCategory}>
              {submittingCategory ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? t('menu.editProduct') : t('menu.addProduct')}
        maxWidth="680px"
      >
        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxHeight: '80vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {/* Category selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {language === 'tr' ? 'Kategori *' : 'Category *'}
              </label>
              <select
                className="input"
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {t('menu.status')}
              </label>
              <select
                className="input"
                value={productIsActive ? 'active' : 'inactive'}
                onChange={(e) => setProductIsActive(e.target.value === 'active')}
              >
                <option value="active">{t('menu.inStock')}</option>
                <option value="inactive">{t('menu.outOfStock')}</option>
              </select>
            </div>
          </div>

          {/* Name, Price, and Currency */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '2 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {t('menu.productName')} *
              </label>
              <input
                type="text"
                className="input"
                required
                placeholder={t('menu.productNamePlaceholder') || (language === 'tr' ? 'Örn: Latte' : 'e.g. Latte')}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {t('menu.price')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                required
                placeholder="150"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 90px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {t('menu.currency')}
              </label>
              <select
                className="input"
                value={productCurrency}
                onChange={(e) => setProductCurrency(e.target.value)}
              >
                {[businessCurrency, 'TRY', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'IDR', 'RUB']
                  .filter((v, idx, arr) => arr.indexOf(v) === idx && Boolean(v))
                  .map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {t('menu.productDesc')}
            </label>
            <textarea
              className="input"
              rows={2}
              placeholder={t('menu.productDescPlaceholder') || 'Espresso, buharda ısıtılmış süt...'}
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>

          {/* Image Upload & URL Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                {t('menu.imageUrl')}
              </label>
              {/* Mode toggle pills */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '2px' }}>
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: imageInputMode === 'upload' ? 'var(--accent-primary)' : 'transparent',
                    color: imageInputMode === 'upload' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={12} />
                  <span>{t('menu.uploadPhoto')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: imageInputMode === 'url' ? 'var(--accent-primary)' : 'transparent',
                    color: imageInputMode === 'url' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  <ExternalLink size={12} />
                  <span>{t('menu.enterImageUrl')}</span>
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/jpg"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleProductImageUpload(file);
                  e.target.value = '';
                }
              }}
            />

            {/* If an image is already selected or entered */}
            {productImageUrl ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src={productImageUrl}
                    alt={productName || 'Preview'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76"><rect width="76" height="76" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">${language === 'tr' ? 'Hatalı Görsel' : 'Invalid Image'}</text></svg>`;
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {t('menu.photoPreview')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                    {productImageUrl.startsWith('data:') ? (language === 'tr' ? 'Cihazdan Yüklendi (WebP Optimize)' : 'Uploaded from Device (WebP)') : productImageUrl}
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.18)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <Camera size={13} />
                      <span>{t('menu.changePhoto')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductImageUrl('')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>{t('menu.removePhoto')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : imageInputMode === 'upload' ? (
              /* Upload Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverPhoto(true);
                }}
                onDragLeave={() => setDragOverPhoto(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverPhoto(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProductImageUpload(file);
                }}
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: '10px',
                  border: dragOverPhoto ? '2px dashed var(--accent-primary)' : '1px dashed rgba(255, 255, 255, 0.2)',
                  background: dragOverPhoto ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.6rem',
                  }}
                >
                  {isProcessingImage ? <div className="spinner-small" /> : <Camera size={20} />}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isProcessingImage ? (language === 'tr' ? 'Görsel işleniyor ve optimize ediliyor...' : 'Optimizing photo...') : t('menu.selectOrDropPhoto')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {t('menu.photoFormatsHelp')}
                </div>
              </div>
            ) : (
              /* URL input fallback */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  type="url"
                  className="input"
                  placeholder={t('menu.imageUrlPlaceholder') || 'https://images.unsplash.com/... veya görsel URL'}
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* ALLERGEN SELECTOR (Grid of 14 standard allergens) */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0 }}>
                  ⚠️ {t('menu.allergens')}
                </label>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t('menu.allergensSelectHelp')}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                {productAllergens.length > 0 ? `${productAllergens.length} ${t('menu.allergensSelectedCount')}` : t('menu.noAllergensSelected')}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {ALLERGEN_CATALOG.map((allergen) => {
                const isSelected = productAllergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    type="button"
                    onClick={() => toggleAllergen(allergen.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: '1px solid',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isSelected ? '#fbbf24' : 'rgba(255, 255, 255, 0.09)',
                      color: isSelected ? '#fbbf24' : 'var(--text-secondary)',
                    }}
                    title={getAllergenDetail(allergen.id, language)}
                  >
                    <span style={{ fontSize: '1rem' }}>{allergen.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getAllergenLabel(allergen.id, language)}
                    </span>
                    {isSelected && <Check size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chef's Highlight / Featured Toggle */}
          <div
            onClick={() => setProductIsFeatured(!productIsFeatured)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1rem',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: productIsFeatured ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
              background: productIsFeatured ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: productIsFeatured ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: productIsFeatured ? '#fbbf24' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: productIsFeatured ? '#fbbf24' : 'var(--text-primary)' }}>
                  {language === 'tr' ? '⭐ Şefin Seçimi & Hikaye Vitrini' : "⭐ Chef's Highlight & Stories"}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {language === 'tr'
                    ? 'Bu ürünü menünün en üstündeki yuvarlak "Şefin Seçtikleri" hikayelerinde göster.'
                    : 'Display this item in the circular stories showcase at the top of your menu.'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={productIsFeatured}
              readOnly
              style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {t('menu.tags')} ({language === 'tr' ? 'Virgülle ayırarak yazın' : 'Comma-separated'})
            </label>
            <input
              type="text"
              className="input"
              placeholder={t('menu.tagPlaceholder') || 'POPULER, SEFIN_SECIMI, VEGAN'}
              value={productTags}
              onChange={(e) => setProductTags(e.target.value)}
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsProductModalOpen(false)}
              disabled={submittingProduct}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingProduct || isProcessingImage}
            >
              {submittingProduct
                ? t('common.saving')
                : isProcessingImage
                ? (language === 'tr' ? 'Fotoğraf Yükleniyor...' : 'Uploading Photo...')
                : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default MenuManagementPage;
