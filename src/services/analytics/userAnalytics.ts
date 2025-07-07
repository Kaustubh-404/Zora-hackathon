import { blockchainService } from '@/services/blockchain/service';
import { usePrivy } from '@privy-io/react-auth';

export interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  averageOdds: number;
  bestStreak: number;
  currentStreak: number;
  profitLoss: number;
  roi: number; // Return on Investment
  sharpeRatio: number; // Risk-adjusted returns
  categoryPerformance: Record<string, {
    bets: number;
    winRate: number;
    profit: number;
  }>;
  recentPerformance: Array<{
    date: Date;
    profit: number;
    bets: number;
  }>;
}

export interface MarketInsights {
  totalMarkets: number;
  totalVolume: number;
  averageMarketSize: number;
  mostPopularCategories: Array<{
    category: string;
    volume: number;
    markets: number;
  }>;
  recentTrends: Array<{
    period: string;
    volume: number;
    markets: number;
    avgReturn: number;
  }>;
  topPerformers: Array<{
    address: string;
    username?: string;
    winRate: number;
    profit: number;
    bets: number;
  }>;
}

class UserAnalyticsService {
  
  async getUserStats(userAddress: string): Promise<UserStats> {
    try {
      console.log('📊 Calculating user analytics...');
      
      // Fetch all user's betting data from blockchain
      const userBets = await this.getUserBettingHistory(userAddress);
      const resolvedBets = userBets.filter(bet => bet.resolved);
      
      if (resolvedBets.length === 0) {
        return this.getEmptyStats();
      }
      
      const totalBets = resolvedBets.length;
      const totalWagered = resolvedBets.reduce((sum, bet) => sum + bet.amount, 0);
      const wins = resolvedBets.filter(bet => bet.won);
      const totalWon = wins.reduce((sum, bet) => sum + bet.payout, 0);
      const winRate = (wins.length / totalBets) * 100;
      const profitLoss = totalWon - totalWagered;
      const roi = totalWagered > 0 ? (profitLoss / totalWagered) * 100 : 0;
      
      return {
        totalBets,
        totalWagered,
        totalWon,
        winRate,
        averageOdds: this.calculateAverageOdds(resolvedBets),
        bestStreak: this.calculateBestStreak(resolvedBets),
        currentStreak: this.calculateCurrentStreak(resolvedBets),
        profitLoss,
        roi,
        sharpeRatio: this.calculateSharpeRatio(resolvedBets),
        categoryPerformance: this.analyzeCategoryPerformance(resolvedBets),
        recentPerformance: this.getRecentPerformance(resolvedBets),
      };
      
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return this.getEmptyStats();
    }
  }
  
  async getMarketInsights(): Promise<MarketInsights> {
    try {
      console.log('📈 Generating market insights...');
      
      const allMarkets = await blockchainService.getAllMarkets();
      const totalVolume = allMarkets.reduce((sum, market) => sum + market.totalLiquidity, 0);
      
      return {
        totalMarkets: allMarkets.length,
        totalVolume,
        averageMarketSize: totalVolume / allMarkets.length,
        mostPopularCategories: this.analyzeCategoryPopularity(allMarkets),
        recentTrends: await this.getRecentTrends(),
        topPerformers: await this.getTopPerformers(),
      };
      
    } catch (error) {
      console.error('Error generating market insights:', error);
      throw error;
    }
  }
  
