// src/components/pages/EnhancedHomePage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '@/store/userStore';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { useAllMarkets } from '@/hooks/useAllMarkets';
import { SwipeInterface } from '@/components/swipe/SwipeInterface';
import { blockchainService } from '@/services/blockchain/service';
import { getUserAvatar, getUserDisplayName, hasLinkedFarcaster } from '@/utils/userHelpers';
import { AppPage } from '../../types/Navigation';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Filter,
  ChevronRight,
  AlertCircle,
  Zap,
  Target,
  Trophy,
  Clock,
  Hash,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface EnhancedHomePageProps {
  onNavigate: (page: AppPage) => void;
}

interface Bet {
  id: string;
  prediction: any;
  outcome: 'yes' | 'no';
  amount: number;
  timestamp: Date;
  onChain?: boolean;
  txHash?: string;
}

export function EnhancedHomePage({ onNavigate }: EnhancedHomePageProps) {
  const { user } = usePrivy();
  const { user: userProfile, getPrimaryInterests } = useUserStore();
  const { 
    loading: aiLoading, 
    predictions: aiPredictions, 
    error: aiError, 
    userData, 
    creatingOnChain,
    generatePredictions 
  } = useAIPredictions();
  const { 
    loading: marketsLoading, 
    markets: allMarkets, 
    error: marketsError, 
    fetchMarkets 
  } = useAllMarkets();
  
  const [bets, setBets] = useState<Bet[]>([]);
  const [skippedPredictions, setSkippedPredictions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('');
  
  // Manual Farcaster FID input state
  const [showManualFarcaster, setShowManualFarcaster] = useState(false);
  const [manualFid, setManualFid] = useState('');
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  const displayName = getUserDisplayName(user, userProfile);
  const userAvatar = getUserAvatar(user, userProfile);
  const hasFC = hasLinkedFarcaster(user, userProfile);

  // Determine which predictions to show - REAL DATA ONLY
  const predictions = hasFC ? aiPredictions : allMarkets;
  const loading = hasFC ? (aiLoading || creatingOnChain) : marketsLoading;
  const error = hasFC ? aiError : marketsError;

  // Load real blockchain data on mount
  useEffect(() => {
    if (hasFC && user?.farcaster?.fid && aiPredictions.length === 0 && !aiLoading) {
      handleGeneratePredictions();
    } else if (!hasFC && allMarkets.length === 0 && !marketsLoading) {
      fetchMarkets();
    }
  }, [user?.farcaster?.fid, hasFC]);

  const handleGeneratePredictions = async () => {
    if (!user?.farcaster?.fid) return;
    
    setIsGenerating(true);
    try {
      await generatePredictions(user.farcaster.fid);
    } catch (err) {
      console.error('Failed to generate predictions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualFarcasterConnect = async () => {
    if (!manualFid || isNaN(parseInt(manualFid))) {
      alert('Please enter a valid Farcaster FID number');
      return;
    }

    setIsLoadingManual(true);
    try {
      await generatePredictions(parseInt(manualFid));
      setShowManualFarcaster(false);
      setManualFid('');
    } catch (err) {
      console.error('Failed to generate predictions with manual FID:', err);
      alert('Failed to fetch predictions for this FID. Please check the FID and try again.');
    } finally {
      setIsLoadingManual(false);
    }
  };

  const handleSkip = (prediction: any) => {
    setSkippedPredictions(prev => [...prev, prediction]);
  };

  const handleBet = async (prediction: any, outcome: 'yes' | 'no', amount: number) => {
    try {
      console.log('🎯 Placing bet on blockchain...');
      
      if (!user?.wallet?.address) {
        alert('Please connect your wallet to place bets');
        return;
      }

      // Place bet on blockchain
      const result = await blockchainService.placeBet(
        user.wallet.address as `0x${string}`,
        prediction.marketId || 0, // Use marketId from blockchain
        outcome === 'yes',
        amount.toString()
      );

      if (result.success) {
        const newBet: Bet = {
          id: `bet_${Date.now()}`,
          prediction,
          outcome,
          amount,
          timestamp: new Date(),
          onChain: true,
          txHash: result.txHash,
        };
        
        setBets(prev => [...prev, newBet]);
        console.log('✅ Bet placed successfully on blockchain!', result.txHash);
        
        // Show success message
        alert(`Bet placed successfully! Transaction: ${result.txHash?.slice(0, 10)}...`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error placing bet:', error);
      alert(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleNeedMore = () => {
    if (hasFC) {
      handleGeneratePredictions();
    } else {
      fetchMarkets();
    }
  };

  const handleRefresh = () => {
    if (hasFC) {
      handleGeneratePredictions();
    } else {
      fetchMarkets();
    }
  };

  const primaryInterests = getPrimaryInterests();
  const totalPredictionsSeen = bets.length + skippedPredictions.length;
  const engagementRate = totalPredictionsSeen > 0 ? (bets.length / totalPredictionsSeen) * 100 : 0;
  const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with User Greeting */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={userAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {hasFC 
                  ? "Here are predictions personalized for you based on your Farcaster activity."
                  : "Browse all prediction markets on the blockchain and start making predictions!"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isGenerating || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${(isGenerating || loading) ? 'animate-spin' : ''}`} />
              <span>{hasFC ? 'Refresh Predictions' : 'Refresh Markets'}</span>
            </button>
          </div>
        </div>

        {/* Blockchain Status Indicator */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-gray-900">
                  ⛓️ Connected to Zora Network
                </h3>
                <p className="text-sm text-gray-600">
                  All markets are live on blockchain • Real money • Real predictions
                </p>
              </div>
            </div>
            
            {creatingOnChain && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Creating markets on-chain...</span>
              </div>
            )}
          </div>
        </div>

        {/* Farcaster Status & Manual Connection */}
        <div className="bg-white rounded-lg p-4 border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">
                  {hasFC ? 'Farcaster Connected' : 'Get Personalized Predictions'}
                </h3>
                <p className="text-sm text-gray-600">
                  {hasFC 
                    ? `Getting personalized predictions from @${user?.farcaster?.username || 'your'} activity`
                    : 'Enter your Farcaster ID to get AI-generated predictions based on your interests'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasFC ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">FID: {user?.farcaster?.fid}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowManualFarcaster(!showManualFarcaster)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Hash className="w-4 h-4" />
                    <span>Enter FID</span>
                  </button>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Farcaster FID Input */}
          {showManualFarcaster && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your Farcaster FID to get personalized predictions:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={manualFid}
                      onChange={(e) => setManualFid(e.target.value)}
                      placeholder="e.g., 3 (Dan Romero)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleManualFarcasterConnect}
                      disabled={isLoadingManual || !manualFid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoadingManual ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>{isLoadingManual ? 'Loading...' : 'Generate'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Find your FID at{' '}
                    <a 
                      href="https://warpcast.com/~/settings" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Warpcast Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Stats & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {hasFC ? 'Your Interests' : 'Market Categories'}
              </h3>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {hasFC ? 'Edit' : 'Set Preferences'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasFC ? (
                primaryInterests.length > 0 ? (
                  primaryInterests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No interests set</span>
                )
              ) : (
                ['crypto', 'tech', 'sports', 'politics', 'general'].map((category) => (
                  <span
                    key={category}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{category}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold text-gray-900 mb-3">Session Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Predictions seen:</span>
                <span className="font-medium">{totalPredictionsSeen}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bets placed:</span>
                <span className="font-medium">{bets.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total wagered:</span>
                <span className="font-medium">{totalWagered.toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold text-gray-900 mb-3">Blockchain Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Markets:</span>
                <span className="font-medium">{allMarkets.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">On-chain Bets:</span>
                <span className="font-medium">{bets.filter(b => b.onChain).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium text-purple-600">Zora</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Swipe Interface - Main Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {hasFC ? '🎯 AI-Generated Markets' : '📊 All Blockchain Markets'}
                </h2>
                {userData && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <img 
                      src={userData.pfpUrl || userAvatar} 
                      alt={userData.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>Based on @{userData.username}'s activity</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                {hasFC 
                  ? "AI-generated markets created automatically on Zora blockchain based on your interests."
                  : "Real prediction markets from the Zora blockchain. Connect Farcaster for personalized recommendations."
                }
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">
                        Error Loading {hasFC ? 'Predictions' : 'Markets'}
                      </h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loading || isGenerating || isLoadingManual ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 font-medium">
                      {creatingOnChain ? 'Creating markets on blockchain...' :
                       isLoadingManual ? 'Generating personalized predictions...' : 
                       isGenerating ? 'Generating personalized predictions...' : 
                       hasFC ? 'Loading predictions...' :
                       'Loading blockchain markets...'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {creatingOnChain ? 'Deploying smart contracts on Zora Network' :
                       hasFC || isLoadingManual
                        ? 'Analyzing Farcaster activity with AI'
                        : 'Fetching real markets from blockchain'
                      }
                    </p>
                  </div>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasFC ? 'No Predictions Generated' : 'No Markets Available'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {hasFC 
                      ? "Generate your first set of personalized predictions to get started."
                      : "No prediction markets are currently available on the blockchain."
                    }
                  </p>
                  {hasFC && (
                    <button
                      onClick={handleGeneratePredictions}
                      disabled={!user?.farcaster?.fid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Generate Predictions
                    </button>
                  )}
                </div>
              ) : (
                <SwipeInterface
                  predictions={predictions}
                  onSkip={handleSkip}
                  onBet={handleBet}
                  onNeedMore={handleNeedMore}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Stats and Activity */}
        <div className="space-y-6">
          {/* Recent Bets */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">💰 Your Blockchain Bets ({bets.length})</h3>
            </div>
            <div className="p-6">
              {bets.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No bets placed yet</p>
                  <p className="text-gray-400 text-xs">Start swiping to make predictions!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bets.slice().reverse().map((bet) => (
                    <div key={bet.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            bet.outcome === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {bet.outcome.toUpperCase()}
                          </span>
                          {bet.onChain && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              ⛓️ ON-CHAIN
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{bet.amount} ETH</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 text-gray-900">
                        {bet.prediction.question}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {bet.timestamp.toLocaleTimeString()}
                        </p>
                        {bet.txHash && (
                          <a
                            href={`https://sepolia.explorer.zora.energy/tx/${bet.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>View TX</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">⚡ Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('markets')}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-blue-900">Browse All Markets</div>
                    <div className="text-sm text-blue-700">View {allMarkets.length} live markets</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </button>
                
                <button
                  onClick={() => onNavigate('create')}
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-green-900">Create Market</div>
                    <div className="text-sm text-green-700">Deploy new prediction market</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-600" />
                </button>
                
                <button
                  onClick={() => onNavigate('rewards')}
                  className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-purple-900">Collect Rewards</div>
                    <div className="text-sm text-purple-700">Claim your winnings</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Zora Network</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Live Markets:</span> All predictions are real smart contracts on Zora blockchain.
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Real Money:</span> Place bets with ETH and win real rewards.
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">NFT Collectibles:</span> Successful predictions become collectible NFTs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}