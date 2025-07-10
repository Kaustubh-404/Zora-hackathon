import  { useState } from 'react';
import { SwipeInterface } from './SwipeInterface';
import { useAIPredictions } from '@/hooks/useAIPredictions';

interface Bet {
  id: string;
  prediction: any;
  outcome: 'yes' | 'no';
  amount: number;
  timestamp: Date;
}

export function SwipeDemo() {
  const [fid, setFid] = useState('3');
  const [bets, setBets] = useState<Bet[]>([]);
  const [skippedPredictions, setSkippedPredictions] = useState<any[]>([]);
  const { loading, predictions, userData, generatePredictions } = useAIPredictions();

  const handleGeneratePredictions = async () => {
    await generatePredictions(parseInt(fid));
  };

  const handleSkip = (prediction: any) => {
    setSkippedPredictions(prev => [...prev, prediction]);
    console.log('⏭️ Skipped prediction:', prediction.question);
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
    console.log('💰 Placed bet:', { outcome, amount, question: prediction.question });
  };

  const handleNeedMore = () => {
    // In a real app, this would generate more predictions
    // For now, we'll just regenerate
    handleGeneratePredictions();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Swipe Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">🎯 Swipe to Predict</h2>
            
            {/* User Info */}
            {userData && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <img 
                    src={userData.pfpUrl} 
                    alt={userData.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{userData.displayName}</p>
                    <p className="text-sm text-blue-600">
                      Personalized predictions based on your Farcaster activity
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate/Load Interface */}
            {predictions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Generate predictions for FID:</label>
                  <input
                    type="number"
                    value={fid}
                    onChange={(e) => setFid(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-32 mr-4"
                    placeholder="Enter FID"
                  />
                  <button
                    onClick={handleGeneratePredictions}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Predictions'}
                  </button>
                </div>
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

        {/* Side Panel - Bets & Stats */}
        <div className="space-y-6">
          {/* Your Bets */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-bold mb-4">💰 Your Bets ({bets.length})</h3>
            {bets.length === 0 ? (
              <p className="text-gray-500 text-sm">No bets placed yet</p>
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
                    <p className="text-sm font-medium line-clamp-2">{bet.prediction.question}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {bet.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-bold mb-4">📊 Session Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Predictions seen:</span>
                <span className="font-medium">{bets.length + skippedPredictions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bets placed:</span>
                <span className="font-medium">{bets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Skipped:</span>
                <span className="font-medium">{skippedPredictions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total wagered:</span>
                <span className="font-medium">
                  {bets.reduce((sum, bet) => sum + bet.amount, 0).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engagement rate:</span>
                <span className="font-medium">
                  {bets.length + skippedPredictions.length > 0 
                    ? `${Math.round((bets.length / (bets.length + skippedPredictions.length)) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {(bets.length > 0 || skippedPredictions.length > 0) && (
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="font-bold mb-4">🕒 Recent Activity</h3>
              <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                {[
                  ...bets.map(bet => ({
                    type: 'bet',
                    text: `Bet ${bet.outcome.toUpperCase()} on "${bet.prediction.question.substring(0, 40)}..."`,
                    time: bet.timestamp
                  })),
                  ...skippedPredictions.map(pred => ({
                    type: 'skip',
                    text: `Skipped "${pred.question.substring(0, 40)}..."`,
                    time: new Date()
                  }))
                ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={activity.type === 'bet' ? '💰' : '⏭️'}></span>
                    <span className="text-gray-600 flex-1">{activity.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}