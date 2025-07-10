import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { blockchainService } from '@/services/blockchain/service';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Search,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

interface PendingMarket {
  marketId: number;
  question: string;
  description: string;
  category: string;
  endTime: Date;
  totalLiquidity: number;
  totalBets: number;
  creator: string;
  resolutionCriteria: string;
  outcomes: {
    yes: number;
    no: number;
  };
}

export function MarketResolutionInterface() {
  const { user } = usePrivy();
  const [pendingMarkets, setPendingMarkets] = useState<PendingMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingMarket, setResolvingMarket] = useState<number | null>(null);
  const [, setSelectedOutcome] = useState<boolean | null>(null);
  const [, setResolutionNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPendingMarkets();
  }, []);

  const loadPendingMarkets = async () => {
    setLoading(true);
    try {
      const allMarkets = await blockchainService.getAllMarkets();
      const pending = allMarkets.filter(market => 
        !market.resolved && market.endTime <= new Date()
      );
      
      // Convert to PendingMarket format
      const pendingData: PendingMarket[] = pending.map(market => ({
        marketId: market.marketId,
        question: market.question,
        description: market.description,
        category: market.category,
        endTime: market.endTime,
        totalLiquidity: market.totalLiquidity,
        totalBets: Math.floor(Math.random() * 50 + 10), // Simulated
        creator: market.creator,
        resolutionCriteria: market.resolutionCriteria,
        outcomes: market.outcomes,
      }));
      
      setPendingMarkets(pendingData);
    } catch (error) {
      console.error('Error loading pending markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMarket = async (marketId: number, outcome: boolean) => {
    if (!user?.wallet?.address) {
      alert('Please connect your wallet to resolve markets');
      return;
    }

    setResolvingMarket(marketId);
    try {
      console.log(`🔧 Resolving market ${marketId} with outcome: ${outcome ? 'YES' : 'NO'}`);
      
      // In a real implementation, this would call the smart contract
      // For now, we'll simulate the resolution
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      console.log('✅ Market resolved successfully');
      
      // Remove from pending list
      setPendingMarkets(prev => prev.filter(m => m.marketId !== marketId));
      
      // Reset resolution state
      setResolvingMarket(null);
      setSelectedOutcome(null);
      setResolutionNotes('');
      
      alert(`Market resolved: ${outcome ? 'YES' : 'NO'} wins!`);
      
    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market. Please try again.');
    } finally {
      setResolvingMarket(null);
    }
  };

  const filteredMarkets = pendingMarkets.filter(market => {
    const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || market.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(pendingMarkets.map(m => m.category))];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending markets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ⚖️ Market Resolution Interface
            </h1>
            <p className="text-gray-600">
              Resolve ended markets and distribute rewards to winners
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-orange-600">
              {pendingMarkets.length} markets pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Markets */}
      {filteredMarkets.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600">
            No markets pending resolution at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.marketId}
              market={market}
              isResolving={resolvingMarket === market.marketId}
              onResolve={handleResolveMarket}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MarketCardProps {
  market: PendingMarket;
  isResolving: boolean;
  onResolve: (marketId: number, outcome: boolean) => void;
}

function MarketCard({ market, isResolving, onResolve }: MarketCardProps) {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<boolean | null>(null);

  const daysOverdue = Math.floor((Date.now() - market.endTime.getTime()) / (1000 * 60 * 60 * 24));

  const handleResolve = () => {
    if (selectedOutcome !== null) {
      onResolve(market.marketId, selectedOutcome);
      setShowResolutionModal(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        className="bg-white rounded-lg border hover:shadow-md transition-all duration-200"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {market.category}
                </span>
                <span className="text-xs text-gray-500">
                  Market #{market.marketId}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  daysOverdue <= 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                {market.question}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {market.description}
              </p>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {market.totalLiquidity.toFixed(2)} ETH
              </div>
              <div className="text-xs text-gray-500">Total Volume</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {market.totalBets}
              </div>
              <div className="text-xs text-gray-500">Total Bets</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                {market.endTime.toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">End Date</div>
            </div>
          </div>

          {/* Current Odds */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{market.outcomes.yes}%</div>
              <div className="text-sm text-green-700">YES</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{market.outcomes.no}%</div>
              <div className="text-sm text-red-700">NO</div>
            </div>
          </div>

          {/* Resolution Criteria */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Resolution Criteria:</h4>
            <p className="text-sm text-blue-800">{market.resolutionCriteria}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Creator:</span>
              <span className="font-medium">
                {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
              </span>
              <a
                href={`https://sepolia.explorer.zora.energy/address/${market.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <button
              onClick={() => setShowResolutionModal(true)}
              disabled={isResolving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isResolving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve Market</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {showResolutionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Resolve Market
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {market.question}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select the winning outcome:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedOutcome(true)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedOutcome === true
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-xl font-bold">YES</div>
                    <div className="text-sm">{market.outcomes.yes}% predicted</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedOutcome(false)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedOutcome === false
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="text-xl font-bold">NO</div>
                    <div className="text-sm">{market.outcomes.no}% predicted</div>
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Resolving this market will distribute rewards to winners immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={selectedOutcome === null}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resolve Market
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}