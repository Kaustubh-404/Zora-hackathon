// // src/components/coins/CoinStaking.tsx - COMPLETE

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePrivy } from "@privy-io/react-auth"
import { coinsService } from "@/services/coins/coinsService"
import { type CoinType, type CoinBalance, getCoinMetadata, formatCoinAmount, COIN_TYPES } from "@/constants/coins"
import { Lock, Unlock, Calculator, Info, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

// Mock data for demo
const MOCK_BALANCES: CoinBalance[] = [
  {
      coinType: COIN_TYPES.ACCURACY,
      symbol: "ACC",
      balance: BigInt("1250750000000000000000"), // 1250.75 with 18 decimals
      priceUSD: 0.85,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
  {
      coinType: COIN_TYPES.STREAK,
      symbol: "STR",
      balance: BigInt("890250000000000000000"), // 890.25 with 18 decimals
      priceUSD: 1.2,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
  {
      coinType: COIN_TYPES.ORACLE,
      symbol: "ORC",
      balance: BigInt("456500000000000000000"), // 456.50 with 18 decimals
      priceUSD: 2.15,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
  {
      coinType: COIN_TYPES.COMMUNITY,
      symbol: "COM",
      balance: BigInt("2100000000000000000000"), // 2100.00 with 18 decimals
      priceUSD: 0.45,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
  {
      coinType: COIN_TYPES.RISK,
      symbol: "RSK",
      balance: BigInt("125750000000000000000"), // 125.75 with 18 decimals
      priceUSD: 5.8,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
  {
      coinType: COIN_TYPES.CRYPTO_MASTER,
      symbol: "CRM",
      balance: BigInt("75250000000000000000"), // 75.25 with 18 decimals
      priceUSD: 8.9,
      coinAddress: "0x145685555",
      name: "",
      decimals: 0
  },
]

const MOCK_STAKING_POOLS = [
  {
    coinType: COIN_TYPES.ACCURACY,
    totalStaked: 125000,
    apr: 12.5,
    userStaked: 250.5,
    userRewards: 15.75,
    lockPeriod: 7,
    isActive: true,
  },
  {
    coinType: COIN_TYPES.STREAK,
    totalStaked: 89000,
    apr: 15.2,
    userStaked: 180.25,
    userRewards: 22.8,
    lockPeriod: 7,
    isActive: true,
  },
  {
    coinType: COIN_TYPES.ORACLE,
    totalStaked: 45000,
    apr: 18.7,
    userStaked: 100.0,
    userRewards: 35.2,
    lockPeriod: 14,
    isActive: true,
  },
  {
    coinType: COIN_TYPES.COMMUNITY,
    totalStaked: 210000,
    apr: 8.5,
    userStaked: 500.0,
    userRewards: 12.5,
    lockPeriod: 7,
    isActive: true,
  },
  {
    coinType: COIN_TYPES.RISK,
    totalStaked: 12000,
    apr: 25.0,
    userStaked: 50.0,
    userRewards: 45.8,
    lockPeriod: 30,
    isActive: true,
  },
  {
    coinType: COIN_TYPES.CRYPTO_MASTER,
    totalStaked: 7500,
    apr: 22.3,
    userStaked: 25.0,
    userRewards: 18.9,
    lockPeriod: 14,
    isActive: true,
  },
]

interface StakingPool {
  coinType: CoinType
  totalStaked: number
  apr: number
  userStaked: number
  userRewards: number
  lockPeriod: number // days
  isActive: boolean
}

interface CoinStakingProps {
  className?: string
}

export function CoinStaking({ className = "" }: CoinStakingProps) {
  const { user } = usePrivy()
  const [balances, setBalances] = useState<CoinBalance[]>([])
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([])
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake")
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    if (user?.wallet?.address) {
      loadStakingData()
    } else {
      // Load mock data for demo
      loadMockData()
    }
  }, [user?.wallet?.address])

  const loadMockData = () => {
    setLoading(true)
    // Simulate API delay
    setTimeout(() => {
      setBalances(MOCK_BALANCES)
      setStakingPools(MOCK_STAKING_POOLS)
      setLoading(false)
    }, 1000)
  }

  const loadStakingData = async () => {
    if (!user?.wallet?.address) return

    setLoading(true)
    try {
      // Load user balances
      const userBalances = await coinsService.getUserCoinBalances(user.wallet.address as any)
      setBalances(userBalances.length > 0 ? userBalances : MOCK_BALANCES)

      // Load staking pools (use mock data for demo)
      setStakingPools(MOCK_STAKING_POOLS)
    } catch (error) {
      console.error("Error loading staking data:", error)
      // Fallback to mock data
      setBalances(MOCK_BALANCES)
      setStakingPools(MOCK_STAKING_POOLS)
    } finally {
      setLoading(false)
    }
  }

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount || !user?.wallet?.address) return

    setTransactionStatus("pending")
    try {
      // In real implementation, this would call staking contract
      console.log(`Staking ${stakeAmount} ${selectedPool.coinType} coins`)

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setTransactionStatus("success")
      setStakeAmount("")

      // Refresh data
      await (user?.wallet?.address ? loadStakingData() : loadMockData())

      setTimeout(() => setTransactionStatus("idle"), 3000)
    } catch (error) {
      console.error("Staking failed:", error)
      setTransactionStatus("error")
    }
  }

  const handleUnstake = async () => {
    if (!selectedPool || !unstakeAmount || !user?.wallet?.address) return

    setTransactionStatus("pending")
    try {
      // In real implementation, this would call unstaking contract
      console.log(`Unstaking ${unstakeAmount} ${selectedPool.coinType} coins`)

      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setTransactionStatus("success")
      setUnstakeAmount("")

      // Refresh data
      await (user?.wallet?.address ? loadStakingData() : loadMockData())

      setTimeout(() => setTransactionStatus("idle"), 3000)
    } catch (error) {
      console.error("Unstaking failed:", error)
      setTransactionStatus("error")
    }
  }

  const getAvailableBalance = (coinType: CoinType): number => {
    const balance = balances.find((b) => b.coinType === coinType)
    return balance ? Number.parseFloat(formatCoinAmount(balance.balance)) : 0
  }

  const calculateRewards = (principal: number, apr: number, days: number): number => {
    return principal * (apr / 100) * (days / 365)
  }

  const getCoinIcon = (coinType: CoinType) => {
    const iconMap = {
      [COIN_TYPES.ACCURACY]: "🎯",
      [COIN_TYPES.STREAK]: "⚡",
      [COIN_TYPES.ORACLE]: "🔮",
      [COIN_TYPES.COMMUNITY]: "👥",
      [COIN_TYPES.RISK]: "👑",
      [COIN_TYPES.CRYPTO_MASTER]: "₿",
      [COIN_TYPES.TECH_MASTER]: "💻",
      [COIN_TYPES.SPORTS_MASTER]: "🏆",
    }
    return iconMap[coinType] || "🪙"
  }

  const totalStakedValue = stakingPools.reduce((sum, pool) => sum + pool.userStaked, 0)
  const totalRewards = stakingPools.reduce((sum, pool) => sum + pool.userRewards, 0)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Coin Staking</h3>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Stake your prediction coins to earn passive rewards while supporting the ecosystem
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{totalStakedValue.toFixed(0)}</div>
            <div className="text-xs text-green-700">Total Staked</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{totalRewards.toFixed(2)}</div>
            <div className="text-xs text-blue-700">Pending Rewards</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {stakingPools.length > 0
                ? (stakingPools.reduce((sum, p) => sum + p.apr, 0) / stakingPools.length).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-xs text-purple-700">Avg APR</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Staking Pools */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Available Staking Pools</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakingPools.map((pool) => {
              const metadata = getCoinMetadata(pool.coinType)
              const available = getAvailableBalance(pool.coinType)

              return (
                <motion.div
                  key={pool.coinType}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPool?.coinType === pool.coinType
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPool(pool)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCoinIcon(pool.coinType)}</div>
                      <div>
                        <div className="font-medium text-gray-900">{metadata.name}</div>
                        <div className="text-sm text-gray-500">{metadata.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{pool.apr}%</div>
                      <div className="text-xs text-gray-500">APR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Available:</div>
                      <div className="font-medium">{available.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Staked:</div>
                      <div className="font-medium">{pool.userStaked.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Lock Period:</div>
                      <div className="font-medium">{pool.lockPeriod} days</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rewards:</div>
                      <div className="font-medium text-green-600">+{pool.userRewards.toFixed(4)}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Staking Interface */}
        {selectedPool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-blue-200 rounded-lg p-4 bg-blue-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">{getCoinMetadata(selectedPool.coinType).name} Staking</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("stake")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === "stake" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab("unstake")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeTab === "unstake" ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  Unstake
                </button>
              </div>
            </div>

            {activeTab === "stake" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Amount to Stake</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setStakeAmount(getAvailableBalance(selectedPool.coinType).toString())}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-blue-700 mt-1">
                    <span>
                      Available: {getAvailableBalance(selectedPool.coinType).toFixed(2)} {selectedPool.coinType}
                    </span>
                    <span>
                      Est. rewards: +
                      {calculateRewards(
                        Number.parseFloat(stakeAmount) || 0,
                        selectedPool.apr,
                        selectedPool.lockPeriod,
                      ).toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-xs text-blue-800 mb-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    Staking Details
                  </div>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div>Lock Period: {selectedPool.lockPeriod} days</div>
                    <div>APR: {selectedPool.apr}%</div>
                    <div>Rewards paid: Daily</div>
                  </div>
                </div>

                <button
                  onClick={handleStake}
                  disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0 || transactionStatus === "pending"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {transactionStatus === "pending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Staking...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Stake {selectedPool.coinType}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Amount to Unstake</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.0"
                      max={selectedPool.userStaked}
                      className="flex-1 border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setUnstakeAmount(selectedPool.userStaked.toString())}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-blue-700 mt-1">
                    <span>
                      Staked: {selectedPool.userStaked.toFixed(2)} {selectedPool.coinType}
                    </span>
                    <span>Pending rewards: +{selectedPool.userRewards.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-yellow-100 rounded-lg p-3">
                  <div className="text-xs text-yellow-800 mb-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Unstaking Notice
                  </div>
                  <div className="text-xs text-yellow-700">
                    Unstaking will also claim all pending rewards. Make sure you're within the unlock period.
                  </div>
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0 || transactionStatus === "pending"}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {transactionStatus === "pending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Unstaking...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Unstake {selectedPool.coinType}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Transaction Status */}
            {transactionStatus === "success" && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {activeTab === "stake" ? "Staking" : "Unstaking"} completed successfully!
                  </span>
                </div>
              </div>
            )}

            {transactionStatus === "error" && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {activeTab === "stake" ? "Staking" : "Unstaking"} failed. Please try again.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Rewards Calculator */}
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <h4 className="font-medium text-purple-900 mb-3">Staking Calculator</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Principal Amount</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full border border-purple-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">APR (%)</label>
                <input
                  type="number"
                  placeholder="12"
                  className="w-full border border-purple-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Days</label>
                <input
                  type="number"
                  placeholder="365"
                  className="w-full border border-purple-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-lg font-bold text-purple-900">Estimated Rewards: 120.00 coins</div>
              <div className="text-sm text-purple-700">Annual yield: ~12%</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
