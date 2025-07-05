// src/components/pages/MarketsPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useAllMarkets } from '@/hooks/useAllMarkets';
import { blockchainService } from '@/services/blockchain/service';
import { MarketDetailModal } from '@/components/markets/MarketDetailModal';
import { AppPage } from '../../types/navigation';
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Grid,
  List,
  RefreshCw,
  Eye,
  BarChart3,
  Zap,
  ChevronDown,
  X,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MarketsPageProps {
  onNavigate: (page: AppPage) => void;
}

type SortOption = 'newest' | 'oldest' | 'ending-soon' | 'most-liquid' | 'most-active' | 'trending';
type ViewMode = 'grid' | 'list';

interface MarketFilters {
  search: string;
  category: string;
  timeframe: string;
  status: string;
  minLiquidity: number;
  sortBy: SortOption;
  viewMode: ViewMode;
}

export function MarketsPage({ onNavigate }: MarketsPageProps) {
  const { user } = usePrivy();
  const { loading, markets, error, fetchMarkets } = useAllMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [placingBet, setPlacingBet] = useState<{ marketId: number; outcome: boolean } | null>(null);
  const [filters, setFilters] = useState<MarketFilters>({
    search: '',
    category: '',
    timeframe: '',
    status: 'active',
    minLiquidity: 0,
    sortBy: 'newest',
    viewMode: 'grid'
  });

  // Load real blockchain markets on mount
  useEffect(() => {
    if (markets.length === 0 && !loading) {
      fetchMarkets();
    }
  }, []);

  // Filter and sort markets - NO MOCK DATA
  const filteredMarkets = useMemo(() => {
    let filtered = markets.filter(market => {
      // Search filter
      if (filters.search && !market.question.toLowerCase().includes(filters.search.toLowerCase()) &&
          !market.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !market.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      // Category filter
      if (filters.category && market.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === 'active' && (market.resolved || market.endTime < new Date())) {
        return false;
      }
      if (filters.status === 'resolved' && !market.resolved) {
        return false;
      }
      if (filters.status === 'ending-soon') {
        const hoursLeft = (market.endTime.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursLeft > 24) return false;
      }

      // Timeframe filter
      if (filters.timeframe) {
        const now = Date.now();
        const endTime = market.endTime.getTime();
        const daysLeft = (endTime - now) / (1000 * 60 * 60 * 24);
        
        switch (filters.timeframe) {
          case '1d':
            if (daysLeft > 1) return false;
            break;
          case '3d':
            if (daysLeft > 3) return false;
            break;
          case '1w':
            if (daysLeft > 7) return false;
            break;
          case '1m':
            if (daysLeft > 30) return false;
            break;
        }
      }

      // Liquidity filter
      if (market.totalLiquidity < filters.minLiquidity) {
        return false;
      }

      return true;
    });

    // Sort markets
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'ending-soon':
          return a.endTime.getTime() - b.endTime.getTime();
        case 'most-liquid':
          return b.totalLiquidity - a.totalLiquidity;
        case 'most-active':
          return b.totalLiquidity - a.totalLiquidity; // Use liquidity as proxy for activity
        case 'trending':
          return Math.abs(50 - b.outcomes.yes) - Math.abs(50 - a.outcomes.yes); // Markets closer to 50/50
        default:
          return 0;
      }
    });

    return filtered;
  }, [markets, filters]);

  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
    setShowDetailModal(true);
  };

  const handleFilterChange = (key: keyof MarketFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      timeframe: '',
      status: 'active',
      minLiquidity: 0,
      sortBy: 'newest',
      viewMode: filters.viewMode // Keep view mode
    });
  };

  const handleQuickBet = async (market: any, outcome: 'yes' | 'no') => {
    if (!user?.wallet?.address) {
      alert('Please connect your wallet to place bets');
      return;
    }

    setPlacingBet({ marketId: market.marketId, outcome: outcome === 'yes' });
    
    try {
      const result = await blockchainService.placeBet(
        user.wallet.address as `0x${string}`,
        market.marketId,
        outcome === 'yes',
        '0.01' // Default bet amount
      );

      if (result.success) {
        alert(`Bet placed successfully! Transaction: ${result.txHash?.slice(0, 10)}...`);
        // Refresh markets to show updated data
        fetchMarkets();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error placing quick bet:', error);
      alert(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPlacingBet(null);
    }
  };

  const getTimeLeft = (endTime: Date) => {
    const now = Date.now();
    const timeLeft = endTime.getTime() - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (timeLeft <= 0) return 'Ended';
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto': return '🪙';
      case 'tech': return '💻';
      case 'sports': return '⚽';
      case 'politics': return '🏛️';
      default: return '📊';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tech': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sports': return 'bg-green-100 text-green-800 border-green-200';
      case 'politics': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⛓️ Blockchain Markets
            </h1>
            <p className="text-gray-600">
              Live prediction markets on Zora Network • {markets.length} total markets
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {Object.values(filters).some(v => v !== '' && v !== 'active' && v !== 0 && v !== 'newest' && v !== 'grid') && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={fetchMarkets}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => onNavigate('create')}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Create Market</span>
            </button>
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-gray-900">Live on Zora Sepolia</h3>
                <p className="text-sm text-gray-600">All markets are real smart contracts • Real ETH • Real predictions</p>
              </div>
            </div>
            <a
              href="https://sepolia.explorer.zora.energy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <span>View on Explorer</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Markets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{markets.length}</div>
            <div className="text-xs text-gray-500">Live on blockchain</div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active Markets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {markets.filter(m => !m.resolved && m.endTime > new Date()).length}
            </div>
            <div className="text-xs text-gray-500">Available for betting</div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Total Volume</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {markets.reduce((sum, m) => sum + m.totalLiquidity, 0).toFixed(3)} ETH
            </div>
            <div className="text-xs text-gray-500">Real money locked</div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Categories</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(markets.map(m => m.category)).size}
            </div>
            <div className="text-xs text-gray-500">Different topics</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Blockchain Markets</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search markets, questions, or tags..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="crypto">🪙 Crypto</option>
                  <option value="tech">💻 Technology</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="politics">🏛️ Politics</option>
                  <option value="general">📊 General</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">🟢 Active</option>
                  <option value="ending-soon">⏰ Ending Soon</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="">🔄 All</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as SortOption)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">🆕 Newest First</option>
                  <option value="ending-soon">⏰ Ending Soon</option>
                  <option value="most-liquid">💰 Most Liquid</option>
                  <option value="most-active">🔥 Most Active</option>
                  <option value="trending">📈 Trending</option>
                  <option value="oldest">📜 Oldest First</option>
                </select>
              </div>

              {/* Min Liquidity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Liquidity ({filters.minLiquidity} ETH)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.minLiquidity}
                  onChange={(e) => handleFilterChange('minLiquidity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Controls and Results Count */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {loading ? 'Loading blockchain data...' : `${filteredMarkets.length} markets found`}
          </span>
          
          {filters.search && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">for</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                "{filters.search}"
              </span>
              <button
                onClick={() => handleFilterChange('search', '')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleFilterChange('viewMode', 'grid')}
            className={`p-2 rounded transition-colors ${
              filters.viewMode === 'grid'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFilterChange('viewMode', 'list')}
            className={`p-2 rounded transition-colors ${
              filters.viewMode === 'list'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Markets Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Blockchain Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchMarkets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Markets Found</h3>
          <p className="text-gray-600 mb-6">
            {markets.length === 0 
              ? "No prediction markets exist on the blockchain yet."
              : "Try adjusting your filters to find more markets."
            }
          </p>
          <div className="flex justify-center space-x-4">
            {markets.length === 0 ? (
              <button
                onClick={() => onNavigate('create')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create First Market
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={
          filters.viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredMarkets.map((market) => (
            <motion.div
              key={market.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg border hover:shadow-lg transition-all duration-200 cursor-pointer ${
                filters.viewMode === 'list' ? 'p-4' : 'p-6'
              }`}
              onClick={() => handleMarketClick(market)}
            >
              {filters.viewMode === 'grid' ? (
                // Grid View
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(market.category)}`}>
                      <span>{getCategoryIcon(market.category)}</span>
                      <span>{market.category}</span>
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeLeft(market.endTime)}</span>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {market.question}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {market.description}
                  </p>

                  {/* Outcomes */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{market.outcomes.yes}%</div>
                      <div className="text-xs text-green-700">YES</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{market.outcomes.no}%</div>
                      <div className="text-xs text-red-700">NO</div>
                    </div>
                  </div>

                  {/* Quick Bet Buttons */}
                  {!market.resolved && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickBet(market, 'yes');
                        }}
                        disabled={placingBet?.marketId === market.marketId}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        {placingBet?.marketId === market.marketId && placingBet.outcome ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <span>Bet YES</span>
                            <span className="text-xs">(0.01Ξ)</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickBet(market, 'no');
                        }}
                        disabled={placingBet?.marketId === market.marketId}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        {placingBet?.marketId === market.marketId && !placingBet.outcome ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <span>Bet NO</span>
                            <span className="text-xs">(0.01Ξ)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{market.totalLiquidity.toFixed(3)} ETH</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>ID: {market.marketId}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </div>
                  </div>

                  {/* Blockchain Badge */}
                  <div className="mt-3 flex items-center justify-center">
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <span>⛓️</span>
                      <span>Live on Zora</span>
                    </span>
                  </div>
                </div>
              ) : (
                // List View
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(market.category)}`}>
                        <span>{getCategoryIcon(market.category)}</span>
                        <span>{market.category}</span>
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeLeft(market.endTime)}</span>
                      </div>
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        ⛓️ ID: {market.marketId}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {market.question}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {market.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{market.outcomes.yes}%</div>
                      <div className="text-xs text-gray-500">YES</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-600">{market.outcomes.no}%</div>
                      <div className="text-xs text-gray-500">NO</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">{market.totalLiquidity.toFixed(3)}</div>
                      <div className="text-xs text-gray-500">ETH</div>
                    </div>
                    
                    {!market.resolved && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickBet(market, 'yes');
                          }}
                          disabled={placingBet?.marketId === market.marketId}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {placingBet?.marketId === market.marketId && placingBet.outcome ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'YES'
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickBet(market, 'no');
                          }}
                          disabled={placingBet?.marketId === market.marketId}
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {placingBet?.marketId === market.marketId && !placingBet.outcome ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'NO'
                          )}
                        </button>
                      </div>
                    )}
                    
                    <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-[-90deg]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Market Detail Modal */}
      <MarketDetailModal
        market={selectedMarket}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onNavigate={onNavigate}
      />

      {/* Empty State for No Blockchain Data */}
      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Markets on Blockchain Yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to create a prediction market on the Zora blockchain!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('create')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Create First Market</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Generate AI Markets
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>
          All markets are live smart contracts on Zora Sepolia testnet. 
          Real ETH transactions • Real predictions • Real rewards
        </p>
        <div className="flex justify-center items-center space-x-4 mt-2">
          <a
            href="https://sepolia.explorer.zora.energy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-1"
          >
            <span>Block Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <span>Network: Zora Sepolia</span>
          <span>•</span>
          <span>Chain ID: 999999999</span>
        </div>
      </div>
    </div>
  );
}