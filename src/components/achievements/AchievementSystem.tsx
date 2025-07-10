"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, Target, Zap, Award, Crown } from "lucide-react"

// Mock data for demo
const MOCK_ACHIEVEMENTS = [
  {
    id: "first_prediction",
    title: "First Steps",
    description: "Make your first prediction",
    icon: Target,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    rarity: "common" as const,
    reward: {
      type: "badge" as const,
      value: "Newcomer Badge",
    },
  },
  {
    id: "correct_streak_5",
    title: "Hot Streak",
    description: "Get 5 predictions correct in a row",
    icon: Zap,
    progress: 3,
    total: 5,
    unlocked: false,
    rarity: "rare" as const,
    reward: {
      type: "nft" as const,
      value: "Streak Master NFT",
    },
  },
  {
    id: "big_winner",
    title: "Big Winner",
    description: "Win more than 1 ETH from a single prediction",
    icon: Crown,
    progress: 0,
    total: 1,
    unlocked: false,
    rarity: "epic" as const,
    reward: {
      type: "title" as const,
      value: "High Roller",
    },
  },
  {
    id: "prediction_master",
    title: "Prediction Master",
    description: "Achieve 80% accuracy with at least 50 predictions",
    icon: Award,
    progress: 32,
    total: 50,
    unlocked: false,
    rarity: "legendary" as const,
    reward: {
      type: "nft" as const,
      value: "Master Predictor NFT",
    },
  },
  {
    id: "community_helper",
    title: "Community Helper",
    description: "Help 10 new users with their first predictions",
    icon: Trophy,
    progress: 7,
    total: 10,
    unlocked: false,
    rarity: "rare" as const,
    reward: {
      type: "badge" as const,
      value: "Helper Badge",
    },
  },
  {
    id: "early_adopter",
    title: "Early Adopter",
    description: "Be among the first 1000 users on the platform",
    icon: Star,
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    rarity: "epic" as const,
    reward: {
      type: "nft" as const,
      value: "Pioneer NFT",
    },
  },
]

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  total: number
  unlocked: boolean
  unlockedAt?: Date
  rarity: "common" | "rare" | "epic" | "legendary"
  reward?: {
    type: "nft" | "badge" | "title"
    value: string
  }
}

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showUnlockedModal, setShowUnlockedModal] = useState<Achievement | null>(null)

  useEffect(() => {
    // Load user's achievement progress
    loadAchievementProgress()
  }, [])

  const loadAchievementProgress = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Use mock data for demo
    setAchievements(MOCK_ACHIEVEMENTS)
  }


  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 bg-gray-100"
      case "rare":
        return "text-blue-600 bg-blue-100"
      case "epic":
        return "text-purple-600 bg-purple-100"
      case "legendary":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700">
              {unlockedCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {unlockedCount === totalCount
            ? "All achievements unlocked! 🎉"
            : `${totalCount - unlockedCount} achievements remaining`}
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          const progressPercent = (achievement.progress / achievement.total) * 100

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg border p-6 transition-all duration-200 ${
                achievement.unlocked ? "border-yellow-200 bg-yellow-50" : "hover:shadow-md"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    achievement.unlocked ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${achievement.unlocked ? "text-gray-900" : "text-gray-600"}`}>
                      {achievement.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                  {achievement.unlocked ? (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">
                        Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {achievement.reward && (
                    <div className="mt-3 text-xs text-purple-600">
                      Reward: {achievement.reward.type} - {achievement.reward.value}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Achievement Unlock Modal */}
      {showUnlockedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="w-10 h-10 text-yellow-600" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
            <h4 className="text-lg font-semibold text-yellow-600 mb-3">{showUnlockedModal.title}</h4>
            <p className="text-gray-600 mb-6">{showUnlockedModal.description}</p>

            {showUnlockedModal.reward && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="text-purple-800 font-medium">🎁 Reward: {showUnlockedModal.reward.value}</p>
              </div>
            )}

            <button
              onClick={() => setShowUnlockedModal(null)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Awesome!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
