
// import React, { useState, useCallback } from 'react';
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

//   const getCategoryBadgeClass = (category: string) => {
//     const baseClass = 'text-sm font-medium px-3 py-1 rounded-full';
//     switch (category.toLowerCase()) {
//       case 'crypto':
//         return `${baseClass} bg-orange-100 text-orange-800`;
//       case 'tech':
//         return `${baseClass} bg-blue-100 text-blue-800`;
//       case 'sports':
//         return `${baseClass} bg-green-100 text-green-800`;
//       case 'politics':
//         return `${baseClass} bg-purple-100 text-purple-800`;
//       default:
//         return `${baseClass} bg-gray-100 text-gray-800`;
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
//           {/* Category Badge and End Time */}
//           <div className="flex justify-between items-center mb-4">
//             <span className={getCategoryBadgeClass(prediction.category)}>
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
//           <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
//             {prediction.description}
//           </p>

//           {/* Resolution Criteria */}
//           <div className="bg-gray-50 rounded-lg p-3 mb-4">
//             <p className="text-xs font-medium text-gray-700 mb-1">Resolution Criteria:</p>
//             <p className="text-xs text-gray-600 line-clamp-2">{prediction.resolutionCriteria}</p>
//           </div>

//           {/* Tags */}
//           {prediction.tags && prediction.tags.length > 0 && (
//             <div className="flex flex-wrap gap-1 mb-4">
//               {prediction.tags.slice(0, 4).map((tag: string) => (
//                 <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
//                   #{tag}
//                 </span>
//               ))}
//             </div>
//           )}

//           {/* Current Odds and Liquidity */}
//           <div className="grid grid-cols-3 gap-3 pt-3 border-t">
//             <div className="text-center">
//               <div className="text-lg font-bold text-green-600">{prediction.outcomes.yes}%</div>
//               <div className="text-xs text-gray-500">YES</div>
//             </div>
//             <div className="text-center">
//               <div className="text-lg font-bold text-red-600">{prediction.outcomes.no}%</div>
//               <div className="text-xs text-gray-500">NO</div>
//             </div>
//             <div className="text-center">
//               <div className="text-sm font-bold text-blue-600">
//                 {prediction.totalLiquidity ? `${prediction.totalLiquidity.toFixed(2)} ETH` : '0 ETH'}
//               </div>
//               <div className="text-xs text-gray-500">LIQUIDITY</div>
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

