// src/hooks/useAllMarkets.ts
import { useState, useCallback } from 'react';
import { blockchainService, OnChainMarket } from '@/services/blockchain/service';

export interface GeneralMarket extends OnChainMarket {}

export function useAllMarkets() {
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<GeneralMarket[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching REAL markets from blockchain...');
      
      // Fetch all markets from blockchain
      const onChainMarkets = await blockchainService.getAllMarkets();
      
      console.log(`✅ Fetched ${onChainMarkets.length} real markets from blockchain`);
      setMarkets(onChainMarkets);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets from blockchain';
      setError(errorMessage);
      console.error('❌ Error fetching markets:', err);
      
      // Don't fall back to mock data - show empty state instead
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching active markets from blockchain...');
      
      const activeMarkets = await blockchainService.getActiveMarkets();
      
      console.log(`✅ Fetched ${activeMarkets.length} active markets`);
      setMarkets(activeMarkets);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active markets';
      setError(errorMessage);
      console.error('❌ Error fetching active markets:', err);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMarkets = useCallback(async () => {
    return fetchMarkets();
  }, [fetchMarkets]);

  const getMarketsByCategory = useCallback((category: string) => {
    return markets.filter(market => market.category.toLowerCase() === category.toLowerCase());
  }, [markets]);

  const getActiveMarkets = useCallback(() => {
    return markets.filter(market => !market.resolved && market.endTime > new Date());
  }, [markets]);

  const getRecentMarkets = useCallback(() => {
    return markets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }, [markets]);

  const createMarket = useCallback(async (
    userAccount: string,
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number;
      initialBetAmount: string;
      initialOutcome: boolean;
    }
  ) => {
    try {
      console.log('🏗️ Creating new market on blockchain...');
      
      const result = await blockchainService.createMarketManually(
        userAccount as any,
        marketData
      );
      
      if (result.success) {
        console.log('✅ Market created successfully!', result);
        // Refresh markets to include the new one
        await fetchMarkets();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error creating market:', error);
      throw error;
    }
  }, [fetchMarkets]);

  return {
    loading,
    markets,
    error,
    fetchMarkets,
    fetchActiveMarkets,
    refreshMarkets,
    getMarketsByCategory,
    getActiveMarkets,
    getRecentMarkets,
    createMarket,
  };
}