// src/services/blockchain/service.ts
import { createPublicClient, createWalletClient, http, parseEther, formatEther, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ZORA_TESTNET } from '@/constants/chains';
import { 
  CONTRACT_ADDRESSES, 
  AUTOMATED_WALLET,
  PREDICTION_MARKET_FACTORY_ABI,
  PREDICTION_MARKET_ABI,
  PREDICTION_NFT_ABI 
} from '@/constants/contracts';

export interface OnChainMarket {
  id: string;
  marketId: number;
  question: string;
  description: string;
  category: string;
  resolutionCriteria: string;
  endTime: Date;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  resolved: boolean;
  outcome?: boolean;
  creator: string;
  createdAt: Date;
  active: boolean;
  totalLiquidity: number;
  outcomes: {
    yes: number;
    no: number;
  };
  tags: string[];
}

class BlockchainService {
  private publicClient;
  private automatedWalletClient;
  private automatedAccount;

  constructor() {
    // Public client for reading
    this.publicClient = createPublicClient({
      chain: ZORA_TESTNET,
      transport: http(),
    });

    // ✅ Automated wallet for AI-generated markets ONLY
    this.automatedAccount = privateKeyToAccount(`0x${AUTOMATED_WALLET.privateKey}`);
    this.automatedWalletClient = createWalletClient({
      account: this.automatedAccount,
      chain: ZORA_TESTNET,
      transport: http(),
    });
  }

  // ===== MANUAL MARKET CREATION (USER PAYS) =====
  async createMarketManually(
    userAccount: Address,
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number; // in seconds
      initialBetAmount: string; // in ETH
      initialOutcome: boolean; // ✅ FIXED: Properly pass the outcome
    }
  ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
      console.log('🏗️ Creating manual market with user wallet...');
      console.log('💰 Initial bet outcome:', marketData.initialOutcome ? 'YES' : 'NO');
      
      // ✅ Create wallet client for user (not automated wallet)
      const userWalletClient = createWalletClient({
        account: userAccount,
        chain: ZORA_TESTNET,
        transport: http(),
      });

      const betAmount = parseEther(marketData.initialBetAmount);
      const creationFee = parseEther('0.001');
      const totalValue = betAmount + creationFee;

      console.log('💰 Payment breakdown:');
      console.log(`  - Initial bet: ${marketData.initialBetAmount} ETH`);
      console.log(`  - Creation fee: 0.001 ETH`);
      console.log(`  - Total: ${formatEther(totalValue)} ETH`);

