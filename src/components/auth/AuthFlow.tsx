import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthFlowProps {
  onComplete: (userData: any) => void;
  onSkip?: () => void;
}

export function AuthFlow({ onComplete, onSkip }: AuthFlowProps) {
  const { 
    login, 
    authenticated, 
    user, 
    linkFarcaster,
    connectWallet,
    ready
  } = usePrivy();

  const [step, setStep] = useState<'wallet' | 'farcaster' | 'complete'>('wallet');
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if user has Farcaster linked - Fixed property access
  const hasFarcaster = user?.farcaster?.fid;
  const hasWallet = user?.wallet?.address;

  useEffect(() => {
    if (authenticated && hasWallet) {
      if (hasFarcaster) {
        setStep('complete');
      } else {
        setStep('farcaster');
      }
    }
  }, [authenticated, hasWallet, hasFarcaster]);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      if (!authenticated) {
        await login();
      } else if (!hasWallet) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFarcasterConnect = async () => {
    setIsConnecting(true);
    try {
      await linkFarcaster();
    } catch (error) {
      console.error('Farcaster connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkipFarcaster = () => {
    setStep('complete');
  };

  const handleComplete = () => {
    const userData = {
      address: user?.wallet?.address,
      farcaster: user?.farcaster ? {
        fid: user.farcaster.fid,
        username: user.farcaster.username,
        displayName: user.farcaster.displayName,
        pfp: user.farcaster.pfp, // Fixed property name
      } : null,
      authenticated: true,
    };
    onComplete(userData);
  };

  // ... rest of component remains the same but with pfp instead of pfpUrl
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            hasWallet ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {hasWallet ? <CheckCircle className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
          </div>
          <div className={`w-12 h-1 ${hasWallet ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            hasFarcaster ? 'bg-green-500 text-white' : 
            step === 'farcaster' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            {hasFarcaster ? <CheckCircle className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div className={`w-12 h-1 ${step === 'complete' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Wallet Connection */}
        {step === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start making predictions and earning rewards on Zora Network.
            </p>
            <button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supports MetaMask, WalletConnect, and embedded wallets
            </p>
          </motion.div>
        )}

        {/* Step 2: Farcaster Connection (Optional) */}
        {step === 'farcaster' && (
          <motion.div
            key="farcaster"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Farcaster (Optional)
            </h2>
            <p className="text-gray-600 mb-6">
              Link your Farcaster account to get personalized prediction topics based on your interests and activity.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">Enhanced Experience</p>
                  <p className="text-xs text-blue-700">AI-generated topics based on your posts and interests</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleFarcasterConnect}
                disabled={isConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>Connect Farcaster</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSkipFarcaster}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Skip for Now
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              You can always connect Farcaster later in your profile settings
            </p>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to ForesightCast!
            </h2>
            <p className="text-gray-600 mb-6">
              {hasFarcaster 
                ? "Your wallet and Farcaster are connected. You're ready to start making personalized predictions!"
                : "Your wallet is connected. You can start making predictions right away!"
              }
            </p>

            {/* User Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wallet:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </span>
                </div>
                {hasFarcaster && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Farcaster:</span>
                      <span className="text-sm text-gray-900">@{user?.farcaster?.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">FID:</span>
                      <span className="text-sm text-gray-900">{user?.farcaster?.fid}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Enter ForesightCast</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}