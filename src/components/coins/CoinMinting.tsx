// src/components/coins/CoinMinting.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { coinRewardsService } from '@/services/coins/coinRewards';
import { 
  CoinType, 
  CoinReward, 
  getCoinMetadata, 
  COIN_TYPES,
  calculateCoinRewards 
} from '@/constants/coins';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Crown,
  TrendingUp,
  Award,
  CheckCircle,
  Coins,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

interface CoinMintingProps {
  predictionResult?: {
    marketId: number;
    userAddress: string;
    correct: boolean;
    marketCategory: string;
    odds: number;
    streak: number;
    isFirstCorrect: boolean;
    isEarlyPrediction: boolean;
    betAmount: number;
    winAmount?: number;
    timestamp: Date;
  };
  onMintComplete?: (rewards: CoinReward[]) => void;
  className?: string;
}

export function CoinMinting({ predictionResult, onMintComplete, className = '' }: CoinMintingProps) {
  const { user } = usePrivy();
  const [mintingState, setMintingState] = useState<'idle' | 'calculating' | 'minting' | 'complete'>('idle');
  const [calculatedRewards, setCalculatedRewards] = useState<CoinReward[]>([]);
  const [currentlyMinting, setCurrentlyMinting] = useState<CoinType | null>(null);
  const [mintProgress, setMintProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-start minting when prediction result is provided
  useEffect(() => {
    if (predictionResult && predictionResult.correct && mintingState === 'idle') {
      startMinting();
    }
  }, [predictionResult]);

  const startMinting = async () => {
    if (!predictionResult || !user?.wallet?.address) return;

    setMintingState('calculating');
    setShowPreview(true);

    try {
      // Calculate rewards
      const rewards = calculateCoinRewards(predictionResult);
      setCalculatedRewards(rewards);

      // Short delay to show calculation
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (rewards.length > 0) {
        setMintingState('minting');
        await processMinting(rewards);
      } else {
        setMintingState('complete');
      }
    } catch (error) {
      console.error('Error in coin minting process:', error);
      setMintingState('idle');
    }
  };

  const processMinting = async (rewards: CoinReward[]) => {
    const totalRewards = rewards.length;
    let completed = 0;

    for (const reward of rewards) {
      setCurrentlyMinting(reward.coinType);
      setMintProgress((completed / totalRewards) * 100);

      try {
        // Simulate minting process (replace with actual SDK calls)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In real implementation, this would call coinsService.mintRewardCoins
        console.log(`Minting ${reward.amount} ${reward.coinType} coins for ${reward.reason}`);
        
        completed++;
        setMintProgress((completed / totalRewards) * 100);
      } catch (error) {
        console.error(`Error minting ${reward.coinType}:`, error);
      }
    }

    setCurrentlyMinting(null);
    setMintingState('complete');
    
    if (onMintComplete) {
      onMintComplete(rewards);
    }
  };

  const getCoinIcon = (coinType: CoinType) => {
    switch (coinType) {
      case COIN_TYPES.ACCURACY: return <Target className="w-6 h-6" />;
      case COIN_TYPES.STREAK: return <Zap className="w-6 h-6" />;
      case COIN_TYPES.ORACLE: return <Sparkles className="w-6 h-6" />;
      case COIN_TYPES.COMMUNITY: return <Users className="w-6 h-6" />;
      case COIN_TYPES.RISK: return <Crown className="w-6 h-6" />;
      case COIN_TYPES.CRYPTO_MASTER: return <Coins className="w-6 h-6" />;
      case COIN_TYPES.TECH_MASTER: return <TrendingUp className="w-6 h-6" />;
      case COIN_TYPES.SPORTS_MASTER: return <Trophy className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getTotalRewardValue = () => {
    return calculatedRewards.reduce((total, reward) => total + reward.amount, 0);
  };

  if (!showPreview) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mintingState === 'calculating' ? 'Calculating Rewards...' :
             mintingState === 'minting' ? 'Minting Coins...' :
             mintingState === 'complete' ? 'Coins Minted!' : 'Coin Rewards'}
          </h2>
          <p className="text-gray-600">
            {mintingState === 'calculating' ? 'Analyzing your prediction performance' :
             mintingState === 'minting' ? 'Creating your reward coins on-chain' :
             mintingState === 'complete' ? 'Your coins are ready to trade!' : 'Earn coins for accurate predictions'}
          </p>
        </div>

        {/* Calculation Phase */}
        {mintingState === 'calculating' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Analyzing prediction accuracy, streak, and market conditions...
              </p>
            </div>
          </div>
        )}

        {/* Reward Preview */}
        {mintingState !== 'calculating' && calculatedRewards.length > 0 && (
          <div className="space-y-4">
            {/* Total Rewards Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Coins Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalRewardValue()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Coin Types</p>
                  <p className="text-lg font-semibold text-purple-600">{calculatedRewards.length}</p>
                </div>
              </div>
            </div>

            {/* Individual Rewards */}
            <div className="space-y-3">
              {calculatedRewards.map((reward, index) => {
                const metadata = getCoinMetadata(reward.coinType);
                const isCurrentlyMinting = currentlyMinting === reward.coinType;
                const isCompleted = mintingState === 'complete' || 
                  (mintingState === 'minting' && mintProgress > (index / calculatedRewards.length) * 100);

                return (
                  <motion.div
                    key={reward.coinType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-3 p-4 rounded-lg border ${
                      isCurrentlyMinting 
                        ? 'bg-blue-50 border-blue-300' 
                        : isCompleted 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                        isCurrentlyMinting ? 'animate-pulse' : ''
                      }`}
                      style={{ backgroundColor: metadata.color }}
                    >
                      {getCoinIcon(reward.coinType)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{metadata.name}</p>
                          <p className="text-sm text-gray-600">{reward.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">+{reward.amount}</p>
                          <p className="text-xs text-gray-500">{metadata.symbol}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : isCurrentlyMinting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Minting Progress */}
            {mintingState === 'minting' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Minting Progress</span>
                  <span>{Math.round(mintProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${mintProgress}%` }}
                  ></div>
                </div>
                {currentlyMinting && (
                  <p className="text-xs text-blue-600 mt-1">
                    Currently minting {getCoinMetadata(currentlyMinting).name}...
                  </p>
                )}
              </div>
            )}

            {/* Completion Message */}
            {mintingState === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Coins Minted Successfully!</p>
                    <p className="text-green-700 text-sm">
                      Your coins are now available in your wallet and can be traded on Uniswap V4.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Rewards */}
        {mintingState !== 'calculating' && calculatedRewards.length === 0 && (
          <div className="text-center py-8">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No coin rewards this time</p>
            <p className="text-gray-500 text-sm">
              Keep making predictions to earn coins!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          {mintingState === 'complete' ? (
            <>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to coin wallet or trading interface
                  setShowPreview(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Coins</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowPreview(false)}
              disabled={mintingState === 'minting'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {mintingState === 'minting' ? 'Minting...' : 'Close'}
            </button>
          )}
        </div>

        {/* Trading Info */}
        {mintingState === 'complete' && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-purple-800 text-sm font-medium mb-1">
              💎 Trade Your Coins
            </p>
            <p className="text-purple-700 text-xs">
              Your coins are now tradeable on Uniswap V4 with automatic liquidity and optimal pricing.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
