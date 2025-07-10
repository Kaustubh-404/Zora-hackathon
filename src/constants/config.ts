export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'ForesightCast',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  description: 'Social prediction marketplace powered by Farcaster and Zora',
  version: '1.0.0',
} as const;

export const API_CONFIG = {
  neynar: {
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY,
    baseUrl: 'https://api.neynar.com/v2',
  },
  groq: {
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  privy: {
    appId: import.meta.env.VITE_PRIVY_APP_ID,
  },
  zora: {
    apiKey: import.meta.env.VITE_ZORA_API_KEY,
    baseUrl: 'https://api.zora.co/v1',
    network: 'base',
    rpcUrl: 'https://sepolia.base.org',
  },
  uniswap: {
    v4PoolManager: import.meta.env.VITE_UNISWAP_V4_POOL_MANAGER || '0x...',
    routerAddress: import.meta.env.VITE_UNISWAP_V4_ROUTER || '0x...',
    factoryAddress: import.meta.env.VITE_UNISWAP_V4_FACTORY || '0x...',
    quoterAddress: import.meta.env.VITE_UNISWAP_V4_QUOTER || '0x...',
  },
} as const;

export const PREDICTION_CONFIG = {
  defaultDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  minimumBet: '0.000111', // ETH (Zora-style)
  maximumBet: '1.0', // ETH
  confidenceRange: [1, 100] as const,
} as const;

export const COIN_CONFIG = {
  // Coin creation settings
  initialSupply: BigInt(1000000), // 1M coins initial supply
  decimals: 18,
  
  // Trading settings
  defaultSlippage: 0.05, // 5%
  maxSlippage: 0.20, // 20%
  minTradeAmount: '0.001', // ETH
  maxTradeAmount: '10.0', // ETH
  
  // Reward multipliers
  multipliers: {
    streak: {
      3: 1.5,   // 1.5x for 3 streak
      5: 2.0,   // 2x for 5 streak
      10: 3.0,  // 3x for 10 streak
    },
    risk: {
      high: 2.0,   // 2x for <20% odds
      medium: 1.5, // 1.5x for 20-40% odds
      low: 1.0,    // 1x for >40% odds
    },
    category: {
      expert: 2.0, // 2x for category expertise
    },
  },
  
  // Staking rewards
  stakingApr: {
    accuracy: 12, // 12% APR for ACC staking
    streak: 15,   // 15% APR for STR staking
    oracle: 20,   // 20% APR for ORC staking
    risk: 25,     // 25% APR for RSK staking
  },
} as const;