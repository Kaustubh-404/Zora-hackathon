// src/constants/coins.ts
import { Address } from 'viem';

export const COIN_TYPES = {
  ACCURACY: 'ACC',
  STREAK: 'STR',
  ORACLE: 'ORC',
  COMMUNITY: 'COM',
  RISK: 'RSK',
  CRYPTO_MASTER: 'CRM',
  TECH_MASTER: 'TCM',
  SPORTS_MASTER: 'SPM'
} as const;

export const COIN_REWARDS = {
  CORRECT_PREDICTION: 10,
  STREAK_3: 50,
  STREAK_5: 150,
  STREAK_10: 500,
  FIRST_CORRECT: 25,
  HIGH_RISK_WIN: 100,
  EARLY_PREDICTION: 30,
  COMMUNITY_SHARE: 5,
  CATEGORY_EXPERTISE: 75
} as const;

export const COIN_METADATA = {
  [COIN_TYPES.ACCURACY]: {
    name: 'Accuracy Coin',
    symbol: 'ACC',
    description: 'Earned through correct predictions. Proof of forecasting skill.',
    image: 'https://foresightcast.app/images/coins/accuracy.png',
    category: 'Skill',
    color: '#10B981', // green
    rarity: 'common'
  },
  [COIN_TYPES.STREAK]: {
    name: 'Streak Coin',
    symbol: 'STR',
    description: 'Earned through consecutive correct predictions. Momentum rewards.',
    image: 'https://foresightcast.app/images/coins/streak.png',
    category: 'Momentum',
    color: '#F59E0B', // yellow
    rarity: 'rare'
  },
  [COIN_TYPES.ORACLE]: {
    name: 'Oracle Coin',
    symbol: 'ORC',
    description: 'Earned by being first to predict correctly. Information value.',
    image: 'https://foresightcast.app/images/coins/oracle.png',
    category: 'Information',
    color: '#8B5CF6', // purple
    rarity: 'epic'
  },
  [COIN_TYPES.COMMUNITY]: {
    name: 'Community Coin',
    symbol: 'COM',
    description: 'Earned through social engagement and community building.',
    image: 'https://foresightcast.app/images/coins/community.png',
    category: 'Social',
    color: '#3B82F6', // blue
    rarity: 'common'
  },
  [COIN_TYPES.RISK]: {
    name: 'Risk Coin',
    symbol: 'RSK',
    description: 'Earned through high-risk, high-reward predictions.',
    image: 'https://foresightcast.app/images/coins/risk.png',
    category: 'Risk',
    color: '#EF4444', // red
    rarity: 'legendary'
  },
  [COIN_TYPES.CRYPTO_MASTER]: {
    name: 'Crypto Master',
    symbol: 'CRM',
    description: 'Expertise in cryptocurrency predictions.',
    image: 'https://foresightcast.app/images/coins/crypto-master.png',
    category: 'Expertise',
    color: '#F97316', // orange
    rarity: 'epic'
  },
  [COIN_TYPES.TECH_MASTER]: {
    name: 'Tech Master',
    symbol: 'TCM',
    description: 'Expertise in technology predictions.',
    image: 'https://foresightcast.app/images/coins/tech-master.png',
    category: 'Expertise',
    color: '#06B6D4', // cyan
    rarity: 'epic'
  },
  [COIN_TYPES.SPORTS_MASTER]: {
    name: 'Sports Master',
    symbol: 'SPM',
    description: 'Expertise in sports predictions.',
    image: 'https://foresightcast.app/images/coins/sports-master.png',
    category: 'Expertise',
    color: '#84CC16', // lime
    rarity: 'epic'
  }
} as const;

export type CoinType = typeof COIN_TYPES[keyof typeof COIN_TYPES];

export interface CoinBalance {
  coinType: CoinType;
  balance: bigint;
  coinAddress: Address;
  symbol: string;
  name: string;
  decimals: number;
  priceUSD?: number;
}

export interface CoinEarning {
  id: string;
  coinType: CoinType;
  amount: bigint;
  reason: string;
  marketId?: number;
  timestamp: Date;
  transactionHash?: string;
}

export interface CoinReward {
  coinType: CoinType;
  amount: number;
  reason: string;
  multiplier?: number;
}

export interface TradingPreferences {
  slippageTolerance: number;
  autoApproval: boolean;
  minTradeAmount: number;
  maxTradeAmount: number;
  preferredCurrency: 'ETH' | 'USDC' | 'ZORA';
}

// Coin utility functions
export const getCoinMetadata = (coinType: CoinType) => {
  return COIN_METADATA[coinType];
};

export const getCoinColor = (coinType: CoinType) => {
  return COIN_METADATA[coinType].color;
};

export const getCoinRarity = (coinType: CoinType) => {
  return COIN_METADATA[coinType].rarity;
};

export const formatCoinAmount = (amount: bigint, decimals: number = 18) => {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return `${wholePart}.${trimmedFractional}`;
};

export const calculateCoinRewards = (
  predictionResult: {
    correct: boolean;
    marketCategory: string;
    odds: number;
    streak: number;
    isFirstCorrect: boolean;
    isEarlyPrediction: boolean;
  }
): CoinReward[] => {
  const rewards: CoinReward[] = [];
  
  if (!predictionResult.correct) return rewards;
  
  // Base accuracy reward
  rewards.push({
    coinType: COIN_TYPES.ACCURACY,
    amount: COIN_REWARDS.CORRECT_PREDICTION,
    reason: 'Correct prediction'
  });
  
  // Streak rewards
  if (predictionResult.streak >= 3) {
    const streakReward = predictionResult.streak >= 10 ? COIN_REWARDS.STREAK_10 :
                        predictionResult.streak >= 5 ? COIN_REWARDS.STREAK_5 :
                        COIN_REWARDS.STREAK_3;
    
    rewards.push({
      coinType: COIN_TYPES.STREAK,
      amount: streakReward,
      reason: `${predictionResult.streak} correct predictions in a row`
    });
  }
  
  // Oracle reward for early/first correct prediction
  if (predictionResult.isFirstCorrect) {
    rewards.push({
      coinType: COIN_TYPES.ORACLE,
      amount: COIN_REWARDS.FIRST_CORRECT,
      reason: 'First correct prediction on this market'
    });
  }
  
  if (predictionResult.isEarlyPrediction) {
    rewards.push({
      coinType: COIN_TYPES.ORACLE,
      amount: COIN_REWARDS.EARLY_PREDICTION,
      reason: 'Early prediction before market gained traction'
    });
  }
  
  // Risk reward for low-odds predictions
  if (predictionResult.odds < 20) {
    rewards.push({
      coinType: COIN_TYPES.RISK,
      amount: COIN_REWARDS.HIGH_RISK_WIN,
      reason: `High-risk prediction (${predictionResult.odds}% odds)`
    });
  }
  
  // Category expertise rewards
  const categoryMap: Record<string, CoinType> = {
    'crypto': COIN_TYPES.CRYPTO_MASTER,
    'tech': COIN_TYPES.TECH_MASTER,
    'sports': COIN_TYPES.SPORTS_MASTER
  };
  
  const categoryMaster = categoryMap[predictionResult.marketCategory.toLowerCase()];
  if (categoryMaster) {
    rewards.push({
      coinType: categoryMaster,
      amount: COIN_REWARDS.CATEGORY_EXPERTISE,
      reason: `${predictionResult.marketCategory} category expertise`
    });
  }
  
  return rewards;
};
