// src/components/coins/CoinTrading.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { coinsService } from '@/services/coins/coinsService';
import { CoinBalance, CoinType, getCoinMetadata, formatCoinAmount } from '@/constants/coins';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Settings,
  Info
} from 'lucide-react';

interface CoinTradingProps {
  className?: string;
}

export function CoinTrading({ className = '' }: CoinTradingProps) {
  const { user } = usePrivy();
  const [balances, setBalances] = useState<CoinBalance[]>([]);
  const [fromCoin, setFromCoin] = useState<CoinType | 'ETH'>('ETH');
  const [toCoin, setToCoin] = useState<CoinType | 'ETH'>('ACC');
  const [amount, setAmount] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [slippage, setSlippage] = useState(0.05); // 5%
  const [loading, setLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tradeError, setTradeError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.wallet?.address) {
      loadBalances();
    }
  }, [user?.wallet?.address]);

  useEffect(() => {
    if (amount && fromCoin && toCoin) {
      calculateExpectedOutput();
    }
  }, [amount, fromCoin, toCoin]);

  const loadBalances = async () => {
    if (!user?.wallet?.address) return;

    try {
      const userBalances = await coinsService.getUserCoinBalances(user.wallet.address as any);
      setBalances(userBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const calculateExpectedOutput = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setExpectedOutput('');
      return;
    }

    try {
      // In a real implementation, this would query Uniswap V4 for accurate pricing
      // For now, we'll simulate pricing with some basic calculations
      const inputAmount = parseFloat(amount);
      
      // Mock price calculation (in reality, this would come from Uniswap pools)
      let exchangeRate = 1;
      
      if (fromCoin === 'ETH' && toCoin !== 'ETH') {
        // ETH to Coin - simulate coin price in ETH
        exchangeRate = 0.001; // 1 coin = 0.001 ETH
      } else if (fromCoin !== 'ETH' && toCoin === 'ETH') {
        // Coin to ETH
        exchangeRate = 1000; // 1000 coins = 1 ETH
      } else if (fromCoin !== 'ETH' && toCoin !== 'ETH') {
        // Coin to Coin
        exchangeRate = 1.2; // Some exchange rate between coins
      }

      const output = inputAmount * exchangeRate;
      const impact = Math.min(inputAmount * 0.001, 0.05); // Max 5% impact
      
      setExpectedOutput(output.toFixed(6));
      setPriceImpact(impact);
      
    } catch (error) {
      console.error('Error calculating output:', error);
      setExpectedOutput('');
    }
  };

  const executeTrade = async () => {
    if (!user?.wallet?.address || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setTradeStatus('loading');
    setTradeError(null);

    try {
      // Check trading eligibility
      if (fromCoin !== 'ETH') {
        const eligibility = await coinsService.checkTradingEligibility(
          user.wallet.address as any,
          fromCoin,
          amount
        );
        
        if (!eligibility.eligible) {
          throw new Error(eligibility.reason);
        }
      }

      // Execute trade through Uniswap V4
      const result = await coinsService.tradeCoin(
        fromCoin,
        toCoin,
        amount,
        user.wallet.address as any,
        // In a real implementation, this would be the actual wallet client
        {} as any
      );

      if (result.success) {
        setTradeStatus('success');
        setAmount('');
        setExpectedOutput('');
        await loadBalances(); // Refresh balances
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setTradeStatus('idle');
        }, 3000);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Trade failed:', error);
      setTradeError(error instanceof Error ? error.message : 'Trade failed');
      setTradeStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const swapCoinPositions = () => {
    const tempFrom = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tempFrom);
    setAmount('');
    setExpectedOutput('');
  };

  const getBalance = (coinType: CoinType | 'ETH') => {
    if (coinType === 'ETH') {
      return 1.0; // Mock ETH balance
    }
    
    const balance = balances.find(b => b.coinType === coinType);
    return balance ? parseFloat(formatCoinAmount(balance.balance)) : 0;
  };

  const getCoinName = (coinType: CoinType | 'ETH') => {
    if (coinType === 'ETH') return 'Ethereum';
    return getCoinMetadata(coinType).name;
  };

  const getCoinSymbol = (coinType: CoinType | 'ETH') => {
    if (coinType === 'ETH') return 'ETH';
    return getCoinMetadata(coinType).symbol;
  };

  const getMaxAmount = () => {
    return getBalance(fromCoin);
  };

  const setMaxAmount = () => {
    setAmount(getMaxAmount().toString());
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Coin Trading</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Trade your prediction coins on Uniswap V4 with optimal pricing
        </div>
      </div>

      <div className="p-6">
        {/* Trading Interface */}
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">From</label>
              <div className="text-sm text-gray-500">
                Balance: {getBalance(fromCoin).toFixed(6)} {getCoinSymbol(fromCoin)}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value as any)}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ETH">ETH - Ethereum</option>
                <option value="ACC">ACC - Accuracy Coin</option>
                <option value="STR">STR - Streak Coin</option>
                <option value="ORC">ORC - Oracle Coin</option>
                <option value="COM">COM - Community Coin</option>
                <option value="RSK">RSK - Risk Coin</option>
                <option value="CRM">CRM - Crypto Master</option>
                <option value="TCM">TCM - Tech Master</option>
                <option value="SPM">SPM - Sports Master</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-32 text-right border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={setMaxAmount}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapCoinPositions}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">To</label>
              <div className="text-sm text-gray-500">
                Balance: {getBalance(toCoin).toFixed(6)} {getCoinSymbol(toCoin)}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value as any)}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ETH">ETH - Ethereum</option>
                <option value="ACC">ACC - Accuracy Coin</option>
                <option value="STR">STR - Streak Coin</option>
                <option value="ORC">ORC - Oracle Coin</option>
                <option value="COM">COM - Community Coin</option>
                <option value="RSK">RSK - Risk Coin</option>
                <option value="CRM">CRM - Crypto Master</option>
                <option value="TCM">TCM - Tech Master</option>
                <option value="SPM">SPM - Sports Master</option>
              </select>
              
              <div className="w-32 text-right py-2 px-3 bg-gray-100 rounded-lg">
                {expectedOutput || '0.0'}
              </div>
            </div>
          </div>

          {/* Trade Details */}
          {amount && expectedOutput && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Expected Output:</span>
                <span className="font-medium">{expectedOutput} {getCoinSymbol(toCoin)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price Impact:</span>
                <span className={`font-medium ${priceImpact > 0.03 ? 'text-red-600' : 'text-green-600'}`}>
                  {(priceImpact * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Slippage Tolerance:</span>
                <span className="font-medium">{(slippage * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Minimum Received:</span>
                <span className="font-medium">
                  {(parseFloat(expectedOutput) * (1 - slippage)).toFixed(6)} {getCoinSymbol(toCoin)}
                </span>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-3">Trading Settings</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slippage Tolerance
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                      value={slippage}
                      onChange={(e) => setSlippage(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-16 text-center">
                      {(slippage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Higher slippage = faster execution but potentially worse prices</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {tradeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{tradeError}</span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {tradeStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">Trade executed successfully!</span>
              </div>
            </div>
          )}

          {/* Trade Button */}
          <button
            onClick={executeTrade}
            disabled={
              loading || 
              !amount || 
              parseFloat(amount) <= 0 || 
              parseFloat(amount) > getMaxAmount() ||
              fromCoin === toCoin
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Trade...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>
                  {fromCoin === toCoin ? 'Select Different Coins' : 
                   parseFloat(amount) > getMaxAmount() ? 'Insufficient Balance' :
                   `Swap ${getCoinSymbol(fromCoin)} for ${getCoinSymbol(toCoin)}`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Trading Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">🚀 Powered by Uniswap V4</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Optimal pricing with advanced hooks and liquidity management</p>
            <p>• Multi-position liquidity for better price discovery</p>
            <p>• MEV protection for fair trading</p>
            <p>• Automatic fee collection and reward distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
}
