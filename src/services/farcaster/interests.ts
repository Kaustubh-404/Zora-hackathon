import { farcasterService } from './client';

export interface UserInterests {
  topics: string[];
  channels: string[];
  engagementScore: number;
  categories: Record<string, number>;
}

export class InterestExtractor {
  async analyzeUserInterests(fid: number): Promise<UserInterests> {
    try {
      // Use the new API endpoint that does analysis on the server
      const result = await farcasterService.getUserInterests(fid);
      return result.interests;
    } catch (error) {
      console.error('Error analyzing user interests:', error);
      // Return default interests on error
      return {
        topics: ['crypto', 'web3'],
        channels: ['general'],
        engagementScore: 0,
        categories: { 'general': 1 },
      };
    }
  }
}

export const interestExtractor = new InterestExtractor();