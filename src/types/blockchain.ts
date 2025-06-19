import { Address } from 'viem';

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

export interface ContractAddresses {
  predictionFactory: Address;
  predictionMarket: Address;
  zoraNFT: Address;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  error?: string;
  gasUsed?: bigint;
}