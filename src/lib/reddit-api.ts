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

const ALTERNATIVE_HOSTS = [
  'https://www.reddit.com',
  'https://old.reddit.com',
  'https://new.reddit.com',
];

const LIBREDDIT_INSTANCES = [
  'https://libreddit.spike.codes',
  'https://safereddit.com',
  'https://libreddit.northboot.xyz',
  'https://libreddit.oxymat.com',
  'https://libreddit.tinfoil-hat.net',
  'https://libreddit.projectsegfau.lt',
  'https://redlib.ducks.party',
  'https://redlib.va.vern.cc',
];

const API_PROXY = '/api/proxy?url=';

const getShuffledArray = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

async function validateAndParse(response: Response, source: string): Promise<any> {
  const contentType = response.headers.get("content-type");
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
  if (!contentType?.includes("application/json")) throw new Error(`${source}: Not JSON (${contentType})`);

  const text = await response.text();
  const data = JSON.parse(text);

  // Validate basic Reddit structure
  if (data && (data.data || Array.isArray(data))) {
    return data;
  }
  throw new Error(`${source}: Invalid Reddit Schema`);
}

async function fetchWithFallback(url: string, retries = 2): Promise<Response> {
  const originalUrl = new URL(url);
  const path = originalUrl.pathname + originalUrl.search;
  let lastError: Error | null = null;

  const hosts = getShuffledArray(ALTERNATIVE_HOSTS);

  console.log(`[Ignition] 🏎️ Entering Parallel Race for: ${path}`);

  // Tier 0 + Tier 2: The Race
  const racers: Promise<any>[] = [];

  // 1. Add Local Proxy (Tier 0) to race
  hosts.forEach(host => {
    const targetUrl = host + path;
    const racePromise = fetch(API_PROXY + encodeURIComponent(targetUrl))
      .then(res => validateAndParse(res, `Bridge(${host})`));
    racers.push(racePromise);
  });

  // 2. Add Top 4 Libreddit instances to race
  const libreddits = getShuffledArray(LIBREDDIT_INSTANCES).slice(0, 4);
  libreddits.forEach(instance => {
    const targetUrl = instance + path;
    const racePromise = fetch(targetUrl)
      .then(res => validateAndParse(res, `Libreddit(${instance})`));
    racers.push(racePromise);
  });

  try {
    const winnerData = await Promise.any(racers);
    console.log(`[Ignition] 🏁 Race won! Data secured.`);
    return new Response(JSON.stringify(winnerData), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.warn(`[Ignition] ⚠️ Race failed. Falling back to Tier 1 Sequential...`, e);
  }

  // Tier 1: Fallback (Public Proxies - slower but wide surface area)
  const proxies = getShuffledArray(CORS_PROXIES);
  for (const host of hosts) {
    const targetUrl = host + path;
    for (const proxy of proxies.slice(0, 3)) { // Only try top 3 to keep it moving
      try {
        const proxyUrl = proxy.endsWith('?') || proxy.endsWith('=') ? proxy + encodeURIComponent(targetUrl) : proxy + targetUrl;
        console.log(`[Ignition] 🛰️ Tier 1 (Fallback) - Trying ${host} via ${proxy.split('/')[2]}`);

        const response = await fetch(proxyUrl, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
        const data = await validateAndParse(response, `Proxy(${proxy.split('/')[2]})`);

        console.log(`[Ignition] ✨ Tier 1 Success!`);
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        lastError = e as Error;
        continue;
      }
    }
  }

  if (retries > 0) {
    console.log(`[Ignition] 🔃 All lanes blocked. Retrying race in 2s... (${retries} retries left)`);
    await new Promise(r => setTimeout(r, 2000));
    return fetchWithFallback(url, retries - 1);
  }

  throw lastError || new Error('All fetching layers exhausted');
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
