import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { FeedType } from '@neynar/nodejs-sdk/build/api';

class ServerFarcasterService {
  constructor() {
    const config = new Configuration({
      apiKey: process.env.VITE_NEYNAR_API_KEY,
    });
    this.client = new NeynarAPIClient(config);
    this.cache = new Map();
  }

  async getUserByFid(fid) {
    const cacheKey = `user_${fid}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.client.fetchBulkUsers({ fids: [fid] });
      const user = response.users[0];
      
      const userData = {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        bio: user.profile?.bio?.text || '',
      };

      this.cache.set(cacheKey, userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserCasts(fid, limit = 25) {
    try {
      const response = await this.client.fetchFeed({
        feedType: FeedType.Following,
        fid,
        limit,
      });
      
      return response.casts.map(cast => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        replies: cast.replies.count,
        reactions: cast.reactions.likes_count,
        recasts: cast.reactions.recasts_count,
        channel: cast.channel?.id || null,
        mentions: cast.mentioned_profiles?.map(p => p.username) || [],
        embeds: cast.embeds || [],
      }));
    } catch (error) {
      console.error('Error fetching user casts:', error);
      throw error;
    }
  }
}

export const serverFarcasterService = new ServerFarcasterService();