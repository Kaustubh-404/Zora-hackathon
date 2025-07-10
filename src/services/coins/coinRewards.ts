// src/services/coins/coinRewards.ts
import { Address } from 'viem';
import { coinsService } from './coinsService';
import { 
  CoinType, 
  CoinReward, 
  CoinEarning,
  calculateCoinRewards,
  COIN_TYPES,
  COIN_REWARDS 
} from '@/constants/coins';

export interface PredictionResult {
  marketId: number;
  userAddress: Address;
  correct: boolean;
  marketCategory: string;
  odds: number;
  streak: number;
  isFirstCorrect: boolean;
  isEarlyPrediction: boolean;
  betAmount: number;
  winAmount?: number;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  coinType: CoinType;
  rewardAmount: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  total: number;
}

class CoinRewardsService {
  private userStreaks = new Map<Address, number>();
  private userAchievements = new Map<Address, Achievement[]>();
  private userEarnings = new Map<Address, CoinEarning[]>();

  // Process prediction result and distribute coin rewards
  async processPredictionResult(
    result: PredictionResult,
    walletClient: any
  ): Promise<{ success: boolean; rewards: CoinEarning[]; achievements: Achievement[] }> {
    try {
      console.log('🎯 Processing prediction result for coin rewards...');
      
      if (!result.correct) {
        console.log('❌ Prediction was incorrect, no coin rewards');
        this.resetUserStreak(result.userAddress);
        return { success: true, rewards: [], achievements: [] };
      }

      // Calculate rewards based on prediction performance
      const rewards = calculateCoinRewards({
        correct: result.correct,
        marketCategory: result.marketCategory,
        odds: result.odds,
        streak: result.streak,
        isFirstCorrect: result.isFirstCorrect,
        isEarlyPrediction: result.isEarlyPrediction,
      });

      console.log(`🪙 Calculated ${rewards.length} coin rewards:`, rewards);

      // Distribute rewards
      const earnings: CoinEarning[] = [];
      const newAchievements: Achievement[] = [];

      for (const reward of rewards) {
        try {
          // Mint reward coins
          const mintResult = await coinsService.mintRewardCoins(
            result.userAddress,
            reward.coinType,
            reward.amount,
            walletClient
          );

          if (mintResult.success) {
            const earning: CoinEarning = {
              id: `${result.marketId}_${reward.coinType}_${Date.now()}`,
              coinType: reward.coinType,
              amount: BigInt(reward.amount),
              reason: reward.reason,
              marketId: result.marketId,
              timestamp: new Date(),
              transactionHash: mintResult.transactionHash,
            };

            earnings.push(earning);
            this.addUserEarning(result.userAddress, earning);
            
            console.log(`✅ Minted ${reward.amount} ${reward.coinType} coins for ${reward.reason}`);
          } else {
            console.warn(`❌ Failed to mint ${reward.coinType} coins:`, mintResult.error);
          }
        } catch (error) {
          console.error(`❌ Error minting ${reward.coinType} coins:`, error);
        }
      }

      // Update user streak
      this.updateUserStreak(result.userAddress, result.correct);

      // Check for new achievements
      const achievements = await this.checkAchievements(result.userAddress);
      
      console.log(`🎉 Distributed ${earnings.length} coin rewards, unlocked ${achievements.length} achievements`);
      
      return { 
        success: true, 
        rewards: earnings, 
        achievements: achievements.filter(a => a.unlocked && !a.unlockedAt) 
      };
      
    } catch (error) {
      console.error('❌ Error processing prediction result:', error);
      return { success: false, rewards: [], achievements: [] };
    }
  }

