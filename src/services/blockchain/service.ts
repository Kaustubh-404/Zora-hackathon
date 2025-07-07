// // src/services/blockchain/service.ts
// import { createPublicClient, createWalletClient, http, parseEther, formatEther, Address } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { ZORA_TESTNET } from '@/constants/chains';
// import { 
//   CONTRACT_ADDRESSES, 
//   AUTOMATED_WALLET,
//   PREDICTION_MARKET_FACTORY_ABI,
//   PREDICTION_MARKET_ABI,
//   PREDICTION_NFT_ABI 
// } from '@/constants/contracts';

// export interface OnChainMarket {
//   id: string;
//   marketId: number;
//   question: string;
//   description: string;
//   category: string;
//   resolutionCriteria: string;
//   endTime: Date;
//   totalYesAmount: bigint;
//   totalNoAmount: bigint;
//   resolved: boolean;
//   outcome?: boolean;
//   creator: string;
//   createdAt: Date;
//   active: boolean;
//   totalLiquidity: number;
//   outcomes: {
//     yes: number;
//     no: number;
//   };
//   tags: string[];
// }

// class BlockchainService {
//   private publicClient;
//   private automatedWalletClient;
//   private automatedAccount;

//   constructor() {
//     // Public client for reading
//     this.publicClient = createPublicClient({
//       chain: ZORA_TESTNET,
//       transport: http(),
//     });

//     // ✅ Automated wallet for AI-generated markets ONLY
//     this.automatedAccount = privateKeyToAccount(`0x${AUTOMATED_WALLET.privateKey}`);
//     this.automatedWalletClient = createWalletClient({
//       account: this.automatedAccount,
//       chain: ZORA_TESTNET,
//       transport: http(),
//     });
//   }

//   // ===== MANUAL MARKET CREATION (USER PAYS) =====
//   async createMarketManually(
//     userAccount: Address,
//     marketData: {
//       question: string;
//       description: string;
//       category: string;
//       resolutionCriteria: string;
//       duration: number; // in seconds
//       initialBetAmount: string; // in ETH
//       initialOutcome: boolean; // ✅ FIXED: Properly pass the outcome
//     }
//   ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
//     try {
//       console.log('🏗️ Creating manual market with user wallet...');
//       console.log('💰 Initial bet outcome:', marketData.initialOutcome ? 'YES' : 'NO');
      
//       // ✅ Create wallet client for user (not automated wallet)
//       const userWalletClient = createWalletClient({
//         account: userAccount,
//         chain: ZORA_TESTNET,
//         transport: http(),
//       });

//       const betAmount = parseEther(marketData.initialBetAmount);
//       const creationFee = parseEther('0.001');
//       const totalValue = betAmount + creationFee;

//       console.log('💰 Payment breakdown:');
//       console.log(`  - Initial bet: ${marketData.initialBetAmount} ETH`);
//       console.log(`  - Creation fee: 0.001 ETH`);
//       console.log(`  - Total: ${formatEther(totalValue)} ETH`);

//       // ✅ Simulate the transaction first
//       const { request } = await this.publicClient.simulateContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
//         abi: PREDICTION_MARKET_FACTORY_ABI,
//         functionName: 'createMarketWithInitialBet',
//         args: [
//           marketData.question,
//           marketData.description,
//           marketData.category,
//           marketData.resolutionCriteria,
//           BigInt(marketData.duration),
//           marketData.initialOutcome, // ✅ FIXED: Pass the actual outcome
//         ],
//         value: totalValue,
//         account: userAccount,
//       });

//       console.log('📡 Sending transaction with user wallet...');
//       const txHash = await userWalletClient.writeContract(request);
      
//       console.log('⏳ Waiting for confirmation...', txHash);
//       const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
//       if (receipt.status === 'success') {
//         // Get the market ID from the latest counter
//         const marketCounter = await this.getMarketCounter();
//         const marketId = Number(marketCounter) - 1;
        
//         console.log('✅ Manual market created successfully!');
//         console.log('📊 Market ID:', marketId);
//         console.log('💸 User paid gas fees');
        
//         return {
//           success: true,
//           marketId,
//           txHash,
//         };
//       } else {
//         throw new Error('Transaction failed');
//       }
//     } catch (error) {
//       console.error('❌ Error creating manual market:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to create market',
//       };
//     }
//   }

