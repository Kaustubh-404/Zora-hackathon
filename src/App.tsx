import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { SUPPORTED_CHAINS } from '@/constants/chains';
import { API_CONFIG } from '@/constants/config';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <PrivyProvider
      appId={API_CONFIG.privy.appId}
      config={{
        loginMethods: ['email', 'wallet', 'farcaster'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: SUPPORTED_CHAINS,
        appearance: {
          theme: 'light',
          accentColor: '#3b82f6',
          logo: '/images/logo.png',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gradient">
                  ForesightCast
                </h1>
                <p className="text-gray-600 text-lg">
                  Social prediction marketplace powered by Farcaster and Zora
                </p>
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                  <p className="text-sm text-gray-500">
                    🚀 Development Environment Ready!
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Next: Setting up authentication and Farcaster integration
                  </p>
                </div>
              </div>
            </main>
          </div>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;