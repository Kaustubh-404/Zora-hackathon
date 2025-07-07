import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { userAnalyticsService, UserStats, MarketInsights } from '@/services/analytics/userAnalytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Activity,
  BarChart3,
  Users} from 'lucide-react';

export function AnalyticsDashboard() {
  const { user } = usePrivy();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'performance' | 'insights' | 'leaderboard'>('performance');

  useEffect(() => {
    if (user?.wallet?.address) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user?.wallet?.address) return;
    
    setLoading(true);
    try {
      const [stats, insights] = await Promise.all([
        userAnalyticsService.getUserStats(user.wallet.address),
        userAnalyticsService.getMarketInsights(),
      ]);
      
      setUserStats(stats);
      setMarketInsights(insights);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Advanced Analytics
        </h1>
        <p className="text-gray-600">
          Deep insights into your prediction performance and market trends
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'performance', label: 'My Performance', icon: TrendingUp },
              { id: 'insights', label: 'Market Insights', icon: BarChart3 },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award },
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

        <div className="p-6">
          {activeTab === 'performance' && userStats && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Bets"
                  value={userStats.totalBets.toString()}
                  icon={Target}
                  color="blue"
                />
                <MetricCard
                  title="Win Rate"
                  value={`${userStats.winRate.toFixed(1)}%`}
                  icon={Award}
                  color={userStats.winRate >= 50 ? "green" : "red"}
                />
                <MetricCard
                  title="Total P&L"
                  value={`${userStats.profitLoss >= 0 ? '+' : ''}${userStats.profitLoss.toFixed(3)} ETH`}
                  icon={DollarSign}
                  color={userStats.profitLoss >= 0 ? "green" : "red"}
                />
                <MetricCard
                  title="ROI"
                  value={`${userStats.roi >= 0 ? '+' : ''}${userStats.roi.toFixed(1)}%`}
                  icon={TrendingUp}
                  color={userStats.roi >= 0 ? "green" : "red"}
                />
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Daily Performance (Last 30 Days)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userStats.recentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date: string | number | Date) => new Date(date).toLocaleDateString()} 
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date: string | number | Date) => new Date(date).toLocaleDateString()}
                        formatter={(value: any, name: any) => [`${value} ETH`, 'Profit/Loss']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Performance */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance by Category
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(userStats.categoryPerformance).map(([category, stats]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{category}</p>
                          <p className="text-sm text-gray-500">{stats.bets} bets</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(3)} ETH
                          </p>
                          <p className="text-sm text-gray-500">
                            {stats.winRate.toFixed(1)}% win rate
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Advanced Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Streak:</span>
                      <span className="font-semibold">{userStats.currentStreak} wins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Streak:</span>
                      <span className="font-semibold">{userStats.bestStreak} wins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Odds:</span>
                      <span className="font-semibold">{userStats.averageOdds.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio:</span>
                      <span className="font-semibold">{userStats.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Wagered:</span>
                      <span className="font-semibold">{userStats.totalWagered.toFixed(3)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && marketInsights && (
            <div className="space-y-8">
              {/* Market Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Markets"
                  value={marketInsights.totalMarkets.toString()}
                  icon={BarChart3}
                  color="blue"
                />
                <MetricCard
                  title="Total Volume"
                  value={`${marketInsights.totalVolume.toFixed(1)} ETH`}
                  icon={DollarSign}
                  color="green"
                />
                <MetricCard
                  title="Avg Market Size"
                  value={`${marketInsights.averageMarketSize.toFixed(3)} ETH`}
                  icon={Activity}
                  color="purple"
                />
                <MetricCard
                  title="Active Traders"
                  value="347"
                  icon={Users}
                  color="orange"
                />
              </div>

              {/* Category Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Popular Categories
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={marketInsights.mostPopularCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="volume"
                        >
                          {marketInsights.mostPopularCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} ETH`, 'Volume']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {marketInsights.mostPopularCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Market Trends
                  </h3>
                  <div className="space-y-4">
                    {marketInsights.recentTrends.map((trend, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">{trend.period}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Volume:</span>
                            <p className="font-semibold">{trend.volume} ETH</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Markets:</span>
                            <p className="font-semibold">{trend.markets}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Return:</span>
                            <p className="font-semibold text-green-600">+{trend.avgReturn}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && marketInsights && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🏆 Top Predictors
                </h3>
                <div className="space-y-4">
                  {marketInsights.topPerformers.map((performer, index) => (
                    <div key={performer.address} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {performer.username || `${performer.address.slice(0, 6)}...${performer.address.slice(-4)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {performer.bets} bets • {performer.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{performer.profit.toFixed(2)} ETH
                        </p>
                        <p className="text-xs text-gray-500">Total profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}