  // Check and unlock achievements
  async checkAchievements(userAddress: Address): Promise<Achievement[]> {
    try {
      const userEarnings = this.getUserEarnings(userAddress);
      const currentAchievements = this.getUserAchievements(userAddress);
      const streak = this.getUserStreak(userAddress);
      
      // Define achievements
      const achievementDefinitions = [
        {
          id: 'first_accuracy_coin',
          title: 'First Step to Accuracy',
          description: 'Earn your first Accuracy coin',
          coinType: COIN_TYPES.ACCURACY,
          rewardAmount: 50,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.ACCURACY).length >= 1,
          total: 1,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.ACCURACY).length,
        },
        {
          id: 'streak_master',
          title: 'Streak Master',
          description: 'Maintain a 10-prediction winning streak',
          coinType: COIN_TYPES.STREAK,
          rewardAmount: 1000,
          condition: () => streak >= 10,
          total: 10,
          progress: () => streak,
        },
        {
          id: 'oracle_initiate',
          title: 'Oracle Initiate',
          description: 'Earn 5 Oracle coins',
          coinType: COIN_TYPES.ORACLE,
          rewardAmount: 200,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.ORACLE).length >= 5,
          total: 5,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.ORACLE).length,
        },
        {
          id: 'community_builder',
          title: 'Community Builder',
          description: 'Earn 100 Community coins',
          coinType: COIN_TYPES.COMMUNITY,
          rewardAmount: 500,
          condition: () => {
            const total = userEarnings
              .filter(e => e.coinType === COIN_TYPES.COMMUNITY)
              .reduce((sum, e) => sum + Number(e.amount), 0);
            return total >= 100;
          },
          total: 100,
          progress: () => userEarnings
            .filter(e => e.coinType === COIN_TYPES.COMMUNITY)
            .reduce((sum, e) => sum + Number(e.amount), 0),
        },
        {
          id: 'risk_taker',
          title: 'Risk Taker',
          description: 'Earn 3 Risk coins',
          coinType: COIN_TYPES.RISK,
          rewardAmount: 300,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.RISK).length >= 3,
          total: 3,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.RISK).length,
        },
        {
          id: 'crypto_expert',
          title: 'Crypto Expert',
          description: 'Earn 10 Crypto Master coins',
          coinType: COIN_TYPES.CRYPTO_MASTER,
          rewardAmount: 750,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.CRYPTO_MASTER).length >= 10,
          total: 10,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.CRYPTO_MASTER).length,
        },
        {
          id: 'tech_guru',
          title: 'Tech Guru',
          description: 'Earn 10 Tech Master coins',
          coinType: COIN_TYPES.TECH_MASTER,
          rewardAmount: 750,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.TECH_MASTER).length >= 10,
          total: 10,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.TECH_MASTER).length,
        },
        {
          id: 'sports_analyst',
          title: 'Sports Analyst',
          description: 'Earn 10 Sports Master coins',
          coinType: COIN_TYPES.SPORTS_MASTER,
          rewardAmount: 750,
          condition: () => userEarnings.filter(e => e.coinType === COIN_TYPES.SPORTS_MASTER).length >= 10,
          total: 10,
          progress: () => userEarnings.filter(e => e.coinType === COIN_TYPES.SPORTS_MASTER).length,
        },
      ];

      const achievements: Achievement[] = [];
      
      for (const def of achievementDefinitions) {
        const existing = currentAchievements.find(a => a.id === def.id);
        const progress = def.progress();
        const unlocked = def.condition();
        
        if (existing) {
          // Update existing achievement
          existing.progress = progress;
          if (!existing.unlocked && unlocked) {
            existing.unlocked = true;
            existing.unlockedAt = new Date();
            achievements.push(existing);
            
            console.log(`🏆 Achievement unlocked: ${existing.title}`);
          }
        } else {
          // Create new achievement
          const achievement: Achievement = {
            id: def.id,
            title: def.title,
            description: def.description,
            coinType: def.coinType,
            rewardAmount: def.rewardAmount,
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            total: def.total,
          };
          
          achievements.push(achievement);
          
          if (unlocked) {
            console.log(`🏆 Achievement unlocked: ${achievement.title}`);
          }
        }
      }

      // Update user achievements
      this.setUserAchievements(userAddress, achievements);
      
      return achievements;
      
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
      return [];
    }
  }

  // Get user's total coin earnings
  getUserEarnings(userAddress: Address): CoinEarning[] {
    return this.userEarnings.get(userAddress) || [];
  }

  // Get user's achievements
  getUserAchievements(userAddress: Address): Achievement[] {
    return this.userAchievements.get(userAddress) || [];
  }

  // Get user's current streak
  getUserStreak(userAddress: Address): number {
    return this.userStreaks.get(userAddress) || 0;
  }

  // Get user's coin earning statistics
  getUserCoinStats(userAddress: Address) {
    const earnings = this.getUserEarnings(userAddress);
    const achievements = this.getUserAchievements(userAddress);
    
    const stats = {
      totalEarnings: earnings.length,
      totalCoins: earnings.reduce((sum, e) => sum + Number(e.amount), 0),
      achievementsUnlocked: achievements.filter(a => a.unlocked).length,
      currentStreak: this.getUserStreak(userAddress),
      coinBreakdown: {} as Record<CoinType, { count: number; total: number }>,
    };

    // Calculate coin breakdown
    Object.values(COIN_TYPES).forEach(coinType => {
      const coinEarnings = earnings.filter(e => e.coinType === coinType);
      stats.coinBreakdown[coinType] = {
        count: coinEarnings.length,
        total: coinEarnings.reduce((sum, e) => sum + Number(e.amount), 0),
      };
    });

    return stats;
  }

  // Helper methods
  private addUserEarning(userAddress: Address, earning: CoinEarning) {
    const userEarnings = this.userEarnings.get(userAddress) || [];
    userEarnings.push(earning);
    this.userEarnings.set(userAddress, userEarnings);
  }

  private updateUserStreak(userAddress: Address, correct: boolean) {
    const currentStreak = this.getUserStreak(userAddress);
    if (correct) {
      this.userStreaks.set(userAddress, currentStreak + 1);
    } else {
      this.userStreaks.set(userAddress, 0);
    }
  }

  private resetUserStreak(userAddress: Address) {
    this.userStreaks.set(userAddress, 0);
  }

  private setUserAchievements(userAddress: Address, achievements: Achievement[]) {
    this.userAchievements.set(userAddress, achievements);
  }

  // Calculate reward multipliers based on user's coin holdings
  async calculateRewardMultipliers(userAddress: Address): Promise<Record<CoinType, number>> {
    try {
      const balances = await coinsService.getUserCoinBalances(userAddress);
      const multipliers: Record<CoinType, number> = {} as any;
      
      // Base multiplier is 1.0
      Object.values(COIN_TYPES).forEach(coinType => {
        multipliers[coinType] = 1.0;
      });

      // Calculate multipliers based on coin holdings
      for (const balance of balances) {
        const coinAmount = Number(balance.balance) / 10**18; // Convert from wei
        
        // Multiplier increases with coin holdings
        if (coinAmount >= 1000) {
          multipliers[balance.coinType] = 2.0; // 2x multiplier
        } else if (coinAmount >= 500) {
          multipliers[balance.coinType] = 1.5; // 1.5x multiplier
        } else if (coinAmount >= 100) {
          multipliers[balance.coinType] = 1.25; // 1.25x multiplier
        }
      }

      return multipliers;
      
    } catch (error) {
      console.error('❌ Error calculating reward multipliers:', error);
      // Return base multipliers on error
      const baseMultipliers: Record<CoinType, number> = {} as any;
      Object.values(COIN_TYPES).forEach(coinType => {
        baseMultipliers[coinType] = 1.0;
      });
      return baseMultipliers;
    }
  }

  // Get leaderboard for a specific coin type
  getLeaderboard(coinType: CoinType, limit: number = 10) {
    const leaderboard: { address: Address; total: number; earnings: number }[] = [];
    
    for (const [address, earnings] of this.userEarnings.entries()) {
      const coinEarnings = earnings.filter(e => e.coinType === coinType);
      if (coinEarnings.length > 0) {
        leaderboard.push({
          address,
          total: coinEarnings.reduce((sum, e) => sum + Number(e.amount), 0),
          earnings: coinEarnings.length,
        });
      }
    }

    return leaderboard
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  // Clear user data (for testing/development)
  clearUserData(userAddress: Address) {
    this.userEarnings.delete(userAddress);
    this.userAchievements.delete(userAddress);
    this.userStreaks.delete(userAddress);
  }
}

export const coinRewardsService = new CoinRewardsService();