//   // ===== AI-GENERATED MARKET CREATION (SYSTEM PAYS) =====
//   async createMarketAutomatically(
//     marketData: {
//       question: string;
//       description: string;
//       category: string;
//       resolutionCriteria: string;
//       duration: number; // in seconds
//     }
//   ): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
//     try {
//       console.log('🤖 Creating AI-generated market with automated wallet...');
//       console.log('📝 Question:', marketData.question);

//       const initialLiquidity = parseEther('0.01'); // 0.01 ETH initial liquidity

//       // ✅ Use automated wallet for AI markets
//       const { request } = await this.publicClient.simulateContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
//         abi: PREDICTION_MARKET_FACTORY_ABI,
//         functionName: 'createAutomatedMarket',
//         args: [
//           marketData.question,
//           marketData.description,
//           marketData.category,
//           marketData.resolutionCriteria,
//           BigInt(marketData.duration),
//         ],
//         value: initialLiquidity,
//         account: this.automatedAccount, // ✅ Use system wallet
//         gas: BigInt(AUTOMATED_WALLET.gasLimit),
//       });

//       console.log('📡 Sending transaction with automated wallet...');
//       const txHash = await this.automatedWalletClient.writeContract(request);
      
//       console.log('⏳ Waiting for confirmation...', txHash);
//       const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
//       if (receipt.status === 'success') {
//         const marketCounter = await this.getMarketCounter();
//         const marketId = Number(marketCounter) - 1;
        
//         console.log('✅ AI market created successfully!');
//         console.log('📊 Market ID:', marketId);
//         console.log('🏦 System paid gas fees');
        
//         return {
//           success: true,
//           marketId,
//           txHash,
//         };
//       } else {
//         throw new Error('Transaction failed');
//       }
//     } catch (error) {
//       console.error('❌ Error creating automated market:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to create automated market',
//       };
//     }
//   }

//   // ===== MARKET READING =====
//   async getAllMarkets(): Promise<OnChainMarket[]> {
//     try {
//       console.log('📊 Fetching all markets from blockchain...');

//       const marketCounter = await this.getMarketCounter();
//       const markets: OnChainMarket[] = [];

//       // Fetch all markets
//       for (let i = 0; i < Number(marketCounter); i++) {
//         try {
//           const market = await this.getMarketById(i);
//           if (market) {
//             markets.push(market);
//           }
//         } catch (error) {
//           console.warn(`Failed to fetch market ${i}:`, error);
//         }
//       }

//       console.log(`✅ Fetched ${markets.length} markets from blockchain`);
//       return markets;
//     } catch (error) {
//       console.error('Error fetching all markets:', error);
//       return [];
//     }
//   }

//   async getActiveMarkets(): Promise<OnChainMarket[]> {
//     try {
//       const activeMarketIds = await this.publicClient.readContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
//         abi: PREDICTION_MARKET_ABI,
//         functionName: 'getAllActiveMarkets',
//       }) as bigint[];

//       const markets: OnChainMarket[] = [];

//       for (const marketId of activeMarketIds) {
//         try {
//           const market = await this.getMarketById(Number(marketId));
//           if (market) {
//             markets.push(market);
//           }
//         } catch (error) {
//           console.warn(`Failed to fetch active market ${marketId}:`, error);
//         }
//       }

//       return markets;
//     } catch (error) {
//       console.error('Error fetching active markets:', error);
//       return [];
//     }
//   }

//   async getMarketById(marketId: number): Promise<OnChainMarket | null> {
//     try {
//       const marketData = await this.publicClient.readContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
//         abi: PREDICTION_MARKET_ABI,
//         functionName: 'getMarket',
//         args: [BigInt(marketId)],
//       }) as any;

//       // Get market odds
//       const odds = await this.publicClient.readContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
//         abi: PREDICTION_MARKET_ABI,
//         functionName: 'getMarketOdds',
//         args: [BigInt(marketId)],
//       }) as [bigint, bigint];

//       const totalLiquidity = formatEther(marketData.totalYesAmount + marketData.totalNoAmount);

//       return {
//         id: `onchain_${marketId}`,
//         marketId,
//         question: marketData.question,
//         description: marketData.description,
//         category: marketData.category,
//         resolutionCriteria: marketData.resolutionCriteria,
//         endTime: new Date(Number(marketData.endTime) * 1000),
//         totalYesAmount: marketData.totalYesAmount,
//         totalNoAmount: marketData.totalNoAmount,
//         resolved: marketData.resolved,
//         outcome: marketData.outcome,
//         creator: marketData.creator,
//         createdAt: new Date(Number(marketData.createdAt) * 1000),
//         active: marketData.active,
//         totalLiquidity: parseFloat(totalLiquidity),
//         outcomes: {
//           yes: Number(odds[0]),
//           no: Number(odds[1]),
//         },
//         tags: [marketData.category], // Basic tags from category
//       };
//     } catch (error) {
//       console.error(`Error fetching market ${marketId}:`, error);
//       return null;
//     }
//   }

