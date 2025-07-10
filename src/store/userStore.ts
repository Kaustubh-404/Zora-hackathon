

// src/store/userStore.ts - COMPLETE with Coin Integration
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CoinEarning, TradingPreferences } from '@/constants/coins';

export interface UserProfile {
  // Authentication
  isAuthenticated: boolean;
  walletAddress?: string;
  
  // ✅ Fixed: Farcaster Data - Allow null AND undefined
  farcaster?: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfp?: string | null;
    followerCount?: number;
    followingCount?: number;
    bio?: string;
  } | null; // ✅ CRITICAL: Allow the entire object to be null
  
  // Profile Information
  displayName: string;
  email?: string;
  phone?: string;
  bio?: string;
  
  // Interests and Preferences
  interests: string[];
  farcasterInterests?: string[];
  
  // ✅ NEW: Coin-related data
  coinBalances: Record<string, number>;
  totalCoinsEarned: number;
  coinEarningHistory: CoinEarning[];
  tradingPreferences: TradingPreferences;
  
  // Notification Preferences
  notificationPreferences: {
    email: boolean;
    push: boolean;
    predictions: boolean;
    coinRewards: boolean; // ✅ NEW: Coin reward notifications
  };
  
  // App State
  hasCompletedOnboarding: boolean;
  onboardingStep?: 'auth' | 'profile' | 'interests' | 'notifications' | 'complete';
  
  // Analytics
  joinedAt: Date;
  lastActive: Date;
  
  // ✅ NEW: Prediction stats for coin rewards
  predictionStats: {
    totalPredictions: number;
    correctPredictions: number;
    currentStreak: number;
    bestStreak: number;
    accuracyRate: number;
    totalEarned: number;
    categoryStats: Record<string, {
      predictions: number;
      correct: number;
      accuracy: number;
    }>;
  };
}