      // ✅ Simulate the transaction first
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'createMarketWithInitialBet',
        args: [
          marketData.question,
          marketData.description,
          marketData.category,
          marketData.resolutionCriteria,
          BigInt(marketData.duration),
          marketData.initialOutcome, // ✅ FIXED: Pass the actual outcome
        ],
        value: totalValue,
        account: userAccount,
      });

      console.log('📡 Sending transaction with user wallet...');
      const txHash = await userWalletClient.writeContract(request);
      
      console.log('⏳ Waiting for confirmation...', txHash);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {
        // Get the market ID from the latest counter
        const marketCounter = await this.getMarketCounter();
        const marketId = Number(marketCounter) - 1;
        
        console.log('✅ Manual market created successfully!');
        console.log('📊 Market ID:', marketId);
        console.log('💸 User paid gas fees');
        
        return {
          success: true,
          marketId,
          txHash,
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Error creating manual market:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create market',
      };
    }
  }

  // ===== AI-GENERATED MARKET CREATION (SYSTEM PAYS) =====
  async createMarketAutomatically(
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number; // in seconds
    }
  ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
      console.log('🤖 Creating AI-generated market with automated wallet...');
      console.log('📝 Question:', marketData.question);

      const initialLiquidity = parseEther('0.01'); // 0.01 ETH initial liquidity

      // ✅ Use automated wallet for AI markets
      const { request } = await this.publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'createAutomatedMarket',
        args: [
          marketData.question,
          marketData.description,
          marketData.category,
          marketData.resolutionCriteria,
          BigInt(marketData.duration),
        ],
        value: initialLiquidity,
        account: this.automatedAccount, // ✅ Use system wallet
        gas: BigInt(AUTOMATED_WALLET.gasLimit),
      });

      console.log('📡 Sending transaction with automated wallet...');
      const txHash = await this.automatedWalletClient.writeContract(request);
      
      console.log('⏳ Waiting for confirmation...', txHash);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {
        const marketCounter = await this.getMarketCounter();
        const marketId = Number(marketCounter) - 1;
        
        console.log('✅ AI market created successfully!');
        console.log('📊 Market ID:', marketId);
        console.log('🏦 System paid gas fees');
        
        return {
          success: true,
          marketId,
          txHash,
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Error creating automated market:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create automated market',
      };
    }
  }

  // ===== MARKET READING =====
  async getAllMarkets(): Promise<OnChainMarket[]> {
    try {
      console.log('📊 Fetching all markets from blockchain...');

      const marketCounter = await this.getMarketCounter();
      const markets: OnChainMarket[] = [];

      // Fetch all markets
      for (let i = 0; i < Number(marketCounter); i++) {
        try {
          const market = await this.getMarketById(i);
          if (market) {
            markets.push(market);
          }
        } catch (error) {
          console.warn(`Failed to fetch market ${i}:`, error);
        }
      }

      console.log(`✅ Fetched ${markets.length} markets from blockchain`);
      return markets;
    } catch (error) {
      console.error('Error fetching all markets:', error);
      return [];
    }
  }

  async getActiveMarkets(): Promise<OnChainMarket[]> {
    try {
      const activeMarketIds = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getAllActiveMarkets',
      }) as bigint[];

      const markets: OnChainMarket[] = [];

      for (const marketId of activeMarketIds) {
        try {
          const market = await this.getMarketById(Number(marketId));
          if (market) {
            markets.push(market);
          }
        } catch (error) {
          console.warn(`Failed to fetch active market ${marketId}:`, error);
        }
      }

      return markets;
    } catch (error) {
      console.error('Error fetching active markets:', error);
      return [];
    }
  }

  async getMarketById(marketId: number): Promise<OnChainMarket | null> {
    try {
      const marketData = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)],
      }) as any;

      // Get market odds
      const odds = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketOdds',
        args: [BigInt(marketId)],
      }) as [bigint, bigint];

      const totalLiquidity = formatEther(marketData.totalYesAmount + marketData.totalNoAmount);

      return {
        id: `onchain_${marketId}`,
        marketId,
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        resolutionCriteria: marketData.resolutionCriteria,
        endTime: new Date(Number(marketData.endTime) * 1000),
        totalYesAmount: marketData.totalYesAmount,
        totalNoAmount: marketData.totalNoAmount,
        resolved: marketData.resolved,
        outcome: marketData.outcome,
        creator: marketData.creator,
        createdAt: new Date(Number(marketData.createdAt) * 1000),
        active: marketData.active,
        totalLiquidity: parseFloat(totalLiquidity),
        outcomes: {
          yes: Number(odds[0]),
          no: Number(odds[1]),
        },
        tags: [marketData.category], // Basic tags from category
      };
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }

  // ===== BETTING (ALWAYS USER PAYS) =====
  async placeBet(
    userAccount: Address,
    marketId: number,
    outcome: boolean, // true = yes, false = no
    amount: string // in ETH
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log('💰 Placing bet with user wallet...');
      console.log(`📊 Market: ${marketId}, Outcome: ${outcome ? 'YES' : 'NO'}, Amount: ${amount} ETH`);
      
      // ✅ Always use user wallet for betting
      const userWalletClient = createWalletClient({
        account: userAccount,
        chain: ZORA_TESTNET,
        transport: http(),
      });

      const betAmount = parseEther(amount);

      const { request } = await this.publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), outcome],
        value: betAmount,
        account: userAccount,
      });

      const txHash = await userWalletClient.writeContract(request);
      
      await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      console.log('✅ Bet placed successfully!');
      console.log('💸 User paid gas fees');
      
      return {
        success: true,
        txHash,
      };
    } catch (error) {
      console.error('❌ Error placing bet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to place bet',
      };
    }
  }

  // ===== UTILITY FUNCTIONS =====
  private async getMarketCounter(): Promise<bigint> {
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'marketCounter',
    }) as bigint;
  }

  async getContractAddresses(): Promise<{ market: string; nft: string }> {
    try {
      const marketAddress = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'getPredictionMarketAddress',
      }) as string;

      const nftAddress = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'getPredictionNFTAddress',
      }) as string;

      return { market: marketAddress, nft: nftAddress };
    } catch (error) {
      console.error('Error getting contract addresses:', error);
      return { market: '', nft: '' };
    }
  }

  // ===== AI INTEGRATION (SYSTEM WALLET) =====
  async createAIGeneratedMarkets(aiPredictions: any[]): Promise<{
    success: boolean;
    createdMarkets: number[];
    errors: string[];
  }> {
    console.log('🤖 Creating AI-generated markets with automated wallet...');
    
    const createdMarkets: number[] = [];
    const errors: string[] = [];

    // Limit to 2 markets as requested
    const marketsToCreate = aiPredictions.slice(0, 2);

    for (const prediction of marketsToCreate) {
      try {
        const duration = 7 * 24 * 60 * 60; // 7 days in seconds
        
        // ✅ Use automated creation (system pays)
        const result = await this.createMarketAutomatically({
          question: prediction.question,
          description: prediction.description || `AI-generated prediction based on user interests`,
          category: prediction.category || 'general',
          resolutionCriteria: prediction.resolutionCriteria || 'Community consensus based on reliable sources',
          duration,
        });

        if (result.success && result.marketId !== undefined) {
          createdMarkets.push(result.marketId);
          console.log(`✅ Created AI market ${result.marketId}: ${prediction.question}`);
        } else {
          errors.push(`Failed to create AI market: ${prediction.question} - ${result.error}`);
        }

        // Small delay between creations to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        const errorMsg = `Error creating AI market "${prediction.question}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`🎯 AI Market Creation Summary:`);
    console.log(`✅ Created: ${createdMarkets.length} markets`);
    console.log(`❌ Failed: ${errors.length} markets`);
    console.log(`💰 System paid all gas fees for AI markets`);

    return {
      success: createdMarkets.length > 0,
      createdMarkets,
      errors,
    };
  }

  // ===== WALLET INFO =====
  getAutomatedWalletInfo() {
    return {
      address: this.automatedAccount.address,
      purpose: 'AI-generated market creation only',
    };
  }
}

export const blockchainService = new BlockchainService();