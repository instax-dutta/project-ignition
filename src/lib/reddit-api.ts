import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/',
  'https://yacdn.org/proxy/',
];

// Shuffle proxies to avoid hitting the same one first every time
const getShuffledProxies = () => [...CORS_PROXIES].sort(() => Math.random() - 0.5);

async function fetchWithFallback(url: string, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  const proxies = getShuffledProxies();

  // Clean URL to prevent double encoding or trailing slashes that some proxies hate
  const targetUrl = url.trim();
  console.log(`[Ignition] 🚀 Initiating fetch: ${targetUrl}`);

  // Try direct fetch first (works if user has a CORS-disabling extension)
  try {
    const directResponse = await fetch(targetUrl + (targetUrl.includes('?') ? '&' : '?') + '___cb=' + Date.now(), {
      mode: 'cors',
      headers: { 'Accept': 'application/json' }
    });
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('[Ignition] ✅ Direct fetch successful (CORS extension or local)!');
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e) {
    // Expected to fail on production without extension
  }

  for (const proxy of proxies) {
    try {
      // Some proxies like corsproxy.io don't want encodeURIComponent for the whole URL
      // but most standard ones do. We use encodeURIComponent as default.
      const proxyUrl = proxy.endsWith('?') || proxy.endsWith('=')
        ? proxy + encodeURIComponent(targetUrl)
        : proxy + targetUrl;

      console.log(`[Ignition] 🛰️ Trying proxy: ${proxy}`);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Some proxies need this
        }
      });

      if (response.status === 429) {
        throw new Error('Proxy rate limited (429)');
      }

      if (!response.ok && response.status !== 200) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const trimmedText = text.trim();

      // Smarter detection: Is it actually JSON?
      let data;
      try {
        data = JSON.parse(trimmedText);
      } catch (e) {
        // If parsing fails, and it looks like HTML, it's a block page
        if (trimmedText.startsWith('<') || trimmedText.toLowerCase().includes('<!doctype') || trimmedText.toLowerCase().includes('<html')) {
          console.warn(`[Ignition] ❌ Proxy ${proxy} returned HTML (Reddit block/Proxy demo page)`);
          throw new Error('Received HTML instead of JSON');
        }
        throw new Error('Invalid JSON response');
      }

      // Handle Wrapped Responses (e.g. AllOrigins /get)
      if (data && typeof data === 'object' && 'contents' in data) {
        console.log(`[Ignition] 📦 Unwrapping proxy payload...`);
        data = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
      }

      // Validate Reddit Data Shape
      if (!data || (!data.data && !Array.isArray(data))) {
        throw new Error('Invalid Reddit payload structure');
      }

      console.log(`[Ignition] ✨ Successfully retrieved data via ${proxy}`);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Ignition] 🛑 Proxy ${proxy} failed:`, lastError.message);

      // Small delay before trying next proxy to avoid looking like a burst attack
      await new Promise(resolve => setTimeout(resolve, 300));
      continue;
    }
  }

  // If we reach here, all proxies failed. Try one last recursive retry if allowed.
  if (retries > 0) {
    console.log(`[Ignition] 🔄 All proxies failed. Retrying in 1s... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fetchWithFallback(targetUrl, retries - 1);
  }

  console.error('[Ignition] 💀 All proxies exhausted.');
  throw lastError || new Error('All proxies failed to fetch content');
}

export async function searchSubreddit(
  subreddit: string,
  query: string,
  sort: string = 'top',
  time: TimeFilter = 'week',
  limit: number = 25
): Promise<RedditThread[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(
    query
  )}&sort=${sort}&t=${time}&limit=${limit}&restrict_sr=1`;

  try {
    const response = await fetchWithFallback(url);
    const data = await response.json();
    return parseThreads(data);
  } catch (error) {
    console.error(`Error searching ${subreddit}:`, error);
    return [];
  }
}

export async function fetchThreadWithComments(
  subreddit: string,
  threadId: string
): Promise<RedditThread | null> {
  const url = `https://www.reddit.com/r/${subreddit}/comments/${threadId}.json?limit=100&depth=5`;

  try {
    const response = await fetchWithFallback(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      return null;
    }

    const threadData = data[0].data.children[0].data;
    const commentsData = data[1].data.children;

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
    console.error(`Error fetching thread ${threadId}:`, error);
    return null;
  }
}


export async function searchMultipleSubreddits(
  subreddits: string[],
  query: string,
  sort: string = 'top',
  time: TimeFilter = 'week'
): Promise<RedditThread[]> {
  // Use Promise.allSettled for graceful failure handling - faster than waiting for all to fail
  const promises = subreddits.map((sub) => searchSubreddit(sub, query, sort, time, 10));
  const results = await Promise.allSettled(promises);

  // Flatten and dedupe by thread ID using a Map for O(1) lookups
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

  // Convert to array and sort by relevance score (score * upvote ratio)
  return Array.from(threadsMap.values()).sort((a, b) => {
    const scoreA = a.score * a.upvoteRatio;
    const scoreB = b.score * b.upvoteRatio;
    return scoreB - scoreA;
  });
}

interface RedditResponse {
  data: {
    children: Array<{
      kind: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any; // reddit data is deeply nested and varied, using any here with caution or define more if needed
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
  // Rough estimate: 1 token ≈ 4 characters
  let charCount = thread.title.length + thread.selftext.length;

  const countCommentChars = (comments: RedditComment[]): number => {
    return comments.reduce((sum, comment) => {
      return sum + comment.body.length + countCommentChars(comment.replies);
    }, 0);
  };

  charCount += countCommentChars(thread.comments);
  return Math.ceil(charCount / 4);
}
