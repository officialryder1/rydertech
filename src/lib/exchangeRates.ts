// /lib/utils/exchangeRates.ts

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const FALLBACK_RATE = 1500; // Fallback rate if API fails
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface ExchangeRateCache {
  rate: number;
  timestamp: number;
  base: string;
  target: string;
}

class ExchangeRateService {
  private cache: ExchangeRateCache | null = null;

  async getNGNRate(): Promise<number> {
    // Check cache first
    if (this.cache && (Date.now() - this.cache.timestamp) < CACHE_DURATION) {
      return this.cache.rate;
    }

    try {
      // Try to fetch from API
      const response = await fetch(EXCHANGE_RATE_API);
      const data = await response.json();
      
      if (data && data.rates && data.rates.NGN) {
        const rate = data.rates.NGN;
        
        // Update cache
        this.cache = {
          rate,
          timestamp: Date.now(),
          base: 'USD',
          target: 'NGN'
        };
        
        // Also store in localStorage for offline use
        if (typeof window !== 'undefined') {
          localStorage.setItem('exchangeRateCache', JSON.stringify(this.cache));
        }
        
        return rate;
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      
      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('exchangeRateCache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (Date.now() - parsed.timestamp) < CACHE_DURATION * 7) {
            this.cache = parsed;
            return parsed.rate;
          }
        }
      }
    }

    // Return fallback rate
    return FALLBACK_RATE;
  }

  formatCurrency(amount: number, currency: 'USD' | 'NGN'): string {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
  }

  convert(amount: number, from: 'USD' | 'NGN', to: 'USD' | 'NGN'): number {
    if (from === to) return amount;
    
    if (from === 'USD' && to === 'NGN') {
      return amount * (this.cache?.rate || FALLBACK_RATE);
    } else {
      return amount / (this.cache?.rate || FALLBACK_RATE);
    }
  }
}

export const exchangeRateService = new ExchangeRateService();

// Nigerian-specific pricing ranges for context
export const nigerianMarketRanges = {
  'landing-page': {
    min: 200000, // ₦200,000
    max: 1000000 // ₦1,000,000
  },
  'business-website': {
    min: 750000, // ₦750,000
    max: 5000000 // ₦5,000,000
  },
  'ecommerce': {
    min: 1000000, // ₦1,000,000
    max: 10000000 // ₦10,000,000
  },
  'web-app': {
    min: 2000000, // ₦5,000,000
    max: 25000000 // ₦25,000,000
  }
};