// import  { useState, useCallback } from 'react';
// import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

// interface SwipeCardProps {
//   prediction: any;
//   onSwipe: (direction: 'left' | 'right', prediction: any) => void;
//   isTop: boolean;
// }

// function SwipeCard({ prediction, onSwipe, isTop }: SwipeCardProps) {
//   const x = useMotionValue(0);
//   const rotate = useTransform(x, [-200, 200], [-15, 15]);
//   const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

//   const handleDragEnd = (event: any, info: PanInfo) => {
//     const threshold = 100;
//     if (info.offset.x > threshold) {
//       onSwipe('right', prediction); // Want to bet
//     } else if (info.offset.x < -threshold) {
//       onSwipe('left', prediction); // Skip
//     }
//   };

//   return (
//     <motion.div
//       className={`absolute inset-0 ${isTop ? 'z-10' : 'z-0'}`}
//       style={{ x, rotate, opacity }}
//       drag="x"
//       dragConstraints={{ left: 0, right: 0 }}
//       onDragEnd={handleDragEnd}
//       whileDrag={{ scale: 1.05 }}
//       initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
//       animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
//     >
//       <div className="swipe-card h-full">
//         <div className="prediction-card h-full flex flex-col">
//           {/* Category Badge */}
//           <div className="flex justify-between items-center mb-4">
//             <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
//               {prediction.category}
//             </span>
//             <span className="text-xs text-gray-400">
//               Ends: {new Date(prediction.endTime).toLocaleDateString()}
//             </span>
//           </div>

//           {/* Question */}
//           <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
//             {prediction.question}
//           </h2>

//           {/* Description */}
//           <p className="text-gray-600 text-sm mb-4 flex-1">
//             {prediction.description}
//           </p>

//           {/* Resolution Criteria */}
//           <div className="bg-gray-50 rounded-lg p-3 mb-4">
//             <p className="text-xs font-medium text-gray-700 mb-1">Resolution Criteria:</p>
//             <p className="text-xs text-gray-600">{prediction.resolutionCriteria}</p>
//           </div>

//           {/* Tags */}
//           {prediction.tags.length > 0 && (
//             <div className="flex flex-wrap gap-1 mb-4">
//               {prediction.tags.map((tag: string) => (
//                 <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
//                   #{tag}
//                 </span>
//               ))}
//             </div>
//           )}

//           {/* Current Odds */}
//           <div className="flex justify-between items-center pt-3 border-t">
//             <div className="text-center">
//               <div className="text-lg font-bold text-green-600">{prediction.outcomes.yes}%</div>
//               <div className="text-xs text-gray-500">YES</div>
//             </div>
//             <div className="text-center">
//               <div className="text-lg font-bold text-red-600">{prediction.outcomes.no}%</div>
//               <div className="text-xs text-gray-500">NO</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Swipe Indicators */}
//       <motion.div
//         className="absolute top-8 left-8 bg-blue-500 text-white px-4 py-2 rounded-full font-bold transform rotate-[-20deg]"
//         style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
//       >
//         BET!
//       </motion.div>
//       <motion.div
//         className="absolute top-8 right-8 bg-gray-500 text-white px-4 py-2 rounded-full font-bold transform rotate-[20deg]"
//         style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
//       >
//         SKIP
//       </motion.div>
//     </motion.div>
//   );
// }

// // Betting Modal Component
// interface BettingModalProps {
//   prediction: any;
//   isOpen: boolean;
//   onClose: () => void;
//   onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
// }

// function BettingModal({ prediction, isOpen, onClose, onBet }: BettingModalProps) {
//   const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
//   const [betAmount, setBetAmount] = useState('0.001');

//   if (!isOpen) return null;

//   const handleBet = () => {
//     if (selectedOutcome) {
//       onBet(prediction, selectedOutcome, parseFloat(betAmount));
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl p-6 max-w-md w-full">
//         <h3 className="text-lg font-bold mb-4">Place Your Bet</h3>
        
//         <div className="mb-4">
//           <p className="text-sm text-gray-600 mb-2">{prediction.question}</p>
//         </div>

//         {/* Outcome Selection */}
//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <button
//             onClick={() => setSelectedOutcome('yes')}
//             className={`p-4 rounded-lg border-2 transition-colors ${
//               selectedOutcome === 'yes'
//                 ? 'border-green-500 bg-green-50 text-green-700'
//                 : 'border-gray-200 hover:border-green-300'
//             }`}
//           >
//             <div className="text-center">
//               <div className="text-xl font-bold">YES</div>
//               <div className="text-sm">{prediction.outcomes.yes}% odds</div>
//             </div>
//           </button>
          
