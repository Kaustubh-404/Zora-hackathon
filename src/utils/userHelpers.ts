// File: src/utils/userHelpers.ts

/**
 * Get user avatar with proper fallback handling
 * Handles both Privy (pfp) and Neynar (pfpUrl) data sources
 */
export const getUserAvatar = (user: any, userProfile?: any, fallbackSeed?: string) => {
  // Priority: Neynar pfpUrl > Privy pfp > Generated avatar
  if (userProfile?.farcaster?.pfpUrl) {
    return userProfile.farcaster.pfpUrl;
  }
  
  if (user?.farcaster?.pfp) {
    return user.farcaster.pfp;
  }
  
  const seed = fallbackSeed || user?.wallet?.address || 'default';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Get user display name with proper fallback
 */
export const getUserDisplayName = (user: any, userProfile?: any) => {
  return userProfile?.displayName || 
         user?.farcaster?.displayName || 
         user?.farcaster?.username ||
         'User';
};

/**
 * Get Farcaster username if available
 */
export const getFarcasterUsername = (user: any, userProfile?: any) => {
  return userProfile?.farcaster?.username || 
         user?.farcaster?.username ||
         null;
};

/**
 * Check if user has linked Farcaster - ✅ Fixed: Handle null values
 */
export const hasLinkedFarcaster = (user: any, userProfile?: any) => {
  return !!(userProfile?.farcaster?.fid || user?.farcaster?.fid);
};

/**
 * Format wallet address for display
 */
export const formatWalletAddress = (address?: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Map Neynar API response to our user profile format
 */
export const mapNeynarToProfile = (neynarUser: any) => {
  return {
    fid: neynarUser.fid || null,
    username: neynarUser.username || null,
    displayName: neynarUser.displayName || null,
    pfp: neynarUser.pfpUrl || null, // Map pfpUrl to pfp
    followerCount: neynarUser.followerCount,
    followingCount: neynarUser.followingCount,
    bio: neynarUser.bio,
  };
};

/**
 * Map Privy user to our profile format - ✅ Fixed: Handle null values properly
 */
export const mapPrivyToProfile = (privyUser: any) => {
  return {
    fid: privyUser.fid || null,           // ✅ Handle null
    username: privyUser.username || null, // ✅ Handle null
    displayName: privyUser.displayName || null, // ✅ Handle null
    pfp: privyUser.pfp || null,           // ✅ Handle null
  };
};

/**
 * Safe Farcaster data extraction - ✅ New: Helper for safe data access
 */
export const getSafeFarcasterData = (user: any) => {
  if (!user?.farcaster) return null;
  
  return {
    fid: user.farcaster.fid || null,
    username: user.farcaster.username || null,
    displayName: user.farcaster.displayName || null,
    pfp: user.farcaster.pfp || null,
  };
};
