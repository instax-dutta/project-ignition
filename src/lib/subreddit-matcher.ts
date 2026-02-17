import { SubredditCategory, SubredditMatch } from '@/types/reddit.types';
import { subredditDatabase } from './subreddit-database';

// Enhanced keyword matcher with semantic understanding
export function findRelevantSubreddits(query: string): SubredditMatch[] {
  const normalizedQuery = query.toLowerCase().trim();
  const scores: Map<string, { match: SubredditMatch; score: number }> = new Map();

  // Tokenize query into words for better matching
  const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 2);
  
  // Check each category
  for (const [categoryName, category] of Object.entries(subredditDatabase)) {
    let categoryScore = 0;

    // Check for keyword matches
    for (const keyword of category.keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      
      // Exact match (highest priority)
      if (normalizedQuery.includes(normalizedKeyword)) {
        categoryScore += 100;
      } 
      // Keyword includes query (high priority)
      else if (normalizedKeyword.includes(normalizedQuery)) {
        categoryScore += 50;
      } 
      // Token-based matching with semantic weighting
      else {
        const keywordTokens = normalizedKeyword.split(/\s+/).filter(token => token.length > 2);
        const matchingTokens = queryTokens.filter(qToken => 
          keywordTokens.some(kToken => kToken.includes(qToken) || qToken.includes(kToken))
        );
        
        // Score based on number of matching tokens and their lengths
        categoryScore += matchingTokens.length * 30;
        matchingTokens.forEach(token => {
          categoryScore += token.length * 5; // Longer matches are more significant
        });
      }
    }

    // If we found a match, add subreddits with weighted scores
    if (categoryScore > 0) {
      for (const subreddit of category.subreddits) {
        const existingScore = scores.get(subreddit.name)?.score || 0;
        const newScore = categoryScore * (subreddit.weight / 100);
        
        if (newScore > existingScore) {
          scores.set(subreddit.name, {
            match: subreddit,
            score: newScore,
          });
        }
      }
    }
  }

  // Sort by score and return top results
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ match, score }) => ({
      ...match,
      weight: Math.min(100, Math.round(score / 2)),
    }));
}

// Topic cluster analysis for better subreddit recommendations
export function analyzeTopic(query: string): {
  mainCategory: string;
  relatedCategories: string[];
  confidence: number;
} {
  const normalizedQuery = query.toLowerCase().trim();
  const categoryScores: Array<{ name: string; score: number }> = [];

  // Calculate category scores
  for (const [categoryName, category] of Object.entries(subredditDatabase)) {
    let score = 0;
    
    for (const keyword of category.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 100;
      } else if (keyword.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }
    }
    
    categoryScores.push({ name: categoryName, score });
  }

  // Find main category
  categoryScores.sort((a, b) => b.score - a.score);
  const mainCategory = categoryScores[0];
  
  // Find related categories (with at least 30% of main category score)
  const relatedCategories = categoryScores
    .slice(1)
    .filter(cat => cat.score >= mainCategory.score * 0.3)
    .map(cat => cat.name);

  // Calculate confidence level
  const maxPossibleScore = Object.values(subredditDatabase).length * 100;
  const confidence = Math.min(100, Math.round((mainCategory.score / maxPossibleScore) * 100));

  return {
    mainCategory: mainCategory.name,
    relatedCategories,
    confidence,
  };
}

// Enhanced subreddit recommendation engine
export function getEnhancedSubredditRecommendations(query: string): SubredditMatch[] {
  const topicAnalysis = analyzeTopic(query);
  const baseMatches = findRelevantSubreddits(query);
  
  // If we have high confidence, return base matches
  if (topicAnalysis.confidence > 70) {
    return baseMatches;
  }
  
  // If confidence is low, expand to related categories
  const expandedMatches: Map<string, SubredditMatch> = new Map();
  
  // Add base matches
  baseMatches.forEach(match => {
    expandedMatches.set(match.name, match);
  });
  
  // Add matches from related categories
  topicAnalysis.relatedCategories.forEach(categoryName => {
    const category = subredditDatabase[categoryName];
    if (category) {
      category.subreddits.forEach(subreddit => {
        if (!expandedMatches.has(subreddit.name)) {
          expandedMatches.set(subreddit.name, {
            ...subreddit,
            weight: Math.floor(subreddit.weight * 0.7), // Reduce weight for related matches
          });
        }
      });
    }
  });
  
  // If still no matches, use fallback strategy
  if (expandedMatches.size === 0) {
    return getFallbackSubreddits(query);
  }
  
  return Array.from(expandedMatches.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

// Fallback strategy for queries with no matches
function getFallbackSubreddits(query: string): SubredditMatch[] {
  const fallbackSubreddits: SubredditMatch[] = [
    { name: 'AskReddit', weight: 80, description: 'General questions and discussions' },
    { name: 'todayilearned', weight: 75, description: 'Interesting facts and stories' },
    { name: 'explainlikeimfive', weight: 70, description: 'Simple explanations for complex topics' },
    { name: 'NoStupidQuestions', weight: 65, description: 'Questions that might seem stupid' },
    { name: 'random', weight: 60, description: 'Random subreddit' },
  ];
  
  return fallbackSubreddits;
}

// Export for backward compatibility
export { getPopularTopics } from './subreddit-database';