//           <button
//             onClick={() => setSelectedOutcome('no')}
//             className={`p-4 rounded-lg border-2 transition-colors ${
//               selectedOutcome === 'no'
//                 ? 'border-red-500 bg-red-50 text-red-700'
//                 : 'border-gray-200 hover:border-red-300'
//             }`}
//           >
//             <div className="text-center">
//               <div className="text-xl font-bold">NO</div>
//               <div className="text-sm">{prediction.outcomes.no}% odds</div>
//             </div>
//           </button>
//         </div>

//         {/* Bet Amount */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-2">Bet Amount (ETH)</label>
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(e.target.value)}
//             step="0.001"
//             min="0.001"
//             className="w-full border rounded-lg px-3 py-2"
//             placeholder="0.001"
//           />
//         </div>

//         {/* Potential Payout */}
//         {selectedOutcome && (
//           <div className="bg-blue-50 rounded-lg p-3 mb-4">
//             <p className="text-sm text-blue-800">
//               Potential payout: ~{(parseFloat(betAmount) * (selectedOutcome === 'yes' ? 100/prediction.outcomes.yes : 100/prediction.outcomes.no)).toFixed(4)} ETH
//             </p>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="flex space-x-3">
//           <button
//             onClick={onClose}
//             className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleBet}
//             disabled={!selectedOutcome}
//             className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             Place Bet
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface SwipeInterfaceProps {
//   predictions: any[];
//   onSkip: (prediction: any) => void;
//   onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
//   onNeedMore: () => void;
// }

// export function SwipeInterface({ predictions, onSkip, onBet, onNeedMore }: SwipeInterfaceProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showBettingModal, setShowBettingModal] = useState(false);
//   const [selectedPrediction, setSelectedPrediction] = useState<any>(null);

//   const handleSwipe = useCallback((direction: 'left' | 'right', prediction: any) => {
//     if (direction === 'right') {
//       // User wants to bet - show betting modal
//       setSelectedPrediction(prediction);
//       setShowBettingModal(true);
//     } else {
//       // User wants to skip
//       onSkip(prediction);
//       setCurrentIndex(prev => prev + 1);
//     }
    
//     // Load more predictions when running low
//     if (currentIndex >= predictions.length - 2) {
//       onNeedMore();
//     }
//   }, [currentIndex, predictions.length, onSkip, onNeedMore]);

//   const handleBet = (prediction: any, outcome: 'yes' | 'no', amount: number) => {
//     onBet(prediction, outcome, amount);
//     setCurrentIndex(prev => prev + 1);
//     setShowBettingModal(false);
//     setSelectedPrediction(null);
//   };

//   const handleButtonSwipe = (direction: 'left' | 'right') => {
//     if (currentIndex < predictions.length) {
//       handleSwipe(direction, predictions[currentIndex]);
//     }
//   };

//   const visiblePredictions = predictions.slice(currentIndex, currentIndex + 2);

//   if (predictions.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">No predictions available</p>
//           <button onClick={onNeedMore} className="btn-primary">
//             Generate Predictions
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (currentIndex >= predictions.length) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">All predictions reviewed!</p>
//           <button onClick={onNeedMore} className="btn-primary">
//             Get More Predictions
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="max-w-md mx-auto">
//         {/* Instructions */}
//         <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
//           <p className="text-sm text-blue-800">
//             <span className="font-medium">Swipe Right</span> to bet • <span className="font-medium">Swipe Left</span> to skip
//           </p>
//         </div>

//         {/* Card Stack Container */}
//         <div className="relative h-96 mb-6">
//           {visiblePredictions.map((prediction, index) => (
//             <SwipeCard
//               key={prediction.id}
//               prediction={prediction}
//               onSwipe={handleSwipe}
//               isTop={index === 0}
//             />
//           ))}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-center space-x-8">
//           <button
//             onClick={() => handleButtonSwipe('left')}
//             className="bg-gray-500 hover:bg-gray-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors"
//             disabled={currentIndex >= predictions.length}
//             title="Skip this prediction"
//           >
//             ⏭️
//           </button>
//           <button
//             onClick={() => handleButtonSwipe('right')}
//             className="bg-blue-500 hover:bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors"
//             disabled={currentIndex >= predictions.length}
//             title="Place a bet on this prediction"
//           >
//             💰
//           </button>
//         </div>

//         {/* Progress */}
//         <div className="mt-4 text-center text-sm text-gray-500">
//           {currentIndex + 1} of {predictions.length} predictions
//         </div>
//       </div>

//       {/* Betting Modal */}
//       <BettingModal
//         prediction={selectedPrediction}
//         isOpen={showBettingModal}
//         onClose={() => {
//           setShowBettingModal(false);
//           setSelectedPrediction(null);
//           setCurrentIndex(prev => prev + 1); // Move to next prediction when cancelled
//         }}
//         onBet={handleBet}
//       />
//     </>
//   );
// }


import React, { useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  prediction: any;
  onSwipe: (direction: 'left' | 'right', prediction: any) => void;
  isTop: boolean;
}

function SwipeCard({ prediction, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', prediction); // Want to bet
    } else if (info.offset.x < -threshold) {
      onSwipe('left', prediction); // Skip
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = 'text-sm font-medium px-3 py-1 rounded-full';
    switch (category.toLowerCase()) {
      case 'crypto':
        return `${baseClass} bg-orange-100 text-orange-800`;
      case 'tech':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'sports':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'politics':
        return `${baseClass} bg-purple-100 text-purple-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'z-10' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
    >
      <div className="swipe-card h-full">
        <div className="prediction-card h-full flex flex-col">
          {/* Category Badge and End Time */}
          <div className="flex justify-between items-center mb-4">
            <span className={getCategoryBadgeClass(prediction.category)}>
              {prediction.category}
            </span>
            <span className="text-xs text-gray-400">
              Ends: {new Date(prediction.endTime).toLocaleDateString()}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
            {prediction.question}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
            {prediction.description}
          </p>

          {/* Resolution Criteria */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-700 mb-1">Resolution Criteria:</p>
            <p className="text-xs text-gray-600 line-clamp-2">{prediction.resolutionCriteria}</p>
          </div>

          {/* Tags */}
          {prediction.tags && prediction.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {prediction.tags.slice(0, 4).map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Current Odds and Liquidity */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{prediction.outcomes.yes}%</div>
              <div className="text-xs text-gray-500">YES</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{prediction.outcomes.no}%</div>
              <div className="text-xs text-gray-500">NO</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">
                {prediction.totalLiquidity ? `${prediction.totalLiquidity.toFixed(2)} ETH` : '0 ETH'}
              </div>
              <div className="text-xs text-gray-500">LIQUIDITY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-8 left-8 bg-blue-500 text-white px-4 py-2 rounded-full font-bold transform rotate-[-20deg]"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        BET!
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 bg-gray-500 text-white px-4 py-2 rounded-full font-bold transform rotate-[20deg]"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        SKIP
      </motion.div>
    </motion.div>
  );
}

// Betting Modal Component
interface BettingModalProps {
  prediction: any;
  isOpen: boolean;
  onClose: () => void;
  onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
}

function BettingModal({ prediction, isOpen, onClose, onBet }: BettingModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('0.001');

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(null);
      setBetAmount('0.001');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBet = () => {
    if (selectedOutcome && parseFloat(betAmount) >= 0.001) {
      onBet(prediction, selectedOutcome, parseFloat(betAmount));
      onClose();
    }
  };

  const calculatePayout = (): string => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return '0.0000';
    const odds = selectedOutcome === 'yes' ? prediction.outcomes.yes : prediction.outcomes.no;
    if (odds <= 0) return '0.0000';
    return (parseFloat(betAmount) * (100 / odds)).toFixed(4);
  };

  return (
    <div className="betting-modal-overlay" onClick={onClose}>
      <div className="betting-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Place Your Bet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{prediction.question}</p>
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {prediction.category}
          </span>
        </div>

        {/* Outcome Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setSelectedOutcome('yes')}
            className={`outcome-button yes ${selectedOutcome === 'yes' ? 'selected' : ''}`}
          >
            <div className="text-center">
              <div className="text-xl font-bold">YES</div>
              <div className="text-sm">{prediction.outcomes.yes}% odds</div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedOutcome('no')}
            className={`outcome-button no ${selectedOutcome === 'no' ? 'selected' : ''}`}
          >
            <div className="text-center">
              <div className="text-xl font-bold">NO</div>
              <div className="text-sm">{prediction.outcomes.no}% odds</div>
            </div>
          </button>
        </div>

        {/* Bet Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Bet Amount (ETH)</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            step="0.001"
            min="0.001"
            max="1.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.001"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min: 0.001 ETH</span>
            <span>Max: 1.0 ETH</span>
          </div>
        </div>

        {/* Potential Payout */}
        {selectedOutcome && parseFloat(betAmount) > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-800">Potential payout:</span>
              <span className="font-bold text-blue-900">~{calculatePayout()} ETH</span>
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>If {selectedOutcome.toUpperCase()} wins</span>
              <span>Profit: +{(parseFloat(calculatePayout()) - parseFloat(betAmount)).toFixed(4)} ETH</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBet}
            disabled={!selectedOutcome || parseFloat(betAmount) < 0.001}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Bet
          </button>
        </div>
      </div>
    </div>
  );
}

interface SwipeInterfaceProps {
  predictions: any[];
  onSkip: (prediction: any) => void;
  onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
  onNeedMore: () => void;
}

export function SwipeInterface({ predictions, onSkip, onBet, onNeedMore }: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);

  const handleSwipe = useCallback((direction: 'left' | 'right', prediction: any) => {
    if (direction === 'right') {
      // User wants to bet - show betting modal
      setSelectedPrediction(prediction);
      setShowBettingModal(true);
    } else {
      // User wants to skip
      onSkip(prediction);
      setCurrentIndex(prev => prev + 1);
    }
    
    // Load more predictions when running low
    if (currentIndex >= predictions.length - 2) {
      onNeedMore();
    }
  }, [currentIndex, predictions.length, onSkip, onNeedMore]);

  const handleBet = (prediction: any, outcome: 'yes' | 'no', amount: number) => {
    onBet(prediction, outcome, amount);
    setCurrentIndex(prev => prev + 1);
    setShowBettingModal(false);
    setSelectedPrediction(null);
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (currentIndex < predictions.length) {
      handleSwipe(direction, predictions[currentIndex]);
    }
  };

  const handleModalClose = () => {
    setShowBettingModal(false);
    setSelectedPrediction(null);
    setCurrentIndex(prev => prev + 1); // Move to next prediction when cancelled
  };

  const visiblePredictions = predictions.slice(currentIndex, currentIndex + 2);

  if (predictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500 mb-4 font-medium">No predictions available</p>
          <p className="text-gray-400 text-sm mb-6">Check back later for new markets</p>
          <button 
            onClick={onNeedMore} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Markets
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= predictions.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-gray-700 font-medium mb-2">All predictions reviewed!</p>
          <p className="text-gray-500 text-sm mb-6">
            You've seen all available predictions. Great job exploring the markets!
          </p>
          <button 
            onClick={onNeedMore} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get More Predictions
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto">
        {/* Instructions */}
        <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">👉 Swipe Right</span> to bet • <span className="font-medium">👈 Swipe Left</span> to skip
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Or use the buttons below
          </p>
        </div>

        {/* Card Stack Container */}
        <div className="card-stack relative h-96 mb-6">
          {visiblePredictions.map((prediction, index) => (
            <SwipeCard
              key={prediction.id}
              prediction={prediction}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-8 mb-4">
          <button
            onClick={() => handleButtonSwipe('left')}
            className="swipe-action-button skip"
            disabled={currentIndex >= predictions.length}
            title="Skip this prediction"
          >
            <span className="text-xl">⏭️</span>
          </button>
          <button
            onClick={() => handleButtonSwipe('right')}
            className="swipe-action-button bet"
            disabled={currentIndex >= predictions.length}
            title="Place a bet on this prediction"
          >
            <span className="text-xl">💰</span>
          </button>
        </div>

        {/* Progress and Stats */}
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{currentIndex + 1}</span> of <span className="font-medium">{predictions.length}</span> predictions
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((currentIndex + 1) / predictions.length) * 100, 100)}%` }}
            ></div>
          </div>
          
          {predictions.length > 0 && (
            <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-2">
              <span>Category: {predictions[currentIndex]?.category}</span>
              <span>•</span>
              <span>Liquidity: {predictions[currentIndex]?.totalLiquidity?.toFixed(2) || '0'} ETH</span>
            </div>
          )}
        </div>
      </div>

      {/* Betting Modal */}
      <BettingModal
        prediction={selectedPrediction}
        isOpen={showBettingModal}
        onClose={handleModalClose}
        onBet={handleBet}
      />
    </>
  );
}