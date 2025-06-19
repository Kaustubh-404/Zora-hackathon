import React, { useState } from 'react';
import { useAIPredictions } from '@/hooks/useAIPredictions';

export function AITopicTest() {
  const [fid, setFid] = useState('3');
  const { loading, predictions, error, userData, generatePredictions } = useAIPredictions();

  const handleGenerateTopics = async () => {
    await generatePredictions(parseInt(fid));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-sm">
          🔗 <strong>Real Data Pipeline:</strong> Farcaster → Interest Analysis → AI Topic Generation
        </p>
        <p className="text-green-700 text-xs mt-1">
          Using REAL user data from Neynar API + Groq AI
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">🤖 AI Prediction Topics from Real Farcaster Data</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Farcaster User FID:</label>
          <input
            type="number"
            value={fid}
            onChange={(e) => setFid(e.target.value)}
            className="border rounded-lg px-3 py-2 w-32"
            placeholder="Enter FID"
          />
          <p className="text-sm text-gray-500 mt-1">
            AI will analyze this user's REAL Farcaster activity and generate personalized topics
          </p>
        </div>

        <button
          onClick={handleGenerateTopics}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing Real Data + Generating...' : 'Generate from Real Farcaster Data'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {userData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">👤 Real User Data Source:</h3>
            <div className="flex items-center space-x-3">
              <img 
                src={userData.pfpUrl} 
                alt={userData.displayName}
                className="w-12 h-12 rounded-full"
              />
              <div className="text-sm">
                <p><strong>{userData.displayName}</strong> (@{userData.username})</p>
                <p className="text-blue-600">
                  {userData.followerCount?.toLocaleString()} followers • FID: {userData.fid}
                </p>
              </div>
            </div>
          </div>
        )}

        {predictions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">🎯 AI-Generated Topics Based on Real Activity:</h3>
            
            {predictions.map((prediction, index) => (
              <div key={prediction.id} className="bg-white rounded-lg border p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {prediction.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Personalized Topic {index + 1}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold mb-2 text-gray-900">
                  {prediction.question}
                </h4>
                
                <p className="text-gray-600 text-sm mb-3">
                  {prediction.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div>
                    <strong>Resolution:</strong> {prediction.resolutionCriteria}
                  </div>
                  <div>
                    <strong>End Time:</strong> {new Date(prediction.endTime).toLocaleDateString()}
                  </div>
                  {prediction.tags.length > 0 && (
                    <div>
                      <strong>Tags:</strong> {prediction.tags.join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>👍 Yes: {prediction.outcomes.yes}%</span>
                    <span>👎 No: {prediction.outcomes.no}%</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors">
                      Swipe YES
                    </button>
                    <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors">
                      Swipe NO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="space-y-1">
                <p className="font-medium">Processing real Farcaster data...</p>
                <p className="text-sm text-gray-500">
                  🔄 Fetching posts → 🧠 Analyzing interests → 🤖 Generating predictions → ✨ Personalizing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}