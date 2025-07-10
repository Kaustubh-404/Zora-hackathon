// File: src/components/demo/ManualFarcasterDemo.tsx

import { useState } from 'react';

import { useAIPredictions } from '@/hooks/useAIPredictions';
import { SwipeInterface } from '@/components/swipe/SwipeInterface';
import { Hash, ExternalLink, Zap, User, TrendingUp } from 'lucide-react';

interface Bet {
  id: string;
  prediction: any;
  outcome: 'yes' | 'no';
  amount: number;
  timestamp: Date;
}

export function ManualFarcasterDemo() {
  const [manualFid, setManualFid] = useState('');
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [skippedPredictions, setSkippedPredictions] = useState<any[]>([]);
  
  const { loading, predictions, error, userData, generatePredictions } = useAIPredictions();

  const handleManualFarcasterConnect = async () => {
    if (!manualFid || isNaN(parseInt(manualFid))) {
      alert('Please enter a valid Farcaster FID number');
      return;
    }

    setIsLoadingManual(true);
    try {
      await generatePredictions(parseInt(manualFid));
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

  const handleBet = (prediction: any, outcome: 'yes' | 'no', amount: number) => {
    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      prediction,
      outcome,
      amount,
      timestamp: new Date(),
    };
    
    setBets(prev => [...prev, newBet]);
  };

  const handleNeedMore = () => {
    if (manualFid) {
      handleManualFarcasterConnect();
    }
  };

  const totalPredictionsSeen = bets.length + skippedPredictions.length;
  const engagementRate = totalPredictionsSeen > 0 ? (bets.length / totalPredictionsSeen) * 100 : 0;
  const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 ForesightCast Manual Demo
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter any Farcaster FID to generate personalized prediction markets based on that user's activity.
        </p>
      </div>

      {/* Manual FID Input */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Hash className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Connect with Farcaster FID</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Farcaster FID:
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={manualFid}
                onChange={(e) => setManualFid(e.target.value)}
                placeholder="e.g., 3 (Dan Romero)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleManualFarcasterConnect}
                disabled={isLoadingManual || !manualFid}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoadingManual ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isLoadingManual ? 'Loading...' : 'Get Predictions'}</span>
              </button>
            </div>
            
            {/* Popular FIDs */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Try these popular FIDs:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { fid: '3', name: 'Dan Romero' },
                  { fid: '2', name: 'Varun' },
                  { fid: '1', name: 'Farcaster' },
                  { fid: '5650', name: 'Vitalik' },
                  { fid: '239', name: 'Linda Xie' }
                ].map((user) => (
                  <button
                    key={user.fid}
                    onClick={() => setManualFid(user.fid)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {user.name} ({user.fid})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter any valid Farcaster FID</li>
              <li>• AI analyzes their posts & interests</li>
              <li>• Get personalized prediction topics</li>
              <li>• Swipe through tailored markets</li>
            </ul>
            <a 
              href="https://warpcast.com/~/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:underline text-xs mt-2"
            >
              <span>Find your FID at Warpcast</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Swipe Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                🎯 Personalized Predictions
              </h2>
              
              {/* User Info */}
              {userData && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={userData.pfpUrl} 
                      alt={userData.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-blue-900">{userData.displayName}</p>
                      <p className="text-sm text-blue-700">@{userData.username} • FID: {userData.fid}</p>
                      <p className="text-xs text-blue-600">
                        {userData.followerCount?.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-600">
                {userData 
                  ? `Predictions generated from @${userData.username}'s Farcaster activity`
                  : "Enter a Farcaster FID above to generate personalized predictions"
                }
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={handleManualFarcasterConnect}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loading || isLoadingManual ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Generating personalized predictions...
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Analyzing Farcaster activity with AI
                    </p>
                  </div>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Predictions</h3>
                  <p className="text-gray-600 mb-6">
                    Enter a Farcaster FID above to generate personalized prediction markets.
                  </p>
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
          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">📊 Session Stats</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Predictions seen:</span>
                  <span className="font-semibold text-gray-900">{totalPredictionsSeen}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bets placed:</span>
                  <span className="font-semibold text-gray-900">{bets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement rate:</span>
                  <span className="font-semibold text-gray-900">{engagementRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total wagered:</span>
                  <span className="font-semibold text-gray-900">{totalWagered.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bets */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">💰 Your Bets ({bets.length})</h3>
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
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          bet.outcome === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bet.outcome.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{bet.amount} ETH</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 text-gray-900">
                        {bet.prediction.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bet.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Demo Tips</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Try different FIDs:</span> Each user has unique interests that generate different prediction topics.
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Swipe gestures:</span> Right for betting, left for skipping. Or use the buttons below the cards.
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Real data:</span> All predictions are generated from actual Farcaster user activity using AI.
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