// src/services/blockchain/service.ts - FIXED: Manual works, automated fixed
import { createPublicClient, createWalletClient, http, parseEther, formatEther, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';
import { ZORA_TESTNET } from '@/constants/chains';
import { 
  CONTRACT_ADDRESSES, 
  AUTOMATED_WALLET,
  PREDICTION_MARKET_FACTORY_ABI,
  PREDICTION_MARKET_ABI,
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
export interface UserBet {
  marketId: number;
  amount: number;
  outcome: boolean;
  timestamp: Date;
  txHash: string;
  market?: OnChainMarket; // Optional market details
}

class BlockchainService {
  
  private publicClient;
  private automatedWalletClient;
  private automatedAccount;
  private userBets = new Map<Address, UserBet[]>();

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

    this.addMockUserBets();

    console.log('🔧 Blockchain service initialized');
    console.log('🤖 Automated wallet:', this.automatedAccount.address);
    console.log('👤 Manual markets use user wallet via wagmi');
  }

  // ===== MANUAL MARKET CREATION (USER PAYS VIA WAGMI) - WORKING ✅ =====
  async createMarketManually(
    _userAccount: Address,
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number;
      initialBetAmount: string;
      initialOutcome: boolean;
    }
  ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
      console.log('🏗️ Creating MANUAL market with USER WALLET via wagmi...');
      console.log('💰 Initial bet outcome:', marketData.initialOutcome ? 'YES' : 'NO');
      console.log('👤 User pays ALL gas fees via connected wallet');
      
      const betAmount = parseEther(marketData.initialBetAmount);
      const creationFee = parseEther('0.001');
      const totalValue = betAmount + creationFee;

      console.log('💰 Payment breakdown:');
      console.log(`  - Initial bet: ${marketData.initialBetAmount} ETH`);
      console.log(`  - Creation fee: 0.001 ETH`);
      console.log(`  - Total: ${formatEther(totalValue)} ETH`);

      // ✅ Use wagmi writeContract (user wallet + signature)
      console.log('📡 Sending transaction with USER WALLET via wagmi...');
      
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'createMarketWithInitialBet',
        args: [
          marketData.question,
          marketData.description,
          marketData.category,
          marketData.resolutionCriteria,
          BigInt(marketData.duration),
          marketData.initialOutcome, // ✅ Pass the actual boolean
        ],
        value: totalValue,
      });
      
      console.log('⏳ Waiting for confirmation...', hash);
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      
      if (receipt.status === 'success') {
        const marketCounter = await this.getMarketCounter();
        const marketId = Number(marketCounter) - 1;
        
        console.log('✅ Manual market created successfully!');
        console.log('📊 Market ID:', marketId);
        console.log('💸 User paid all gas fees');
        
        return {
          success: true,
          marketId,
          txHash: hash,
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Error creating manual market:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create manual market',
      };
    }
  }

  // ===== AI-GENERATED MARKET CREATION (AUTOMATED WALLET PAYS) - FIXED 🔧 =====
