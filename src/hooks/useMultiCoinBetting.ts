
// src/hooks/useMultiCoinBetting.ts
import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useCoinRewards } from './useCoinRewards';
import { blockchainService } from '@/services/blockchain/service';
import { CoinType } from '@/constants/coins';
import { Address } from 'viem';

interface EnhancedBetParams {
  marketId: number;
  outcome: boolean;
  amount: string;
  coinType?: CoinType; // Optional coin to stake for enhanced rewards
  useMultiplier?: boolean;
}

export function useMultiCoinBetting() {
  const { user } = usePrivy();
  const { processRewards } = useCoinRewards();
  const [betting, setBetting] = useState(false);
  const [lastBet, setLastBet] = useState<any>(null);

  const placeBetWithCoins = useCallback(async (params: EnhancedBetParams) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setBetting(true);
    
    try {
      console.log('💰 Placing enhanced bet with coin rewards...', params);

      // Place the regular bet first
      const betResult = await blockchainService.placeBet(
        user.wallet.address as Address,
        params.marketId,
        params.outcome,
        params.amount
      );

      if (!betResult.success) {
        throw new Error(betResult.error);
      }

      // Create prediction result for coin processing
      const predictionResult = {
        marketId: params.marketId,
        userAddress: user.wallet.address as Address,
        correct: true, // We'll determine this when market resolves
        marketCategory: 'general', // Would come from market data
        odds: 50, // Would come from market data
        streak: 0, // Would come from user stats
        isFirstCorrect: false,
        isEarlyPrediction: true,
        betAmount: parseFloat(params.amount),
        timestamp: new Date(),
      };

      // Process coin rewards (this would normally happen at resolution)
      // For demo, we'll process immediately
      try {
        await processRewards(predictionResult, {} as any);
      } catch (rewardError) {
        console.warn('Coin reward processing failed:', rewardError);
        // Don't fail the bet if reward processing fails
      }

      const betData = {
        ...params,
        txHash: betResult.txHash,
        timestamp: new Date(),
        enhancedRewards: !!params.coinType,
      };

      setLastBet(betData);
      console.log('✅ Enhanced bet placed successfully!');
      
      return {
        success: true,
        ...betData,
      };

    } catch (error) {
      console.error('❌ Enhanced betting failed:', error);
      throw error;
    } finally {
      setBetting(false);
    }
  }, [user?.wallet?.address, processRewards]);

  const calculateEnhancedRewards = useCallback((
    baseReward: number,
    coinType?: CoinType,
    userCoinBalance?: number
  ) => {
    if (!coinType || !userCoinBalance) return baseReward;

    // Calculate multiplier based on coin holdings
    let multiplier = 1.0;
    
    if (userCoinBalance >= 1000) {
      multiplier = 2.0; // 2x for high holders
    } else if (userCoinBalance >= 500) {
      multiplier = 1.5; // 1.5x for medium holders
    } else if (userCoinBalance >= 100) {
      multiplier = 1.25; // 1.25x for smaller holders
    }

    return baseReward * multiplier;
  }, []);

  return {
    betting,
    lastBet,
    placeBetWithCoins,
    calculateEnhancedRewards,
  };
}


