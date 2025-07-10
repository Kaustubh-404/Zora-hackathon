// src/services/coins/coinsService.ts
import { 
  createCoin, 
  tradeCoin, 
  getCoin, 
  setApiKey,
  createMetadataBuilder,
  createZoraUploaderForCreator,
  DeployCurrency,
  TradeParameters,
  InitialPurchaseCurrency
} from '@zoralabs/coins-sdk';
import { createPublicClient, createWalletClient, http, parseEther, formatEther, Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { COIN_TYPES, COIN_METADATA, CoinType, CoinBalance, CoinEarning } from '@/constants/coins';
import { API_CONFIG } from '@/constants/config';

interface CoinCreationResult {
  success: boolean;
  coinAddress?: Address;
  transactionHash?: string;
  error?: string;
}

interface CoinTradeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class CoinsService {
  private publicClient;
  private isInitialized = false;

  constructor() {
    // Initialize Zora Coins SDK
    if (API_CONFIG.zora?.apiKey) {
      setApiKey(API_CONFIG.zora.apiKey);
    }

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🪙 Initializing Zora Coins Service...');
      this.isInitialized = true;
      console.log('✅ Zora Coins Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Zora Coins Service:', error);
      throw error;
    }
  }

  // Create a new coin for user achievements
  async createCoinForUser(
    userAddress: Address,
    coinType: CoinType,
    walletClient: any
  ): Promise<CoinCreationResult> {
    try {
      await this.initialize();
      
      console.log(`🪙 Creating ${coinType} coin for user...`);
      
      const metadata = COIN_METADATA[coinType];
      
      // Create metadata using Zora's metadata builder
      const { createMetadataParameters } = await createMetadataBuilder()
        .withName(metadata.name)
        .withSymbol(metadata.symbol)
        .withDescription(metadata.description)
        .withImage(await this.createCoinImage(coinType))
        .upload(createZoraUploaderForCreator(userAddress));

      // Create coin with initial liquidity
      const coinParams = {
        ...createMetadataParameters,
        payoutRecipient: userAddress,
        platformReferrer: userAddress, // User earns from their own coin trades
        currency: DeployCurrency.ZORA, // Use ZORA as base currency
        initialPurchase: {
          currency: InitialPurchaseCurrency.ETH,
          amount: parseEther('0.01'), // Small initial purchase
        },
      };

      const result = await createCoin(coinParams, walletClient, this.publicClient);
      
      console.log(`✅ ${coinType} coin created successfully!`);
      console.log('📍 Coin address:', result.address);
      console.log('🔗 Transaction hash:', result.hash);
      
      return {
        success: true,
        coinAddress: result.address,
        transactionHash: result.hash,
      };
      
    } catch (error) {
      console.error(`❌ Error creating ${coinType} coin:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Mint reward coins for successful predictions
  async mintRewardCoins(
    userAddress: Address,
    coinType: CoinType,
    amount: number,
    walletClient: any
  ): Promise<CoinCreationResult> {
    try {
      await this.initialize();
      
      console.log(`🎯 Minting ${amount} ${coinType} reward coins...`);
      
      // In a real implementation, this would interact with a minting contract
      // For now, we'll simulate by creating a small trade to mint coins
      const tradeParams: TradeParameters = {
        sell: { type: "eth" },
        buy: { 
          type: "erc20", 
          address: await this.getCoinAddress(coinType) 
        },
        amountIn: parseEther('0.001'), // Small amount to mint rewards
        slippage: 0.05,
        sender: userAddress,
      };

      const result = await tradeCoin({
        tradeParameters: tradeParams,
        walletClient,
        account: walletClient.account,
        publicClient: this.publicClient,
      });
      
      console.log(`✅ Reward coins minted successfully!`);
      return {
        success: true,
        transactionHash: result.hash,
      };
      
    } catch (error) {
      console.error(`❌ Error minting ${coinType} reward coins:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Trade coins on Uniswap V4
  async tradeCoin(
    fromCoinType: CoinType | 'ETH',
    toCoinType: CoinType | 'ETH',
    amount: string,
    userAddress: Address,
    walletClient: any
  ): Promise<CoinTradeResult> {
    try {
      await this.initialize();
      
      console.log(`🔄 Trading ${amount} ${fromCoinType} → ${toCoinType}...`);
      
      const tradeParams: TradeParameters = {
        sell: fromCoinType === 'ETH' 
          ? { type: "eth" }
          : { type: "erc20", address: await this.getCoinAddress(fromCoinType) },
        buy: toCoinType === 'ETH'
          ? { type: "eth" }
          : { type: "erc20", address: await this.getCoinAddress(toCoinType) },
        amountIn: parseEther(amount),
        slippage: 0.05, // 5% slippage tolerance
        sender: userAddress,
      };

      const result = await tradeCoin({
        tradeParameters: tradeParams,
        walletClient,
        account: walletClient.account,
        publicClient: this.publicClient,
      });
      
      console.log(`✅ Trade completed successfully!`);
      return {
        success: true,
        transactionHash: result.hash,
      };
      
    } catch (error) {
      console.error(`❌ Error trading ${fromCoinType} → ${toCoinType}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get user's coin balances
  async getUserCoinBalances(userAddress: Address): Promise<CoinBalance[]> {
    try {
      await this.initialize();
      
      console.log('💰 Fetching user coin balances...');
      
      const balances: CoinBalance[] = [];
      
      // Get balances for each coin type
      for (const coinType of Object.values(COIN_TYPES)) {
        try {
          const coinAddress = await this.getCoinAddress(coinType);
          const balance = await this.getCoinBalance(userAddress, coinAddress);
          const metadata = COIN_METADATA[coinType];
          
          balances.push({
            coinType,
            balance,
            coinAddress,
            symbol: metadata.symbol,
            name: metadata.name,
            decimals: 18, // Standard ERC20 decimals
            priceUSD: await this.getCoinPriceUSD(coinAddress),
          });
        } catch (error) {
          console.warn(`Failed to fetch balance for ${coinType}:`, error);
        }
      }
      
      return balances;
      
    } catch (error) {
      console.error('❌ Error fetching user coin balances:', error);
      return [];
    }
  }

  // Get coin information
  async getCoinInfo(coinType: CoinType) {
    try {
      const coinAddress = await this.getCoinAddress(coinType);
      const coinInfo = await getCoin({
        address: coinAddress,
        chain: baseSepolia.id,
      });
      
      return coinInfo;
    } catch (error) {
      console.error(`❌ Error getting ${coinType} coin info:`, error);
      return null;
    }
  }

  // Helper method to get coin address (in real implementation, this would be stored/cached)
  private async getCoinAddress(coinType: CoinType): Promise<Address> {
    // In a real implementation, these addresses would be stored after coin creation
    // For now, return mock addresses - these would be real addresses after deployment
    const coinAddresses: Record<CoinType, Address> = {
      [COIN_TYPES.ACCURACY]: '0x1234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.STREAK]: '0x2234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.ORACLE]: '0x3234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.COMMUNITY]: '0x4234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.RISK]: '0x5234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.CRYPTO_MASTER]: '0x6234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.TECH_MASTER]: '0x7234567890123456789012345678901234567890' as Address,
      [COIN_TYPES.SPORTS_MASTER]: '0x8234567890123456789012345678901234567890' as Address,
    };
    
    return coinAddresses[coinType];
  }

  // Helper method to get coin balance
  private async getCoinBalance(userAddress: Address, coinAddress: Address): Promise<bigint> {
    try {
      // Read ERC20 balance
      const balance = await this.publicClient.readContract({
        address: coinAddress,
        abi: [
          {
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'balanceOf',
        args: [userAddress],
      });
      
      return balance as bigint;
    } catch (error) {
      console.warn(`Failed to fetch balance for ${coinAddress}:`, error);
      return BigInt(0);
    }
  }

  // Helper method to get coin price in USD
  private async getCoinPriceUSD(coinAddress: Address): Promise<number> {
    try {
      // In a real implementation, this would fetch from price oracles
      // For now, return mock prices
      return Math.random() * 100; // $0-100 range
    } catch (error) {
      console.warn(`Failed to fetch price for ${coinAddress}:`, error);
      return 0;
    }
  }

  // Helper method to create coin image
  private async createCoinImage(coinType: CoinType): Promise<File> {
    // In a real implementation, this would generate or fetch actual images
    // For now, create a simple placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    
    // Draw coin background
    const metadata = COIN_METADATA[coinType];
    ctx.fillStyle = metadata.color;
    ctx.fillRect(0, 0, 200, 200);
    
    // Draw coin symbol
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(metadata.symbol, 100, 120);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], `${coinType}-coin.png`, { type: 'image/png' }));
      }, 'image/png');
    });
  }

  // Get coin statistics
  async getCoinStats(coinType: CoinType) {
    try {
      const coinInfo = await this.getCoinInfo(coinType);
      
      if (!coinInfo?.data?.zora20Token) {
        return null;
      }
      
      const token = coinInfo.data.zora20Token;
      
      return {
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.totalSupply,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        holders: token.uniqueHolders,
       
      };
    } catch (error) {
      console.error(`❌ Error getting ${coinType} stats:`, error);
      return null;
    }
  }

  // Check if user has sufficient coins for a trade
  async checkTradingEligibility(
    userAddress: Address,
    coinType: CoinType,
    amount: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const coinAddress = await this.getCoinAddress(coinType);
      const balance = await this.getCoinBalance(userAddress, coinAddress);
      const requiredAmount = parseEther(amount);
      
      if (balance < requiredAmount) {
        return {
          eligible: false,
          reason: `Insufficient ${coinType} balance. Required: ${formatEther(requiredAmount)}, Available: ${formatEther(balance)}`,
        };
      }
      
      return { eligible: true };
    } catch (error) {
      console.error('❌ Error checking trading eligibility:', error);
      return {
        eligible: false,
        reason: 'Error checking balance',
      };
    }
  }
}

export const coinsService = new CoinsService();