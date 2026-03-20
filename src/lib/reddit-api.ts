import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';

// ============================================
// CONFIGURATION
// ============================================

const API_PROXY = '/api/proxy?url=';
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// ============================================
// IN-MEMORY CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  // Evict old entries if cache gets too large
  if (responseCache.size > 100) {
    const oldest = Array.from(responseCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, 20);
    oldest.forEach(([key]) => responseCache.delete(key));
  }
}

// ============================================
// REQUEST DEDUPLICATION
// ============================================

const inflightRequests = new Map<string, Promise<unknown>>();

async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

// ============================================
// CORE FETCH PIPELINE
// ============================================

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRedditJSON(redditPath: string): Promise<unknown> {
  const cacheKey = `reddit:${redditPath}`;
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    console.log(`[Ignition] 💾 Cache hit: ${redditPath}`);
    return cached;
  }

  return deduplicatedFetch(cacheKey, async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[Ignition] ⏳ Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }

      // Strategy 1: Netlify proxy (primary — guaranteed CORS-safe)
      try {
        const proxyUrl = `${API_PROXY}${encodeURIComponent(`https://www.reddit.com${redditPath}`)}`;
        console.log(`[Ignition] 🔌 Proxy fetch: ${redditPath} (attempt ${attempt + 1})`);
        const response = await fetchWithTimeout(proxyUrl, REQUEST_TIMEOUT_MS);

        if (response.ok) {
          const data = await response.json();
          if (isValidRedditData(data)) {
            console.log(`[Ignition] ✅ Success via Proxy (attempt ${attempt + 1})`);
            setCache(cacheKey, data);
            return data;
          }
        }

        // Rate limited — worth retrying
        if (response.status === 429) {
          lastError = new Error(`Rate limited (429)`);
          continue;
        }

        lastError = new Error(`Proxy returned HTTP ${response.status}`);
      } catch (e) {
        lastError = e as Error;
        console.warn(`[Ignition] ⚠️ Proxy attempt ${attempt + 1} failed:`, (e as Error).message);
      }

      // Strategy 2: Try old.reddit.com through proxy (different rate limit pool)
      try {
        const oldRedditUrl = `${API_PROXY}${encodeURIComponent(`https://old.reddit.com${redditPath}`)}`;
        const response = await fetchWithTimeout(oldRedditUrl, REQUEST_TIMEOUT_MS);

        if (response.ok) {
          const data = await response.json();
          if (isValidRedditData(data)) {
            console.log(`[Ignition] ✅ Success via old.reddit.com Proxy (attempt ${attempt + 1})`);
            setCache(cacheKey, data);
            return data;
          }
        }
        lastError = new Error(`old.reddit proxy returned HTTP ${response.status}`);
      } catch (e) {
        lastError = e as Error;
      }
    }

    throw new Error(`All fetch attempts exhausted for ${redditPath}: ${lastError?.message}`);
  });
}

function isValidRedditData(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  // Search results / listing
  if ('data' in data && typeof (data as Record<string, unknown>).data === 'object') {
    const listing = (data as Record<string, unknown>).data as Record<string, unknown>;
    return Array.isArray(listing.children);
  }

  // Thread + comments (array of two listings)
  if (Array.isArray(data) && data.length >= 2) {
    return data[0]?.data?.children !== undefined;
  }

  return false;
}

// ============================================
// PUBLIC API — Same signatures, clean internals
// ============================================

export async function searchSubreddit(
  subreddit: string,
  query: string,
  sort: string = 'top',
  time: TimeFilter = 'week',
  limit: number = 25
): Promise<RedditThread[]> {
  const path = `/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${time}&limit=${limit}&restrict_sr=1`;

  try {
    const data = await fetchRedditJSON(path);
    return parseThreads(data as RedditResponse);
  } catch (error) {
    console.error(`[Ignition] ❌ Search failed for r/${subreddit}:`, error);
    return [];
  }
}

export async function fetchThreadWithComments(
  subreddit: string,
  threadId: string
): Promise<RedditThread | null> {
  const path = `/r/${subreddit}/comments/${threadId}.json?limit=100&depth=5`;

  try {
    const data = (await fetchRedditJSON(path)) as unknown[];

    if (!Array.isArray(data) || data.length < 2) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const threadData = (data[0] as any).data.children[0].data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commentsData = (data[1] as any).data.children;

    return {
      id: threadData.id,
      title: threadData.title,
      subreddit: threadData.subreddit,
      author: threadData.author,
      selftext: threadData.selftext || '',
      url: threadData.url,
      permalink: threadData.permalink,
      score: threadData.score,
      upvoteRatio: threadData.upvote_ratio,
      numComments: threadData.num_comments,
      created: threadData.created,
      createdUtc: threadData.created_utc,
      awards: threadData.total_awards_received || 0,
      flair: threadData.link_flair_text,
      isNsfw: threadData.over_18,
      comments: parseComments(commentsData),
    };
  } catch (error) {
    console.error(`[Ignition] ❌ Thread fetch failed for ${threadId}:`, error);
    return null;
  }
}