//   // ===== BETTING (ALWAYS USER PAYS) =====
//   async placeBet(
//     userAccount: Address,
//     marketId: number,
//     outcome: boolean, // true = yes, false = no
//     amount: string // in ETH
//   ): Promise<{ success: boolean; txHash?: string; error?: string }> {
//     try {
//       console.log('💰 Placing bet with user wallet...');
//       console.log(`📊 Market: ${marketId}, Outcome: ${outcome ? 'YES' : 'NO'}, Amount: ${amount} ETH`);
      
//       // ✅ Always use user wallet for betting
//       const userWalletClient = createWalletClient({
//         account: userAccount,
//         chain: ZORA_TESTNET,
//         transport: http(),
//       });

//       const betAmount = parseEther(amount);

//       const { request } = await this.publicClient.simulateContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
//         abi: PREDICTION_MARKET_ABI,
//         functionName: 'placeBet',
//         args: [BigInt(marketId), outcome],
//         value: betAmount,
//         account: userAccount,
//       });

//       const txHash = await userWalletClient.writeContract(request);
      
//       await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
//       console.log('✅ Bet placed successfully!');
//       console.log('💸 User paid gas fees');
      
//       return {
//         success: true,
//         txHash,
//       };
//     } catch (error) {
//       console.error('❌ Error placing bet:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to place bet',
//       };
//     }
//   }

//   // ===== UTILITY FUNCTIONS =====
//   private async getMarketCounter(): Promise<bigint> {
//     return await this.publicClient.readContract({
//       address: CONTRACT_ADDRESSES.PREDICTION_MARKET as Address,
//       abi: PREDICTION_MARKET_ABI,
//       functionName: 'marketCounter',
//     }) as bigint;
//   }

//   async getContractAddresses(): Promise<{ market: string; nft: string }> {
//     try {
//       const marketAddress = await this.publicClient.readContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
//         abi: PREDICTION_MARKET_FACTORY_ABI,
//         functionName: 'getPredictionMarketAddress',
//       }) as string;

//       const nftAddress = await this.publicClient.readContract({
//         address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
//         abi: PREDICTION_MARKET_FACTORY_ABI,
//         functionName: 'getPredictionNFTAddress',
//       }) as string;

//       return { market: marketAddress, nft: nftAddress };
//     } catch (error) {
//       console.error('Error getting contract addresses:', error);
//       return { market: '', nft: '' };
//     }
//   }

//   // ===== AI INTEGRATION (SYSTEM WALLET) =====
//   async createAIGeneratedMarkets(aiPredictions: any[]): Promise<{
//     success: boolean;
//     createdMarkets: number[];
//     errors: string[];
//   }> {
//     console.log('🤖 Creating AI-generated markets with automated wallet...');
    
//     const createdMarkets: number[] = [];
//     const errors: string[] = [];

//     // Limit to 2 markets as requested
//     const marketsToCreate = aiPredictions.slice(0, 2);

//     for (const prediction of marketsToCreate) {
//       try {
//         const duration = 7 * 24 * 60 * 60; // 7 days in seconds
        
//         // ✅ Use automated creation (system pays)
//         const result = await this.createMarketAutomatically({
//           question: prediction.question,
//           description: prediction.description || `AI-generated prediction based on user interests`,
//           category: prediction.category || 'general',
//           resolutionCriteria: prediction.resolutionCriteria || 'Community consensus based on reliable sources',
//           duration,
//         });

//         if (result.success && result.marketId !== undefined) {
//           createdMarkets.push(result.marketId);
//           console.log(`✅ Created AI market ${result.marketId}: ${prediction.question}`);
//         } else {
//           errors.push(`Failed to create AI market: ${prediction.question} - ${result.error}`);
//         }

//         // Small delay between creations to avoid nonce issues
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//       } catch (error) {
//         const errorMsg = `Error creating AI market "${prediction.question}": ${error instanceof Error ? error.message : 'Unknown error'}`;
//         errors.push(errorMsg);
//         console.error(errorMsg);
//       }
//     }

//     console.log(`🎯 AI Market Creation Summary:`);
//     console.log(`✅ Created: ${createdMarkets.length} markets`);
//     console.log(`❌ Failed: ${errors.length} markets`);
//     console.log(`💰 System paid all gas fees for AI markets`);

