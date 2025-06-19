// This will be a simple fetch-based service for the client
export class ClientFarcasterService {
  private baseUrl = '/api/farcaster';

  async getUserByFid(fid: number) {
    const response = await fetch(`${this.baseUrl}/user/${fid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }

  async getUserCasts(fid: number, limit = 25) {
    const response = await fetch(`${this.baseUrl}/casts/${fid}?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch casts');
    }
    return response.json();
  }

  async getUserInterests(fid: number) {
    const response = await fetch(`${this.baseUrl}/interests/${fid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch interests');
    }
    return response.json();
  }
}

export const clientFarcasterService = new ClientFarcasterService();