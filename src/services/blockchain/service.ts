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
  private walletClient;
  private automatedAccount;

  constructor() {
    // Public client for reading
    this.publicClient = createPublicClient({
      chain: ZORA_TESTNET,
      transport: http(),
    });

    // Automated wallet for AI-generated markets
    this.automatedAccount = privateKeyToAccount(`0x${AUTOMATED_WALLET.privateKey}`);
    this.walletClient = createWalletClient({
      account: this.automatedAccount,
      chain: ZORA_TESTNET,
      transport: http(),
    });
  }

  // ===== MARKET CREATION =====

  async createMarketManually(
    userAccount: Address,
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number; // in seconds
      initialBetAmount: string; // in ETH
      initialOutcome: boolean;
    }
  ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
      const userWalletClient = createWalletClient({
        account: userAccount,
        chain: ZORA_TESTNET,
        transport: http(),
      });

      const totalValue = parseEther((parseFloat(marketData.initialBetAmount) + 0.001).toString()); // bet + fee

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
          marketData.initialOutcome,
        ],
        value: totalValue,
        account: userAccount,
      });

      const txHash = await userWalletClient.writeContract(request);
      
      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      // Extract market ID from logs (simplified - in production you'd parse the event properly)
      const marketCounter = await this.getMarketCounter();
      
      return {
        success: true,
        marketId: Number(marketCounter) - 1, // Latest created market
        txHash,
      };
    } catch (error) {
      console.error('Error creating market manually:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create market',
      };
    }
  }

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
      console.log('🤖 Creating automated market on-chain:', marketData.question);

      const initialLiquidity = parseEther('0.01'); // 0.01 ETH initial liquidity

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
        account: this.automatedAccount,
        gas: BigInt(AUTOMATED_WALLET.gasLimit),
      });

      const txHash = await this.walletClient.writeContract(request);
      
      console.log('📡 Transaction sent:', txHash);
      
      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {
        const marketCounter = await this.getMarketCounter();
        const marketId = Number(marketCounter) - 1;
        
        console.log('✅ Market created successfully! ID:', marketId);
        
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

  // ===== BETTING =====

  async placeBet(
    userAccount: Address,
    marketId: number,
    outcome: boolean, // true = yes, false = no
    amount: string // in ETH
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
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
      
      return {
        success: true,
        txHash,
      };
    } catch (error) {
      console.error('Error placing bet:', error);
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

  // ===== AI INTEGRATION =====

  async createAIGeneratedMarkets(aiPredictions: any[]): Promise<{
    success: boolean;
    createdMarkets: number[];
    errors: string[];
  }> {
    console.log('🤖 Creating AI-generated markets on blockchain...');
    
    const createdMarkets: number[] = [];
    const errors: string[] = [];

    // Limit to 2 markets as requested
    const marketsToCreate = aiPredictions.slice(0, 2);

    for (const prediction of marketsToCreate) {
      try {
        const duration = 7 * 24 * 60 * 60; // 7 days in seconds
        
        const result = await this.createMarketAutomatically({
          question: prediction.question,
          description: prediction.description || `AI-generated prediction based on user interests`,
          category: prediction.category || 'general',
          resolutionCriteria: prediction.resolutionCriteria || 'Community consensus based on reliable sources',
          duration,
        });

        if (result.success && result.marketId !== undefined) {
          createdMarkets.push(result.marketId);
          console.log(`✅ Created market ${result.marketId}: ${prediction.question}`);
        } else {
          errors.push(`Failed to create market: ${prediction.question} - ${result.error}`);
        }

        // Small delay between creations to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        const errorMsg = `Error creating market "${prediction.question}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return {
      success: createdMarkets.length > 0,
      createdMarkets,
      errors,
    };
  }
}

export const blockchainService = new BlockchainService();