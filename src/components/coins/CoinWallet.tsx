

// src/components/coins/CoinWallet.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { coinsService } from '@/services/coins/coinsService';
import { coinRewardsService } from '@/services/coins/coinRewards';
import { CoinBalance, CoinEarning, getCoinMetadata, formatCoinAmount } from '@/constants/coins';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Star,
  Trophy,
  Target,
  Users,
  Zap,
  Crown,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface CoinWalletProps {
  className?: string;
}

export function CoinWallet({ className = '' }: CoinWalletProps) {
  const { user } = usePrivy();
  const [balances, setBalances] = useState<CoinBalance[]>([]);
  const [earnings, setEarnings] = useState<CoinEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinBalance | null>(null);
  const [showEarnings, setShowEarnings] = useState(false);

  useEffect(() => {
    if (user?.wallet?.address) {
      loadWalletData();
    }
  }, [user?.wallet?.address]);

  const loadWalletData = async () => {
    if (!user?.wallet?.address) return;

    setLoading(true);
    try {
      const [userBalances, userEarnings] = await Promise.all([
        coinsService.getUserCoinBalances(user.wallet.address as any),
        coinRewardsService.getUserEarnings(user.wallet.address as any),
      ]);

      setBalances(userBalances);
      setEarnings(userEarnings);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoinIcon = (coinType: string) => {
    switch (coinType) {
      case 'ACC': return <Target className="w-5 h-5" />;
      case 'STR': return <Zap className="w-5 h-5" />;
      case 'ORC': return <Sparkles className="w-5 h-5" />;
      case 'COM': return <Users className="w-5 h-5" />;
      case 'RSK': return <Crown className="w-5 h-5" />;
      case 'CRM': return <Coins className="w-5 h-5" />;
      case 'TCM': return <TrendingUp className="w-5 h-5" />;
      case 'SPM': return <Trophy className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getTotalPortfolioValue = () => {
    return balances.reduce((total, balance) => {
      const coinValue = parseFloat(formatCoinAmount(balance.balance)) * (balance.priceUSD || 0);
      return total + coinValue;
    }, 0);
  };

  const getTopCoin = () => {
    return balances.reduce((top, balance) => {
      const coinValue = parseFloat(formatCoinAmount(balance.balance)) * (balance.priceUSD || 0);
      const topValue = parseFloat(formatCoinAmount(top.balance)) * (top.priceUSD || 0);
      return coinValue > topValue ? balance : top;
    }, balances[0]);
  };

  const getRecentEarnings = () => {
    return earnings
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Coin Wallet</h3>
          </div>
          <button
            onClick={loadWalletData}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${getTotalPortfolioValue().toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Top Coin</p>
              {getTopCoin() && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: getCoinMetadata(getTopCoin().coinType).color }}>
                    {getCoinIcon(getTopCoin().symbol)}
                  </div>
                  <span className="font-medium">{getTopCoin().symbol}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowEarnings(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showEarnings
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Balances
          </button>
          <button
            onClick={() => setShowEarnings(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showEarnings
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Earnings
          </button>
        </div>
      </div>

      <div className="p-6">
        {!showEarnings ? (
          // Coin Balances
          <div className="space-y-4">
            {balances.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No coins yet</p>
                <p className="text-sm text-gray-400">Make predictions to earn coins!</p>
              </div>
            ) : (
              balances.map((balance) => {
                const metadata = getCoinMetadata(balance.coinType);
                const amount = formatCoinAmount(balance.balance);
                const usdValue = parseFloat(amount) * (balance.priceUSD || 0);
                
                return (
                  <motion.div
                    key={balance.coinType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedCoin(balance)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: metadata.color }}
                      >
                        {getCoinIcon(balance.symbol)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{metadata.name}</p>
                        <p className="text-sm text-gray-500">{balance.symbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{amount}</p>
                      <p className="text-sm text-gray-500">${usdValue.toFixed(2)}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          // Recent Earnings
          <div className="space-y-4">
            {getRecentEarnings().length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No earnings yet</p>
                <p className="text-sm text-gray-400">Make correct predictions to earn coins!</p>
              </div>
            ) : (
              getRecentEarnings().map((earning) => {
                const metadata = getCoinMetadata(earning.coinType);
                const amount = formatCoinAmount(earning.amount);
                
                return (
                  <motion.div
                    key={earning.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: metadata.color }}
                      >
                        {getCoinIcon(earning.coinType)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">+{amount} {earning.coinType}</p>
                        <p className="text-sm text-gray-600">{earning.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm font-medium">Earned</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {earning.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Coin Detail Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getCoinMetadata(selectedCoin.coinType).color }}
                >
                  {getCoinIcon(selectedCoin.symbol)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getCoinMetadata(selectedCoin.coinType).name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedCoin.symbol}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCoin(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-5 h-5 transform rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCoinAmount(selectedCoin.balance)}
                </p>
                <p className="text-sm text-gray-500">
                  ≈ ${(parseFloat(formatCoinAmount(selectedCoin.balance)) * (selectedCoin.priceUSD || 0)).toFixed(2)} USD
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  {getCoinMetadata(selectedCoin.coinType).description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {getCoinMetadata(selectedCoin.coinType).category}
                  </span>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    {getCoinMetadata(selectedCoin.coinType).rarity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Buy</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  <Minus className="w-4 h-4" />
                  <span>Sell</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

