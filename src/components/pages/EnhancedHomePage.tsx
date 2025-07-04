// // File: src/components/pages/EnhancedHomePage.tsx

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { usePrivy } from '@privy-io/react-auth';
// import { useUserStore } from '@/store/userStore';
// import { useAIPredictions } from '@/hooks/useAIPredictions';
// import { SwipeInterface } from '@/components/swipe/SwipeInterface';
// import { getUserAvatar, getUserDisplayName, hasLinkedFarcaster } from '@/utils/userHelpers';
// import { AppPage } from '../../types/Navigation'; // ✅ Import shared type
// import { 
//   Sparkles, 
//   TrendingUp, 
//   Users, 
//   RefreshCw, 
//   Filter,
//   ChevronRight,
//   AlertCircle,
//   Zap,
//   Target,
//   Trophy,
//   Clock
// } from 'lucide-react';

// interface EnhancedHomePageProps {
//   onNavigate: (page: AppPage) => void; // ✅ Fixed: Use imported AppPage type
// }

// interface Bet {
//   id: string;
//   prediction: any;
//   outcome: 'yes' | 'no';
//   amount: number;
//   timestamp: Date;
// }

// export function EnhancedHomePage({ onNavigate }: EnhancedHomePageProps) {
//   const { user } = usePrivy();
//   const { user: userProfile, getPrimaryInterests } = useUserStore();
//   const { loading, predictions, error, userData, generatePredictions } = useAIPredictions();
  
//   const [bets, setBets] = useState<Bet[]>([]);
//   const [skippedPredictions, setSkippedPredictions] = useState<any[]>([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [filterCategory, setFilterCategory] = useState<string>('');
//   const [filterTimeframe, setFilterTimeframe] = useState<string>('');

//   const displayName = getUserDisplayName(user, userProfile);
//   const userAvatar = getUserAvatar(user, userProfile);
//   const hasFC = hasLinkedFarcaster(user, userProfile);

//   // Auto-generate predictions on mount if user has Farcaster
//   useEffect(() => {
//     if (user?.farcaster?.fid && predictions.length === 0 && !loading) {
//       handleGeneratePredictions();
//     }
//   }, [user?.farcaster?.fid]);

//   const handleGeneratePredictions = async () => {
//     if (!user?.farcaster?.fid) return;
    
//     setIsGenerating(true);
//     try {
//       await generatePredictions(user.farcaster.fid);
//     } catch (err) {
//       console.error('Failed to generate predictions:', err);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleSkip = (prediction: any) => {
//     setSkippedPredictions(prev => [...prev, prediction]);
//   };

//   const handleBet = (prediction: any, outcome: 'yes' | 'no', amount: number) => {
//     const newBet: Bet = {
//       id: `bet_${Date.now()}`,
//       prediction,
//       outcome,
//       amount,
//       timestamp: new Date(),
//     };
    
//     setBets(prev => [...prev, newBet]);
//   };

//   const handleNeedMore = () => {
//     handleGeneratePredictions();
//   };

//   const primaryInterests = getPrimaryInterests();
//   const totalPredictionsSeen = bets.length + skippedPredictions.length;
//   const engagementRate = totalPredictionsSeen > 0 ? (bets.length / totalPredictionsSeen) * 100 : 0;
//   const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);

//   // Show connect Farcaster prompt if not connected
//   if (!hasFC) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center mb-8">
//           <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Users className="w-8 h-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-4">
//             Get Personalized Predictions
//           </h2>
//           <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
//             Connect your Farcaster account to receive AI-generated prediction topics 
//             tailored to your interests and activity.
//           </p>
          
//           <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
//               <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
//               <p className="text-sm text-gray-600">Topics generated from your real Farcaster activity</p>
//             </div>
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
//               <h3 className="font-bold text-gray-900 mb-2">Relevant</h3>
//               <p className="text-sm text-gray-600">Predictions about topics you actually care about</p>
//             </div>
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <Zap className="w-8 h-8 text-purple-500 mx-auto mb-3" />
//               <h3 className="font-bold text-gray-900 mb-2">Engaging</h3>
//               <p className="text-sm text-gray-600">Higher accuracy through personal knowledge</p>
//             </div>
//           </div>

//           <button
//             onClick={() => onNavigate('profile')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
//           >
//             <Users className="w-5 h-5" />
//             <span>Connect Farcaster</span>
//             <ChevronRight className="w-4 h-4" />
//           </button>
          
