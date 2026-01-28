import { RedditThread, RedditComment, OptimizationLevel } from '@/types/reddit.types';

interface TOONOptions {
  level: OptimizationLevel;
  minUpvotes: number;
  maxDepth: number;
  excludeBots: boolean;
}

const DEFAULT_OPTIONS: TOONOptions = {
  level: 'balanced',
  minUpvotes: 5,
  maxDepth: 5,
  excludeBots: true,
};

const BOT_AUTHORS = [
  'AutoModerator',
  'RemindMeBot',
  'SaveVideo',
  'haikusbot',
  'sub_doesnt_exist_bot',
];

const SYMBOL_SUBSTITUTIONS: [RegExp, string][] = [
  [/in my opinion/gi, 'imo'],
  [/to be honest/gi, 'tbh'],
  [/as far as i know/gi, 'afaik'],
  [/for what it's worth/gi, 'fwiw'],
  [/not gonna lie/gi, 'ngl'],
  [/i don't know/gi, 'idk'],
  [/on the other hand/gi, 'otoh'],
  [/\[deleted\]/g, '~'],
  [/\[removed\]/g, '-'],
  [/edit:/gi, '*'],
  [/Edit:/g, '*'],
];

export function generateTOON(
  threads: RedditThread[],
  query: string,
  options: Partial<TOONOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const subreddits = [...new Set(threads.map((t) => t.subreddit))];
  const totalComments = threads.reduce((sum, t) => sum + countComments(t.comments, opts), 0);

  let toon = generateHeader();
  toon += generateMetadata(query, subreddits, threads.length, totalComments);
  
  threads.forEach((thread, idx) => {
    toon += generateThreadBlock(thread, idx + 1, opts);
  });

  toon += generateFooter();
  return toon;
}

function generateHeader(): string {
  return `/*TOON v1.0 - Token Optimized Object Notation
Read instructions:
- @META = metadata, @T = thread, @C = comment
- Format @C[T.C.R] where T=thread#, C=comment#, R=reply depth
- ts:2d = "2 days ago", up:892 = 892 upvotes
- ~ = deleted, - = removed
- Numbered structure shows hierarchy (no indent needed)
*/

`;
}

function generateMetadata(
  query: string,
  subreddits: string[],
  threadCount: number,
  commentCount: number
): string {
  const date = new Date().toISOString().split('T')[0];
  return `@META
q:"${cleanText(query)}"
sr:[${subreddits.map((s) => `"${s}"`).join(',')}]
dt:${date}
tc:${threadCount}|cc:${commentCount}

`;
}

function generateThreadBlock(
  thread: RedditThread,
  threadNum: number,
  opts: TOONOptions
): string {
  let block = `@T${threadNum}\n`;
  block += `t:"${cleanText(thread.title)}"\n`;
  block += `sr:${thread.subreddit}|ts:${abbreviateTime(thread.createdUtc)}|up:${thread.score}`;
  
  if (thread.awards > 0) {
    block += `|aw:${thread.awards}`;
  }
  block += '\n\n';

  if (thread.selftext) {
    const content = compressContent(thread.selftext, opts.level);
    if (content) {
      block += `${content}\n\n`;
    }
  }

  const filteredComments = filterComments(thread.comments, opts);
  let commentNum = 0;
  
  for (const comment of filteredComments) {
    commentNum++;
    block += generateCommentBlock(comment, threadNum, commentNum, 0, opts);
  }

  block += '\n';
  return block;
}

function generateCommentBlock(
  comment: RedditComment,
  threadNum: number,
  commentNum: number,
  depth: number,
  opts: TOONOptions
): string {
  if (depth > opts.maxDepth) return '';
  if (comment.score < opts.minUpvotes && depth > 0) return '';
  if (opts.excludeBots && BOT_AUTHORS.includes(comment.author)) return '';

  let block = `@C${threadNum}.${commentNum}`;
  if (depth > 0) {
    block += `.${depth}`;
  }
  
  block += `|u:${comment.author}|up:${comment.score}`;
  
  if (comment.createdUtc) {
    block += `|ts:${abbreviateTime(comment.createdUtc)}`;
  }
  block += '\n';

  const content = compressContent(comment.body, opts.level);
  if (content) {
    block += `${content}\n\n`;
  }

  // Process replies
  const filteredReplies = comment.replies.filter(
    (r) => r.score >= opts.minUpvotes || depth === 0
  );

  let replyNum = 0;
  for (const reply of filteredReplies.slice(0, 5)) {
    replyNum++;
    block += generateCommentBlock(reply, threadNum, commentNum, depth + 1, opts);
  }

  return block;
}

function generateFooter(): string {
  const timestamp = new Date().toISOString();
  return `@END
gen:reddit-context-extractor|ts:${timestamp}
`;
}

function abbreviateTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  const hours = diff / 3600;

  if (hours < 1) return `${Math.max(1, Math.floor(diff / 60))}m`;
  if (hours < 24) return `${Math.floor(hours)}h`;
  if (hours < 168) return `${Math.floor(hours / 24)}d`;
  if (hours < 720) return `${Math.floor(hours / 168)}w`;
  return `${Math.floor(hours / 720)}mo`;
}

function cleanText(text: string): string {
  return text
    .replace(/"/g, "'")
    .replace(/\n/g, ' ')
    .trim();
}

function compressContent(text: string, level: OptimizationLevel): string {
  if (!text) return '';

  let compressed = text;

  // Apply symbol substitutions
  for (const [pattern, replacement] of SYMBOL_SUBSTITUTIONS) {
    compressed = compressed.replace(pattern, replacement);
  }

  // Remove excessive whitespace
  compressed = compressed.replace(/\n{3,}/g, '\n\n');
  compressed = compressed.replace(/[ \t]{2,}/g, ' ');

  // Level-specific compression
  switch (level) {
    case 'aggressive':
      // Remove markdown formatting
      compressed = compressed.replace(/\*\*([^*]+)\*\*/g, '$1');
      compressed = compressed.replace(/__([^_]+)__/g, '$1');
      compressed = compressed.replace(/\*([^*]+)\*/g, '$1');
      compressed = compressed.replace(/_([^_]+)_/g, '$1');
      compressed = compressed.replace(/~~([^~]+)~~/g, '$1');
      
      // Truncate long content
      if (compressed.length > 500) {
        compressed = compressed.slice(0, 400) + ' [...] ' + compressed.slice(-80);
      }
      break;

    case 'balanced':
      // Light markdown cleanup
      compressed = compressed.replace(/\*\*([^*]+)\*\*/g, '$1');
      
      // Moderate truncation
      if (compressed.length > 800) {
        compressed = compressed.slice(0, 650) + ' [...] ' + compressed.slice(-100);
      }
      break;

    case 'maximum':
      // Keep most formatting, only remove excessive
      if (compressed.length > 1500) {
        compressed = compressed.slice(0, 1200) + ' [...] ' + compressed.slice(-200);
      }
      break;
  }

  return compressed.trim();
}

function filterComments(comments: RedditComment[], opts: TOONOptions): RedditComment[] {
  return comments
    .filter((c) => {
      if (opts.excludeBots && BOT_AUTHORS.includes(c.author)) return false;
      return c.score >= opts.minUpvotes || c.replies.some((r) => r.score >= opts.minUpvotes);
    })
    .slice(0, 20);
}

function countComments(comments: RedditComment[], opts: TOONOptions): number {
  let count = 0;
  for (const comment of comments) {
    if (!opts.excludeBots || !BOT_AUTHORS.includes(comment.author)) {
      if (comment.score >= opts.minUpvotes) {
        count++;
      }
    }
    count += countComments(comment.replies, opts);
  }
  return count;
}

export function calculateTokenSavings(
  threads: RedditThread[],
  toonContent: string
): { originalTokens: number; toonTokens: number; savings: number } {
  // Estimate original tokens (standard format)
  let originalChars = 0;
  for (const thread of threads) {
    originalChars += thread.title.length + 50; // Title + metadata
    originalChars += thread.selftext.length;
    
    const countCommentChars = (comments: RedditComment[]): number => {
      return comments.reduce((sum, c) => {
        return sum + c.body.length + 30 + countCommentChars(c.replies);
      }, 0);
    };
    
    originalChars += countCommentChars(thread.comments);
  }

  const originalTokens = Math.ceil(originalChars / 4);
  const toonTokens = Math.ceil(toonContent.length / 4);
  const savings = Math.round(((originalTokens - toonTokens) / originalTokens) * 100);

  return { originalTokens, toonTokens, savings };
}

export function downloadTOON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFilename(query: string): string {
  const date = new Date().toISOString().split('T')[0];
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  return `reddit-${slug}-${date}.toon`;
}
