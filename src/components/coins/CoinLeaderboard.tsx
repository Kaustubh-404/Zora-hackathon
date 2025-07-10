
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePrivy } from "@privy-io/react-auth"
import { type CoinType, getCoinMetadata, COIN_TYPES } from "@/constants/coins"
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Users,
  Target,
  Zap,
  Star,
  Award,
  RefreshCw,
  Filter,
  ChevronDown,
} from "lucide-react"

// Mock data for demo
const MOCK_LEADERBOARD_DATA = [
  {
    address: "0x1234567890123456789012345678901234567890",
    username: "CryptoProphet",
    totalCoins: 15420,
    rank: 1,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 5200,
      [COIN_TYPES.STREAK]: 3800,
      [COIN_TYPES.ORACLE]: 2900,
      [COIN_TYPES.COMMUNITY]: 1800,
      [COIN_TYPES.RISK]: 1200,
      [COIN_TYPES.CRYPTO_MASTER]: 520,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 18,
    accuracy: 87,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    address: "0x2345678901234567890123456789012345678901",
    username: "MarketMaster",
    totalCoins: 12850,
    rank: 2,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 4200,
      [COIN_TYPES.STREAK]: 3100,
      [COIN_TYPES.ORACLE]: 2400,
      [COIN_TYPES.COMMUNITY]: 1650,
      [COIN_TYPES.RISK]: 1000,
      [COIN_TYPES.CRYPTO_MASTER]: 500,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 15,
    accuracy: 82,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    address: "0x3456789012345678901234567890123456789012",
    username: "TrendSpotter",
    totalCoins: 11200,
    rank: 3,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 3800,
      [COIN_TYPES.STREAK]: 2900,
      [COIN_TYPES.ORACLE]: 2100,
      [COIN_TYPES.COMMUNITY]: 1400,
      [COIN_TYPES.RISK]: 800,
      [COIN_TYPES.CRYPTO_MASTER]: 200,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 12,
    accuracy: 79,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    address: "0x4567890123456789012345678901234567890123",
    username: "DataDriven",
    totalCoins: 9750,
    rank: 4,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 3200,
      [COIN_TYPES.STREAK]: 2400,
      [COIN_TYPES.ORACLE]: 1800,
      [COIN_TYPES.COMMUNITY]: 1350,
      [COIN_TYPES.RISK]: 700,
      [COIN_TYPES.CRYPTO_MASTER]: 300,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 9,
    accuracy: 75,
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    address: "0x5678901234567890123456789012345678901234",
    username: "RiskTaker",
    totalCoins: 8900,
    rank: 5,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 2800,
      [COIN_TYPES.STREAK]: 2100,
      [COIN_TYPES.ORACLE]: 1600,
      [COIN_TYPES.COMMUNITY]: 1200,
      [COIN_TYPES.RISK]: 900,
      [COIN_TYPES.CRYPTO_MASTER]: 300,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 7,
    accuracy: 71,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    address: "0x6789012345678901234567890123456789012345",
    username: "SmartTrader",
    totalCoins: 7650,
    rank: 6,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 2400,
      [COIN_TYPES.STREAK]: 1800,
      [COIN_TYPES.ORACLE]: 1350,
      [COIN_TYPES.COMMUNITY]: 1100,
      [COIN_TYPES.RISK]: 700,
      [COIN_TYPES.CRYPTO_MASTER]: 300,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 6,
    accuracy: 68,
    lastActive: new Date(Date.now() - 18 * 60 * 60 * 1000),
  },
  {
    address: "0x7890123456789012345678901234567890123456",
    username: "AnalysisExpert",
    totalCoins: 6800,
    rank: 7,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 2200,
      [COIN_TYPES.STREAK]: 1600,
      [COIN_TYPES.ORACLE]: 1200,
      [COIN_TYPES.COMMUNITY]: 1000,
      [COIN_TYPES.RISK]: 600,
      [COIN_TYPES.CRYPTO_MASTER]: 200,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 5,
    accuracy: 65,
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    address: "0x8901234567890123456789012345678901234567",
    username: "PredictionPro",
    totalCoins: 5950,
    rank: 8,
    coinBreakdown: {
      [COIN_TYPES.ACCURACY]: 1900,
      [COIN_TYPES.STREAK]: 1400,
      [COIN_TYPES.ORACLE]: 1050,
      [COIN_TYPES.COMMUNITY]: 900,
      [COIN_TYPES.RISK]: 500,
      [COIN_TYPES.CRYPTO_MASTER]: 200,
      [COIN_TYPES.TECH_MASTER]: 0,
      [COIN_TYPES.SPORTS_MASTER]: 0,
    } as Record<CoinType, number>,
    streak: 4,
    accuracy: 62,
    lastActive: new Date(Date.now() - 30 * 60 * 60 * 1000),
  },
]

