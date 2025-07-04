// File: src/components/pages/MarketsPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllMarkets } from '@/hooks/useAllMarkets';
import { AppPage } from '../../types/Navigation';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  Grid,
  List,
  RefreshCw,
  Star,
  Eye,
  BarChart3,
  Zap,
  ChevronDown,
  X
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
  const { loading, markets, error, fetchMarkets } = useAllMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>({
    search: '',
    category: '',
    timeframe: '',
    status: 'active',
    minLiquidity: 0,
    sortBy: 'newest',
    viewMode: 'grid'
  });

  // Load markets on mount
  useEffect(() => {
    if (markets.length === 0) {
      fetchMarkets();
    }
  }, []);

  // Filter and sort markets
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
          return (b.totalLiquidity * 10) - (a.totalLiquidity * 10); // Mock activity score
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

  const getTimeLeft = (endTime: Date) => {
    const now = Date.now();
    const timeLeft = endTime.getTime() - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ended';
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
              📊 Prediction Markets
            </h1>
            <p className="text-gray-600">
              Discover and trade on {markets.length} prediction markets across all categories
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
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active Markets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {markets.filter(m => !m.resolved && m.endTime > new Date()).length}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Total Volume</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {markets.reduce((sum, m) => sum + m.totalLiquidity, 0).toFixed(1)} ETH
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Categories</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(markets.map(m => m.category)).size}
            </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Filter Markets</h3>
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

              {/* Time Frame */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
                <select
                  value={filters.timeframe}
                  onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Time</option>
                  <option value="1d">📅 1 Day</option>
                  <option value="3d">📅 3 Days</option>
                  <option value="1w">📅 1 Week</option>
                  <option value="1m">📅 1 Month</option>
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
                  max="10"
                  step="0.1"
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
            {loading ? 'Loading...' : `${filteredMarkets.length} markets found`}
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
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Markets</h3>
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
            Try adjusting your filters or search terms to find more markets.
          </p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
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

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>{market.totalLiquidity.toFixed(2)} ETH</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </div>
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
                      <div className="text-sm font-bold text-blue-600">{market.totalLiquidity.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">ETH</div>
                    </div>
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
    </div>
  );
}

// Market Detail Modal Component (included in same file to avoid circular imports)
interface MarketDetailModalProps {
  market: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
}

function MarketDetailModal({ market, isOpen, onClose, onNavigate }: MarketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'rules'>('overview');
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!isOpen || !market) return null;

  const getTimeLeft = (endTime: Date) => {
    const now = Date.now();
    const timeLeft = endTime.getTime() - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (timeLeft <= 0) return 'Market Ended';
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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

  const handleBet = (outcome: 'yes' | 'no', amount: number) => {
    console.log('Bet placed:', { outcome, amount, market: market.question });
    alert(`Bet placed: ${outcome.toUpperCase()} for ${amount} ETH on "${market.question}"`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: market.question,
        text: `Check out this prediction market: ${market.question}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(market.category)}`}>
                    {market.category}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeLeft(market.endTime)}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {market.question}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{market.outcomes.yes}%</div>
                <div className="text-sm text-green-700">YES</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{market.outcomes.no}%</div>
                <div className="text-sm text-red-700">NO</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{market.totalLiquidity.toFixed(2)} ETH</div>
                <div className="text-sm text-blue-700">Liquidity</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.floor(Math.random() * 150 + 50)}
                </div>
                <div className="text-sm text-purple-700">Traders</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{market.description}</p>
              </div>

              {/* Market Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Market Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{market.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ends:</span>
                      <span className="font-medium">{market.endTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creator:</span>
                      <span className="font-medium capitalize">{market.creator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        market.resolved ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {market.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {market.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution Criteria */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resolution Criteria</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{market.resolutionCriteria}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Copy Link</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {!market.resolved && (
                  <>
                    <button
                      onClick={() => setShowBettingModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Place Bet
                    </button>
                    <button
                      onClick={() => onNavigate('home')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      More Markets
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simple Betting Modal */}
        {showBettingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Place Your Bet</h3>
                <button
                  onClick={() => setShowBettingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{market.question}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    handleBet('yes', 0.01);
                    setShowBettingModal(false);
                  }}
                  className="p-4 rounded-lg border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">YES</div>
                    <div className="text-sm text-green-700">{market.outcomes.yes}% odds</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    handleBet('no', 0.01);
                    setShowBettingModal(false);
                  }}
                  className="p-4 rounded-lg border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">NO</div>
                    <div className="text-sm text-red-700">{market.outcomes.no}% odds</div>
                  </div>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowBettingModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}