//           <p className="text-sm text-gray-500 mt-4">
//             Or browse <button onClick={() => onNavigate('markets')} className="text-blue-600 hover:underline">all markets</button> without personalization
//           </p>
//         </div>

//         {/* Quick Stats for Non-Farcaster Users */}
//         <div className="grid md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg p-6 border text-center">
//             <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
//             <h3 className="font-bold text-gray-900 mb-2">Browse Markets</h3>
//             <p className="text-gray-600 text-sm mb-4">Explore all available prediction markets</p>
//             <button
//               onClick={() => onNavigate('markets')}
//               className="text-blue-600 hover:text-blue-700 font-medium text-sm"
//             >
//               View Markets →
//             </button>
//           </div>
          
//           <div className="bg-white rounded-lg p-6 border text-center">
//             <Trophy className="w-8 h-8 text-green-500 mx-auto mb-3" />
//             <h3 className="font-bold text-gray-900 mb-2">Create Market</h3>
//             <p className="text-gray-600 text-sm mb-4">Start your own prediction market</p>
//             <button
//               onClick={() => onNavigate('create')}
//               className="text-blue-600 hover:text-blue-700 font-medium text-sm"
//             >
//               Create Now →
//             </button>
//           </div>
          
//           <div className="bg-white rounded-lg p-6 border text-center">
//             <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
//             <h3 className="font-bold text-gray-900 mb-2">Quick Start</h3>
//             <p className="text-gray-600 text-sm mb-4">Connect Farcaster for best experience</p>
//             <button
//               onClick={() => onNavigate('profile')}
//               className="text-blue-600 hover:text-blue-700 font-medium text-sm"
//             >
//               Get Started →
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header with User Greeting */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-4">
//             <img
//               src={userAvatar}
//               alt={displayName}
//               className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
//             />
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Welcome back, {displayName}! 👋
//               </h1>
//               <p className="text-gray-600 mt-1">
//                 Ready to make some predictions? Here are topics personalized for you.
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`p-2 rounded-lg transition-colors ${
//                 showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               <Filter className="w-5 h-5" />
//             </button>
            
//             <button
//               onClick={handleGeneratePredictions}
//               disabled={isGenerating || loading}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//             >
//               <RefreshCw className={`w-4 h-4 ${(isGenerating || loading) ? 'animate-spin' : ''}`} />
//               <span>Refresh Predictions</span>
//             </button>
//           </div>
//         </div>

//         {/* User Stats & Interests */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-lg p-6 border">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-gray-900">Your Interests</h3>
//               <button 
//                 onClick={() => onNavigate('profile')}
//                 className="text-blue-600 hover:text-blue-700 text-sm"
//               >
//                 Edit
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {primaryInterests.map((interest) => (
//                 <span
//                   key={interest}
//                   className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
//                 >
//                   #{interest}
//                 </span>
//               ))}
//               {primaryInterests.length === 0 && (
//                 <span className="text-gray-500 text-sm">No interests set</span>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-6 border">
//             <h3 className="font-semibold text-gray-900 mb-3">Session Stats</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Predictions seen:</span>
//                 <span className="font-medium">{totalPredictionsSeen}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Bets placed:</span>
//                 <span className="font-medium">{bets.length}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Engagement:</span>
//                 <span className="font-medium">{engagementRate.toFixed(0)}%</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-6 border">
//             <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
//             <div className="space-y-2">
//               <button
//                 onClick={() => onNavigate('markets')}
//                 className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
//               >
//                 <span>Browse All Markets</span>
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => onNavigate('create')}
//                 className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
//               >
//                 <span>Create Market</span>
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => onNavigate('rewards')}
//                 className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
//               >
//                 <span>View Rewards</span>
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters Panel */}
//       {showFilters && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: 'auto' }}
//           exit={{ opacity: 0, height: 0 }}
//           className="bg-white rounded-lg border p-6 mb-6"
//         >
//           <h3 className="font-semibold text-gray-900 mb-4">Filter Predictions</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//               <select 
//                 value={filterCategory}
//                 onChange={(e) => setFilterCategory(e.target.value)}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="">All Categories</option>
//                 <option value="crypto">Crypto</option>
//                 <option value="tech">Technology</option>
//                 <option value="sports">Sports</option>
//                 <option value="politics">Politics</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
//               <select 
//                 value={filterTimeframe}
//                 onChange={(e) => setFilterTimeframe(e.target.value)}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//               >
//                 <option value="">Any Time</option>
//                 <option value="1d">1 Day</option>
//                 <option value="3d">3 Days</option>
//                 <option value="1w">1 Week</option>
//                 <option value="1m">1 Month</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
//               <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
//                 <option value="">Any Difficulty</option>
//                 <option value="easy">Easy (80%+ consensus)</option>
//                 <option value="medium">Medium (60-80%)</option>
//                 <option value="hard">Hard (50-60%)</option>
//               </select>
//             </div>
//             <div className="flex items-end">
//               <button
//                 onClick={() => {
//                   setFilterCategory('');
//                   setFilterTimeframe('');
//                 }}
//                 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Main Content Grid */}
//       <div className="grid lg:grid-cols-3 gap-8">
//         {/* Swipe Interface - Main Column */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl shadow-sm border">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between mb-2">
//                 <h2 className="text-xl font-bold text-gray-900">🎯 Personalized Predictions</h2>
//                 {userData && (
//                   <div className="flex items-center space-x-2 text-sm text-gray-600">
//                     <img 
//                       src={userData.pfpUrl || userAvatar} 
//                       alt={userData.displayName}
//                       className="w-6 h-6 rounded-full"
//                     />
//                     <span>Based on @{userData.username}'s activity</span>
//                   </div>
//                 )}
//               </div>
//               <p className="text-gray-600">
//                 Swipe right to bet, left to skip. Topics tailored to your interests.
//               </p>
//             </div>

//             <div className="p-6">
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//                   <div className="flex items-center space-x-2">
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                     <div>
//                       <h3 className="font-semibold text-red-800">Error Loading Predictions</h3>
//                       <p className="text-red-700 text-sm">{error}</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleGeneratePredictions}
//                     className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               )}

//               {loading || isGenerating ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600 font-medium">
//                       {isGenerating ? 'Generating personalized predictions...' : 'Loading predictions...'}
//                     </p>
//                     <p className="text-gray-500 text-sm mt-1">
//                       Analyzing your Farcaster activity with AI
//                     </p>
//                   </div>
//                 </div>
//               ) : predictions.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
//                   <p className="text-gray-600 mb-6">
//                     Generate your first set of personalized predictions to get started.
//                   </p>
//                   <button
//                     onClick={handleGeneratePredictions}
//                     disabled={!user?.farcaster?.fid}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
//                   >
//                     Generate Predictions
//                   </button>
//                 </div>
//               ) : (
//                 <SwipeInterface
//                   predictions={predictions}
//                   onSkip={handleSkip}
//                   onBet={handleBet}
//                   onNeedMore={handleNeedMore}
//                 />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Sidebar - Stats and Activity */}
//         <div className="space-y-6">
//           {/* Recent Bets */}
//           <div className="bg-white rounded-xl shadow-sm border">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="font-bold text-gray-900">💰 Your Bets ({bets.length})</h3>
//             </div>
//             <div className="p-6">
//               {bets.length === 0 ? (
//                 <div className="text-center py-8">
//                   <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
//                   <p className="text-gray-500 text-sm">No bets placed yet</p>
//                   <p className="text-gray-400 text-xs">Start swiping to make predictions!</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {bets.slice().reverse().map((bet) => (
//                     <div key={bet.id} className="border rounded-lg p-3">
//                       <div className="flex items-center justify-between mb-2">
//                         <span className={`text-xs font-medium px-2 py-1 rounded ${
//                           bet.outcome === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                         }`}>
//                           {bet.outcome.toUpperCase()}
//                         </span>
//                         <span className="text-xs text-gray-500">{bet.amount} ETH</span>
//                       </div>
//                       <p className="text-sm font-medium line-clamp-2 text-gray-900">
//                         {bet.prediction.question}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {bet.timestamp.toLocaleTimeString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Performance Stats */}
//           <div className="bg-white rounded-xl shadow-sm border">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="font-bold text-gray-900">📊 Performance</h3>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total Wagered</span>
//                   <span className="font-semibold text-gray-900">
//                     {totalWagered.toFixed(4)} ETH
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Predictions Made</span>
//                   <span className="font-semibold text-gray-900">{bets.length}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Engagement Rate</span>
//                   <span className="font-semibold text-gray-900">
//                     {engagementRate.toFixed(0)}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Skipped</span>
//                   <span className="font-semibold text-gray-900">{skippedPredictions.length}</span>
//                 </div>
//               </div>

//               {bets.length > 0 && (
//                 <button
//                   onClick={() => onNavigate('rewards')}
//                   className="w-full mt-4 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
//                 >
//                   <span>View All Rewards</span>
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* AI Insights */}
//           <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
//             <div className="p-6">
//               <div className="flex items-center space-x-2 mb-3">
//                 <Sparkles className="w-5 h-5 text-purple-600" />
//                 <h3 className="font-bold text-gray-900">AI Insights</h3>
//               </div>
//               <div className="space-y-3 text-sm">
//                 <div className="bg-white bg-opacity-50 rounded-lg p-3">
//                   <p className="text-gray-700">
//                     <span className="font-medium">Prediction Strength:</span> Your bets show 
//                     {engagementRate > 70 ? ' high confidence' : engagementRate > 40 ? ' moderate confidence' : ' selective'} 
//                     in market outcomes.
//                   </p>
//                 </div>
//                 {primaryInterests.length > 0 && (
//                   <div className="bg-white bg-opacity-50 rounded-lg p-3">
//                     <p className="text-gray-700">
//                       <span className="font-medium">Focus Areas:</span> You're most active in{' '}
//                       {primaryInterests.slice(0, 2).join(' and ')} predictions.
//                     </p>
//                   </div>
//                 )}
//                 <div className="bg-white bg-opacity-50 rounded-lg p-3">
//                   <p className="text-gray-700">
//                     <span className="font-medium">Recommendation:</span> 
//                     {bets.length === 0 
//                       ? ' Start with smaller bets to build your prediction history.'
//                       : bets.length < 5 
//                       ? ' Try betting on more diverse topics to improve accuracy.'
//                       : ' Your prediction pattern shows good diversification.'
//                     }
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// File: src/components/pages/EnhancedHomePage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '@/store/userStore';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { useAllMarkets } from '@/hooks/useAllMarkets';
import { SwipeInterface } from '@/components/swipe/SwipeInterface';
import { getUserAvatar, getUserDisplayName, hasLinkedFarcaster } from '@/utils/userHelpers';
import { AppPage } from '../../types/Navigation';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Filter,
  ChevronRight,
  AlertCircle,
  Zap,
  Target,
  Trophy,
  Clock,
  Hash,
  ExternalLink
} from 'lucide-react';

