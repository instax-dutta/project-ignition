import { RedditThread, RedditComment, TimeFilter } from '@/types/reddit.types';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function encodeRedditUrl(url: string): string {
  return CORS_PROXY + encodeURIComponent(url);
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
    const response = await fetch(encodeRedditUrl(url), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

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
    const response = await fetch(encodeRedditUrl(url), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

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
  const promises = subreddits.map((sub) => searchSubreddit(sub, query, sort, time, 10));
  const results = await Promise.all(promises);
  
  // Flatten and dedupe by thread ID
  const seen = new Set<string>();
  const threads: RedditThread[] = [];
  
  for (const subThreads of results) {
    for (const thread of subThreads) {
      if (!seen.has(thread.id)) {
        seen.add(thread.id);
        threads.push(thread);
      }
    }
  }

  // Sort by relevance score (score * upvote ratio)
  return threads.sort((a, b) => {
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
