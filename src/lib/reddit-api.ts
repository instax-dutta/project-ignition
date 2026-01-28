import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';

// List of CORS proxies to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

async function fetchWithFallback(url: string): Promise<Response> {
  let lastError: Error | null = null;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Check if response is actually JSON by peeking at content
      const text = await response.text();
      
      // If it starts with HTML tags, it's not JSON
      if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
        throw new Error('Received HTML instead of JSON');
      }
      
      // Parse and return as a new Response with the JSON
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      lastError = error as Error;
      console.warn(`Proxy ${proxy} failed:`, error);
      continue;
    }
  }
  
  throw lastError || new Error('All proxies failed');
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

function parseThreads(data: any): RedditThread[] {
  if (!data?.data?.children) return [];

  return data.data.children
    .filter((child: any) => child.kind === 't3')
    .map((child: any) => {
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
