import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { ZORA_TESTNET } from '@/constants/chains';

export const wagmiConfig = createConfig({
  chains: [ZORA_TESTNET],
  transports: {
    [ZORA_TESTNET.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}