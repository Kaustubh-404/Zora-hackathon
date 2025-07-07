import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { zoraNFTService } from '@/services/nft/zoraService';
import { Trophy, ExternalLink, Share2 } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';

interface NFTGalleryProps {
  userAddress?: `0x${string}`;
}

export function NFTGallery({ userAddress }: NFTGalleryProps) {
  const { user } = usePrivy();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const targetAddress = userAddress || user?.wallet?.address as  `0x${string}`;
  
  useEffect(() => {
    if (targetAddress) {
      loadUserNFTs();
    }
  }, [targetAddress]);
  
  const loadUserNFTs = async () => {
    if (!targetAddress) return;
    
    setLoading(true);
    try {
      const userNFTs = await zoraNFTService.getUserNFTs(targetAddress);
      setNfts(userNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = (nft: any) => {
    if (navigator.share) {
      navigator.share({
        title: nft.name,
        text: nft.description,
        url: window.location.href,
      });
    }
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Prediction NFTs Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Make successful predictions to earn collectible NFTs!
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
          Start Predicting
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Your Prediction NFTs ({nfts.length})
        </h2>
        <button
          onClick={loadUserNFTs}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <motion.div
            key={nft.tokenId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200"
          >
            <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-500 rounded-t-lg p-6 flex items-center justify-center">
              <div className="text-center text-white">
                <Trophy className="w-12 h-12 mx-auto mb-3" />
                <div className="text-2xl font-bold">
                  {nft.attributes.find((a: { trait_type: string; }) => a.trait_type === 'Prediction')?.value}
                </div>
                <div className="text-sm opacity-90">
                  {nft.attributes.find((a: { trait_type: string; }) => a.trait_type === 'Result')?.value}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {nft.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {nft.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {nft.attributes.slice(0, 3).map((attr: any) => (
                  <span
                    key={attr.trait_type}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleShare(nft)}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                <a
                  href={`https://sepolia.explorer.zora.energy/token/${CONTRACT_ADDRESSES.PREDICTION_NFT}/${nft.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}