// src/constants/chains.ts - UPDATED with better RPC support
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
      // ✅ Multiple RPC endpoints for better reliability
      http: [
        'https://sepolia.rpc.zora.energy',
        'https://rpc.zora.energy/sepolia',
        'https://zora-sepolia.g.alchemy.com/v2/demo'
      ],
    },
    public: {
      http: [
        'https://sepolia.rpc.zora.energy',
        'https://rpc.zora.energy/sepolia'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zora Sepolia Explorer',
      url: 'https://sepolia.explorer.zora.energy',
    },
  },
  contracts: {
    // ✅ Add your deployed contract addresses here
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5882,
    },
  },
  testnet: true,
} as const satisfies Chain;

// ✅ Alternative configuration for local development
export const ZORA_LOCAL = {
  id: 999999999,
  name: 'Zora Local',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'], // For local testing
    },
  },
  blockExplorers: {
    default: {
      name: 'Local Explorer',
      url: 'http://localhost:4000',
    },
  },
  testnet: true,
} as const satisfies Chain;

// ✅ Ethereum Sepolia as fallback for testing
export const ETHEREUM_SEPOLIA = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.sepolia.org',
        'https://ethereum-sepolia.publicnode.com',
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sepolia Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
  testnet: true,
} as const satisfies Chain;

// ✅ Environment-based chain selection
export const getActiveChain = (): Chain => {
  // In development, you might want to use local or Ethereum Sepolia for testing
  if (import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_CHAIN === 'true') {
    return ZORA_LOCAL;
  }
  
  // For production testing, use Zora testnet
  return ZORA_TESTNET;
};

export const SUPPORTED_CHAINS = [ZORA_TESTNET, ETHEREUM_SEPOLIA];

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

// ✅ Network switching helper for wallets
export const NETWORK_CONFIGS = {
  ZORA_SEPOLIA: {
    chainId: '0x3B9ACA07', // 999999999 in hex
    chainName: 'Zora Sepolia Testnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.rpc.zora.energy'],
    blockExplorerUrls: ['https://sepolia.explorer.zora.energy'],
  },
  ETHEREUM_SEPOLIA: {
    chainId: '0xAA36A7', // 11155111 in hex
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};