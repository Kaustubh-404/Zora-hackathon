import { Chain } from 'viem';

export const ZORA_TESTNET = {
  id: 999999999,
  name: 'Zora Sepolia Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zora Sepolia Explorer',
      url: 'https://sepolia.explorer.zora.energy',
    },
  },
  testnet: true,
} as const satisfies Chain;

export const SUPPORTED_CHAINS = [ZORA_TESTNET];

// Keep our custom config type for other uses
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}