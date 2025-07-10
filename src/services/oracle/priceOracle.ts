interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  source: string;
}

interface OracleResult {
  success: boolean;
  data?: PriceData;
  error?: string;
}

class PriceOracleService {
  private cache = new Map<string, { data: PriceData; expiry: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getPrice(symbol: string): Promise<OracleResult> {
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() < cached.expiry) {
      return { success: true, data: cached.data };
    }

    try {
      // In production, this would call real price APIs like:
      // - CoinGecko API
      // - Chainlink Price Feeds
      // - Binance API
      // - CoinMarketCap API
      
      const priceData = await this.fetchFromMultipleSources(symbol);
      
      // Cache the result
      this.cache.set(symbol, {
        data: priceData,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return { success: true, data: priceData };
      
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return { 
        success: false, 
        error: `Failed to fetch ${symbol} price` 
      };
    }
  }

  private async fetchFromMultipleSources(symbol: string): Promise<PriceData> {
    // For demo purposes, simulate price data
    // In production, implement real API calls
    
    const mockPrices: Record<string, number> = {
      'BTC': 95000 + Math.random() * 10000, // $95k-105k
      'ETH': 3500 + Math.random() * 1000,   // $3.5k-4.5k
      'SOL': 180 + Math.random() * 40,      // $180-220
      'MATIC': 0.8 + Math.random() * 0.4,   // $0.8-1.2
    };

    const price = mockPrices[symbol.toUpperCase()] || 100;

    return {
      symbol: symbol.toUpperCase(),
      price,
      timestamp: new Date(),
      source: 'CoinGecko API', // In production, track actual source
    };
  }

  async canResolveAutomatically(question: string): Promise<{
    canResolve: boolean;
    symbol?: string;
    targetPrice?: number;
    condition?: 'above' | 'below';
  }> {
    // Parse common price-based questions
    const pricePatterns = [
      /Will (\w+) (?:reach|hit|exceed|be above) \$?([0-9,]+)/i,
      /Will (\w+) (?:drop below|fall under|be under) \$?([0-9,]+)/i,
      /Will (\w+) (?:price|value) (?:be|go) (?:above|over) \$?([0-9,]+)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = question.match(pattern);
      if (match) {
        const symbol = this.normalizeSymbol(match[1]);
        const targetPrice = parseFloat(match[2].replace(',', ''));
        const condition = question.toLowerCase().includes('below') || 
                         question.toLowerCase().includes('under') ? 'below' : 'above';

        return {
          canResolve: true,
          symbol,
          targetPrice,
          condition,
        };
      }
    }

    return { canResolve: false };
  }

  async resolveMarketAutomatically(_marketId: number, question: string): Promise<{
    canResolve: boolean;
    outcome?: boolean;
    confidence?: number;
    explanation?: string;
  }> {
    const analysis = await this.canResolveAutomatically(question);
    
    if (!analysis.canResolve || !analysis.symbol || !analysis.targetPrice) {
      return { canResolve: false };
    }

    const priceResult = await this.getPrice(analysis.symbol);
    
    if (!priceResult.success || !priceResult.data) {
      return { canResolve: false };
    }

    const currentPrice = priceResult.data.price;
    let outcome: boolean;

    if (analysis.condition === 'above') {
      outcome = currentPrice >= analysis.targetPrice;
    } else {
      outcome = currentPrice <= analysis.targetPrice;
    }

    return {
      canResolve: true,
      outcome,
      confidence: 100, // High confidence for price data
      explanation: `${analysis.symbol} current price: ${currentPrice.toFixed(2)}. Target: ${analysis.condition} ${analysis.targetPrice}. Result: ${outcome ? 'YES' : 'NO'}`,
    };
  }

  private normalizeSymbol(symbol: string): string {
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'polygon': 'MATIC',
      'matic': 'MATIC',
    };

    return symbolMap[symbol.toLowerCase()] || symbol.toUpperCase();
  }
}

export const priceOracleService = new PriceOracleService();