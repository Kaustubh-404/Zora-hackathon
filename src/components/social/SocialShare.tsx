
import { Twitter, Link, MessageCircle, Share2 } from 'lucide-react';

interface SocialShareProps {
  prediction: {
    question: string;
    outcome: boolean;
    confidence?: number;
    marketId?: number;
  };
  result?: {
    correct: boolean;
    winAmount?: number;
  };
}

export function SocialShare({ prediction, result }: SocialShareProps) {
  const generateShareText = () => {
    const outcome = prediction.outcome ? 'YES' : 'NO';
    const baseText = `I predicted ${outcome} on: "${prediction.question}"`;
    
    if (result) {
      if (result.correct) {
        const winText = result.winAmount ? ` and won ${result.winAmount} ETH` : '';
        return `${baseText} - I was RIGHT!${winText} 🎯`;
      } else {
        return `${baseText} - I was wrong this time 📊`;
      }
    }
    
    return `${baseText} on @ForesightCast 🔮`;
  };
  
  const shareUrl = `https://foresightcast.app/market/${prediction.marketId}`;
  const shareText = generateShareText();
  
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  const handleFarcasterShare = () => {
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show toast notification
      console.log('Link copied!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ForesightCast Prediction',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Share Your Prediction
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">{shareText}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleTwitterShare}
          className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Twitter className="w-4 h-4" />
          <span>Twitter</span>
        </button>
        
        <button
          onClick={handleFarcasterShare}
          className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Farcaster</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Link className="w-4 h-4" />
          <span>Copy Link</span>
        </button>
        
        {navigator && (
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  );
}