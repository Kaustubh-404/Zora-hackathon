
// src/hooks/useCoinRewards.ts
import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { coinRewardsService, PredictionResult } from '@/services/coins/coinRewards';
import { CoinEarning,  } from '@/constants/coins';
import { Address } from 'viem';

export function useCoinRewards() {
  const { user } = usePrivy();
  const [processing, setProcessing] = useState(false);
  const [lastRewards, setLastRewards] = useState<CoinEarning[]>([]);


  const processRewards = useCallback(async (
    predictionResult: PredictionResult,
    walletClient: any
  ) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setProcessing(true);
    
    try {
      console.log('🎯 Processing coin rewards for prediction...');

      const result = await coinRewardsService.processPredictionResult(
        {
          ...predictionResult,
          userAddress: user.wallet.address as Address,
        },
        walletClient
      );

      if (result.success) {
        setLastRewards(result.rewards);
        
        
        console.log(`✅ Processed ${result.rewards.length} coin rewards`);
        console.log(`🏆 Unlocked ${result.achievements.length} new achievements`);
        
        return result;
      } else {
        throw new Error('Failed to process coin rewards');
      }
    } catch (error) {
      console.error('❌ Error processing rewards:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [user?.wallet?.address]);

  const calculatePotentialRewards = useCallback((predictionData: {
    correct: boolean;
    marketCategory: string;
    odds: number;
    streak: number;
    isFirstCorrect: boolean;
    isEarlyPrediction: boolean;
  }) => {
    const { calculateCoinRewards } = require('@/constants/coins');
    return calculateCoinRewards(predictionData);
  }, []);

  const getUserStreak = useCallback(() => {
    if (!user?.wallet?.address) return 0;
    return coinRewardsService.getUserStreak(user.wallet.address as Address);
  }, [user?.wallet?.address]);

  const getRewardMultipliers = useCallback(async () => {
    if (!user?.wallet?.address) return {};
    return coinRewardsService.calculateRewardMultipliers(user.wallet.address as Address);
  }, [user?.wallet?.address]);

  return {
    processing,
    lastRewards,

    processRewards,
    calculatePotentialRewards,
    getUserStreak,
    getRewardMultipliers,
  };
}
