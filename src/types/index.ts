// User Types
export interface User {
  id: string;
  fid?: number; // Farcaster ID
  username?: string;
  displayName?: string;
  avatar?: string;
  walletAddress?: string;
  isConnected: boolean;
}

// Farcaster Types
export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
  bio?: string;
}

// Prediction Market Types
export interface PredictionMarket {
  id: string;
  question: string;
  description: string;
  category: string;
  endTime: Date;
  totalLiquidity: number;
  outcomes: {
    yes: number;
    no: number;
  };
  resolved: boolean;
  resolution?: boolean;
  createdAt: Date;
  creator: string;
  tags: string[];
}

// User Prediction
export interface UserPrediction {
  id: string;
  marketId: string;
  userId: string;
  outcome: boolean; // true = yes, false = no
  confidence: number; // 1-100
  amount: number;
  timestamp: Date;
  nftTokenId?: string;
  resolved?: boolean;
  won?: boolean;
}

// Interest Profile
export interface UserInterests {
  topics: string[];
  channels: string[];
  engagementScore: number;
  categories: {
    [key: string]: number; // category -> relevance score
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Swipe Actions
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type PredictionAction = 'yes' | 'no' | 'skip';