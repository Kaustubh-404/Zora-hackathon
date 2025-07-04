// File: src/hooks/useAllMarkets.ts

import { useState, useCallback } from 'react';

export interface GeneralMarket {
  id: string;
  question: string;
  description: string;
  category: string;
  endTime: Date;
  resolutionCriteria: string;
  totalLiquidity: number;
  outcomes: {
    yes: number;
    no: number;
  };
  resolved: boolean;
  createdAt: Date;
  creator: string;
  tags: string[];
}

export function useAllMarkets() {
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<GeneralMarket[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock data for general prediction markets
  const generateMockMarkets = useCallback(() => {
    const categories = ['crypto', 'tech', 'sports', 'politics', 'general'];
    
    const marketTemplates = [
      // Crypto Markets
      {
        category: 'crypto',
        questions: [
          'Will Bitcoin reach $100,000 by end of 2024?',
          'Will Ethereum 2.0 launch successfully this quarter?',
          'Will any cryptocurrency ETF get approved this month?',
          'Will Dogecoin reach $1 this year?',
          'Will a new DeFi protocol gain over $1B TVL this month?'
        ]
      },
      // Tech Markets
      {
        category: 'tech',
        questions: [
          'Will Apple announce a new product line this quarter?',
          'Will ChatGPT-5 be released this year?',
          'Will Tesla stock hit $300 this month?',
          'Will a major tech company have a data breach this quarter?',
          'Will any AI model achieve AGI benchmarks this year?'
        ]
      },
      // Sports Markets
      {
        category: 'sports',
        questions: [
          'Will the Lakers make the NBA playoffs this season?',
          'Will Messi score in the next World Cup match?',
          'Will any NFL team go undefeated this season?',
          'Will a new world record be set in swimming this year?',
          'Will the Super Bowl have over 100M viewers?'
        ]
      },
      // Politics Markets
      {
        category: 'politics',
        questions: [
          'Will there be a government shutdown this year?',
          'Will any new international trade deal be signed this quarter?',
          'Will voter turnout exceed 2020 levels in the next election?',
          'Will any Supreme Court justice retire this year?',
          'Will climate legislation pass Congress this session?'
        ]
      },
      // General Markets
      {
        category: 'general',
        questions: [
          'Will it rain in San Francisco tomorrow?',
          'Will the S&P 500 close green this week?',
          'Will a viral TikTok trend reach 1B views this month?',
          'Will gas prices drop below $3/gallon nationally this quarter?',
          'Will any natural disaster make international headlines this month?'
        ]
      }
    ];

    const generatedMarkets: GeneralMarket[] = [];

    marketTemplates.forEach(template => {
      template.questions.forEach((question, index) => {
        const market: GeneralMarket = {
          id: `market_${template.category}_${index}_${Date.now()}`,
          question,
          description: `A prediction market about ${template.category} trends and outcomes.`,
          category: template.category,
          endTime: new Date(Date.now() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000), // 1-30 days
          resolutionCriteria: `Resolved based on official sources and community consensus.`,
          totalLiquidity: Math.floor(Math.random() * 1000) / 100, // 0-10 ETH
          outcomes: {
            yes: Math.floor(Math.random() * 40) + 30, // 30-70%
            no: 0 // Will be calculated as 100 - yes
          },
          resolved: false,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Within last week
          creator: 'community',
          tags: [template.category, 'prediction', 'market']
        };

        // Calculate no percentage
        market.outcomes.no = 100 - market.outcomes.yes;

        generatedMarkets.push(market);
      });
    });

    // Shuffle the markets for variety
    return generatedMarkets.sort(() => Math.random() - 0.5);
  }, []);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call:
      // const response = await fetch('/api/markets');
      // const markets = await response.json();
      
      const mockMarkets = generateMockMarkets();
      setMarkets(mockMarkets);
      
      console.log('📊 Generated mock markets:', mockMarkets.length);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
      setError(errorMessage);
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  }, [generateMockMarkets]);

  const refreshMarkets = useCallback(async () => {
    return fetchMarkets();
  }, [fetchMarkets]);

  const getMarketsByCategory = useCallback((category: string) => {
    return markets.filter(market => market.category === category);
  }, [markets]);

  const getActiveMarkets = useCallback(() => {
    return markets.filter(market => !market.resolved && market.endTime > new Date());
  }, [markets]);

  const getRecentMarkets = useCallback(() => {
    return markets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }, [markets]);

  return {
    loading,
    markets,
    error,
    fetchMarkets,
    refreshMarkets,
    getMarketsByCategory,
    getActiveMarkets,
    getRecentMarkets,
  };
}