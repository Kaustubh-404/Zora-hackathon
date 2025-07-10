import Groq from 'groq-sdk';
import { API_CONFIG } from '@/constants/config';

class GroqService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: API_CONFIG.groq.apiKey,
      dangerouslyAllowBrowser: true, // For hackathon - in production, use server-side
    });
  }

  async generatePredictionTopics(userInterests: any, _count = 3) {
    try {
      const prompt = this.buildPersonalizationPrompt(userInterests);
      
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // Fastest model for real-time
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating engaging binary prediction market topics. Create topics that are specific, measurable, and resolvable within 1-7 days. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      const parsed = JSON.parse(content);
      return this.formatPredictionTopics(parsed.predictions || []);
      
    } catch (error) {
      console.error('Error generating topics:', error);
      return this.getFallbackTopics(userInterests);
    }
  }

  private buildPersonalizationPrompt(userInterests: any): string {
    const topCategories = Object.entries(userInterests.categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([cat]) => cat);

    return `
Based on this user's Farcaster activity, create 3 engaging binary prediction market topics:

User Profile:
- Top interests: ${userInterests.topics.slice(0, 5).join(', ')}
- Active channels: ${userInterests.channels.join(', ')}
- Main categories: ${topCategories.join(', ')}
- Engagement level: ${userInterests.engagementScore}

Requirements:
- Each topic should be a YES/NO question
- Resolvable within 1-7 days with public information
- Relevant to their interests
- Specific and measurable
- Engaging for crypto/web3 audience

Return JSON format:
{
  "predictions": [
    {
      "question": "Will Bitcoin close above $100,000 by December 31st?",
      "description": "Based on current market trends and your crypto interest",
      "category": "crypto",
      "endTime": "2024-12-31",
      "resolutionCriteria": "Price data from CoinGecko at market close EST"
    }
  ]
}
`;
  }

  private formatPredictionTopics(rawTopics: any[]) {
    return rawTopics.map((topic, index) => ({
      id: `ai_${Date.now()}_${index}`,
      question: topic.question || 'Will this prediction come true?',
      description: topic.description || 'AI-generated prediction based on your interests',
      category: topic.category || 'general',
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      resolutionCriteria: topic.resolutionCriteria || 'To be determined',
      totalLiquidity: 0,
      outcomes: { yes: 50, no: 50 },
      resolved: false,
      createdAt: new Date(),
      creator: 'ai_system',
      tags: this.extractTags(topic.question),
    }));
  }

  private extractTags(question: string): string[] {
    const words = question.toLowerCase().split(/\s+/);
    const commonTags = ['bitcoin', 'ethereum', 'crypto', 'defi', 'nft', 'web3', 'ai', 'tech'];
    return commonTags.filter(tag => words.some(word => word.includes(tag)));
  }

  private getFallbackTopics(userInterests: any) {
    const topCategory = Object.entries(userInterests.categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'crypto';

    const fallbackTopics = {
      crypto: [
        'Will Bitcoin reach a new all-time high this week?',
        'Will Ethereum gas fees drop below 20 gwei today?',
        'Will a new memecoin gain 1000% this week?'
      ],
      tech: [
        'Will a major tech company announce AI news this week?',
        'Will GitHub have a major outage this week?',
        'Will Apple stock hit a new high this month?'
      ],
      general: [
        'Will it rain in San Francisco tomorrow?',
        'Will the S&P 500 close green today?',
        'Will a viral meme trend start this week?'
      ]
    };

    const questions = fallbackTopics[topCategory as keyof typeof fallbackTopics] || fallbackTopics.general;
    
    return questions.map((question, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      question,
      description: `Personalized for your ${topCategory} interests`,
      category: topCategory,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      resolutionCriteria: 'Community consensus',
      totalLiquidity: 0,
      outcomes: { yes: 50, no: 50 },
      resolved: false,
      createdAt: new Date(),
      creator: 'ai_system',
      tags: [topCategory],
    }));
  }
}

export const groqService = new GroqService();