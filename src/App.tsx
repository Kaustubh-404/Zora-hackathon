import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { SUPPORTED_CHAINS } from '@/constants/chains';
import { API_CONFIG } from '@/constants/config';
import { FarcasterTest } from '@/components/auth/FarcasterTest';
import { AITopicTest } from '@/components/ai/AITopicTest';
import { SwipeDemo } from '@/components/swipe/SwipeDemo';

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
  const [activeTab, setActiveTab] = useState<'farcaster' | 'ai' | 'swipe'>('swipe');

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
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-4xl font-bold text-gradient">
                  ForesightCast
                </h1>
                <p className="text-gray-600 text-lg">
                  Social prediction marketplace powered by Farcaster and Zora
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-8 max-w-lg mx-auto">
                <button
                  onClick={() => setActiveTab('swipe')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'swipe'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🎯 Swipe Demo
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🤖 AI Topics
                </button>
                <button
                  onClick={() => setActiveTab('farcaster')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'farcaster'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🔗 Farcaster Test
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'swipe' && <SwipeDemo />}
              {activeTab === 'ai' && <AITopicTest />}
              {activeTab === 'farcaster' && <FarcasterTest />}
            </main>
          </div>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;