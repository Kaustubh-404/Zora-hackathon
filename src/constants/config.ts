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
} as const;

export const PREDICTION_CONFIG = {
  defaultDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  minimumBet: '0.000111', // ETH (Zora-style)
  maximumBet: '1.0', // ETH
  confidenceRange: [1, 100] as const,
} as const;