//     return {
//       success: createdMarkets.length > 0,
//       createdMarkets,
//       errors,
//     };
//   }

//   // ===== WALLET INFO =====
//   getAutomatedWalletInfo() {
//     return {
//       address: this.automatedAccount.address,
//       purpose: 'AI-generated market creation only',
//     };
//   }
// }

// export const blockchainService = new BlockchainService();



// src/services/blockchain/service.ts - COMPLETELY FIXED VERSION
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

    console.log('🔧 Blockchain service initialized');
    console.log('🤖 Automated wallet:', this.automatedAccount.address);
    console.log('👤 Manual markets use user wallet via wagmi');
  }

  // ===== MANUAL MARKET CREATION (USER PAYS VIA WAGMI) =====
  async createMarketManually(
    userAccount: Address,
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

  // ===== AI-GENERATED MARKET CREATION (AUTOMATED WALLET PAYS) =====
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

      // ✅ FIXED: Reduced initial liquidity to minimum amount
      const initialLiquidity = parseEther('0.001'); // Minimum required amount

      console.log('💰 AI Market funding:');
      console.log(`  - System liquidity: ${formatEther(initialLiquidity)} ETH`);
      console.log(`  - Funded by: ${this.automatedAccount.address}`);

      // ✅ Use automated wallet directly with better error handling
      try {
        console.log('🔍 Simulating contract call...');
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
          gas: BigInt(300000), // ✅ Reduced gas limit
        });

        console.log('📡 Sending transaction with AUTOMATED WALLET...');
        const txHash = await this.automatedWalletClient.writeContract(request);
        
        console.log('⏳ Waiting for confirmation...', txHash);
        const receipt = await this.publicClient.waitForTransactionReceipt({ 
          hash: txHash,
          timeout: 60000 // 1 minute timeout
        });
        
        if (receipt.status === 'success') {
          const marketCounter = await this.getMarketCounter();
          const marketId = Number(marketCounter) - 1;
          
          console.log('✅ AI market created successfully!');
          console.log('📊 Market ID:', marketId);
          console.log('🏦 System paid all gas fees');
          
          return {
            success: true,
            marketId,
            txHash,
          };
        } else {
          throw new Error(`Transaction failed with status: ${receipt.status}`);
        }
      } catch (contractError: any) {
        console.error('❌ Contract interaction failed:', contractError);
        
        // ✅ Better error analysis
        if (contractError.message?.includes('execution reverted')) {
          // Check if it's an authorization issue
          const owner = await this.publicClient.readContract({
            address: CONTRACT_ADDRESSES.PREDICTION_MARKET_FACTORY as Address,
            abi: PREDICTION_MARKET_FACTORY_ABI,
            functionName: 'owner',
          });
          
          console.log('🔍 Contract owner:', owner);
          console.log('🤖 Automated wallet:', this.automatedAccount.address);
          
          if (owner.toLowerCase() !== this.automatedAccount.address.toLowerCase()) {
            throw new Error(`Automated wallet not authorized. Contract owner: ${owner}, Automated wallet: ${this.automatedAccount.address}`);
          }
        }
        
        throw contractError;
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

  // ===== BETTING (ALWAYS USER PAYS VIA WAGMI) =====
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

  // ===== AI INTEGRATION (AUTOMATED WALLET) =====
  async createAIGeneratedMarkets(aiPredictions: any[]): Promise<{
    success: boolean;
    createdMarkets: number[];
    errors: string[];
  }> {
    console.log('🤖 Creating AI-generated markets with AUTOMATED WALLET...');
    console.log('🏦 System pays ALL gas fees for AI markets');
    
    const createdMarkets: number[] = [];
    const errors: string[] = [];

    // ✅ FIXED: Create only 2 markets as requested, with better error handling
    const marketsToCreate = aiPredictions.slice(0, 2);

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
          console.log('⏳ Waiting 3 seconds before next creation...');
          await new Promise(resolve => setTimeout(resolve, 3000));
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
      if (parseFloat(balance) < 0.01) {
        console.warn('⚠️ Automated wallet has low balance:', balance, 'ETH');
        return false;
      }

      // Check ownership
      const ownership = await this.verifyContractOwnership();
      if (!ownership.isOwner) {
        console.error('❌ Automated wallet is not contract owner');
        return false;
      }

      console.log('✅ Automated wallet connection test passed');
      return true;
    } catch (error) {
      console.error('❌ Automated wallet connection test failed:', error);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();