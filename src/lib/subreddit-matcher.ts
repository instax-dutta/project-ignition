import { SubredditMatch } from '@/types/reddit.types';
import { subredditDatabase, synonymMap } from './subreddit-database';
import { searchSubreddits } from './reddit-api';

// ============================================
// SYNONYM EXPANSION
// Expands a raw query into a broader set of
// terms before running through the matcher.
// ============================================

function expandQuery(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 1);
  const expanded = new Set(tokens);

  // Add synonyms for each token
  for (const token of tokens) {
    // Check if token is a synonym key
    if (synonymMap[token]) {
      synonymMap[token].forEach(syn => expanded.add(syn));
    }

    // Check if token appears in any synonym value list
    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (synonyms.some(syn => syn.includes(token) || token.includes(syn))) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
    }
  }

  // Also check multi-word synonym keys
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (normalizedQuery.includes(key)) {
      synonyms.forEach(syn => expanded.add(syn));
    }
  }

  return Array.from(expanded).join(' ');
}

// ============================================
// STEMMING-LIKE TOKEN REDUCER
// Strips common suffixes for better matching.
// ============================================

function stemToken(token: string): string {
  if (token.length < 5) return token;

  const suffixes = ['tion', 'sion', 'ness', 'ment', 'able', 'ible', 'ful', 'less', 'ous', 'ive', 'ing', 'ity', 'ers', 'est', 'ies', 'ied', 'ed', 'ly', 'es', 's'];

  for (const suffix of suffixes) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      return token.slice(0, token.length - suffix.length);
    }
  }
  return token;
}

// ============================================
// ENHANCED KEYWORD MATCHER
// ============================================