export async function searchMultipleSubreddits(
  subreddits: string[],
  query: string,
  sort: string = 'top',
  time: TimeFilter = 'week'
): Promise<RedditThread[]> {
  const promises = subreddits.map((sub) => searchSubreddit(sub, query, sort, time, 10));
  const results = await Promise.allSettled(promises);

  // Flatten and dedupe by thread ID
  const threadsMap = new Map<string, RedditThread>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const thread of result.value) {
        if (!threadsMap.has(thread.id)) {
          threadsMap.set(thread.id, thread);
        }
      }
    }
  }

  // Filter and rank
  const queryTokens = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 2);

  return Array.from(threadsMap.values())
    .filter(thread => {
      const threadText = `${thread.title.toLowerCase()} ${thread.selftext.toLowerCase()}`;
      return queryTokens.some(token => threadText.includes(token));
    })
    .sort((a, b) => calculateRelevanceScore(b, queryTokens) - calculateRelevanceScore(a, queryTokens));
}

// ============================================
// SUBREDDIT SEARCH (for dynamic discovery)
// ============================================

export interface SubredditSearchResult {
  name: string;
  title: string;
  subscribers: number;
  description: string;
  over18: boolean;
}

export async function searchSubreddits(query: string): Promise<SubredditSearchResult[]> {
  const path = `/subreddits/search.json?q=${encodeURIComponent(query)}&limit=10&include_over_18=false`;

  try {
    const data = await fetchRedditJSON(path);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listing = data as any;
    if (!listing?.data?.children) return [];

    return listing.data.children
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((child: any) => child.kind === 't5')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((child: any) => ({
        name: child.data.display_name,
        title: child.data.title || child.data.display_name,
        subscribers: child.data.subscribers || 0,
        description: child.data.public_description || '',
        over18: child.data.over18 || false,
      }))
      .filter((sub: SubredditSearchResult) => !sub.over18 && sub.subscribers > 1000);
  } catch (error) {
    console.warn(`[Ignition] ⚠️ Subreddit search failed for "${query}":`, error);
    return [];
  }
}

// ============================================
// SCORING & PARSING (unchanged logic)
// ============================================

function calculateRelevanceScore(thread: RedditThread, queryTokens: string[]): number {
  let score = 0;

  // Base score
  score += thread.score * thread.upvoteRatio;

  // Title match bonus
  const titleText = thread.title.toLowerCase();
  queryTokens.forEach(token => {
    if (titleText.includes(token)) {
      score += 50;
      if (titleText.startsWith(token)) score += 30;
    }
  });

  // Selftext match bonus
  const selftext = thread.selftext.toLowerCase();
  queryTokens.forEach(token => {
    if (selftext.includes(token)) score += 25;
  });

  // Comment count bonus
  score += thread.numComments * 2;

  // Freshness bonus
  const hoursOld = (Date.now() / 1000 - thread.createdUtc) / 3600;
  if (hoursOld < 24) score += 100;
  else if (hoursOld < 72) score += 50;
  else if (hoursOld < 168) score += 25;

  return score;
}

interface RedditResponse {
  data: {
    children: Array<{
      kind: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }>;
  };
}

function parseThreads(data: RedditResponse): RedditThread[] {
  if (!data?.data?.children) return [];

  return data.data.children
    .filter((child) => child.kind === 't3')
    .map((child) => {
      const thread = child.data;
      return {
        id: thread.id,
        title: thread.title,
        subreddit: thread.subreddit,
        author: thread.author,
        selftext: thread.selftext || '',
        url: thread.url,
        permalink: thread.permalink,
        score: thread.score,
        upvoteRatio: thread.upvote_ratio,
        numComments: thread.num_comments,
        created: thread.created,
        createdUtc: thread.created_utc,
        awards: thread.total_awards_received || 0,
        flair: thread.link_flair_text,
        isNsfw: thread.over_18,
        comments: [],
      };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseComments(children: any[], depth = 0): RedditComment[] {
  if (!children || depth > 5) return [];

  return children
    .filter((child) => child.kind === 't1' && child.data)
    .map((child) => {
      const comment = child.data;
      const replies = comment.replies?.data?.children || [];

      return {
        id: comment.id,
        author: comment.author || '[deleted]',
        body: comment.body || '[deleted]',
        score: comment.score || 0,
        created: comment.created,
        createdUtc: comment.created_utc,
        depth,
        isDeleted: comment.author === '[deleted]' || comment.body === '[deleted]',
        replies: parseComments(replies, depth + 1),
      };
    })
    .filter((comment) => !comment.isDeleted || comment.replies.length > 0);
}

export function calculateTokenEstimate(thread: RedditThread): number {
  let charCount = thread.title.length + thread.selftext.length;

  const countCommentChars = (comments: RedditComment[]): number => {
    return comments.reduce((sum, comment) => {
      return sum + comment.body.length + countCommentChars(comment.replies);
    }, 0);
  };

  charCount += countCommentChars(thread.comments);
  return Math.ceil(charCount / 4);
}
