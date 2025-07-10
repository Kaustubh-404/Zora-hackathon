import { useState } from 'react';

import { usePrivy } from '@privy-io/react-auth';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { AchievementSystem } from '@/components/achievements/AchievementSystem';
import { SocialShare } from '@/components/social/SocialShare';
import { AppPage } from '@/types/navigation';
import { 
  Trophy, 
  Coins, 
  Award, 
  TrendingUp, 
  Star,
  ExternalLink,

} from 'lucide-react';

interface RewardsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function RewardsPage({ onNavigate }: RewardsPageProps) {
  const { user } = usePrivy();
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'achievements'>('overview');
  
  // Mock user stats - in real app, fetch from blockchain
  const userStats = {
    totalEarned: 2.45,
    totalBets: 23,
    winRate: 65,
    currentStreak: 3,
    nftCount: 8,
    achievementCount: 5,
    rank: 156,
  };
  
  const recentWins = [
    {
      question: "Will Bitcoin reach $100k by end of year?",
      outcome: true,
      amount: 0.5,
      correct: true,
      marketId: 123,
    },
    {
      question: "Will Ethereum gas fees drop below 20 gwei?",
      outcome: false,
      amount: 0.25,
      correct: true,
      marketId: 124,
    },
  ];
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'nfts', label: 'NFT Collection', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Collect Your Rewards</h1>
            <p className="text-purple-100">
              Track your predictions, collect NFTs, and unlock achievements
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.totalEarned} ETH</div>
            <div className="text-purple-200">Total Earned</div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <Coins className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.totalBets}</div>
              <div className="text-sm text-gray-500">Total Bets</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.winRate}%</div>
              <div className="text-sm text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{userStats.nftCount}</div>
              <div className="text-sm text-gray-500">NFTs Earned</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">#{userStats.rank}</div>
              <div className="text-sm text-gray-500">Global Rank</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
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
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Wins */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Successful Predictions
                </h3>
                <div className="space-y-3">
                  {recentWins.map((win, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {win.question}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Predicted: {win.outcome ? 'YES' : 'NO'}</span>
                            <span>Won: {win.amount} ETH</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">Correct!</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Share Recent Win */}
              {recentWins.length > 0 && (
                <SocialShare 
                  prediction={recentWins[0]}
                  result={{ correct: true, winAmount: recentWins[0].amount }}
                />
              )}
              
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('home')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Make More Predictions</span>
                </button>
                
                <a
                  href={`https://sepolia.explorer.zora.energy/address/${user?.wallet?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>View on Explorer</span>
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'nfts' && (
            <NFTGallery userAddress={user?.wallet?.address as `0x${string}`} />
          )}
          
          {activeTab === 'achievements' && (
            <AchievementSystem />
          )}
        </div>
      </div>
    </div>
  );
}