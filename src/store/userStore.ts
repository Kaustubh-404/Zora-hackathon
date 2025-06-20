// File: src/store/userStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  // Notification Preferences
  notificationPreferences: {
    email: boolean;
    push: boolean;
    predictions: boolean;
  };
  
  // App State
  hasCompletedOnboarding: boolean;
  onboardingStep?: 'auth' | 'profile' | 'interests' | 'notifications' | 'complete';
  
  // Analytics
  joinedAt: Date;
  lastActive: Date;
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
  
  // Computed
  getDisplayName: () => string;
  hasLinkedFarcaster: () => boolean;
  getPrimaryInterests: () => string[];
}

const initialUserState: UserProfile = {
  isAuthenticated: false,
  displayName: '',
  interests: [],
  farcaster: null, // ✅ Initialize as null
  notificationPreferences: {
    email: true,
    push: true,
    predictions: true,
  },
  hasCompletedOnboarding: false,
  joinedAt: new Date(),
  lastActive: new Date(),
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
    }),
    {
      name: 'foresightcast-user',
      version: 1,
      // Only persist essential user data
      partialize: (state) => ({
        user: state.user ? {
          isAuthenticated: state.user.isAuthenticated,
          walletAddress: state.user.walletAddress,
          farcaster: state.user.farcaster,
          displayName: state.user.displayName,
          email: state.user.email,
          interests: state.user.interests,
          farcasterInterests: state.user.farcasterInterests,
          notificationPreferences: state.user.notificationPreferences,
          hasCompletedOnboarding: state.user.hasCompletedOnboarding,
          joinedAt: state.user.joinedAt,
          lastActive: state.user.lastActive,
        } : null,
      }),
    }
  )
);