
import { CONTRACT_ADDRESSES, PREDICTION_NFT_ABI } from '@/constants/contracts';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface MintNFTData {
  marketId: number;
  question: string;
  outcome: boolean;
  correct: boolean;
  userAddress: `0x${string}`;
  betAmount?: number;
  odds?: number;
}

class ZoraNFTService {
  
  async mintPredictionNFT(data: MintNFTData): Promise<{
    success: boolean;
    tokenId?: number;
    txHash?: string;
    error?: string;
  }> {
    try {
      console.log('🎨 Minting prediction NFT on Zora...');
      
      // Generate metadata
      const metadata = this.generateNFTMetadata(data);
      const tokenURI = await this.uploadMetadata(metadata);
      
      // Mint NFT via smart contract
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.PREDICTION_NFT as `0x${string}`,
        abi: PREDICTION_NFT_ABI,
        functionName: 'mintPredictionNFT',
        args: [
          data.userAddress,
          BigInt(data.marketId),
          data.question,
          data.outcome,
          data.correct,
          tokenURI,
        ],
      });
      
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      
      if (receipt.status === 'success') {
        console.log('✅ NFT minted successfully!');
        return {
          success: true,
          txHash: hash,
          // Extract tokenId from logs if needed
        };
      } else {
        throw new Error('Minting transaction failed');
      }
      
    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint NFT',
      };
    }
  }
  
  private generateNFTMetadata(data: MintNFTData): NFTMetadata {
    const status = data.correct ? 'Correct' : 'Incorrect';
    const outcome = data.outcome ? 'YES' : 'NO';
    
    return {
      name: `ForesightCast Prediction #${data.marketId}`,
      description: `${status} prediction: "${data.question}" - Predicted: ${outcome}`,
      image: this.generateNFTImage(data),
      attributes: [
        { trait_type: 'Market ID', value: data.marketId },
        { trait_type: 'Prediction', value: outcome },
        { trait_type: 'Result', value: status },
        { trait_type: 'Category', value: 'Prediction' },
        { trait_type: 'Platform', value: 'ForesightCast' },
        ...(data.betAmount ? [{ trait_type: 'Bet Amount', value: `${data.betAmount} ETH` }] : []),
        ...(data.odds ? [{ trait_type: 'Odds', value: `${data.odds}%` }] : []),
      ],
    };
  }
  
  private generateNFTImage(data: MintNFTData): string {
    // Generate dynamic NFT image URL
    const params = new URLSearchParams({
      question: data.question.substring(0, 100),
      outcome: data.outcome ? 'YES' : 'NO',
      correct: data.correct.toString(),
      marketId: data.marketId.toString(),
    });
    
    return `https://api.foresightcast.app/nft-image?${params}`;
  }
  
  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    // For demo, return IPFS-style URL
    // In production, upload to IPFS or Arweave
    const jsonString = JSON.stringify(metadata);
    const hash = btoa(jsonString).substring(0, 32);
    return `ipfs://QmDemo${hash}`;
  }
  
  async getUserNFTs(_userAddress: string): Promise<any[]> {
    try {
      // Get user's NFT balance
      
      const nfts: any[] = [];
      // In a real implementation, you'd iterate through owned tokens
      // This is a simplified version
      
      return nfts;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }
}

export const zoraNFTService = new ZoraNFTService();