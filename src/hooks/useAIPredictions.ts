// src/hooks/useAIPredictions.ts - FIXED with proper wallet separation
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
      
      // Step 1: Test automated wallet first
      console.log('🧪 Testing automated wallet connection...');
      const walletTest = await blockchainService.testAutomatedWalletConnection();
      if (!walletTest) {
        console.warn('⚠️ Automated wallet test failed, but continuing...');
      }
      
      // Step 2: Get REAL user interests from Farcaster
      console.log('📡 Fetching REAL user interests from Farcaster...');
      const result = await farcasterService.getUserInterests(fid);
      
      setUserData(result.user);
      console.log('✅ Real user data:', result.user);
      console.log('🧠 Real interests:', result.interests);
      
      // Step 3: Generate AI predictions based on REAL interests
      console.log('🤖 Generating AI predictions from REAL data...');
      const aiPredictions = await groqService.generatePredictionTopics(result.interests, 3);
      
      console.log('🎯 Generated AI predictions:', aiPredictions);
      
      // Step 4: Create markets on blockchain automatically with AUTOMATED WALLET
      setCreatingOnChain(true);
      console.log('⛓️ Creating AI markets on blockchain with AUTOMATED WALLET...');
      console.log('🏦 System will pay all gas fees for AI-generated markets');
      
      // ✅ FIXED: Better error handling and contract verification
      const ownership = await blockchainService.verifyContractOwnership();
      console.log('🔍 Contract ownership verification:', ownership);
      
      if (!ownership.isOwner) {
        console.error('❌ Automated wallet is not contract owner!');
        console.error('Contract owner:', ownership.owner);
        console.error('Automated wallet:', ownership.automatedWallet);
        
        // Still show AI predictions but don't create on-chain
        setPredictions(aiPredictions);
        setError(`Automated wallet (${ownership.automatedWallet}) is not authorized. Contract owner: ${ownership.owner}`);
        return aiPredictions;
      }

      // ✅ Use automated market creation (system pays)
      const blockchainResult = await blockchainService.createAIGeneratedMarkets(aiPredictions);
      
      if (blockchainResult.success && blockchainResult.createdMarkets.length > 0) {
        console.log('✅ Successfully created AI markets on blockchain:', blockchainResult.createdMarkets);
        console.log('💰 All gas fees paid by automated wallet');
        setOnChainMarkets(blockchainResult.createdMarkets);
        
        // Step 5: Fetch the newly created markets from blockchain
        console.log('📖 Fetching created markets from blockchain...');
        const onChainMarkets = [];
        
        for (const marketId of blockchainResult.createdMarkets) {
          try {
            const market = await blockchainService.getMarketById(marketId);
            if (market) {
              onChainMarkets.push(market);
            }
          } catch (fetchError) {
            console.warn(`Failed to fetch created market ${marketId}:`, fetchError);
          }
        }
        
        if (onChainMarkets.length > 0) {
          setPredictions(onChainMarkets);
          console.log('🎯 Final AI-generated on-chain predictions ready:', onChainMarkets);
        } else {
          console.warn('⚠️ Created markets but failed to fetch them, showing AI predictions');
          setPredictions(aiPredictions);
        }

        // Show any errors but don't fail completely
        if (blockchainResult.errors.length > 0) {
          console.warn('⚠️ Some AI markets failed to create:', blockchainResult.errors);
          setError(`Some AI markets couldn't be created: ${blockchainResult.errors.length} failed`);
        }
      } else {
        console.error('❌ Failed to create AI markets on blockchain');
        console.error('Errors:', blockchainResult.errors);
        
        // Still show the AI predictions even if blockchain creation fails
        setPredictions(aiPredictions);
        setError(`AI markets couldn't be created on-chain: ${blockchainResult.errors.join(', ')}`);
      }
      
      return aiPredictions;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI predictions';
      setError(errorMessage);
      console.error('❌ AI prediction generation failed:', err);
      return [];
    } finally {
      setLoading(false);
      setCreatingOnChain(false);
    }
  }, []);

  const refreshPredictions = useCallback(async (fid: number) => {
    return generatePredictions(fid);
  }, [generatePredictions]);

  // ✅ Get wallet usage info for debugging
  const getWalletUsageInfo = useCallback(() => {
    const automatedInfo = blockchainService.getAutomatedWalletInfo();
    const userInfo = blockchainService.getUserWalletInfo();
    
    return {
      aiMarkets: {
        wallet: 'Automated System Wallet',
        address: automatedInfo.address,
        paysGas: true,
        purpose: automatedInfo.purpose,
        method: 'Direct viem client'
      },
      manualMarkets: {
        wallet: 'User Connected Wallet',
        paysGas: true,
        purpose: userInfo.purpose,
        method: userInfo.method
      }
    };
  }, []);

  // ✅ Debug function to check automated wallet
  const debugAutomatedWallet = useCallback(async () => {
    console.log('🔧 Debug: Checking automated wallet...');
    
    try {
      const ownership = await blockchainService.verifyContractOwnership();
      const balance = await blockchainService.getWalletBalance();
      const walletInfo = blockchainService.getAutomatedWalletInfo();
      
      console.log('📊 Automated Wallet Debug Info:');
      console.log('  Address:', walletInfo.address);
      console.log('  Balance:', balance, 'ETH');
      console.log('  Is Contract Owner:', ownership.isOwner);
      console.log('  Contract Owner:', ownership.owner);
      
      return {
        address: walletInfo.address,
        balance,
        isOwner: ownership.isOwner,
        contractOwner: ownership.owner,
        canCreateMarkets: ownership.isOwner && parseFloat(balance) > 0.01
      };
    } catch (error) {
      console.error('❌ Debug failed:', error);
      return null;
    }
  }, []);

  return {
    loading,
    predictions,
    error,
    userData,
    creatingOnChain,
    onChainMarkets,
    generatePredictions,
    refreshPredictions,
    getWalletUsageInfo,
    debugAutomatedWallet, // ✅ New debug function
  };
}