//   // Reset state when modal opens/closes
//   React.useEffect(() => {
//     if (isOpen) {
//       setSelectedOutcome(null);
//       setBetAmount('0.001');
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleBet = () => {
//     if (selectedOutcome && parseFloat(betAmount) >= 0.001) {
//       onBet(prediction, selectedOutcome, parseFloat(betAmount));
//       onClose();
//     }
//   };

//   const calculatePayout = (): string => {
//     if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return '0.0000';
//     const odds = selectedOutcome === 'yes' ? prediction.outcomes.yes : prediction.outcomes.no;
//     if (odds <= 0) return '0.0000';
//     return (parseFloat(betAmount) * (100 / odds)).toFixed(4);
//   };

//   return (
//     <div className="betting-modal-overlay" onClick={onClose}>
//       <div className="betting-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-bold">Place Your Bet</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-xl"
//           >
//             ×
//           </button>
//         </div>
        
//         <div className="mb-4">
//           <p className="text-sm text-gray-600 mb-2 line-clamp-2">{prediction.question}</p>
//           <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
//             {prediction.category}
//           </span>
//         </div>

//         {/* Outcome Selection */}
//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <button
//             onClick={() => setSelectedOutcome('yes')}
//             className={`outcome-button yes ${selectedOutcome === 'yes' ? 'selected' : ''}`}
//           >
//             <div className="text-center">
//               <div className="text-xl font-bold">YES</div>
//               <div className="text-sm">{prediction.outcomes.yes}% odds</div>
//             </div>
//           </button>
          
//           <button
//             onClick={() => setSelectedOutcome('no')}
//             className={`outcome-button no ${selectedOutcome === 'no' ? 'selected' : ''}`}
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
//             max="1.0"
//             className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="0.001"
//           />
//           <div className="flex justify-between text-xs text-gray-500 mt-1">
//             <span>Min: 0.001 ETH</span>
//             <span>Max: 1.0 ETH</span>
//           </div>
//         </div>

//         {/* Potential Payout */}
//         {selectedOutcome && parseFloat(betAmount) > 0 && (
//           <div className="bg-blue-50 rounded-lg p-3 mb-4">
//             <div className="flex justify-between text-sm">
//               <span className="text-blue-800">Potential payout:</span>
//               <span className="font-bold text-blue-900">~{calculatePayout()} ETH</span>
//             </div>
//             <div className="flex justify-between text-xs text-blue-600 mt-1">
//               <span>If {selectedOutcome.toUpperCase()} wins</span>
//               <span>Profit: +{(parseFloat(calculatePayout()) - parseFloat(betAmount)).toFixed(4)} ETH</span>
//             </div>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="flex space-x-3">
//           <button
//             onClick={onClose}
//             className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleBet}
//             disabled={!selectedOutcome || parseFloat(betAmount) < 0.001}
//             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

//   const handleModalClose = () => {
//     setShowBettingModal(false);
//     setSelectedPrediction(null);
//     setCurrentIndex(prev => prev + 1); // Move to next prediction when cancelled
//   };

//   const visiblePredictions = predictions.slice(currentIndex, currentIndex + 2);

//   if (predictions.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">📊</span>
//           </div>
//           <p className="text-gray-500 mb-4 font-medium">No predictions available</p>
//           <p className="text-gray-400 text-sm mb-6">Check back later for new markets</p>
//           <button 
//             onClick={onNeedMore} 
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//           >
//             Refresh Markets
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (currentIndex >= predictions.length) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">✅</span>
//           </div>
//           <p className="text-gray-700 font-medium mb-2">All predictions reviewed!</p>
//           <p className="text-gray-500 text-sm mb-6">
//             You've seen all available predictions. Great job exploring the markets!
//           </p>
//           <button 
//             onClick={onNeedMore} 
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//           >
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
//             <span className="font-medium">👉 Swipe Right</span> to bet • <span className="font-medium">👈 Swipe Left</span> to skip
//           </p>
//           <p className="text-xs text-blue-600 mt-1">
//             Or use the buttons below
//           </p>
//         </div>

//         {/* Card Stack Container */}
//         <div className="card-stack relative h-96 mb-6">
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
//         <div className="flex justify-center space-x-8 mb-4">
//           <button
//             onClick={() => handleButtonSwipe('left')}
//             className="swipe-action-button skip"
//             disabled={currentIndex >= predictions.length}
//             title="Skip this prediction"
//           >
//             <span className="text-xl">⏭️</span>
//           </button>
//           <button
//             onClick={() => handleButtonSwipe('right')}
//             className="swipe-action-button bet"
//             disabled={currentIndex >= predictions.length}
//             title="Place a bet on this prediction"
//           >
//             <span className="text-xl">💰</span>
//           </button>
//         </div>

//         {/* Progress and Stats */}
//         <div className="text-center space-y-2">
//           <div className="text-sm text-gray-500">
//             <span className="font-medium">{currentIndex + 1}</span> of <span className="font-medium">{predictions.length}</span> predictions
//           </div>
          
//           {/* Progress Bar */}
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div 
//               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${Math.min(((currentIndex + 1) / predictions.length) * 100, 100)}%` }}
//             ></div>
//           </div>
          
//           {predictions.length > 0 && (
//             <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-2">
//               <span>Category: {predictions[currentIndex]?.category}</span>
//               <span>•</span>
//               <span>Liquidity: {predictions[currentIndex]?.totalLiquidity?.toFixed(2) || '0'} ETH</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Betting Modal */}
//       <BettingModal
//         prediction={selectedPrediction}
//         isOpen={showBettingModal}
//         onClose={handleModalClose}
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

/**
 * SwipeCard – single Tinder‑style card used by the SwipeInterface.
 * ‑ Added solid white background, subtle shadow, border, rounded corners, and
 *   a faint gradient overlay so the card is fully opaque and readable.
 */
function SwipeCard({ prediction, onSwipe, isTop }: SwipeCardProps) {
  // ===== motion values ======================================================
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  // keep card fully opaque until it starts leaving the screen
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // ===== helpers ============================================================
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 120; // a little stiffer than before
    if (info.offset.x > threshold) onSwipe('right', prediction);
    else if (info.offset.x < -threshold) onSwipe('left', prediction);
  };

  const categoryBadge = (category: string) => {
    const base = 'text-xs font-medium px-2.5 py-1 rounded-full border';
    switch (category.toLowerCase()) {
      case 'crypto':
        return `${base} bg-orange-50 border-orange-200 text-orange-700`;
      case 'tech':
        return `${base} bg-blue-50 border-blue-200 text-blue-700`;
      case 'sports':
        return `${base} bg-green-50 border-green-200 text-green-700`;
      case 'politics':
        return `${base} bg-purple-50 border-purple-200 text-purple-700`;
      default:
        return `${base} bg-gray-50 border-gray-200 text-gray-700`;
    }
  };

  // ===== render =============================================================
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      whileDrag={{ scale: 1.04 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      className={`absolute inset-0 ${isTop ? 'z-20' : 'z-10'}`}
      initial={{ scale: isTop ? 1 : 0.96, y: isTop ? 0 : 12 }}
      animate={{ scale: isTop ? 1 : 0.96, y: isTop ? 0 : 12 }}
    >
      {/* Card */}
      <div className="h-full w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden relative flex flex-col p-6">
        {/* faint gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 to-white/90" />

        {/* Top – category & end time */}
        <div className="flex justify-between items-center mb-3 relative z-10">
          <span className={categoryBadge(prediction.category)}>{prediction.category}</span>
          <span className="text-xs text-gray-400">
            Ends {new Date(prediction.endTime).toLocaleDateString()}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl leading-tight font-semibold text-gray-900 mb-2 relative z-10 line-clamp-3">
          {prediction.question}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 flex-1 relative z-10 line-clamp-4">
          {prediction.description}
        </p>

        {/* Resolution criteria */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 relative z-10">
          <p className="text-[11px] font-semibold text-gray-700 mb-1">Resolution Criteria</p>
          <p className="text-[11px] text-gray-600 line-clamp-2">{prediction.resolutionCriteria}</p>
        </div>

        {/* Tags */}
        {prediction.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 relative z-10">
            {prediction.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded">#{tag}</span>
            ))}
          </div>
        )}

        {/* Odds & liquidity */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 relative z-10 text-center text-xs font-medium text-gray-500">
          <div>
            <div className="text-lg font-bold text-green-600">{prediction.outcomes.yes}%</div>
            YES
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{prediction.outcomes.no}%</div>
            NO
          </div>
          <div>
            <div className="text-[13px] font-bold text-blue-600">
              {prediction.totalLiquidity ? prediction.totalLiquidity.toFixed(2) : '0'} Ξ
            </div>
            LIQUIDITY
          </div>
        </div>
      </div>

      {/* Swipe cues */}
      <motion.div
        style={{ opacity: useTransform(x, [80, 140], [0, 1]) }}
        className="absolute top-10 left-6 px-5 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg rotate-[-15deg] select-none pointer-events-none"
      >
        BET
      </motion.div>
      <motion.div
        style={{ opacity: useTransform(x, [-140, -80], [1, 0]) }}
        className="absolute top-10 right-6 px-5 py-2 bg-gray-500 text-white rounded-full font-bold shadow-lg rotate-[15deg] select-none pointer-events-none"
      >
        SKIP
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// BettingModal ‑–– unchanged except for slight padding tweak for consistency
// ---------------------------------------------------------------------------

interface BettingModalProps {
  prediction: any;
  isOpen: boolean;
  onClose: () => void;
  onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
}

function BettingModal({ prediction, isOpen, onClose, onBet }: BettingModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('0.001');

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

  const payout = () => {
    if (!selectedOutcome) return '0.0000';
    const odds = selectedOutcome === 'yes' ? prediction.outcomes.yes : prediction.outcomes.no;
    if (odds <= 0) return '0.0000';
    return (parseFloat(betAmount) * (100 / odds)).toFixed(4);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Place Your Bet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{prediction.question}</p>

        {/* Outcome buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['yes', 'no'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSelectedOutcome(side)}
              className={`rounded-lg border text-center py-3 font-semibold transition-colors ${
                selectedOutcome === side
                  ? side === 'yes'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-red-600 text-white border-red-600'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {side.toUpperCase()} <br /> <span className="text-xs font-normal">{prediction.outcomes[side]}% odds</span>
            </button>
          ))}
        </div>

        {/* Amount */}
        <label className="block text-sm font-medium mb-1">Bet Amount (Ξ)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          step="0.001"
          min="0.001"
          max="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-blue-500 focus:outline-none"
        />

        {/* Payout */}
        {selectedOutcome && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm mb-4 flex justify-between">
            <span className="text-blue-800">Potential payout</span>
            <span className="font-bold text-blue-900">≈ {payout()} Ξ</span>
          </div>
        )}

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 font-medium">Cancel</button>
          <button
            onClick={handleBet}
            disabled={!selectedOutcome}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            Bet
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SwipeInterface – exports same props, uses new SwipeCard & BettingModal
// ---------------------------------------------------------------------------
interface SwipeInterfaceProps {
  predictions: any[];
  onSkip: (prediction: any) => void;
  onBet: (prediction: any, outcome: 'yes' | 'no', amount: number) => void;
  onNeedMore: () => void;
}

export function SwipeInterface({ predictions, onSkip, onBet, onNeedMore }: SwipeInterfaceProps) {
  const [idx, setIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);

  const swipe = useCallback(
    (dir: 'left' | 'right', pred: any) => {
      if (dir === 'right') {
        setCurrentPrediction(pred);
        setModalOpen(true);
      } else {
        onSkip(pred);
        setIdx((i) => i + 1);
      }
      if (idx >= predictions.length - 2) onNeedMore();
    },
    [idx, predictions.length, onSkip, onNeedMore]
  );

  const placeBet = (pred: any, outcome: 'yes' | 'no', amount: number) => {
    onBet(pred, outcome, amount);
    setIdx((i) => i + 1);
    setModalOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIdx((i) => i + 1);
  };

  const visible = predictions.slice(idx, idx + 2);

  // empty / done states
  if (predictions.length === 0)
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">No predictions</div>
    );

  if (idx >= predictions.length)
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4 text-gray-600">
        <span className="text-3xl">🎉</span>
        <p>You're all caught up!</p>
        <button onClick={onNeedMore} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Fetch more
        </button>
      </div>
    );

  return (
    <>
      <div className="max-w-md mx-auto">
        {/* stack */}
        <div className="relative h-96 mb-6">
          {visible.map((p, i) => (
            <SwipeCard key={p.id} prediction={p} onSwipe={swipe} isTop={i === 0} />
          ))}
        </div>

        {/* buttons */}
        <div className="flex justify-center space-x-10">
          <button onClick={() => swipe('left', predictions[idx])} className="text-2xl" title="Skip">
            ⏭️
          </button>
          <button onClick={() => swipe('right', predictions[idx])} className="text-2xl" title="Bet">
            💰
          </button>
        </div>

        {/* progress */}
        <div className="mt-4 text-center text-xs text-gray-400">
          {idx + 1} / {predictions.length}
        </div>
      </div>

      <BettingModal
        prediction={currentPrediction}
        isOpen={modalOpen}
        onClose={closeModal}
        onBet={placeBet}
      />
    </>
  );
}
