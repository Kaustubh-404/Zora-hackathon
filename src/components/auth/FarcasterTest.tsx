import  { useState } from 'react';
import { farcasterService } from '@/services/farcaster/client';
import { interestExtractor } from '@/services/farcaster/interests';

export function FarcasterTest() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [interests, setInterests] = useState<any>(null);
  const [fid, setFid] = useState('3'); // Dan Romero's FID as default
  const [error, setError] = useState<string | null>(null);

  const testFarcasterIntegration = async () => {
    setLoading(true);
    setError(null);
    setUserData(null);
    setInterests(null);

    try {
      console.log('🔄 Testing REAL Farcaster integration...');
      
      // Test user data fetch
      console.log('📡 Fetching user data from Neynar...');
      const user = await farcasterService.getUserByFid(parseInt(fid));
      setUserData(user);
      console.log('✅ User data:', user);
      
      // Test interest extraction
      console.log('🧠 Analyzing user interests...');
      const userInterests = await interestExtractor.analyzeUserInterests(parseInt(fid));
      setInterests(userInterests);
      console.log('✅ User interests:', userInterests);
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-sm">
          🔗 <strong>Real Neynar Integration:</strong> Fetching live data from Farcaster via Neynar API
        </p>
        <p className="text-green-700 text-xs mt-1">
          Make sure the API server is running: <code>pnpm server</code>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">🔗 Real Farcaster Integration Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Farcaster FID:</label>
          <input
            type="number"
            value={fid}
            onChange={(e) => setFid(e.target.value)}
            className="border rounded-lg px-3 py-2 w-32"
            placeholder="Enter FID"
          />
          <p className="text-sm text-gray-500 mt-1">
            Try: 3 (Dan Romero), 2 (Varun), 1 (Farcaster), or any valid FID
          </p>
        </div>

        <button
          onClick={testFarcasterIntegration}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching Real Data...' : 'Test Real Farcaster Integration'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Make sure the API server is running: <code>pnpm server</code>
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="space-y-1">
                <p className="font-medium">Fetching real Farcaster data...</p>
                <p className="text-sm text-blue-600">
                  📡 Connecting to Neynar → 🔍 Analyzing casts → 🧠 Extracting interests
                </p>
              </div>
            </div>
          </div>
        )}

        {userData && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-2">👤 Real User Data from Farcaster:</h3>
            <div className="flex items-start space-x-4">
              {userData.pfpUrl && (
                <img 
                  src={userData.pfpUrl} 
                  alt={userData.displayName}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="space-y-1 text-sm flex-1">
                <p><strong>Name:</strong> {userData.displayName}</p>
                <p><strong>Username:</strong> @{userData.username}</p>
                <p><strong>FID:</strong> {userData.fid}</p>
                <p><strong>Followers:</strong> {userData.followerCount?.toLocaleString()}</p>
                <p><strong>Following:</strong> {userData.followingCount?.toLocaleString()}</p>
                {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}
              </div>
            </div>
          </div>
        )}

        {interests && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-2">🎯 Real Interest Analysis:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Topics from posts:</strong> {interests.topics.join(', ') || 'None found'}
              </div>
              <div>
                <strong>Active channels:</strong> {interests.channels.join(', ') || 'None found'}
              </div>
              <div>
                <strong>Engagement score:</strong> {interests.engagementScore}
              </div>
              <div>
                <strong>Content categories:</strong>
                <ul className="mt-1 ml-4">
                  {Object.entries(interests.categories).map(([cat, score]) => (
                    <li key={cat}>• {cat}: {score as number} mentions</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}