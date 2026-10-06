/**
 * Currency Conversion Utility with live exchange rates and fallback rates
 */

export interface ExchangeRates {
  TRY: number;
  USD: number;
  EUR: number;
  GBP: number;
  [key: string]: number;
}

// Fallback rates against 1 TRY
const FALLBACK_RATES: ExchangeRates = {
  TRY: 1,
  USD: 1 / 38.50, // ~0.026 USD per TRY
  EUR: 1 / 41.80, // ~0.0239 EUR per TRY
  GBP: 1 / 49.50, // ~0.0202 GBP per TRY
};

let cachedRates: ExchangeRates = { ...FALLBACK_RATES };
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchLiveExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const saved = localStorage.getItem('naponi_exchange_rates_try');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.timestamp && now - parsed.timestamp < CACHE_DURATION && parsed.rates) {
        cachedRates = { ...FALLBACK_RATES, ...parsed.rates };
        lastFetchTime = parsed.timestamp;
        return cachedRates;
      }
    }

    const res = await fetch('https://open.er-api.com/v6/latest/TRY');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedRates = {
          TRY: 1,
          USD: data.rates.USD || FALLBACK_RATES.USD,
          EUR: data.rates.EUR || FALLBACK_RATES.EUR,
          GBP: data.rates.GBP || FALLBACK_RATES.GBP,
        };
        lastFetchTime = now;
        localStorage.setItem(
          'naponi_exchange_rates_try',
          JSON.stringify({ timestamp: now, rates: cachedRates })
        );
      }
    }
  } catch (err) {
    // Silently fall back to cached / fallback rates
  }

  return cachedRates;
}

// Fire initial fetch in background
if (typeof window !== 'undefined') {
  fetchLiveExchangeRates().catch(() => {});
}

export function convertCurrency(
  amount: number,
  fromCurrency: string = 'TRY',
  toCurrency: string = 'TRY',
  rates: ExchangeRates = cachedRates
): number {
  if (fromCurrency === toCurrency || !amount) return amount;

  const fromRate = rates[fromCurrency.toUpperCase()] || 1;
  const toRate = rates[toCurrency.toUpperCase()] || 1;

  // Convert to base TRY first, then to target
  // Since rates are relative to TRY: 1 TRY = toRate [TARGET]
  const amountInTRY = fromCurrency.toUpperCase() === 'TRY' ? amount : amount / fromRate;
  const converted = toCurrency.toUpperCase() === 'TRY' ? amountInTRY : amountInTRY * toRate;

  // Round to 2 decimals
  return Math.round(converted * 100) / 100;
}

export function getExchangeRateText(
  fromCurrency: string = 'TRY',
  toCurrency: string = 'USD',
  rates: ExchangeRates = cachedRates
): string {
  if (fromCurrency === toCurrency) return '1.00';
  const converted = convertCurrency(1, fromCurrency, toCurrency, rates);
  return converted.toFixed(4);
}
