
// src/components/pages/EnhancedRewardsPage.tsx - COMPLETE with Coin Integration
import  { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { AchievementSystem } from '@/components/achievements/AchievementSystem';
import { MarketResolutionInterface } from '@/components/admin/MarketResolutionInterface';
import { CoinWallet } from '@/components/coins/CoinWallet';
import { CoinTrading } from '@/components/coins/CoinTrading';
import { CoinStaking } from '@/components/coins/CoinStaking';
import { CoinLeaderboard } from '@/components/coins/CoinLeaderboard';
import { AppPage } from '@/types/navigation';
import { 
  BarChart3, 
  Trophy, 
  Award, 
  Settings,
  Crown,
  Coins,
  TrendingUp,
  Lock,
  Users
} from 'lucide-react';

interface EnhancedRewardsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function EnhancedRewardsPage({ }: EnhancedRewardsPageProps) {
  const { user } = usePrivy();
  const [activeTab, setActiveTab] = useState<'coins' | 'trading' | 'staking' | 'leaderboard' | 'analytics' | 'nfts' | 'achievements' | 'admin'>('coins');
  
  // Check if user is admin (in production, this would be checked properly)
  const isAdmin = user?.wallet?.address === '0x44e37A9a53EB19F26a2e73aF559C13048Aa4FaE9';

  const tabs = [
    { id: 'coins', label: 'Coin Wallet', icon: Coins, description: 'Your coin portfolio' },
    { id: 'trading', label: 'Coin Trading', icon: TrendingUp, description: 'Trade on Uniswap V4' },
    { id: 'staking', label: 'Coin Staking', icon: Lock, description: 'Stake for rewards' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown, description: 'Top coin holders' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance insights' },
    { id: 'nfts', label: 'NFT Collection', icon: Award, description: 'Your prediction NFTs' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Unlock rewards' },
    ...(isAdmin ? [{ 
      id: 'admin' as const, 
      label: 'Admin Panel', 
      icon: Settings, 
      description: 'Resolve markets' 
    }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Coin Ecosystem & Rewards</h1>
            <p className="text-purple-100">
              Complete coin ecosystem powered by Zora Coins SDK + Uniswap V4
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <div className="flex items-center space-x-2 bg-yellow-500 bg-opacity-20 rounded-lg px-3 py-2">
                  <Crown className="w-5 h-5 text-yellow-200" />
                  <span className="text-yellow-200 font-medium">Admin Access</span>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold">6</div>
                <div className="text-purple-200 text-sm">Coin Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">💰</div>
                <div className="text-purple-200 text-sm">Live Trading</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coin Ecosystem Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5" />
              <span className="font-medium">Zora Coins SDK</span>
            </div>
            <div className="text-sm text-purple-100">
              Mint tradeable coins for accurate predictions
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Uniswap V4</span>
            </div>
            <div className="text-sm text-purple-100">
              Trade coins with optimal pricing & liquidity
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">Creator Economy</span>
            </div>
            <div className="text-sm text-purple-100">
              Prediction accuracy becomes tradeable assets
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 font-normal">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'coins' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Coin Portfolio</h2>
                <p className="text-gray-600">
                  Manage your prediction coins earned through accurate forecasting
                </p>
              </div>
              <CoinWallet />
            </div>
          )}
          
          {activeTab === 'trading' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coin Trading</h2>
                <p className="text-gray-600">
                  Trade your prediction coins on Uniswap V4 with optimal pricing
                </p>
              </div>
              <CoinTrading />
            </div>
          )}
          
          {activeTab === 'staking' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coin Staking</h2>
                <p className="text-gray-600">
                  Stake your coins to earn passive rewards and support the ecosystem
                </p>
              </div>
              <CoinStaking />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coin Leaderboard</h2>
                <p className="text-gray-600">
                  See who's leading in prediction coin earnings across all categories
                </p>
              </div>
              <CoinLeaderboard />
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
          
          {activeTab === 'nfts' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">NFT Collection</h2>
                <p className="text-gray-600">
                  Your prediction NFTs representing successful forecasts
                </p>
              </div>
              <NFTGallery userAddress={user?.wallet?.address as `0x${string}`} />
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievements</h2>
                <p className="text-gray-600">
                  Unlock special rewards and recognition for your prediction accuracy
                </p>
              </div>
              <AchievementSystem />
            </div>
          )}
          
          {activeTab === 'admin' && isAdmin && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h2>
                <p className="text-gray-600">
                  Resolve pending markets and manage the prediction ecosystem
                </p>
              </div>
              <MarketResolutionInterface />
            </div>
          )}
        </div>
      </div>

      {/* Coin Ecosystem Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200 p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🪙 Complete Coin Ecosystem
          </h3>
          <p className="text-gray-600">
            Transform your prediction accuracy into a tradeable creator economy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Earn Coins</h4>
            <p className="text-sm text-gray-600">
              Make accurate predictions to mint specialized coins automatically
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Trade on Uniswap</h4>
            <p className="text-sm text-gray-600">
              Trade coins with optimal pricing using Uniswap V4 hooks
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Stake for Rewards</h4>
            <p className="text-sm text-gray-600">
              Lock coins to earn passive rewards and enhanced multipliers
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Build Reputation</h4>
            <p className="text-sm text-gray-600">
              Become a recognized oracle with tradeable expertise tokens
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                🚀 Powered by Cutting-Edge Tech
              </h4>
              <p className="text-sm text-gray-600">
                Zora Coins SDK + Uniswap V4 + Base Network for optimal performance
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Live Trading</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Auto Liquidity</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">MEV Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