interface LeaderboardEntry {
  address: string
  username?: string
  avatar?: string
  totalCoins: number
  rank: number
  coinBreakdown: Record<CoinType, number>
  streak: number
  accuracy: number
  lastActive: Date
}

interface CoinLeaderboardProps {
  className?: string
}

export function CoinLeaderboard({ className = "" }: CoinLeaderboardProps) {
  const { user } = usePrivy()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoinType, setSelectedCoinType] = useState<CoinType | "all">("all")
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all")
  const [userRank, setUserRank] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Helper function to get user wallet address safely
  const getUserWalletAddress = (): string | null => {
    return user?.wallet?.address || null
  }

  useEffect(() => {
    loadLeaderboard()
  }, [selectedCoinType, timeframe])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use mock data for demo
      let leaderboardData = [...MOCK_LEADERBOARD_DATA]

      // Filter by coin type if not "all"
      if (selectedCoinType !== "all") {
        leaderboardData = leaderboardData.map((entry) => ({
          ...entry,
          totalCoins: entry.coinBreakdown[selectedCoinType] || 0,
        }))
      }

      // Sort by total coins and assign ranks
      leaderboardData.sort((a, b) => b.totalCoins - a.totalCoins)
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboard(leaderboardData)

      // Find user's rank (simulate user being in position 15 for demo)
      const userWalletAddress = getUserWalletAddress()
      if (userWalletAddress) {
        setUserRank(15) // Mock user rank
      } else {
        setUserRank(null)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold text-sm">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400"
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-600"
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-500"
    }
  }

  const getCoinIcon = (coinType: CoinType) => {
    switch (coinType) {
      case COIN_TYPES.ACCURACY:
        return <Target className="w-4 h-4" />
      case COIN_TYPES.STREAK:
        return <Zap className="w-4 h-4" />
      case COIN_TYPES.ORACLE:
        return <Star className="w-4 h-4" />
      case COIN_TYPES.COMMUNITY:
        return <Users className="w-4 h-4" />
      case COIN_TYPES.RISK:
        return <Crown className="w-4 h-4" />
      case COIN_TYPES.CRYPTO_MASTER:
        return <TrendingUp className="w-4 h-4" />
      case COIN_TYPES.TECH_MASTER:
        return <TrendingUp className="w-4 h-4" />
      case COIN_TYPES.SPORTS_MASTER:
        return <Trophy className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const getTopCoinType = (coinBreakdown: Record<CoinType, number>) => {
    const entries = Object.entries(coinBreakdown)
    if (entries.length === 0) return null

    const topEntry = entries.reduce((max, current) => (current[1] > max[1] ? current : max))

    return topEntry[0] as CoinType
  }

  // Helper function to check if entry belongs to current user
  const isCurrentUser = (entryAddress: string): boolean => {
    const userWalletAddress = getUserWalletAddress()
    if (!userWalletAddress) return false
    return userWalletAddress.toLowerCase() === entryAddress.toLowerCase()
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Coin Leaderboard</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={loadLeaderboard}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coin Type</label>
                <select
                  value={selectedCoinType}
                  onChange={(e) => setSelectedCoinType(e.target.value as CoinType | "all")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Coins</option>
                  {Object.entries(COIN_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {getCoinMetadata(value).name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as "all" | "week" | "month")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Rank Display */}
        {userRank && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getRankBadgeColor(userRank)}`}
              >
                {getRankIcon(userRank)}
              </div>
              <div>
                <p className="font-medium text-blue-900">Your Rank</p>
                <p className="text-blue-700 text-sm">
                  #{userRank} out of {leaderboard.length} players
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No leaderboard data yet</p>
            <p className="text-gray-400 text-sm">Start making predictions to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isUserEntry = isCurrentUser(entry.address)
              const topCoinType = getTopCoinType(entry.coinBreakdown)

              return (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                    isUserEntry ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">{getRankIcon(entry.rank)}</div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {entry.username || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                      </p>
                      {isUserEntry && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>🏆 {entry.totalCoins} coins</span>
                      <span>🎯 {entry.accuracy}% accuracy</span>
                      <span>🔥 {entry.streak} streak</span>
                      {topCoinType && (
                        <div className="flex items-center space-x-1">
                          {getCoinIcon(topCoinType)}
                          <span className="text-xs font-medium" style={{ color: getCoinMetadata(topCoinType).color }}>
                            {getCoinMetadata(topCoinType).symbol}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coin Breakdown */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{entry.totalCoins}</p>
                    <p className="text-xs text-gray-500">total coins</p>
                  </div>

                  {/* Detailed View Trigger */}
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-b-lg">
        <div className="text-center">
          <p className="text-purple-800 text-sm font-medium mb-1">🚀 Powered by Zora Coins SDK</p>
          <p className="text-purple-700 text-xs">
            All coins are tradeable on Uniswap V4 with automatic liquidity management
          </p>
        </div>
      </div>
    </div>
  )
}
