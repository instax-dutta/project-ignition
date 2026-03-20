import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';

// ============================================
// CONFIGURATION - Client-Side CORS Proxies
// ============================================

const CORS_PROXIES = [
  { base: 'https://corsproxy.io/?url=', format: 'direct' },
  { base: 'https://api.allorigins.win/get?url=', format: 'wrapped' },
  { base: 'https://api.codetabs.com/v1/proxy?quest=', format: 'direct' },
];

const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const CACHE_TTL_MS = 5 * 60 * 1000;

// ============================================
// IN-MEMORY CACHE
// ============================================

interface CacheEntry<T> { data: T; timestamp: number; }
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
  if (existing) return existing as Promise<T>;
  const promise = fetcher().finally(() => { inflightRequests.delete(key); });
  inflightRequests.set(key, promise);
  return promise;
}

// ============================================
// CORE FETCH - Client-Side CORS Proxies
// ============================================

export async function fetchReddit(
  endpoint: string,
  params: Record<string, any> = {},
  signal?: AbortSignal
): Promise<any> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const redditUrl = 'https://www.reddit.com' + endpoint + (query ? '?' + query : '') + '.json';
  const cacheKey = 'reddit:' + endpoint + (query ? '?' + query : '');

  const cached = getCached<any>(cacheKey);
  if (cached) {
    console.log('[Ignition] Cache hit: ' + endpoint);
    return cached;
  }

  return deduplicatedFetch(cacheKey, async () => {
    for (const { base, format } of CORS_PROXIES) {
      const proxyUrl = base + encodeURIComponent(redditUrl);
      console.log('[Ignition] Trying proxy: ' + base);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
          const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

          const res = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
              'Accept': 'application/json',
            },
            signal: combinedSignal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) throw new Error('Proxy ' + base + ' HTTP ' + res.status);

          let data: any;
          if (format === 'wrapped') {
            const wrapped = await res.json();
            if (!wrapped.contents) throw new Error('No contents in wrapped response');
            data = JSON.parse(wrapped.contents);
          } else {
            data = await res.json();
          }

          if (!isValidRedditData(data)) throw new Error('Invalid Reddit response structure');

          console.log('[Ignition] Success via ' + base);
          setCache(cacheKey, data);
          return data;
        } catch (err: any) {
          console.warn('[Ignition] Proxy ' + base + ' attempt ' + (attempt + 1) + '/' + MAX_RETRIES + ' failed: ' + err.message);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
            continue;
          }
        }
      }
    }

    throw new Error('All CORS proxies failed for Reddit. Please try again in 30-60 seconds.');
  });
}

function isValidRedditData(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  if ('data' in data && typeof (data as Record<string, unknown>).data === 'object') {
    const listing = (data as Record<string, unknown>).data as Record<string, unknown>;
    return Array.isArray(listing.children);
  }
  if (Array.isArray(data) && data.length >= 2) {
    return data[0]?.data?.children !== undefined;
  }
  return false;
}

// ============================================
// PUBLIC API
// ============================================

export async function searchSubreddit(
  subreddit: string,
  query: string,
  sort: string = 'top',
  time: TimeFilter = 'week',
  limit: number = 25
): Promise<RedditThread[]> {
  try {
    const data = await fetchReddit('/r/' + subreddit + '/search', {
      q: query, sort: sort, t: time, limit: limit, restrict_sr: 1,
    });
    return parseThreads(data as RedditResponse);
  } catch (error) {
    console.error('[Ignition] Search failed for r/' + subreddit + ':', error);
    return [];
  }
}

export async function fetchThreadWithComments(
  subreddit: string,
  threadId: string
): Promise<RedditThread | null> {
  try {
    const data = await fetchReddit('/r/' + subreddit + '/comments/' + threadId, {
      limit: 100, depth: 5,
    });

    if (!Array.isArray(data) || data.length < 2) return null;

    const threadData = (data[0] as any).data.children[0].data;
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
    console.error('[Ignition] Thread fetch failed for ' + threadId + ':', error);
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

  const threadsMap = new Map<string, RedditThread>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const thread of result.value) {
        if (!threadsMap.has(thread.id)) threadsMap.set(thread.id, thread);
      }
    }
  }

  const queryTokens = query.toLowerCase().trim().split(/s+/).filter(t => t.length > 2);

  return Array.from(threadsMap.values())
    .filter(thread => {
      const threadText = thread.title.toLowerCase() + ' ' + thread.selftext.toLowerCase();
      return queryTokens.some(token => threadText.includes(token));
    })
    .sort((a, b) => calculateRelevanceScore(b, queryTokens) - calculateRelevanceScore(a, queryTokens));
}

