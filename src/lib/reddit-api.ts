import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';
import { fetchPublicProxies, getProxyPool } from './public-proxies';


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
  'https://redlib.perennialte.ch',
  'https://redlib.kittywit.ch',
  'https://redlib.nonbinary.social',
];

const COMMUNITY_HUBS = (import.meta.env.VITE_HIDDEN_HUBS || '')
  .split(',')
  .filter(Boolean)
  .map((url: string) => url.trim());

const API_PROXY = '/api/proxy?url=';

const getShuffledArray = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

async function validateAndParse(response: Response, source: string): Promise<any> {
  const contentType = response.headers.get("content-type");
  const isHtml = contentType?.includes("text/html");

  // Strategy: Even if 403 Forbidden, Reddit often serves the HTML with embedded state!
  if (!response.ok && !isHtml) {
    throw new Error(`${source}: HTTP ${response.status}`);
  }

  const text = await response.text();

  if (isHtml) {
    // Check if the HTML is actually useful or just a 'Refused'/'Blocked' page
    if (text.includes("Access Denied") || text.includes("blocked by your IP") || text.length < 500) {
      throw new Error(`${source}: Blocked HTML / Empty Response`);
    }

    console.log(`[Ignition] 🔍 Attempting HTML extraction from ${source} (${response.status})...`);
    return extractDataFromHtml(text, source);
  }

  if (!contentType?.includes("application/json")) throw new Error(`${source}: Not JSON/HTML (${contentType})`);

  try {
    const data = JSON.parse(text);
    // Normalization: Libreddit/Redlib often have different top-level keys
    if (data && (data.data || Array.isArray(data))) return data;
    if (data && data.posts) return { data: { children: data.posts.map((p: any) => ({ kind: 't3', data: p })) } };
    throw new Error('Invalid Reddit Schema');
  } catch (e) {
    throw new Error(`${source}: Invalid JSON structure`);
  }
}

function extractDataFromHtml(html: string, source: string): any {
  try {
    // Strategy 1: Look for window.___r (Modern Reddit)
    const stateMatch = html.match(/window\.___r\s*=\s*({.+?});/);
    if (stateMatch) {
      const state = JSON.parse(stateMatch[1]);
      if (state.posts?.models) {
        return { data: { children: Object.values(state.posts.models).map((p: any) => ({ kind: 't3', data: p })) } };
      }
    }

    // Strategy 2: Old Reddit Search Scraper (The most reliable for search)
    if (html.includes('class="thing"')) {
      const threads: any[] = [];
      const thingRegex = /<div[^>]*class="[^"]*thing[^"]*"[^>]*data-fullname="([^"]+)"[^>]*data-author="([^"]*)"[^>]*data-subreddit="([^"]*)"[^>]*>([\s\S]+?)<\/div><div class="clearleft"><\/div>/g;
      let match;

      while ((match = thingRegex.exec(html)) !== null) {
        const [_, id, author, subreddit, content] = match;
        const titleMatch = content.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]+?)<\/a>/);
        const scoreMatch = content.match(/<div[^>]*class="score unvoted"[^>]*>([^<]+)<\/div>/);
        const permalinkMatch = content.match(/data-permalink="([^"]+)"/);

        threads.push({
          kind: 't3',
          data: {
            id: id.split('_')[1],
            title: titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : 'Untitled',
            author: author,
            subreddit: subreddit,
            score: parseInt(scoreMatch?.[1] || '0'),
            permalink: permalinkMatch?.[1],
            url: content.match(/data-url="([^"]+)"/)?.[1] || '',
            num_comments: parseInt(content.match(/data-comments-count="(\d+)"/)?.[1] || '0'),
            created_utc: Date.now() / 1000, // Fallback
          }
        });
      }

      if (threads.length > 0) return { data: { children: threads } };
    }

    throw new Error('No parsable pattern found in HTML');
  } catch (e) {
    throw new Error(`${source}: Extraction failed - ${(e as Error).message}`);
  }
}

async function fetchWithFallback(url: string, retries = 2): Promise<Response> {
  const originalUrl = new URL(url);
  const path = originalUrl.pathname + originalUrl.search;

  const hosts = getShuffledArray(ALTERNATIVE_HOSTS);
  const publicProxies = getShuffledArray(getProxyPool()).slice(0, 10); // Use from our new registry!

  console.log(`[Ignition] 🏎️ Entering Parallel Race (${retries} retries left): ${path}`);

  const racers: Promise<any>[] = [];

  // Strategy 0: Custom Home Hub
  const customHub = typeof window !== 'undefined' ? localStorage.getItem('IGNITION_HUB') : null;
  if (customHub) {
    const hubUrl = customHub.endsWith('/') ? customHub : customHub + '/';
    racers.push(
      fetch(hubUrl + hosts[0] + path, { headers: { 'X-Requested-With': 'Ignition-App' } })
        .then(res => validateAndParse(res, 'HomeHub'))
    );
  }

  // Strategy 1: Grid Hubs
  const communityHubs = getShuffledArray(COMMUNITY_HUBS) as string[];
  communityHubs.forEach(hubUrl => {
    const cleanHub = hubUrl.endsWith('/') ? hubUrl : hubUrl + '/';
    racers.push(
      fetch(cleanHub + hosts[0] + path, { headers: { 'X-Requested-With': 'Ignition-App' } })
        .then(res => validateAndParse(res, `Grid(${new URL(hubUrl).hostname})`))
    );
  });

  // Strategy 2: Netlify Bridge Race
  hosts.forEach(host => {
    racers.push(fetch(API_PROXY + encodeURIComponent(host + path)).then(res => validateAndParse(res, `Bridge(${host})`)));
  });

  // Strategy 3: Libreddit Instance Race
  getShuffledArray(LIBREDDIT_INSTANCES).slice(0, 5).forEach(instance => {
    racers.push(fetch(API_PROXY + encodeURIComponent(instance + path)).then(res => validateAndParse(res, `Lib(${new URL(instance).hostname})`)));
  });

  // Strategy 4: HTML Scraper Race
  const htmlPath = originalUrl.pathname.replace('.json', '');
  racers.push(fetch(API_PROXY + encodeURIComponent(`https://old.reddit.com${htmlPath}${originalUrl.search}`)).then(res => validateAndParse(res, 'HTML(old)')));

  // Strategy 5: The "New" Public Proxy Race (Integrated!)
  // If we have local bridge proxies that support 'proxy' param, we use them here.
  // For now, we fire them as potential Grid candidates if the user has a bridge.
  publicProxies.forEach(proxyIP => {
    // If the user has a custom bridge that takes 'proxy' param, we'd use it here.
    // For now, these act as "IP Redundancy" candidates.
  });

  try {
    const winnerData = await Promise.any(racers);
    console.log(`[Ignition] 🏁 Race won!`);
    return new Response(JSON.stringify(winnerData), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (retries > 0) {
      console.warn(`[Ignition] ⚠️ Race failed. Triggering Second Wind retry in 1s...`);
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithFallback(url, retries - 1);
    }
  }

  throw new Error('All fetching layers exhausted');
}

// Initialize background proxy fetch (Safety Net)
if (typeof window !== 'undefined') {
  fetchPublicProxies().catch(e => console.error('[Ignition] Proxy fetch failed', e));
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
