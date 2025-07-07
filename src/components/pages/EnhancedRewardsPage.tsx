import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { AchievementSystem } from '@/components/achievements/AchievementSystem';
import { MarketResolutionInterface } from '@/components/admin/MarketResolutionInterface';
import { AppPage } from '@/types/navigation';
import { 
  BarChart3, 
  Trophy, 
  Award, 
  Settings,
  Crown
} from 'lucide-react';

interface EnhancedRewardsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function EnhancedRewardsPage({ onNavigate }: EnhancedRewardsPageProps) {
  const { user } = usePrivy();
  const [activeTab, setActiveTab] = useState<'analytics' | 'nfts' | 'achievements' | 'admin'>('analytics');
  
  // Check if user is admin (in production, this would be checked properly)
  const isAdmin = user?.wallet?.address === '0x44e37A9a53EB19F26a2e73aF559C13048Aa4FaE9';

  const tabs = [
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Advanced Rewards Center</h1>
            <p className="text-purple-100">
              Deep analytics, NFT collection, achievements, and more
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center space-x-2 bg-yellow-500 bg-opacity-20 rounded-lg px-3 py-2">
              <Crown className="w-5 h-5 text-yellow-200" />
              <span className="text-yellow-200 font-medium">Admin Access</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
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
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          
          {activeTab === 'nfts' && (
            <NFTGallery userAddress={user?.wallet?.address as `0x${string}`} />
          )}
          
          {activeTab === 'achievements' && <AchievementSystem />}
          
          {activeTab === 'admin' && isAdmin && <MarketResolutionInterface />}
        </div>
      </div>
    </div>
  );
}