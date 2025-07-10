
// src/hooks/useCoinTrading.ts
import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { coinsService } from '@/services/coins/coinsService';
import { CoinType } from '@/constants/coins';
import { Address } from 'viem';

interface TradeParams {
  fromCoin: CoinType | 'ETH';
  toCoin: CoinType | 'ETH';
  amount: string;
}

export function useCoinTrading() {
  const { user } = usePrivy();
  const [trading, setTrading] = useState(false);
  const [lastTrade, setLastTrade] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeTrade = useCallback(async (params: TradeParams) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setTrading(true);
    setError(null);

    try {
      console.log('🔄 Executing coin trade...', params);

      // Check trading eligibility if not ETH
      if (params.fromCoin !== 'ETH') {
        const eligibility = await coinsService.checkTradingEligibility(
          user.wallet.address as Address,
          params.fromCoin,
          params.amount
        );

        if (!eligibility.eligible) {
          throw new Error(eligibility.reason);
        }
      }

      // Execute the trade
      const result = await coinsService.tradeCoin(
        params.fromCoin,
        params.toCoin,
        params.amount,
        user.wallet.address as Address,
        // In real implementation, pass actual wallet client
        {} as any
      );

      if (result.success) {
        setLastTrade({
          ...params,
          txHash: result.transactionHash,
          timestamp: new Date(),
        });
        console.log('✅ Trade executed successfully!');
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Trade failed';
      setError(errorMessage);
      console.error('❌ Trade failed:', err);
      throw err;
    } finally {
      setTrading(false);
    }
  }, [user?.wallet?.address]);

  const getTradeEstimate = useCallback(async (params: TradeParams) => {
    try {
      // In real implementation, this would call Uniswap quoter
      // For now, simulate trade estimation
      const inputAmount = parseFloat(params.amount);
      
      // Mock exchange rates
      let exchangeRate = 1;
      if (params.fromCoin === 'ETH' && params.toCoin !== 'ETH') {
        exchangeRate = 1000; // 1 ETH = 1000 coins
      } else if (params.fromCoin !== 'ETH' && params.toCoin === 'ETH') {
        exchangeRate = 0.001; // 1000 coins = 1 ETH
      } else if (params.fromCoin !== 'ETH' && params.toCoin !== 'ETH') {
        exchangeRate = 1.05; // 5% bonus for coin-to-coin
      }

      const outputAmount = inputAmount * exchangeRate;
      const priceImpact = Math.min(inputAmount * 0.001, 0.05); // Max 5%

      return {
        outputAmount: outputAmount.toFixed(6),
        priceImpact,
        minimumReceived: (outputAmount * 0.95).toFixed(6), // 5% slippage
        exchangeRate,
      };
    } catch (error) {
      console.error('Error estimating trade:', error);
      return null;
    }
  }, []);

  return {
    trading,
    lastTrade,
    error,
    executeTrade,
    getTradeEstimate,
    setError,
  };
}
