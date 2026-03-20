import { SubredditCategory, SubredditMatch } from '@/types/reddit.types';

// ============================================
// SYNONYM / ALIAS MAP
// Expands queries before matching so users
// don't need to guess exact keywords.
// ============================================

export const synonymMap: Record<string, string[]> = {
  // Tech
  ai: ['artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network'],
  coding: ['programming', 'software development', 'code', 'developer'],
  javascript: ['js', 'node', 'react', 'typescript', 'frontend'],
  python: ['django', 'flask', 'fastapi', 'data science'],
  cybersecurity: ['security', 'hacking', 'infosec', 'pentest', 'cybersec'],
  crypto: ['cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'web3', 'defi'],

  // Business
  startup: ['entrepreneur', 'founder', 'bootstrapping', 'side project', 'indie hacker'],
  marketing: ['digital marketing', 'growth hacking', 'brand', 'ads', 'advertising'],
  money: ['finance', 'investing', 'stock', 'budget', 'savings'],

  // Lifestyle
  fitness: ['gym', 'workout', 'exercise', 'lifting', 'running', 'bodybuilding'],
  diet: ['nutrition', 'meal plan', 'keto', 'vegan', 'intermittent fasting'],
  skincare: ['skin care', 'acne', 'moisturizer', 'sunscreen', 'dermatology'],
  dating: ['relationship', 'love', 'breakup', 'marriage', 'partner'],
  parenting: ['kids', 'children', 'baby', 'toddler', 'newborn', 'child rearing'],
  homeimprovement: ['home improvement', 'renovation', 'diy', 'remodel', 'interior design'],

  // Entertainment
  anime: ['manga', 'weeb', 'otaku', 'japanese animation'],
  gaming: ['video game', 'gamer', 'esports', 'steam', 'pc gaming'],
  music: ['song', 'album', 'artist', 'concert', 'playlist', 'band'],
  books: ['reading', 'novel', 'literature', 'audiobook', 'kindle'],
  photography: ['photo', 'camera', 'dslr', 'mirrorless', 'editing'],
  cars: ['automobile', 'vehicle', 'car review', 'automotive', 'driving'],

  // General
  advice: ['help', 'question', 'how to', 'guide', 'tips'],
  environment: ['climate', 'sustainability', 'renewable', 'green', 'eco'],
};

// ============================================
// SUBREDDIT DATABASE — 28 categories
// ============================================

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
    keywords: ['tv', 'television', 'show', 'series', 'episode', 'season', 'binge', 'streaming', 'netflix', 'hulu', 'disney+', 'hbo', 'apple tv'],
    subreddits: [
      { name: 'television', weight: 95, description: 'TV discussions' },
      { name: 'netflix', weight: 85, description: 'Netflix content' },
      { name: 'hulu', weight: 75, description: 'Hulu shows' },
      { name: 'televisionsuggestions', weight: 70, description: 'TV recommendations' },
    ],
  },
  movies: {
    keywords: ['movie', 'film', 'cinema', 'theater', 'blockbuster', 'oscar', 'hollywood', 'movie review', 'documentary'],
    subreddits: [
      { name: 'movies', weight: 100, description: 'Movie discussions' },
      { name: 'MovieSuggestions', weight: 85, description: 'Movie recommendations' },
      { name: 'TrueFilm', weight: 80, description: 'In-depth film analysis' },
      { name: 'boxoffice', weight: 70, description: 'Box office news' },
    ],
  },

  // Technology
  ai_news: {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'openai', 'chatgpt', 'llm', 'claude', 'generative ai', 'ai tools', 'deep learning', 'neural network', 'transformer'],
    subreddits: [
      { name: 'artificial', weight: 100, description: 'AI news and discussion' },
      { name: 'MachineLearning', weight: 95, description: 'ML research' },
      { name: 'OpenAI', weight: 90, description: 'OpenAI community' },
      { name: 'ChatGPT', weight: 85, description: 'ChatGPT discussions' },
      { name: 'LocalLLaMA', weight: 80, description: 'Local LLM development' },
    ],
  },
  tech_news: {
    keywords: ['tech', 'technology', 'gadget', 'innovation', 'tech news', 'new tech', 'tech review', 'apple', 'google', 'microsoft'],
    subreddits: [
      { name: 'technology', weight: 100, description: 'Technology news' },
      { name: 'gadgets', weight: 85, description: 'Gadget reviews' },
      { name: 'Futurology', weight: 80, description: 'Future tech' },
      { name: 'technews', weight: 75, description: 'Tech news' },
    ],
  },
  programming: {
    keywords: ['programming', 'coding', 'developer', 'software', 'code', 'javascript', 'python', 'react', 'web development', 'software development', 'typescript', 'rust', 'golang'],
    subreddits: [
      { name: 'programming', weight: 100, description: 'Programming discussions' },
      { name: 'webdev', weight: 90, description: 'Web development' },
      { name: 'learnprogramming', weight: 85, description: 'Learn to code' },
      { name: 'javascript', weight: 80, description: 'JavaScript community' },
      { name: 'Python', weight: 80, description: 'Python community' },
    ],
  },
  cybersecurity: {
    keywords: ['cybersecurity', 'security', 'hacking', 'infosec', 'pentest', 'vulnerability', 'malware', 'privacy', 'vpn', 'encryption'],
    subreddits: [
      { name: 'netsec', weight: 100, description: 'Network security' },
      { name: 'cybersecurity', weight: 95, description: 'Cybersecurity discussions' },
      { name: 'hacking', weight: 85, description: 'Ethical hacking' },
      { name: 'privacy', weight: 80, description: 'Privacy and surveillance' },
      { name: 'AskNetsec', weight: 75, description: 'Security Q&A' },
    ],
  },

  // Business & Finance
  startup: {
    keywords: ['startup', 'entrepreneur', 'founder', 'side project', 'saas', 'business idea', 'launch', 'startup ideas', 'small business', 'bootstrapping', 'indie hacker'],
    subreddits: [
      { name: 'startups', weight: 100, description: 'Startup community' },
      { name: 'Entrepreneur', weight: 95, description: 'Entrepreneurship' },
      { name: 'SideProject', weight: 90, description: 'Side projects' },
      { name: 'smallbusiness', weight: 80, description: 'Small business owners' },
      { name: 'SaaS', weight: 75, description: 'SaaS discussions' },
    ],
  },
  investing: {
    keywords: ['invest', 'stock', 'trading', 'portfolio', 'finance', 'investment', 'stock market', 'etf', 'dividend', 'passive income'],
    subreddits: [
      { name: 'investing', weight: 100, description: 'Investment discussions' },
      { name: 'stocks', weight: 95, description: 'Stock market' },
      { name: 'wallstreetbets', weight: 85, description: 'Trading community' },
      { name: 'personalfinance', weight: 80, description: 'Personal finance' },
      { name: 'financialindependence', weight: 75, description: 'FIRE movement' },
    ],
  },
  crypto: {
    keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'web3', 'defi', 'nft', 'altcoin', 'token'],
    subreddits: [
      { name: 'CryptoCurrency', weight: 100, description: 'Crypto discussions' },
      { name: 'Bitcoin', weight: 95, description: 'Bitcoin community' },
      { name: 'ethereum', weight: 90, description: 'Ethereum ecosystem' },
      { name: 'defi', weight: 80, description: 'Decentralized finance' },
      { name: 'CryptoMarkets', weight: 75, description: 'Crypto trading' },
    ],
  },
  marketing: {
    keywords: ['marketing', 'digital marketing', 'seo', 'content marketing', 'social media marketing', 'growth hacking', 'brand', 'advertising', 'copywriting'],
    subreddits: [
      { name: 'marketing', weight: 100, description: 'Marketing strategies' },
      { name: 'digital_marketing', weight: 90, description: 'Digital marketing' },
      { name: 'SEO', weight: 85, description: 'Search engine optimization' },
      { name: 'socialmedia', weight: 80, description: 'Social media strategy' },
      { name: 'copywriting', weight: 75, description: 'Copywriting craft' },
    ],
  },

  // Gaming
  gaming: {
    keywords: ['gaming', 'video game', 'game', 'playstation', 'xbox', 'nintendo', 'pc gaming', 'game review', 'gaming news', 'steam', 'esports'],
    subreddits: [
      { name: 'gaming', weight: 100, description: 'Gaming community' },
      { name: 'Games', weight: 95, description: 'Game discussions' },
      { name: 'pcgaming', weight: 90, description: 'PC gaming' },
      { name: 'PS5', weight: 80, description: 'PlayStation 5' },
      { name: 'NintendoSwitch', weight: 80, description: 'Nintendo Switch' },
    ],
  },

  // Food & Cooking
  cooking: {
    keywords: ['cooking', 'recipe', 'food', 'kitchen', 'chef', 'meal', 'cuisine', 'cooking tips', 'baking', 'grilling'],
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
    keywords: ['science', 'research', 'study', 'scientific', 'discovery', 'physics', 'biology', 'chemistry', 'astronomy', 'space', 'nasa'],
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
    keywords: ['productivity', 'self improvement', 'habits', 'motivation', 'discipline', 'goals', 'time management', 'productivity tips', 'focus', 'mindset'],
    subreddits: [
      { name: 'productivity', weight: 100, description: 'Productivity tips' },
      { name: 'getdisciplined', weight: 95, description: 'Building discipline' },
      { name: 'DecidingToBeBetter', weight: 90, description: 'Self improvement' },
      { name: 'selfimprovement', weight: 85, description: 'Personal growth' },
    ],
  },

  // Design
  design: {
    keywords: ['design', 'ui', 'ux', 'graphic design', 'web design', 'figma', 'creative', 'design inspiration', 'ui ux', 'typography'],
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
    keywords: ['health', 'fitness', 'wellness', 'exercise', 'nutrition', 'diet', 'mental health', 'meditation', 'yoga', 'gym', 'workout'],
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
    keywords: ['travel', 'vacation', 'trip', 'destination', 'backpacking', 'tourism', 'travel tips', 'flight', 'hotel'],
    subreddits: [
      { name: 'travel', weight: 100, description: 'Travel discussions' },
      { name: 'solotravel', weight: 90, description: 'Solo travel' },
      { name: 'backpacking', weight: 85, description: 'Backpacking' },
      { name: 'travelhacks', weight: 80, description: 'Travel tips' },
    ],
  },

  // Education
  education: {
    keywords: ['education', 'learn', 'study', 'school', 'university', 'college', 'learning', 'online learning', 'tutorial', 'course'],
    subreddits: [
      { name: 'learnprogramming', weight: 100, description: 'Learn to code' },
      { name: 'education', weight: 90, description: 'Education discussions' },
      { name: 'AskReddit', weight: 85, description: 'General questions' },
      { name: 'explainlikeimfive', weight: 80, description: 'Simple explanations' },
    ],
  },

  // Pets
  pets: {
    keywords: ['pets', 'cat', 'dog', 'animal', 'pet care', 'dog training', 'cat behavior', 'puppy', 'kitten'],
    subreddits: [
      { name: 'aww', weight: 100, description: 'Cute animals' },
      { name: 'cats', weight: 95, description: 'Cat community' },
      { name: 'dogs', weight: 90, description: 'Dog community' },
      { name: 'pets', weight: 85, description: 'Pet discussions' },
    ],
  },

  // Fashion & Beauty
  fashion: {
    keywords: ['fashion', 'style', 'beauty', 'makeup', 'skincare', 'hair care', 'fashion tips', 'outfit', 'clothing'],
    subreddits: [
      { name: 'fashion', weight: 100, description: 'Fashion community' },
      { name: 'makeupaddiction', weight: 90, description: 'Makeup enthusiasts' },
      { name: 'SkincareAddiction', weight: 85, description: 'Skincare tips' },
      { name: 'malefashionadvice', weight: 80, description: 'Men\'s fashion' },
    ],
  },

  // ============================================
  // NEW CATEGORIES (10 more)
  // ============================================

  // Sports
  sports: {
    keywords: ['sports', 'football', 'basketball', 'soccer', 'baseball', 'nfl', 'nba', 'mls', 'hockey', 'tennis', 'formula 1', 'f1', 'athlete'],
    subreddits: [
      { name: 'sports', weight: 100, description: 'General sports' },
      { name: 'nfl', weight: 95, description: 'NFL football' },
      { name: 'nba', weight: 95, description: 'NBA basketball' },
      { name: 'soccer', weight: 90, description: 'World football / soccer' },
      { name: 'formula1', weight: 85, description: 'Formula 1 racing' },
    ],
  },

  // Music
  music: {
    keywords: ['music', 'song', 'album', 'artist', 'concert', 'playlist', 'band', 'rap', 'hip hop', 'rock', 'pop', 'spotify', 'vinyl'],
    subreddits: [
      { name: 'Music', weight: 100, description: 'Music community' },
      { name: 'listentothis', weight: 90, description: 'Music discovery' },
      { name: 'hiphopheads', weight: 85, description: 'Hip hop community' },
      { name: 'indieheads', weight: 80, description: 'Indie music' },
      { name: 'WeAreTheMusicMakers', weight: 75, description: 'Music production' },
    ],
  },

  // Books & Reading
  books: {
    keywords: ['book', 'reading', 'novel', 'literature', 'audiobook', 'kindle', 'author', 'fiction', 'nonfiction', 'bookclub'],
    subreddits: [
      { name: 'books', weight: 100, description: 'Book discussions' },
      { name: 'suggestmeabook', weight: 95, description: 'Book recommendations' },
      { name: 'booksuggestions', weight: 90, description: 'Book suggestions' },
      { name: '52book', weight: 80, description: 'Reading challenges' },
      { name: 'Fantasy', weight: 75, description: 'Fantasy literature' },
    ],
  },

  // Photography
  photography: {
    keywords: ['photography', 'photo', 'camera', 'dslr', 'mirrorless', 'editing', 'lightroom', 'photoshop', 'portrait', 'landscape photo'],
    subreddits: [
      { name: 'photography', weight: 100, description: 'Photography community' },
      { name: 'itookapicture', weight: 90, description: 'Photo sharing' },
      { name: 'photocritique', weight: 85, description: 'Photo feedback' },
      { name: 'EarthPorn', weight: 80, description: 'Landscape photography' },
      { name: 'postprocessing', weight: 75, description: 'Photo editing' },
    ],
  },

  // Cars & Automotive
  cars: {
    keywords: ['car', 'automobile', 'vehicle', 'automotive', 'driving', 'electric vehicle', 'ev', 'tesla', 'truck', 'suv', 'engine'],
    subreddits: [
      { name: 'cars', weight: 100, description: 'Car community' },
      { name: 'Autos', weight: 90, description: 'Automobile discussions' },
      { name: 'electricvehicles', weight: 85, description: 'EV community' },
      { name: 'whatcarshouldIbuy', weight: 80, description: 'Car buying advice' },
      { name: 'teslamotors', weight: 75, description: 'Tesla community' },
    ],
  },

  // Relationships & Dating
  relationships: {
    keywords: ['relationship', 'dating', 'love', 'breakup', 'marriage', 'partner', 'romantic', 'crush', 'boyfriend', 'girlfriend', 'spouse'],
    subreddits: [
      { name: 'relationships', weight: 100, description: 'Relationship advice' },
      { name: 'relationship_advice', weight: 95, description: 'Relationship Q&A' },
      { name: 'dating_advice', weight: 90, description: 'Dating tips' },
      { name: 'Marriage', weight: 80, description: 'Marriage discussions' },
    ],
  },

  // Parenting
  parenting: {
    keywords: ['parenting', 'kids', 'children', 'baby', 'toddler', 'newborn', 'child rearing', 'mom', 'dad', 'family'],
    subreddits: [
      { name: 'Parenting', weight: 100, description: 'Parenting community' },
      { name: 'Mommit', weight: 90, description: 'Mom community' },
      { name: 'daddit', weight: 90, description: 'Dad community' },
      { name: 'beyondthebump', weight: 85, description: 'After birth' },
      { name: 'toddlers', weight: 80, description: 'Toddler parenting' },
    ],
  },

  // Home Improvement
  home_improvement: {
    keywords: ['home improvement', 'renovation', 'diy', 'remodel', 'interior design', 'woodworking', 'home decor', 'landscaping', 'plumbing', 'electrical'],
    subreddits: [
      { name: 'HomeImprovement', weight: 100, description: 'Home improvement' },
      { name: 'DIY', weight: 95, description: 'Do it yourself' },
      { name: 'woodworking', weight: 85, description: 'Woodworking projects' },
      { name: 'InteriorDesign', weight: 80, description: 'Interior design' },
      { name: 'landscaping', weight: 75, description: 'Landscaping ideas' },
    ],
  },

  // Environment & Sustainability
  environment: {
    keywords: ['environment', 'climate', 'sustainability', 'renewable', 'green', 'eco', 'climate change', 'global warming', 'carbon', 'solar', 'recycling'],
    subreddits: [
      { name: 'environment', weight: 100, description: 'Environment news' },
      { name: 'climate', weight: 95, description: 'Climate science' },
      { name: 'sustainability', weight: 90, description: 'Sustainable living' },
      { name: 'ZeroWaste', weight: 85, description: 'Zero waste lifestyle' },
      { name: 'energy', weight: 80, description: 'Energy discussions' },
    ],
  },

  // Anime & Manga
  anime: {
    keywords: ['anime', 'manga', 'weeb', 'otaku', 'japanese animation', 'crunchyroll', 'funimation', 'shonen', 'isekai', 'light novel'],
    subreddits: [
      { name: 'anime', weight: 100, description: 'Anime community' },
      { name: 'manga', weight: 95, description: 'Manga discussions' },
      { name: 'Animesuggest', weight: 90, description: 'Anime recommendations' },
      { name: 'LightNovels', weight: 80, description: 'Light novels' },
    ],
  },
};

export function findRelevantSubreddits(query: string): SubredditMatch[] {
  const normalizedQuery = query.toLowerCase().trim();
  const scores: Map<string, { match: SubredditMatch; score: number }> = new Map();

  for (const [, category] of Object.entries(subredditDatabase)) {
    let categoryScore = 0;

    for (const keyword of category.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        categoryScore += 100;
      } else if (keyword.toLowerCase().includes(normalizedQuery)) {
        categoryScore += 50;
      } else {
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
    'cybersecurity news',
    'climate change',
  ];
}
