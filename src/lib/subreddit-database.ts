import { SubredditCategory, SubredditMatch } from '@/types/reddit.types';

export const subredditDatabase: Record<string, SubredditCategory> = {
  // Entertainment - TV/Movies
  stranger_things: {
    keywords: ['stranger things', 'hawkins', 'upside down', 'eleven', 'netflix stranger', 'demogorgon', 'mind flayer', 'vecna'],
    subreddits: [
      { name: 'StrangerThings', weight: 100, description: 'Official Stranger Things community' },
      { name: 'netflix', weight: 70, description: 'Netflix discussions' },
      { name: 'television', weight: 60, description: 'TV show discussions' },
    ],
  },
  tv_shows: {
    keywords: ['tv', 'television', 'show', 'series', 'episode', 'season', 'binge', 'streaming', 'netflix', 'hulu', 'disney+'],
    subreddits: [
      { name: 'television', weight: 95, description: 'TV discussions' },
      { name: 'netflix', weight: 85, description: 'Netflix content' },
      { name: 'hulu', weight: 75, description: 'Hulu shows' },
      { name: 'televisionsuggestions', weight: 70, description: 'TV recommendations' },
    ],
  },
  movies: {
    keywords: ['movie', 'film', 'cinema', 'theater', 'blockbuster', 'oscar', 'hollywood', 'movie review'],
    subreddits: [
      { name: 'movies', weight: 100, description: 'Movie discussions' },
      { name: 'MovieSuggestions', weight: 85, description: 'Movie recommendations' },
      { name: 'TrueFilm', weight: 80, description: 'In-depth film analysis' },
      { name: 'boxoffice', weight: 70, description: 'Box office news' },
    ],
  },

  // Technology
  ai_news: {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'openai', 'chatgpt', 'llm', 'claude', 'generative ai', 'ai tools'],
    subreddits: [
      { name: 'artificial', weight: 100, description: 'AI news and discussion' },
      { name: 'MachineLearning', weight: 95, description: 'ML research' },
      { name: 'OpenAI', weight: 90, description: 'OpenAI community' },
      { name: 'ChatGPT', weight: 85, description: 'ChatGPT discussions' },
      { name: 'LocalLLaMA', weight: 80, description: 'Local LLM development' },
    ],
  },
  tech_news: {
    keywords: ['tech', 'technology', 'gadget', 'innovation', 'tech news', 'new tech', 'tech review'],
    subreddits: [
      { name: 'technology', weight: 100, description: 'Technology news' },
      { name: 'gadgets', weight: 85, description: 'Gadget reviews' },
      { name: 'Futurology', weight: 80, description: 'Future tech' },
      { name: 'technews', weight: 75, description: 'Tech news' },
    ],
  },
  programming: {
    keywords: ['programming', 'coding', 'developer', 'software', 'code', 'javascript', 'python', 'react', 'web development', 'software development'],
    subreddits: [
      { name: 'programming', weight: 100, description: 'Programming discussions' },
      { name: 'webdev', weight: 90, description: 'Web development' },
      { name: 'learnprogramming', weight: 85, description: 'Learn to code' },
      { name: 'javascript', weight: 80, description: 'JavaScript community' },
      { name: 'Python', weight: 80, description: 'Python community' },
    ],
  },

  // Business & Finance
  startup: {
    keywords: ['startup', 'entrepreneur', 'founder', 'side project', 'saas', 'business idea', 'launch', 'startup ideas', 'small business'],
    subreddits: [
      { name: 'startups', weight: 100, description: 'Startup community' },
      { name: 'Entrepreneur', weight: 95, description: 'Entrepreneurship' },
      { name: 'SideProject', weight: 90, description: 'Side projects' },
      { name: 'smallbusiness', weight: 80, description: 'Small business owners' },
      { name: 'SaaS', weight: 75, description: 'SaaS discussions' },
    ],
  },
  investing: {
    keywords: ['invest', 'stock', 'crypto', 'bitcoin', 'trading', 'portfolio', 'finance', 'investment', 'stock market', 'cryptocurrency'],
    subreddits: [
      { name: 'investing', weight: 100, description: 'Investment discussions' },
      { name: 'stocks', weight: 95, description: 'Stock market' },
      { name: 'CryptoCurrency', weight: 90, description: 'Crypto discussions' },
      { name: 'wallstreetbets', weight: 85, description: 'Trading community' },
      { name: 'personalfinance', weight: 80, description: 'Personal finance' },
    ],
  },

  // Gaming
  gaming: {
    keywords: ['gaming', 'video game', 'game', 'playstation', 'xbox', 'nintendo', 'pc gaming', 'game review', 'gaming news'],
    subreddits: [
      { name: 'gaming', weight: 100, description: 'Gaming community' },
      { name: 'Games', weight: 95, description: 'Game discussions' },
      { name: 'pcgaming', weight: 90, description: 'PC gaming' },
      { name: 'PS5', weight: 80, description: 'PlayStation 5' },
      { name: 'XboxSeriesX', weight: 80, description: 'Xbox Series X' },
    ],
  },

  // Food & Cooking
  cooking: {
    keywords: ['cooking', 'recipe', 'food', 'kitchen', 'chef', 'meal', 'cuisine', 'cooking tips', 'recipe sharing'],
    subreddits: [
      { name: 'Cooking', weight: 100, description: 'Cooking tips' },
      { name: 'recipes', weight: 95, description: 'Recipe sharing' },
      { name: 'AskCulinary', weight: 90, description: 'Culinary questions' },
      { name: 'food', weight: 85, description: 'Food appreciation' },
      { name: 'MealPrepSunday', weight: 75, description: 'Meal prep' },
    ],
  },

  // Science
  science: {
    keywords: ['science', 'research', 'study', 'scientific', 'discovery', 'physics', 'biology', 'chemistry', 'astronomy', 'space'],
    subreddits: [
      { name: 'science', weight: 100, description: 'Science news' },
      { name: 'askscience', weight: 95, description: 'Ask scientists' },
      { name: 'space', weight: 90, description: 'Space exploration' },
      { name: 'Physics', weight: 85, description: 'Physics discussions' },
      { name: 'biology', weight: 80, description: 'Biology discussions' },
    ],
  },

  // Self Improvement
  productivity: {
    keywords: ['productivity', 'self improvement', 'habits', 'motivation', 'discipline', 'goals', 'time management', 'productivity tips'],
    subreddits: [
      { name: 'productivity', weight: 100, description: 'Productivity tips' },
      { name: 'getdisciplined', weight: 95, description: 'Building discipline' },
      { name: 'DecidingToBeBetter', weight: 90, description: 'Self improvement' },
      { name: 'selfimprovement', weight: 85, description: 'Personal growth' },
    ],
  },

  // Design
  design: {
    keywords: ['design', 'ui', 'ux', 'graphic design', 'web design', 'figma', 'creative', 'design inspiration', 'ui ux'],
    subreddits: [
      { name: 'design', weight: 100, description: 'Design community' },
      { name: 'web_design', weight: 95, description: 'Web design' },
      { name: 'UI_Design', weight: 90, description: 'UI design' },
      { name: 'graphic_design', weight: 85, description: 'Graphic design' },
    ],
  },
  life_hacks: {
    keywords: ['life hack', 'tip', 'advice', 'trick', 'efficiency', 'useful', 'how to', 'life tips', 'practical tips'],
    subreddits: [
      { name: 'LifeProTips', weight: 100, description: 'Life tips' },
      { name: 'explainlikeimfive', weight: 90, description: 'Simple explanations' },
      { name: 'NoStupidQuestions', weight: 85, description: 'General questions' },
      { name: 'didntknowiwantedthat', weight: 80, description: 'Interesting finds' },
    ],
  },
  general_news: {
    keywords: ['news', 'world', 'current event', 'politics', 'breaking', 'global', 'news update', 'current affairs'],
    subreddits: [
      { name: 'news', weight: 100, description: 'General news' },
      { name: 'worldnews', weight: 95, description: 'Global news' },
      { name: 'upliftingnews', weight: 80, description: 'Positive news' },
      { name: 'nottheonion', weight: 75, description: 'True but weird' },
    ],
  },

  // Health & Wellness
  health: {
    keywords: ['health', 'fitness', 'wellness', 'exercise', 'nutrition', 'diet', 'mental health', 'meditation', 'yoga'],
    subreddits: [
      { name: 'Fitness', weight: 100, description: 'Fitness community' },
      { name: 'loseit', weight: 95, description: 'Weight loss' },
      { name: 'meditation', weight: 90, description: 'Meditation practice' },
      { name: 'yoga', weight: 85, description: 'Yoga community' },
      { name: 'health', weight: 80, description: 'General health' },
    ],
  },

  // Travel
  travel: {
    keywords: ['travel', 'vacation', 'trip', 'destination', 'backpacking', 'tourism', 'travel tips'],
    subreddits: [
      { name: 'travel', weight: 100, description: 'Travel discussions' },
      { name: 'solotravel', weight: 90, description: 'Solo travel' },
      { name: 'backpacking', weight: 85, description: 'Backpacking' },
      { name: 'travelhacks', weight: 80, description: 'Travel tips' },
    ],
  },

  // Education
  education: {
    keywords: ['education', 'learn', 'study', 'school', 'university', 'college', 'learning', 'online learning'],
    subreddits: [
      { name: 'learnprogramming', weight: 100, description: 'Learn to code' },
      { name: 'education', weight: 90, description: 'Education discussions' },
      { name: 'AskReddit', weight: 85, description: 'General questions' },
      { name: 'explainlikeimfive', weight: 80, description: 'Simple explanations' },
    ],
  },

  // Pets
  pets: {
    keywords: ['pets', 'cat', 'dog', 'animal', 'pet care', 'dog training', 'cat behavior'],
    subreddits: [
      { name: 'aww', weight: 100, description: 'Cute animals' },
      { name: 'cats', weight: 95, description: 'Cat community' },
      { name: 'dogs', weight: 90, description: 'Dog community' },
      { name: 'pets', weight: 85, description: 'Pet discussions' },
    ],
  },

  // Fashion & Beauty
  fashion: {
    keywords: ['fashion', 'style', 'beauty', 'makeup', 'skincare', 'hair care', 'fashion tips'],
    subreddits: [
      { name: 'fashion', weight: 100, description: 'Fashion community' },
      { name: 'makeupaddiction', weight: 90, description: 'Makeup enthusiasts' },
      { name: 'SkincareAddiction', weight: 85, description: 'Skincare tips' },
      { name: 'malefashionadvice', weight: 80, description: 'Men\'s fashion' },
    ],
  },
};

export function findRelevantSubreddits(query: string): SubredditMatch[] {
  const normalizedQuery = query.toLowerCase().trim();
  const scores: Map<string, { match: SubredditMatch; score: number }> = new Map();

  // Check each category
  for (const [categoryName, category] of Object.entries(subredditDatabase)) {
    let categoryScore = 0;

    // Check for keyword matches
    for (const keyword of category.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        categoryScore += 100;
      } else if (keyword.toLowerCase().includes(normalizedQuery)) {
        categoryScore += 50;
      } else {
        // Check for partial word matches
        const queryWords = normalizedQuery.split(/\s+/);
        const keywordWords = keyword.toLowerCase().split(/\s+/);
        for (const qWord of queryWords) {
          for (const kWord of keywordWords) {
            if (qWord.length > 2 && kWord.includes(qWord)) {
              categoryScore += 25;
            }
          }
        }
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

export function getPopularTopics(): string[] {
  return [
    'AI news',
    'startup ideas',
    'tech product reviews',
    'cooking tips',
    'investment strategies',
    'productivity hacks',
    'gaming releases',
    'movie recommendations',
  ];
}
