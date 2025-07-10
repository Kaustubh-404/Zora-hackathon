

// src/hooks/useCoins.ts
import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { coinsService } from '@/services/coins/coinsService';
import { coinRewardsService } from '@/services/coins/coinRewards';
import { 
  CoinBalance, 
  CoinEarning, 
  CoinType, 
 
} from '@/constants/coins';
import { Address } from 'viem';

export function useCoins() {
  const { user } = usePrivy();
  const [balances, setBalances] = useState<CoinBalance[]>([]);
  const [earnings, setEarnings] = useState<CoinEarning[]>([]);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!user?.wallet?.address) return;

    setLoading(true);
    setError(null);

    try {
      const [userBalances, userEarnings, userAchievements] = await Promise.all([
        coinsService.getUserCoinBalances(user.wallet.address as Address),
        coinRewardsService.getUserEarnings(user.wallet.address as Address),
        coinRewardsService.getUserAchievements(user.wallet.address as Address),
      ]);

      setBalances(userBalances);
      setEarnings(userEarnings);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coin data');
      console.error('Error loading coin data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.wallet?.address]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getTotalCoinValue = useCallback(() => {
    return balances.reduce((total, balance) => {
      const amount = parseFloat(balance.balance.toString()) / 10**18;
      return total + (amount * (balance.priceUSD || 0));
    }, 0);
  }, [balances]);

  const getTopCoinType = useCallback(() => {
    if (balances.length === 0) return null;
    
    return balances.reduce((top, current) => {
      const topAmount = parseFloat(top.balance.toString());
      const currentAmount = parseFloat(current.balance.toString());
      return currentAmount > topAmount ? current : top;
    }).coinType;
  }, [balances]);

  const getCoinStats = useCallback(() => {
    const stats = coinRewardsService.getUserCoinStats(user?.wallet?.address as Address);
    return {
      ...stats,
      totalValue: getTotalCoinValue(),
      topCoinType: getTopCoinType(),
    };
  }, [user?.wallet?.address, getTotalCoinValue, getTopCoinType]);

  return {
    balances,
    earnings,
    loading,
    error,
    refreshData,
    getTotalCoinValue,
    getTopCoinType,
    getCoinStats,
  };
}