export interface SubredditSearchResult {
  name: string; title: string; subscribers: number; description: string; over18: boolean;
}

export async function searchSubreddits(query: string): Promise<SubredditSearchResult[]> {
  try {
    const data = await fetchReddit('/subreddits/search', { q: query, limit: 10, include_over_18: false });
    const listing = data as any;
    if (!listing?.data?.children) return [];

    return listing.data.children
      .filter((child: any) => child.kind === 't5')
      .map((child: any) => ({
        name: child.data.display_name,
        title: child.data.title || child.data.display_name,
        subscribers: child.data.subscribers || 0,
        description: child.data.public_description || '',
        over18: child.data.over18 || false,
      }))
      .filter((sub: SubredditSearchResult) => !sub.over18 && sub.subscribers > 1000);
  } catch (error) {
    console.warn('[Ignition] Subreddit search failed for "' + query + '":', error);
    return [];
  }
}

// ============================================
// SCORING and PARSING
// ============================================

function calculateRelevanceScore(thread: RedditThread, queryTokens: string[]): number {
  let score = thread.score * thread.upvoteRatio;
  const titleText = thread.title.toLowerCase();
  queryTokens.forEach(token => {
    if (titleText.includes(token)) { score += 50; if (titleText.startsWith(token)) score += 30; }
  });
  const selftext = thread.selftext.toLowerCase();
  queryTokens.forEach(token => { if (selftext.includes(token)) score += 25; });
  score += thread.numComments * 2;
  const hoursOld = (Date.now() / 1000 - thread.createdUtc) / 3600;
  if (hoursOld < 24) score += 100; else if (hoursOld < 72) score += 50; else if (hoursOld < 168) score += 25;
  return score;
}

interface RedditResponse {
  data: { children: Array<{ kind: string; data: any; }>; };
}

function parseThreads(data: RedditResponse): RedditThread[] {
  if (!data?.data?.children) return [];
  return data.data.children
    .filter((child) => child.kind === 't3')
    .map((child) => {
      const thread = child.data;
      return {
        id: thread.id, title: thread.title, subreddit: thread.subreddit, author: thread.author,
        selftext: thread.selftext || '', url: thread.url, permalink: thread.permalink,
        score: thread.score, upvoteRatio: thread.upvote_ratio, numComments: thread.num_comments,
        created: thread.created, createdUtc: thread.created_utc,
        awards: thread.total_awards_received || 0, flair: thread.link_flair_text,
        isNsfw: thread.over_18, comments: [],
      };
    });
}

function parseComments(children: any[], depth = 0): RedditComment[] {
  if (!children || depth > 5) return [];
  return children
    .filter((child) => child.kind === 't1' && child.data)
    .map((child) => {
      const comment = child.data;
      const replies = comment.replies?.data?.children || [];
      return {
        id: comment.id, author: comment.author || '[deleted]', body: comment.body || '[deleted]',
        score: comment.score || 0, created: comment.created, createdUtc: comment.created_utc,
        depth, isDeleted: comment.author === '[deleted]' || comment.body === '[deleted]',
        replies: parseComments(replies, depth + 1),
      };
    })
    .filter((comment) => !comment.isDeleted || comment.replies.length > 0);
}

export function calculateTokenEstimate(thread: RedditThread): number {
  let charCount = thread.title.length + thread.selftext.length;
  const countCommentChars = (comments: RedditComment[]): number => {
    return comments.reduce((sum, comment) => sum + comment.body.length + countCommentChars(comment.replies), 0);
  };
  charCount += countCommentChars(thread.comments);
  return Math.ceil(charCount / 4);
}