  private async getUserBettingHistory(userAddress: string): Promise<any[]> {
    // In a real implementation, this would query blockchain events
    // For now, we'll simulate with some data
    const allMarkets = await blockchainService.getAllMarkets();
    const userBets: any[] = [];
    
    // This would normally come from indexed blockchain events
    // Simulating user betting history
    for (const market of allMarkets.slice(0, 10)) {
      if (Math.random() > 0.7) { // 30% chance user bet on this market
        userBets.push({
          marketId: market.marketId,
          amount: Math.random() * 0.5 + 0.01, // 0.01 to 0.51 ETH
          outcome: Math.random() > 0.5,
          won: Math.random() > 0.4, // 60% win rate simulation
          payout: Math.random() * 1 + 0.02, // Random payout
          timestamp: market.createdAt,
          resolved: market.resolved,
          category: market.category,
        });
      }
    }
    
    return userBets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  private calculateAverageOdds(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalOdds = bets.reduce((sum, bet) => {
      return sum + (bet.payout / bet.amount);
    }, 0);
    return totalOdds / bets.length;
  }
  
  private calculateBestStreak(bets: any[]): number {
    let bestStreak = 0;
    let currentStreak = 0;
    
    for (const bet of bets) {
      if (bet.won) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return bestStreak;
  }
  
  private calculateCurrentStreak(bets: any[]): number {
    let streak = 0;
    for (const bet of bets) {
      if (bet.won) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  
  private calculateSharpeRatio(bets: any[]): number {
    if (bets.length < 2) return 0;
    
    const returns = bets.map(bet => (bet.payout - bet.amount) / bet.amount);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? avgReturn / stdDev : 0;
  }
  
  private analyzeCategoryPerformance(bets: any[]): Record<string, any> {
    const categories: Record<string, any> = {};
    
    for (const bet of bets) {
      if (!categories[bet.category]) {
        categories[bet.category] = { bets: 0, wins: 0, totalWagered: 0, totalWon: 0 };
      }
      
      categories[bet.category].bets++;
      categories[bet.category].totalWagered += bet.amount;
      
      if (bet.won) {
        categories[bet.category].wins++;
        categories[bet.category].totalWon += bet.payout;
      }
    }
    
    // Calculate win rates and profits
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.winRate = (cat.wins / cat.bets) * 100;
      cat.profit = cat.totalWon - cat.totalWagered;
    });
    
    return categories;
  }
  
  private getRecentPerformance(bets: any[]): Array<any> {
    // Group bets by day for last 30 days
    const dailyStats: Record<string, any> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBets = bets.filter(bet => bet.timestamp >= thirtyDaysAgo);
    
    recentBets.forEach(bet => {
      const dateKey = bet.timestamp.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { bets: 0, profit: 0 };
      }
      
      dailyStats[dateKey].bets++;
      dailyStats[dateKey].profit += (bet.won ? bet.payout : 0) - bet.amount;
    });
    
    return Object.entries(dailyStats).map(([date, stats]) => ({
      date: new Date(date),
      ...stats,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  private analyzeCategoryPopularity(markets: any[]): Array<any> {
    const categories: Record<string, any> = {};
    
    markets.forEach(market => {
      if (!categories[market.category]) {
        categories[market.category] = { volume: 0, markets: 0 };
      }
      categories[market.category].volume += market.totalLiquidity;
      categories[market.category].markets++;
    });
    
    return Object.entries(categories)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.volume - a.volume);
  }
  
  private async getRecentTrends(): Promise<Array<any>> {
    // Simulate recent trends data
    // In production, this would analyze blockchain data over time
    return [
      { period: 'Last 7 days', volume: 45.6, markets: 23, avgReturn: 12.5 },
      { period: 'Last 30 days', volume: 156.3, markets: 89, avgReturn: 8.7 },
      { period: 'Last 90 days', volume: 445.2, markets: 267, avgReturn: 15.2 },
    ];
  }
  
  private async getTopPerformers(): Promise<Array<any>> {
    // Simulate top performers data
    // In production, this would come from indexed user data
    return [
      { address: '0x1234...5678', username: 'cryptooracle', winRate: 78.5, profit: 12.4, bets: 45 },
      { address: '0x2345...6789', username: 'predictorpro', winRate: 76.2, profit: 9.8, bets: 38 },
      { address: '0x3456...7890', username: 'futureseer', winRate: 74.1, profit: 8.7, bets: 52 },
    ];
  }
  
  private getEmptyStats(): UserStats {
    return {
      totalBets: 0,
      totalWagered: 0,
      totalWon: 0,
      winRate: 0,
      averageOdds: 0,
      bestStreak: 0,
      currentStreak: 0,
      profitLoss: 0,
      roi: 0,
      sharpeRatio: 0,
      categoryPerformance: {},
      recentPerformance: [],
    };
  }
}

export const userAnalyticsService = new UserAnalyticsService();