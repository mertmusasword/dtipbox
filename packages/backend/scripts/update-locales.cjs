const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'id', 'ja', 'pt', 'ru', 'zh'];

const translations = {
  tr: { adminProducts: 'Mağaza Ürünleri', adminOrders: 'Mağaza Siparişleri' },
  en: { adminProducts: 'Store Products', adminOrders: 'Store Orders' },
  de: { adminProducts: 'Shop-Produkte', adminOrders: 'Shop-Bestellungen' },
  fr: { adminProducts: 'Produits de la boutique', adminOrders: 'Commandes de la boutique' },
  es: { adminProducts: 'Productos de la tienda', adminOrders: 'Pedidos de la tienda' },
  ar: { adminProducts: 'منتجات المتجر', adminOrders: 'طلبات المتجر' },
  id: { adminProducts: 'Produk Toko', adminOrders: 'Pesanan Toko' },
  ja: { adminProducts: 'ストア商品', adminOrders: 'ストア注文' },
  pt: { adminProducts: 'Produtos da loja', adminOrders: 'Pedidos da loja' },
  ru: { adminProducts: 'Товары магазина', adminOrders: 'Заказы магазина' },
  zh: { adminProducts: '商店商品', adminOrders: '商店订单' }
};

for (const loc of locales) {
  const filePath = path.resolve(__dirname, '../../frontend/src/i18n/locales', `${loc}.ts`);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('"adminProducts"')) {
    // Replace in the "nav": { ... } object under "payments": "..."
    const regex = /("payments":\s*"[^"]+")/;
    if (regex.test(content)) {
      content = content.replace(
        regex,
        `$1,\n    "adminProducts": "${translations[loc].adminProducts}",\n    "adminOrders": "${translations[loc].adminOrders}"`
      );
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated locale: ${loc}`);
    } else {
      console.warn(`Could not find "payments" in ${loc}.ts`);
    }
  } else {
    console.log(`Already has adminProducts: ${loc}`);
  }
}
