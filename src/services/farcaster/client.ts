
class RealFarcasterService {
  private baseUrl = 'http://localhost:3001/api/farcaster';
  private cache = new Map();

  async getUserByFid(fid: number) {
    const cacheKey = `user_${fid}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/${fid}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }

      this.cache.set(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserCasts(fid: number, limit = 25) {
    try {
      const response = await fetch(`${this.baseUrl}/casts/${fid}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch casts');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching user casts:', error);
      throw error;
    }
  }

  async getUserInterests(fid: number) {
    try {
      const response = await fetch(`${this.baseUrl}/interests/${fid}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch interests');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching user interests:', error);
      throw error;
    }
  }
}

export const farcasterService = new RealFarcasterService();