// Fixed createMarketAutomatically function - replace in your service.ts

  async createMarketAutomatically(
    marketData: {
      question: string;
      description: string;
      category: string;
      resolutionCriteria: string;
      duration: number;
    }
  ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
      console.log('🤖 Creating AI-generated market with AUTOMATED WALLET...');
      console.log('🏦 System pays ALL gas fees');
      console.log('📝 Question:', marketData.question);

      const initialLiquidity = parseEther('0.01');

      console.log('💰 AI Market funding:');
      console.log(`  - System liquidity: ${formatEther(initialLiquidity)} ETH`);
      console.log(`  - Funded by: ${this.automatedAccount.address}`);

      try {
        console.log('🔍 Estimating gas for contract call...');
        
        // ✅ FIXED: Estimate gas first, then add 20% buffer
        const gasEstimate = await this.publicClient.estimateContractGas({
          address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'createMarket',
          args: [
            marketData.question,
            marketData.description,
            marketData.category,
            marketData.resolutionCriteria,
            BigInt(marketData.duration),
          ],
          value: initialLiquidity,
          account: this.automatedAccount,
        });

        // ✅ Add 20% buffer to gas estimate
        const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
        console.log(`⛽ Gas estimate: ${gasEstimate}, Using limit: ${gasLimit}`);

        // ✅ FIXED: Use higher gas limit based on estimation
        const { request } = await this.publicClient.simulateContract({
          address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'createMarket',
          args: [
            marketData.question,
            marketData.description,
            marketData.category,
            marketData.resolutionCriteria,
            BigInt(marketData.duration),
          ],
          value: initialLiquidity,
          account: this.automatedAccount,
          gas: gasLimit, // ✅ Use estimated gas with buffer
        });

        console.log('📡 Sending transaction with AUTOMATED WALLET...');
        const txHash = await this.automatedWalletClient.writeContract(request);
        
        console.log('⏳ Waiting for confirmation...', txHash);
        const receipt = await this.publicClient.waitForTransactionReceipt({ 
          hash: txHash,
          timeout: 120000 // ✅ Increased timeout to 2 minutes
        });
        
        if (receipt.status === 'success') {
          const marketCounter = await this.getMarketCounter();
          const marketId = Number(marketCounter) - 1;
          
          console.log('✅ AI market created successfully!');
          console.log('📊 Market ID:', marketId);
          console.log('🏦 System paid all gas fees');
          console.log('⛽ Gas used:', receipt.gasUsed?.toString());
          
          return {
            success: true,
            marketId,
            txHash,
          };
        } else {
          throw new Error(`Transaction failed with status: ${receipt.status}`);
        }
        
      } catch (contractError: any) {
        console.error('❌ Direct PredictionMarket approach failed:', contractError);
        
        // ✅ FALLBACK: Try Factory approach with proper gas estimation
        console.log('🔄 Trying Factory approach as fallback...');
        
        try {
          const creationFee = parseEther('0.001');
          const totalValue = initialLiquidity + creationFee;
          
          console.log('💰 Factory approach values:');
          console.log(`  - Liquidity: ${formatEther(initialLiquidity)} ETH`);
          console.log(`  - Creation fee: ${formatEther(creationFee)} ETH`);
          console.log(`  - Total: ${formatEther(totalValue)} ETH`);

          // ✅ Gas estimation for Factory approach
          const factoryGasEstimate = await this.publicClient.estimateContractGas({
            address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
            abi: PREDICTION_MARKET_FACTORY_ABI,
            functionName: 'createMarketWithInitialBet',
            args: [
              marketData.question,
              marketData.description,
              marketData.category,
              marketData.resolutionCriteria,
              BigInt(marketData.duration),
              true, // Default to YES for automated markets
            ],
            value: totalValue,
            account: this.automatedAccount,
          });

          const factoryGasLimit = BigInt(Math.floor(Number(factoryGasEstimate) * 1.2));
          console.log(`⛽ Factory gas estimate: ${factoryGasEstimate}, Using limit: ${factoryGasLimit}`);

          const factoryRequest = await this.publicClient.simulateContract({
            address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
            abi: PREDICTION_MARKET_FACTORY_ABI,
            functionName: 'createMarketWithInitialBet',
            args: [
              marketData.question,
              marketData.description,
              marketData.category,
              marketData.resolutionCriteria,
              BigInt(marketData.duration),
              true,
            ],
            value: totalValue,
            account: this.automatedAccount,
            gas: factoryGasLimit, // ✅ Use proper gas estimation
          });

          console.log('📡 Sending Factory transaction with AUTOMATED WALLET...');
          const factoryTxHash = await this.automatedWalletClient.writeContract(factoryRequest.request);
          
          const factoryReceipt = await this.publicClient.waitForTransactionReceipt({ 
            hash: factoryTxHash,
            timeout: 120000 // ✅ Increased timeout
          });
          
          if (factoryReceipt.status === 'success') {
            const marketCounter = await this.getMarketCounter();
            const marketId = Number(marketCounter) - 1;
            
            console.log('✅ AI market created via Factory successfully!');
            console.log('📊 Market ID:', marketId);
            console.log('⛽ Gas used:', factoryReceipt.gasUsed?.toString());
            
            return {
              success: true,
              marketId,
              txHash: factoryTxHash,
            };
          } else {
            throw new Error(`Factory transaction failed with status: ${factoryReceipt.status}`);
          }
          
        } catch (factoryError) {
          console.error('❌ Factory approach also failed:', factoryError);
          throw new Error(`Both approaches failed: ${contractError.message}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating automated market:', error);
      
      let errorMessage = 'Failed to create automated market';
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Automated wallet has insufficient funds';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Smart contract rejected the transaction - check contract parameters';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Transaction ran out of gas - contact support';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // ===== MARKET READING (UNCHANGED - WORKING) =====
  async getAllMarkets(): Promise<OnChainMarket[]> {
    try {
      console.log('📊 Fetching all markets from blockchain...');

      const marketCounter = await this.getMarketCounter();
      const markets: OnChainMarket[] = [];

      console.log(`🔢 Total markets to fetch: ${marketCounter}`);

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
      console.log('📊 Fetching active markets...');
      
      const activeMarketIds = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getAllActiveMarkets',
      }) as bigint[];

      console.log(`🎯 Found ${activeMarketIds.length} active market IDs`);

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

      console.log(`✅ Fetched ${markets.length} active markets`);
      return markets;
    } catch (error) {
      console.error('Error fetching active markets:', error);
      return [];
    }
  }

  async getMarketById(marketId: number): Promise<OnChainMarket | null> {
    try {
      console.log(`📖 Fetching market ${marketId}...`);
      
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

      const market: OnChainMarket = {
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
        tags: [marketData.category], // Use category as tag
      };

      console.log(`✅ Market ${marketId} fetched successfully`);
      return market;
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }

  // ===== BETTING (ALWAYS USER PAYS VIA WAGMI) - UNCHANGED =====
  async placeBet(
    userAccount: Address,
    marketId: number,
    outcome: boolean,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log('💰 Placing bet with USER WALLET via wagmi...');
      console.log(`📊 Market: ${marketId}, Outcome: ${outcome ? 'YES' : 'NO'}, Amount: ${amount} ETH`);
      console.log('👤 User pays gas fees');
      
      const betAmount = parseEther(amount);

      // ✅ Use wagmi for user transactions
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), outcome],
        value: betAmount,
      });
      
      await waitForTransactionReceipt(wagmiConfig, { hash });

        this.trackUserBet(userAccount, {
        marketId,
        amount: parseFloat(amount),
        outcome,
        timestamp: new Date(),
        txHash: hash,
       });
      
      console.log('✅ Bet placed successfully!');
      console.log('💸 User paid gas fees');
      
      return {
        success: true,
        txHash: hash,
      };
    } catch (error) {
      console.error('❌ Error placing bet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to place bet',
      };
    }
  }

  // Add new methods
private trackUserBet(userAddress: Address, bet: UserBet) {
  const userBets = this.userBets.get(userAddress) || [];
  userBets.push(bet);
  this.userBets.set(userAddress, userBets);
}

async getUserBets(userAddress: Address): Promise<UserBet[]> {
  try {
    // Get stored bets
    const storedBets = this.userBets.get(userAddress) || [];
    
    // Enrich with market data
    const enrichedBets = await Promise.all(
      storedBets.map(async (bet) => {
        const market = await this.getMarketById(bet.marketId);
        return market ? { ...bet, market } : bet;
      })
    );
    
    return enrichedBets;
  } catch (error) {
    console.error('Error fetching user bets:', error);
    return [];
  }
}

async getUserBetsWithStatus(userAddress: Address): Promise<(UserBet & { 
  status: 'pending' | 'won' | 'lost';
  payout?: number;
})[]> {
  const bets = await this.getUserBets(userAddress);
  
  return bets.map(bet => {
    if (!bet.market) {
      return { ...bet, status: 'pending' as const };
    }
    
    if (!bet.market.resolved) {
      return { ...bet, status: 'pending' as const };
    }
    
    const won = bet.market.outcome === bet.outcome;
    const payout = won ? bet.amount * 2 : 0; // Simplified payout calculation
    
    return {
      ...bet,
      status: won ? 'won' as const : 'lost' as const,
      payout,
    };
  });
}

// Add some mock data for demo - call this in constructor
private addMockUserBets() {
  // Add some mock bets for demo
  const mockUserAddress = '0x44e37A9a53EB19F26a2e73aF559C13048Aa4FaE9' as Address;
  const mockBets: UserBet[] = [
    {
      marketId: 0,
      amount: 0.05,
      outcome: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      txHash: '0x1234567890abcdef...',
    },
    {
      marketId: 1,
      amount: 0.1,
      outcome: false,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      txHash: '0xabcdef1234567890...',
    },
  ];
  
  this.userBets.set(mockUserAddress, mockBets);
}

  // ===== UTILITY FUNCTIONS =====
  private async getMarketCounter(): Promise<bigint> {
    try {
      const counter = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketCounter',
      }) as bigint;
      
      console.log(`📊 Market counter: ${counter}`);
      return counter;
    } catch (error) {
      console.error('Error getting market counter:', error);
      return BigInt(0);
    }
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

  // ===== AI INTEGRATION (AUTOMATED WALLET) - IMPROVED 🔧 =====
  async createAIGeneratedMarkets(aiPredictions: any[]): Promise<{
    success: boolean;
    createdMarkets: number[];
    errors: string[];
  }> {
    console.log('🤖 Creating AI-generated markets with AUTOMATED WALLET...');
    console.log('🏦 System pays ALL gas fees for AI markets');
    
    const createdMarkets: number[] = [];
    const errors: string[] = [];

    // ✅ FIXED: Create only 1 market first to test, then expand
    const marketsToCreate = aiPredictions.slice(0, 1); // Start with just 1 to debug

    for (let i = 0; i < marketsToCreate.length; i++) {
      const prediction = marketsToCreate[i];
      try {
        console.log(`🔄 Creating AI market ${i + 1}/${marketsToCreate.length}: ${prediction.question}`);
        
        const duration = 7 * 24 * 60 * 60; // 7 days in seconds
        
        // ✅ Use automated creation (SYSTEM PAYS)
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
          const errorMsg = `Failed to create AI market: ${prediction.question} - ${result.error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }

        // ✅ Better delay between creations to avoid nonce issues
        if (i < marketsToCreate.length - 1) {
          console.log('⏳ Waiting 5 seconds before next creation...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        const errorMsg = `Error creating AI market "${prediction.question}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`🎯 AI Market Creation Summary:`);
    console.log(`✅ Created: ${createdMarkets.length} markets`);
    console.log(`❌ Failed: ${errors.length} markets`);
    console.log(`🏦 System paid all gas fees for AI markets`);

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
      paysGasFor: 'AI markets via Farcaster personalization',
      balance: 'Check Zora Sepolia explorer',
    };
  }

  getUserWalletInfo() {
    return {
      purpose: 'Manual market creation and all betting',
      paysGasFor: 'User-initiated markets and all bets',
      method: 'Connected wallet via wagmi',
    };
  }

  // ===== CONTRACT VERIFICATION =====
  async verifyContractOwnership(): Promise<{ isOwner: boolean; owner: string; automatedWallet: string }> {
    try {
      const owner = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
        abi: PREDICTION_MARKET_FACTORY_ABI,
        functionName: 'owner',
      }) as string;

      const isOwner = owner.toLowerCase() === this.automatedAccount.address.toLowerCase();

      console.log('🔍 Contract ownership check:');
      console.log(`  Contract owner: ${owner}`);
      console.log(`  Automated wallet: ${this.automatedAccount.address}`);
      console.log(`  Is owner: ${isOwner}`);

      return {
        isOwner,
        owner,
        automatedWallet: this.automatedAccount.address,
      };
    } catch (error) {
      console.error('Error verifying contract ownership:', error);
      return {
        isOwner: false,
        owner: 'unknown',
        automatedWallet: this.automatedAccount.address,
      };
    }
  }

  // ===== DEBUGGING METHODS =====
  async getWalletBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.automatedAccount.address;
      const balance = await this.publicClient.getBalance({
        address: targetAddress as Address,
      });
      
      const balanceEth = formatEther(balance);
      console.log(`💰 Balance for ${targetAddress}: ${balanceEth} ETH`);
      return balanceEth;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }

  async testAutomatedWalletConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing automated wallet connection...');
      
      // Check balance
      const balance = await this.getWalletBalance();
      if (parseFloat(balance) < 0.02) { // ✅ Increased minimum balance requirement
        console.warn('⚠️ Automated wallet has low balance:', balance, 'ETH (need at least 0.02)');
        return false;
      }

      // Check ownership
      const ownership = await this.verifyContractOwnership();
      if (!ownership.isOwner) {
        console.error('❌ Automated wallet is not contract owner');
        return false;
      }

      // ✅ NEW: Test contract accessibility
      try {
        const minBet = await this.publicClient.readContract({
          address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'MIN_BET',
        }) as bigint;
        console.log('💰 Contract MIN_BET:', formatEther(minBet), 'ETH');
      } catch (contractError) {
        console.error('❌ Cannot access smart contract:', contractError);
        return false;
      }

      console.log('✅ Automated wallet connection test passed');
      return true;
    } catch (error) {
      console.error('❌ Automated wallet connection test failed:', error);
      return false;
    }
  }

  // ✅ NEW: Debug function to test a simple contract interaction
  async testSimpleContractCall(): Promise<boolean> {
    try {
      console.log('🔧 Testing simple contract call...');
      
      // Try to read market counter (should always work)
      const counter = await this.getMarketCounter();
      console.log('📊 Market counter read successfully:', counter.toString());
      
      // Try to read MIN_BET
      const minBet = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'MIN_BET',
      }) as bigint;
      console.log('💰 MIN_BET read successfully:', formatEther(minBet), 'ETH');
      
      return true;
    } catch (error) {
      console.error('❌ Simple contract call failed:', error);
      return false;
    }
  }

  get client() {
    return this.publicClient;
  }
}

export const blockchainService = new BlockchainService();