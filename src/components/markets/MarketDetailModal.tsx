// File: src/components/markets/MarketDetailModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppPage } from '../../types/Navigation';
import {
  X,
  Calendar,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Star,
  Share2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Target,
  Trophy,
  Copy,
  Twitter,
  MessageSquare
} from 'lucide-react';

interface MarketDetailModalProps {
  market: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
}

interface BettingModalProps {
  market: any;
  isOpen: boolean;
  onClose: () => void;
  onBet: (outcome: 'yes' | 'no', amount: number) => void;
}

function BettingModal({ market, isOpen, onClose, onBet }: BettingModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('0.01');

  if (!isOpen || !market) return null;

  const handleBet = () => {
    if (selectedOutcome && parseFloat(betAmount) >= 0.001) {
      onBet(selectedOutcome, parseFloat(betAmount));
      onClose();
      setSelectedOutcome(null);
      setBetAmount('0.01');
    }
  };

  const calculatePayout = (): string => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return '0.0000';
    const odds = selectedOutcome === 'yes' ? market.outcomes.yes : market.outcomes.no;
    if (odds <= 0) return '0.0000';
    return (parseFloat(betAmount) * (100 / odds)).toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Place Your Bet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{market.question}</p>
        </div>

        {/* Outcome Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setSelectedOutcome('yes')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedOutcome === 'yes'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-green-300 hover:border-green-400'
            }`}
          >
            <div className="text-center">
              <div className="text-xl font-bold">YES</div>
              <div className="text-sm">{market.outcomes.yes}% odds</div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedOutcome('no')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedOutcome === 'no'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-red-300 hover:border-red-400'
            }`}
          >
            <div className="text-center">
              <div className="text-xl font-bold">NO</div>
              <div className="text-sm">{market.outcomes.no}% odds</div>
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
            placeholder="0.01"
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
      </motion.div>
    </div>
  );
}

export function MarketDetailModal({ market, isOpen, onClose, onNavigate }: MarketDetailModalProps) {
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
    // In real app, this would make a blockchain transaction
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
                  <Share2 className="w-5 h-5" />
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

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'rules', label: 'Rules', icon: AlertCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
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
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {/* Mock activity data */}
                    {[
                      { type: 'bet', user: 'alice.eth', outcome: 'yes', amount: 0.5, time: '2 hours ago' },
                      { type: 'bet', user: 'bob.eth', outcome: 'no', amount: 0.25, time: '3 hours ago' },
                      { type: 'bet', user: 'charlie.eth', outcome: 'yes', amount: 1.0, time: '5 hours ago' },
                      { type: 'comment', user: 'diana.eth', content: 'Great market! Very well researched.', time: '6 hours ago' },
                      { type: 'bet', user: 'eve.eth', outcome: 'no', amount: 0.75, time: '8 hours ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                          activity.type === 'bet' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {activity.type === 'bet' ? '₿' : '💬'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{activity.user}</span>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                          {activity.type === 'bet' ? (
                            <p className="text-sm text-gray-600">
                              Bet <span className="font-medium">{activity.amount} ETH</span> on{' '}
                              <span className={`font-medium ${
                                activity.outcome === 'yes' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {activity.outcome?.toUpperCase()}
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">{activity.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Rules</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Resolution</h4>
                          <p className="text-blue-800 text-sm mt-1">
                            This market will resolve based on verifiable public information from reliable sources.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Dispute Period</h4>
                          <p className="text-yellow-800 text-sm mt-1">
                            There is a 48-hour dispute period after resolution during which the outcome can be challenged.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Target className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Payout</h4>
                          <p className="text-green-800 text-sm mt-1">
                            Winners receive payouts proportional to their bets and the final odds ratio.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Trophy className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">NFT Rewards</h4>
                          <p className="text-gray-700 text-sm mt-1">
                            Successful predictions are minted as commemorative NFTs on the Zora network.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy Link</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Discuss</span>
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

        {/* Betting Modal */}
        <BettingModal
          market={market}
          isOpen={showBettingModal}
          onClose={() => setShowBettingModal(false)}
          onBet={handleBet}
        />
      </div>
    </AnimatePresence>
  );
}