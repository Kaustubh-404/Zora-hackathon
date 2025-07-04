// src/hooks/useAIPredictions.ts
import { useState, useCallback } from 'react';
import { groqService } from '@/services/groq/client';
import { farcasterService } from '@/services/farcaster/client';
import { blockchainService } from '@/services/blockchain/service';

export function useAIPredictions() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [creatingOnChain, setCreatingOnChain] = useState(false);
  const [onChainMarkets, setOnChainMarkets] = useState<number[]>([]);

  const generatePredictions = useCallback(async (fid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting AI prediction generation pipeline...');
      
      // Step 1: Get REAL user interests from Farcaster
      console.log('📡 Fetching REAL user interests from Farcaster...');
      const result = await farcasterService.getUserInterests(fid);
      
      setUserData(result.user);
      console.log('✅ Real user data:', result.user);
      console.log('🧠 Real interests:', result.interests);
      
      // Step 2: Generate AI predictions based on REAL interests
      console.log('🤖 Generating AI predictions from REAL data...');
      const aiPredictions = await groqService.generatePredictionTopics(result.interests, 3);
      
      console.log('🎯 Generated AI predictions:', aiPredictions);
      
      // Step 3: Create markets on blockchain automatically
      setCreatingOnChain(true);
      console.log('⛓️ Creating markets on blockchain...');
      
      const blockchainResult = await blockchainService.createAIGeneratedMarkets(aiPredictions);
      
      if (blockchainResult.success) {
        console.log('✅ Successfully created markets on blockchain:', blockchainResult.createdMarkets);
        setOnChainMarkets(blockchainResult.createdMarkets);
        
        // Step 4: Fetch the newly created markets from blockchain
        const onChainMarkets = [];
        for (const marketId of blockchainResult.createdMarkets) {
          const market = await blockchainService.getMarketById(marketId);
          if (market) {
            onChainMarkets.push(market);
          }
        }
        
        setPredictions(onChainMarkets);
        console.log('🎯 Final on-chain predictions ready:', onChainMarkets);
      } else {
        console.warn('⚠️ Some markets failed to create:', blockchainResult.errors);
        // Still show the AI predictions even if blockchain creation fails
        setPredictions(aiPredictions);
        setError(`Some markets couldn't be created on-chain: ${blockchainResult.errors.join(', ')}`);
      }
      
      return aiPredictions;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      setError(errorMessage);
      console.error('❌ Prediction generation failed:', err);
      return [];
    } finally {
      setLoading(false);
      setCreatingOnChain(false);
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
    creatingOnChain,
    onChainMarkets,
    generatePredictions,
    refreshPredictions,
  };
}