export function findRelevantSubreddits(query: string): SubredditMatch[] {
  // Expand the query with synonyms first
  const expandedQuery = expandQuery(query);
  const normalizedQuery = expandedQuery.toLowerCase().trim();
  const scores: Map<string, { match: SubredditMatch; score: number }> = new Map();

  // Tokenize expanded query
  const queryTokens = normalizedQuery.split(/\s+/).filter(token => token.length > 2);
  const stemmedQueryTokens = queryTokens.map(stemToken);

  for (const [, category] of Object.entries(subredditDatabase)) {
    let categoryScore = 0;

    for (const keyword of category.keywords) {
      const normalizedKeyword = keyword.toLowerCase();

      // Exact phrase match (highest priority)
      if (normalizedQuery.includes(normalizedKeyword)) {
        categoryScore += 100;
      }
      // Keyword contains original query (high priority)
      else if (normalizedKeyword.includes(query.toLowerCase().trim())) {
        categoryScore += 60;
      }
      // Token-based matching with stemming
      else {
        const keywordTokens = normalizedKeyword.split(/\s+/).filter(token => token.length > 2);
        const stemmedKeywordTokens = keywordTokens.map(stemToken);

        let tokenMatchScore = 0;

        for (const sqt of stemmedQueryTokens) {
          for (const skt of stemmedKeywordTokens) {
            if (sqt === skt) {
              tokenMatchScore += 40; // Exact stem match
            } else if (skt.includes(sqt) || sqt.includes(skt)) {
              tokenMatchScore += 20; // Partial stem match
            }
          }
        }

        categoryScore += tokenMatchScore;
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

// ============================================
// TOPIC CLUSTER ANALYSIS
// ============================================

export function analyzeTopic(query: string): {
  mainCategory: string;
  relatedCategories: string[];
  confidence: number;
} {
  const expandedQuery = expandQuery(query);
  const normalizedQuery = expandedQuery.toLowerCase().trim();
  const categoryScores: Array<{ name: string; score: number }> = [];

  for (const [categoryName, category] of Object.entries(subredditDatabase)) {
    let score = 0;

    for (const keyword of category.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 100;
      } else if (keyword.toLowerCase().includes(query.toLowerCase().trim())) {
        score += 50;
      }
    }

    categoryScores.push({ name: categoryName, score });
  }

  categoryScores.sort((a, b) => b.score - a.score);
  const mainCategory = categoryScores[0];

  const relatedCategories = categoryScores
    .slice(1)
    .filter(cat => cat.score >= mainCategory.score * 0.3 && cat.score > 0)
    .map(cat => cat.name);

  const maxPossibleScore = Object.values(subredditDatabase).length * 100;
  const confidence = Math.min(100, Math.round((mainCategory.score / maxPossibleScore) * 100));

  return {
    mainCategory: mainCategory.name,
    relatedCategories,
    confidence,
  };
}

// ============================================
// DYNAMIC SUBREDDIT DISCOVERY
// Falls back to Reddit's own search API when
// the local database doesn't have good matches.
// ============================================

async function discoverSubredditsFromReddit(query: string): Promise<SubredditMatch[]> {
  try {
    const results = await searchSubreddits(query);

    return results
      .slice(0, 3) // Take top 3 dynamic results
      .map(sub => ({
        name: sub.name,
        weight: Math.min(85, Math.round((sub.subscribers / 100000) * 10 + 50)),
        description: sub.description || sub.title,
        subscribers: sub.subscribers,
      }));
  } catch {
    console.warn('[Ignition] ⚠️ Dynamic subreddit discovery failed');
    return [];
  }
}

// ============================================
// ENHANCED RECOMMENDATION ENGINE
// ============================================

export async function getEnhancedSubredditRecommendationsAsync(query: string): Promise<SubredditMatch[]> {
  const topicAnalysis = analyzeTopic(query);
  const baseMatches = findRelevantSubreddits(query);

  // High confidence — local DB has good answers
  if (topicAnalysis.confidence > 70 && baseMatches.length >= 3) {
    return baseMatches;
  }

  // Medium confidence — augment with related categories
  const expandedMatches: Map<string, SubredditMatch> = new Map();

  baseMatches.forEach(match => {
    expandedMatches.set(match.name, match);
  });

  // Add from related categories
  topicAnalysis.relatedCategories.forEach(categoryName => {
    const category = subredditDatabase[categoryName];
    if (category) {
      category.subreddits.forEach(subreddit => {
        if (!expandedMatches.has(subreddit.name)) {
          expandedMatches.set(subreddit.name, {
            ...subreddit,
            weight: Math.floor(subreddit.weight * 0.7),
          });
        }
      });
    }
  });

  // Low confidence or few matches — try dynamic discovery
  if (expandedMatches.size < 3) {
    const dynamicSubs = await discoverSubredditsFromReddit(query);
    dynamicSubs.forEach(sub => {
      if (!expandedMatches.has(sub.name)) {
        expandedMatches.set(sub.name, sub);
      }
    });
  }

  // Ultimate fallback
  if (expandedMatches.size === 0) {
    return getFallbackSubreddits();
  }

  return Array.from(expandedMatches.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

// Synchronous version (backward-compatible — uses local DB only)
export function getEnhancedSubredditRecommendations(query: string): SubredditMatch[] {
  const topicAnalysis = analyzeTopic(query);
  const baseMatches = findRelevantSubreddits(query);

  if (topicAnalysis.confidence > 70) {
    return baseMatches;
  }

  const expandedMatches: Map<string, SubredditMatch> = new Map();

  baseMatches.forEach(match => {
    expandedMatches.set(match.name, match);
  });

  topicAnalysis.relatedCategories.forEach(categoryName => {
    const category = subredditDatabase[categoryName];
    if (category) {
      category.subreddits.forEach(subreddit => {
        if (!expandedMatches.has(subreddit.name)) {
          expandedMatches.set(subreddit.name, {
            ...subreddit,
            weight: Math.floor(subreddit.weight * 0.7),
          });
        }
      });
    }
  });

  if (expandedMatches.size === 0) {
    return getFallbackSubreddits();
  }

  return Array.from(expandedMatches.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

// ============================================
// FALLBACK
// ============================================

function getFallbackSubreddits(): SubredditMatch[] {
  return [
    { name: 'AskReddit', weight: 80, description: 'General questions and discussions' },
    { name: 'todayilearned', weight: 75, description: 'Interesting facts and stories' },
    { name: 'explainlikeimfive', weight: 70, description: 'Simple explanations for complex topics' },
    { name: 'NoStupidQuestions', weight: 65, description: 'Questions that might seem stupid' },
    { name: 'bestof', weight: 60, description: 'Best of Reddit' },
  ];
}

// Export for backward compatibility
export { getPopularTopics } from './subreddit-database';
