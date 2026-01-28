export interface RedditThread {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  selftext: string;
  url: string;
  permalink: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  created: number;
  createdUtc: number;
  awards: number;
  flair?: string;
  isNsfw: boolean;
  comments: RedditComment[];
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created: number;
  createdUtc: number;
  depth: number;
  replies: RedditComment[];
  isDeleted: boolean;
}

export interface SubredditMatch {
  name: string;
  weight: number;
  description?: string;
  subscribers?: number;
}

export interface SubredditCategory {
  keywords: string[];
  subreddits: SubredditMatch[];
}

export interface SearchResults {
  query: string;
  subreddits: SubredditMatch[];
  threads: RedditThread[];
  isLoading: boolean;
  error?: string;
}

export interface ThreadSelection {
  thread: RedditThread;
  selected: boolean;
  tokenEstimate: number;
}

export type SortOption = 'relevance' | 'top' | 'new' | 'comments';
export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
export type OptimizationLevel = 'maximum' | 'balanced' | 'aggressive';
