import { useState, useEffect } from 'react';
import { userAnalyticsService, UserStats, MarketInsights } from '@/services/analytics/userAnalytics';

export function useAnalytics(userAddress?: string) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAnalytics = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [stats, insights] = await Promise.all([
        userAnalyticsService.getUserStats(userAddress),
        userAnalyticsService.getMarketInsights(),
      ]);
      
      setUserStats(stats);
      setMarketInsights(insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      refreshAnalytics();
    }
  }, [userAddress]);

  return {
    userStats,
    marketInsights,
    loading,
    error,
    refreshAnalytics,
  };
}