interface EnhancedHomePageProps {
  onNavigate: (page: AppPage) => void;
}

interface Bet {
  id: string;
  prediction: any;
  outcome: 'yes' | 'no';
  amount: number;
  timestamp: Date;
}

export function EnhancedHomePage({ onNavigate }: EnhancedHomePageProps) {
  const { user } = usePrivy();
  const { user: userProfile, getPrimaryInterests } = useUserStore();
  const { loading: aiLoading, predictions: aiPredictions, error: aiError, userData, generatePredictions } = useAIPredictions();
  const { loading: marketsLoading, markets: allMarkets, error: marketsError, fetchMarkets } = useAllMarkets();
  
  const [bets, setBets] = useState<Bet[]>([]);
  const [skippedPredictions, setSkippedPredictions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('');
  
  // Manual Farcaster FID input state
  const [showManualFarcaster, setShowManualFarcaster] = useState(false);
  const [manualFid, setManualFid] = useState('');
  const [isLoadingManual, setIsLoadingManual] = useState(false);

  const displayName = getUserDisplayName(user, userProfile);
  const userAvatar = getUserAvatar(user, userProfile);
  const hasFC = hasLinkedFarcaster(user, userProfile);

  // Determine which predictions to show
  const predictions = hasFC ? aiPredictions : allMarkets;
  const loading = hasFC ? aiLoading : marketsLoading;
  const error = hasFC ? aiError : marketsError;

  // Auto-generate predictions on mount if user has Farcaster
  useEffect(() => {
    if (hasFC && user?.farcaster?.fid && aiPredictions.length === 0 && !aiLoading) {
      handleGeneratePredictions();
    }
  }, [user?.farcaster?.fid, hasFC]);

  // Fetch all markets if user doesn't have Farcaster
  useEffect(() => {
    if (!hasFC && allMarkets.length === 0 && !marketsLoading) {
      fetchMarkets();
    }
  }, [hasFC]);

  const handleGeneratePredictions = async () => {
    if (!user?.farcaster?.fid) return;
    
    setIsGenerating(true);
    try {
      await generatePredictions(user.farcaster.fid);
    } catch (err) {
      console.error('Failed to generate predictions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualFarcasterConnect = async () => {
    if (!manualFid || isNaN(parseInt(manualFid))) {
      alert('Please enter a valid Farcaster FID number');
      return;
    }

    setIsLoadingManual(true);
    try {
      await generatePredictions(parseInt(manualFid));
      setShowManualFarcaster(false);
      setManualFid('');
    } catch (err) {
      console.error('Failed to generate predictions with manual FID:', err);
      alert('Failed to fetch predictions for this FID. Please check the FID and try again.');
    } finally {
      setIsLoadingManual(false);
    }
  };

  const handleSkip = (prediction: any) => {
    setSkippedPredictions(prev => [...prev, prediction]);
  };

  const handleBet = (prediction: any, outcome: 'yes' | 'no', amount: number) => {
    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      prediction,
      outcome,
      amount,
      timestamp: new Date(),
    };
    
    setBets(prev => [...prev, newBet]);
  };

  const handleNeedMore = () => {
    if (hasFC) {
      handleGeneratePredictions();
    } else {
      fetchMarkets();
    }
  };

  const handleRefresh = () => {
    if (hasFC) {
      handleGeneratePredictions();
    } else {
      fetchMarkets();
    }
  };

  const primaryInterests = getPrimaryInterests();
  const totalPredictionsSeen = bets.length + skippedPredictions.length;
  const engagementRate = totalPredictionsSeen > 0 ? (bets.length / totalPredictionsSeen) * 100 : 0;
  const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with User Greeting */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={userAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {hasFC 
                  ? "Here are predictions personalized for you based on your Farcaster activity."
                  : "Browse all prediction markets and start making predictions!"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isGenerating || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${(isGenerating || loading) ? 'animate-spin' : ''}`} />
              <span>{hasFC ? 'Refresh Predictions' : 'Refresh Markets'}</span>
            </button>
          </div>
        </div>

        {/* Farcaster Status & Manual Connection */}
        <div className="bg-white rounded-lg p-4 border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">
                  {hasFC ? 'Farcaster Connected' : 'Farcaster Not Connected'}
                </h3>
                <p className="text-sm text-gray-600">
                  {hasFC 
                    ? `Getting personalized predictions from @${user?.farcaster?.username || 'your'} activity`
                    : 'Connect Farcaster for personalized predictions or browse all markets'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasFC ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">FID: {user?.farcaster?.fid}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowManualFarcaster(!showManualFarcaster)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Hash className="w-4 h-4" />
                    <span>Enter FID</span>
                  </button>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Farcaster FID Input */}
          {showManualFarcaster && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your Farcaster FID to get personalized predictions:
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={manualFid}
                      onChange={(e) => setManualFid(e.target.value)}
                      placeholder="e.g., 3 (Dan Romero)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleManualFarcasterConnect}
                      disabled={isLoadingManual || !manualFid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoadingManual ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>{isLoadingManual ? 'Loading...' : 'Get Predictions'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Find your FID at{' '}
                    <a 
                      href="https://warpcast.com/~/settings" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Warpcast Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* User Stats & Interests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {hasFC ? 'Your Interests' : 'Market Categories'}
              </h3>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {hasFC ? 'Edit' : 'Set Preferences'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasFC ? (
                primaryInterests.length > 0 ? (
                  primaryInterests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No interests set</span>
                )
              ) : (
                ['crypto', 'tech', 'sports', 'politics', 'general'].map((category) => (
                  <span
                    key={category}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{category}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold text-gray-900 mb-3">Session Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Predictions seen:</span>
                <span className="font-medium">{totalPredictionsSeen}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bets placed:</span>
                <span className="font-medium">{bets.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Engagement:</span>
                <span className="font-medium">{engagementRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('markets')}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
              >
                <span>Browse All Markets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('create')}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
              >
                <span>Create Market</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('rewards')}
                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 flex items-center justify-between"
              >
                <span>View Rewards</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg border p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Filter Predictions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="crypto">Crypto</option>
                <option value="tech">Technology</option>
                <option value="sports">Sports</option>
                <option value="politics">Politics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
              <select 
                value={filterTimeframe}
                onChange={(e) => setFilterTimeframe(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Any Time</option>
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Any Difficulty</option>
                <option value="easy">Easy (80%+ consensus)</option>
                <option value="medium">Medium (60-80%)</option>
                <option value="hard">Hard (50-60%)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterCategory('');
                  setFilterTimeframe('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Swipe Interface - Main Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {hasFC ? '🎯 Personalized Predictions' : '📊 All Prediction Markets'}
                </h2>
                {userData && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <img 
                      src={userData.pfpUrl || userAvatar} 
                      alt={userData.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>Based on @{userData.username}'s activity</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                {hasFC 
                  ? "Swipe right to bet, left to skip. Topics tailored to your interests."
                  : "Swipe through all available prediction markets. Connect Farcaster for personalized recommendations."
                }
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">
                        Error Loading {hasFC ? 'Predictions' : 'Markets'}
                      </h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loading || isGenerating || isLoadingManual ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      {isLoadingManual ? 'Generating personalized predictions...' 
                       : isGenerating ? 'Generating personalized predictions...' 
                       : hasFC ? 'Loading predictions...'
                       : 'Loading all markets...'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {hasFC || isLoadingManual
                        ? 'Analyzing Farcaster activity with AI'
                        : 'Fetching all available prediction markets'
                      }
                    </p>
                  </div>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasFC ? 'No Predictions Yet' : 'No Markets Available'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {hasFC 
                      ? "Generate your first set of personalized predictions to get started."
                      : "No prediction markets are currently available. Check back later!"
                    }
                  </p>
                  {hasFC && (
                    <button
                      onClick={handleGeneratePredictions}
                      disabled={!user?.farcaster?.fid}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Generate Predictions
                    </button>
                  )}
                </div>
              ) : (
                <SwipeInterface
                  predictions={predictions}
                  onSkip={handleSkip}
                  onBet={handleBet}
                  onNeedMore={handleNeedMore}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Stats and Activity */}
        <div className="space-y-6">
          {/* Recent Bets */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">💰 Your Bets ({bets.length})</h3>
            </div>
            <div className="p-6">
              {bets.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No bets placed yet</p>
                  <p className="text-gray-400 text-xs">Start swiping to make predictions!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bets.slice().reverse().map((bet) => (
                    <div key={bet.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          bet.outcome === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bet.outcome.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{bet.amount} ETH</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 text-gray-900">
                        {bet.prediction.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {bet.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">📊 Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Wagered</span>
                  <span className="font-semibold text-gray-900">
                    {totalWagered.toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Predictions Made</span>
                  <span className="font-semibold text-gray-900">{bets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="font-semibold text-gray-900">
                    {engagementRate.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Skipped</span>
                  <span className="font-semibold text-gray-900">{skippedPredictions.length}</span>
                </div>
              </div>

              {bets.length > 0 && (
                <button
                  onClick={() => onNavigate('rewards')}
                  className="w-full mt-4 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>View All Rewards</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* AI Insights or Market Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                {hasFC ? (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-900">AI Insights</h3>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Market Stats</h3>
                  </>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">
                      {hasFC ? 'Prediction Strength:' : 'Market Activity:'}
                    </span>{' '}
                    {hasFC ? (
                      <>Your bets show 
                      {engagementRate > 70 ? ' high confidence' : engagementRate > 40 ? ' moderate confidence' : ' selective'} 
                      in market outcomes.</>
                    ) : (
                      <>Browse {allMarkets.length} available markets across different categories.</>
                    )}
                  </p>
                </div>
                {hasFC && primaryInterests.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-gray-700">
                      <span className="font-medium">Focus Areas:</span> You're most active in{' '}
                      {primaryInterests.slice(0, 2).join(' and ')} predictions.
                    </p>
                  </div>
                )}
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Recommendation:</span>
                    {hasFC ? (
                      bets.length === 0 
                        ? ' Start with smaller bets to build your prediction history.'
                        : bets.length < 5 
                        ? ' Try betting on more diverse topics to improve accuracy.'
                        : ' Your prediction pattern shows good diversification.'
                    ) : (
                      bets.length === 0
                        ? ' Start exploring markets that interest you most.'
                        : ' Consider connecting Farcaster for personalized recommendations.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}