interface UserStore {
  // State
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (userData: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setFarcasterData: (farcasterData: UserProfile['farcaster']) => void;
  setOnboardingComplete: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // ✅ NEW: Coin-related actions
  updateCoinBalances: (balances: Record<string, number>) => void;
  addCoinEarning: (earning: CoinEarning) => void;
  updateTradingPreferences: (preferences: Partial<TradingPreferences>) => void;
  updatePredictionStats: (stats: Partial<UserProfile['predictionStats']>) => void;
  
  // Computed
  getDisplayName: () => string;
  hasLinkedFarcaster: () => boolean;
  getPrimaryInterests: () => string[];
  
  // ✅ NEW: Coin-related computed values
  getTotalCoinValue: () => number;
  getTopCoinType: () => string | null;
  getCoinAccuracy: () => number;
}

const initialUserState: UserProfile = {
  isAuthenticated: false,
  displayName: '',
  interests: [],
  farcaster: null, // ✅ Initialize as null
  
  // ✅ NEW: Initialize coin data
  coinBalances: {},
  totalCoinsEarned: 0,
  coinEarningHistory: [],
  tradingPreferences: {
    slippageTolerance: 0.05,
    autoApproval: false,
    minTradeAmount: 0.001,
    maxTradeAmount: 1.0,
    preferredCurrency: 'ETH',
  },
  
  notificationPreferences: {
    email: true,
    push: true,
    predictions: true,
    coinRewards: true, // ✅ NEW: Default to true
  },
  hasCompletedOnboarding: false,
  joinedAt: new Date(),
  lastActive: new Date(),
  
  // ✅ NEW: Initialize prediction stats
  predictionStats: {
    totalPredictions: 0,
    correctPredictions: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracyRate: 0,
    totalEarned: 0,
    categoryStats: {},
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (userData) => {
        set((state) => ({
          user: {
            ...initialUserState,
            ...state.user,
            ...userData,
            isAuthenticated: true,
            lastActive: new Date(),
          },
          error: null,
        }));
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            ...updates,
            lastActive: new Date(),
          } : null,
        }));
      },

      setFarcasterData: (farcasterData) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            farcaster: farcasterData, // ✅ This now accepts null properly
            displayName: state.user.displayName || farcasterData?.displayName || '',
            lastActive: new Date(),
          } : null,
        }));
      },

      setOnboardingComplete: (profile) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            ...profile,
            hasCompletedOnboarding: true,
            onboardingStep: 'complete',
            lastActive: new Date(),
          } : null,
        }));
      },

      logout: () => {
        set({
          user: null,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // ✅ NEW: Coin-related actions
      updateCoinBalances: (balances) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            coinBalances: balances,
            lastActive: new Date(),
          } : null,
        }));
      },

      addCoinEarning: (earning) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            coinEarningHistory: [earning, ...state.user.coinEarningHistory].slice(0, 100), // Keep last 100
            totalCoinsEarned: state.user.totalCoinsEarned + Number(earning.amount),
            lastActive: new Date(),
          } : null,
        }));
      },

      updateTradingPreferences: (preferences) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            tradingPreferences: {
              ...state.user.tradingPreferences,
              ...preferences,
            },
            lastActive: new Date(),
          } : null,
        }));
      },

      updatePredictionStats: (stats) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            predictionStats: {
              ...state.user.predictionStats,
              ...stats,
            },
            lastActive: new Date(),
          } : null,
        }));
      },

      // Computed Values
      getDisplayName: () => {
        const { user } = get();
        return user?.displayName || 
               user?.farcaster?.displayName || 
               user?.farcaster?.username ||
               'User';
      },

      hasLinkedFarcaster: () => {
        const { user } = get();
        return !!(user?.farcaster?.fid);
      },

      getPrimaryInterests: () => {
        const { user } = get();
        const userInterests = user?.interests || [];
        const farcasterInterests = user?.farcasterInterests || [];
        
        // Combine and deduplicate interests
        const allInterests = [...new Set([...userInterests, ...farcasterInterests])];
        return allInterests.slice(0, 5); // Return top 5 interests
      },

      // ✅ NEW: Coin-related computed values
      getTotalCoinValue: () => {
        const { user } = get();
        if (!user?.coinBalances) return 0;
        
        // In a real implementation, this would use current coin prices
        return Object.values(user.coinBalances).reduce((total, balance) => total + balance, 0);
      },

      getTopCoinType: () => {
        const { user } = get();
        if (!user?.coinBalances) return null;
        
        const entries = Object.entries(user.coinBalances);
        if (entries.length === 0) return null;
        
        const [topCoinType] = entries.reduce((max, current) => 
          current[1] > max[1] ? current : max
        );
        
        return topCoinType;
      },

      getCoinAccuracy: () => {
        const { user } = get();
        if (!user?.predictionStats || user.predictionStats.totalPredictions === 0) return 0;
        
        return (user.predictionStats.correctPredictions / user.predictionStats.totalPredictions) * 100;
      },
    }),
    {
      name: 'foresightcast-user',
      version: 2, // ✅ Increment version for coin integration
      
      // ✅ Enhanced persistence for coin data
      partialize: (state) => ({
        user: state.user ? {
          isAuthenticated: state.user.isAuthenticated,
          walletAddress: state.user.walletAddress,
          farcaster: state.user.farcaster,
          displayName: state.user.displayName,
          email: state.user.email,
          interests: state.user.interests,
          farcasterInterests: state.user.farcasterInterests,
          
          // ✅ NEW: Persist coin data
          coinBalances: state.user.coinBalances,
          totalCoinsEarned: state.user.totalCoinsEarned,
          coinEarningHistory: state.user.coinEarningHistory.slice(0, 50), // Keep last 50
          tradingPreferences: state.user.tradingPreferences,
          
          notificationPreferences: state.user.notificationPreferences,
          hasCompletedOnboarding: state.user.hasCompletedOnboarding,
          joinedAt: state.user.joinedAt,
          lastActive: state.user.lastActive,
          
          // ✅ NEW: Persist prediction stats
          predictionStats: state.user.predictionStats,
        } : null,
      }),
      
      // ✅ Migration for existing users
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Add coin-related fields for existing users
          if (persistedState?.user) {
            persistedState.user.coinBalances = {};
            persistedState.user.totalCoinsEarned = 0;
            persistedState.user.coinEarningHistory = [];
            persistedState.user.tradingPreferences = {
              slippageTolerance: 0.05,
              autoApproval: false,
              minTradeAmount: 0.001,
              maxTradeAmount: 1.0,
              preferredCurrency: 'ETH',
            };
            persistedState.user.notificationPreferences = {
              ...persistedState.user.notificationPreferences,
              coinRewards: true,
            };
            persistedState.user.predictionStats = {
              totalPredictions: 0,
              correctPredictions: 0,
              currentStreak: 0,
              bestStreak: 0,
              accuracyRate: 0,
              totalEarned: 0,
              categoryStats: {},
            };
          }
        }
        return persistedState;
      },
    }
  )
);