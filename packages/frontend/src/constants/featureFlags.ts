/**
 * Global Feature Flags
 *
 * Bu bayraklar geçici olarak açılıp kapatılabilen operasyonel özellikleri yönetir.
 * Lemon Squeezy onayı gelene kadar Naponi'nin işletmelerden tahsil ettiği B2B ödemelerde
 * (Naponi Store ürün/stand satışları) kredi kartı seçeneği gizlidir; yalnızca Havale / EFT aktiftir.
 *
 * NOT: İşletmelerin müşterilerinden kendi dış ödeme linkleriyle (Stripe, PayTR, iyzico, vb.) aldıkları
 * bahşiş ödemeleri bu bayraktan bağımsızdır ve her zaman serbesttir.
 */

// Naponi B2B Kredi Kartı Tahsilatları (Naponi Store Stand/Donanım Satışı)
export const ENABLE_B2B_CREDIT_CARD_PAYMENTS = false;
