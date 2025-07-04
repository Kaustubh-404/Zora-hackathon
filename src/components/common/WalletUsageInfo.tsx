// src/components/common/WalletUsageInfo.tsx
import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { Wallet, Bot, User, Info } from 'lucide-react';

interface WalletUsageInfoProps {
  showDetails?: boolean;
  className?: string;
}

export function WalletUsageInfo({ showDetails = false, className = '' }: WalletUsageInfoProps) {
  const { user } = usePrivy();
  const { getWalletUsageInfo } = useAIPredictions();
  
  const walletInfo = getWalletUsageInfo();

  if (!showDetails) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <div className="text-sm text-blue-800">
            <span className="font-medium">Smart Payment:</span> AI markets use system wallet, manual markets use your wallet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Wallet className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Wallet Usage Summary</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* AI-Generated Markets */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2 mb-3">
            <Bot className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-gray-900">AI-Generated Markets</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium text-purple-600">System Wallet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Fees:</span>
              <span className="font-medium text-green-600">Free for you</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trigger:</span>
              <span className="text-gray-700">Farcaster FID input</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-700">
            <strong>Auto-funded:</strong> System pays all creation costs
          </div>
        </div>

        {/* Manual Markets */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">Manual Markets</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium text-blue-600">Your Wallet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Fees:</span>
              <span className="font-medium text-orange-600">You pay</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trigger:</span>
              <span className="text-gray-700">Create Market page</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <strong>Your control:</strong> {user?.wallet?.address?.slice(0, 8)}...
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
          <div className="text-sm text-green-800">
            <strong>Smart System:</strong> AI markets are subsidized to encourage personalized content, 
            while manual markets ensure user ownership and control.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper hook for showing wallet status in forms
export function useWalletStatus() {
  const { user } = usePrivy();
  
  const getPaymentSource = (marketType: 'ai' | 'manual') => {
    if (marketType === 'ai') {
      return {
        source: 'System Wallet',
        address: '0x44e37A9a53EB19F26a2e73aF559C13048Aa4FaE9',
        userPays: false,
        color: 'purple'
      };
    } else {
      return {
        source: 'Your Wallet',
        address: user?.wallet?.address,
        userPays: true,
        color: 'blue'
      };
    }
  };

  return { getPaymentSource };
}