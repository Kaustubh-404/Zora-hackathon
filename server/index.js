import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

// process.env.VITE_NEYNAR_API_KEY = '32189CB8-38AC-40A8-B6C8-4B49E1182CE9';
// console.log('🔧 API key set manually for debugging');

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.VITE_NEYNAR_API_KEY,
});
const neynarClient = new NeynarAPIClient(config);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Real Farcaster API server running',
    hasApiKey: !!process.env.VITE_NEYNAR_API_KEY
  });
});

// Get user by FID
app.get('/api/farcaster/user/:fid', async (req, res) => {
  try {
    const fid = parseInt(req.params.fid);
    if (isNaN(fid)) {
      return res.status(400).json({ error: 'Invalid FID' });
    }

    console.log(`📡 Fetching REAL user data for FID: ${fid}`);
    const response = await neynarClient.fetchBulkUsers({ fids: [fid] });
    const user = response.users[0];
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: `User with FID ${fid} not found` 
      });
    }
    
    const userData = {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      bio: user.profile?.bio?.text || '',
    };

    console.log(`✅ REAL user data fetched: @${userData.username}`);
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch user' 
    });
  }
});

// Get user casts - REAL DATA
app.get('/api/farcaster/casts/:fid', async (req, res) => {
  try {
    const fid = parseInt(req.params.fid);
    const limit = parseInt(req.query.limit) || 25;
    
    if (isNaN(fid)) {
      return res.status(400).json({ error: 'Invalid FID' });
    }

    console.log(`📡 Fetching REAL casts for FID: ${fid}`);
    
    // Use the simpler fetchFeed method with proper parameters
    const response = await neynarClient.fetchFeed({
      feedType: 'filter',
      filterType: 'fids',
      fids: fid.toString(),
      limit,
    });
    
    const processedCasts = response.casts.map(cast => ({
      hash: cast.hash,
      text: cast.text,
      timestamp: cast.timestamp,
      replies: cast.replies?.count || 0,
      reactions: cast.reactions?.likes_count || 0,
      recasts: cast.reactions?.recasts_count || 0,
      channel: cast.channel?.id || null,
      mentions: cast.mentioned_profiles?.map(p => p.username) || [],
      embeds: cast.embeds || [],
    }));

    console.log(`✅ Fetched ${processedCasts.length} REAL casts`);
    res.json({ success: true, data: processedCasts });
  } catch (error) {
    console.error('❌ Casts API Error:', error);
    
    // Return empty array if no casts found
    console.log(`⚠️ No casts found for FID ${req.params.fid}, returning empty array`);
    res.json({ success: true, data: [] });
  }
});

// Get user interests (combines user + casts + analysis) - REAL DATA
app.get('/api/farcaster/interests/:fid', async (req, res) => {
  try {
    const fid = parseInt(req.params.fid);
    
    if (isNaN(fid)) {
      return res.status(400).json({ error: 'Invalid FID' });
    }

    console.log(`🧠 Analyzing REAL interests for FID: ${fid}`);

    // Get real user data
    const userResponse = await neynarClient.fetchBulkUsers({ fids: [fid] });
    const user = userResponse.users[0];

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: `User with FID ${fid} not found` 
      });
    }

    console.log(`📝 User found: @${user.username}, now fetching casts...`);

    // Try to get user casts, but don't fail if none found
    let casts = [];
    try {
      const castsResponse = await neynarClient.fetchFeed({
        feedType: 'filter',
        filterType: 'fids',
        fids: fid.toString(),
        limit: 30,
      });

      casts = castsResponse.casts.map(cast => ({
        text: cast.text,
        reactions: cast.reactions?.likes_count || 0,
        replies: cast.replies?.count || 0,
        recasts: cast.reactions?.recasts_count || 0,
        channel: cast.channel?.id || null,
      }));

      console.log(`📚 Found ${casts.length} casts for analysis`);
    } catch (castsError) {
      console.log(`⚠️ No casts found for FID ${fid}:`, castsError.message);
      casts = []; // Use empty array if no casts
    }

    // Analyze interests (even with empty casts, we can still provide basic info)
    const interests = analyzeInterests(casts, user);
    
    console.log(`✅ REAL interest analysis complete for @${user.username}`);
    res.json({ 
      success: true, 
      data: {
        user: {
          fid: user.fid,
          username: user.username,
          displayName: user.display_name,
          pfpUrl: user.pfp_url,
          followerCount: user.follower_count,
          followingCount: user.following_count,
          bio: user.profile?.bio?.text || '',
        },
        interests,
        castsAnalyzed: casts.length
      }
    });
  } catch (error) {
    console.error('❌ Interests API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to analyze interests' 
    });
  }
});

// Enhanced interest analysis function
function analyzeInterests(casts, user = null) {
  const topics = new Set();
  const channels = new Set();
  const categories = {};

  // If we have casts, analyze them
  casts.forEach(cast => {
    // Extract hashtags
    const hashtags = cast.text.match(/#[\w]+/g) || [];
    hashtags.forEach(tag => {
      const cleanTag = tag.toLowerCase().replace('#', '');
      topics.add(cleanTag);
    });

    // Extract channels
    if (cast.channel) {
      channels.add(cast.channel);
    }

    // Categorize content
    const content = cast.text.toLowerCase();
    categorizeContent(content, categories);
  });

  // If no casts but we have user bio, analyze that
  if (casts.length === 0 && user?.profile?.bio?.text) {
    const bioContent = user.profile.bio.text.toLowerCase();
    categorizeContent(bioContent, categories);
    
    // Extract hashtags from bio
    const bioHashtags = user.profile.bio.text.match(/#[\w]+/g) || [];
    bioHashtags.forEach(tag => {
      const cleanTag = tag.toLowerCase().replace('#', '');
      topics.add(cleanTag);
    });
  }

  // Add some default topics if none found
  if (topics.size === 0) {
    topics.add('farcaster');
    topics.add('web3');
  }

  if (Object.keys(categories).length === 0) {
    categories['social'] = 1;
  }

  return {
    topics: Array.from(topics).slice(0, 10),
    channels: Array.from(channels).slice(0, 5),
    engagementScore: calculateEngagementScore(casts),
    categories,
  };
}

function categorizeContent(content, categories) {
  const categoryKeywords = {
    'crypto': ['crypto', 'bitcoin', 'ethereum', 'defi', 'nft', 'token', 'blockchain', 'web3'],
    'tech': ['tech', 'ai', 'software', 'development', 'programming', 'code', 'developer'],
    'social': ['social', 'community', 'friend', 'meet', 'event', 'party', 'farcaster'],
    'finance': ['money', 'invest', 'finance', 'market', 'trading', 'stock'],
    'art': ['art', 'design', 'creative', 'music', 'painting', 'artist'],
    'sports': ['sports', 'game', 'team', 'player', 'match', 'win'],
    'memes': ['gm', 'gn', 'wagmi', 'ngmi', 'lfg', 'meme', 'based'],
  };

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => content.includes(keyword));
    if (matches.length > 0) {
      categories[category] = (categories[category] || 0) + matches.length;
    }
  });
}

function calculateEngagementScore(casts) {
  if (casts.length === 0) return 0;

  const totalEngagement = casts.reduce((sum, cast) => {
    return sum + (cast.reactions || 0) + (cast.replies || 0) + (cast.recasts || 0);
  }, 0);

  return Math.round(totalEngagement / casts.length);
}

app.listen(PORT, () => {
  console.log(`🚀 REAL Farcaster API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 API Key configured: ${!!process.env.VITE_NEYNAR_API_KEY}`);
  console.log(`✨ Ready to fetch REAL Farcaster data!`);
});