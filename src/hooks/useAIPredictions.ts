import { useState, useCallback } from 'react';
import { groqService } from '@/services/groq/client';
import { farcasterService } from '@/services/farcaster/client';

export function useAIPredictions() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const generatePredictions = useCallback(async (fid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Get REAL user interests from our API
      console.log('🔄 Fetching REAL user interests from Farcaster...');
      const result = await farcasterService.getUserInterests(fid);
      
      setUserData(result.user);
      console.log('✅ Real user data:', result.user);
      console.log('🧠 Real interests:', result.interests);
      
      // Step 2: Generate AI predictions based on REAL interests
      console.log('🤖 Generating AI predictions from REAL data...');
      const aiPredictions = await groqService.generatePredictionTopics(result.interests, 3);
      
      setPredictions(aiPredictions);
      return aiPredictions;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      setError(errorMessage);
      console.error('Error generating predictions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPredictions = useCallback(async (fid: number) => {
    return generatePredictions(fid);
  }, [generatePredictions]);

  return {
    loading,
    predictions,
    error,
    userData,
    generatePredictions,
    refreshPredictions,
  };
}