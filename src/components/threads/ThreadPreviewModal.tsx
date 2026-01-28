import { useState, useEffect } from 'react';
import { RedditThread, RedditComment } from '@/types/reddit.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUp,
  MessageSquare,
  Clock,
  Award,
  ExternalLink,
  User,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface ThreadPreviewModalProps {
  thread: RedditThread | null;
  isOpen: boolean;
  onClose: () => void;
  onFetchComments: (thread: RedditThread) => Promise<RedditThread | null>;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  const hours = diff / 3600;

  if (hours < 1) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
  if (hours < 720) return `${Math.floor(hours / 168)}w ago`;
  return `${Math.floor(hours / 720)}mo ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return String(num);
}

interface CommentNodeProps {
  comment: RedditComment;
  depth?: number;
}

function CommentNode({ comment, depth = 0 }: CommentNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(depth > 2);
  const hasReplies = comment.replies && comment.replies.length > 0;

  if (comment.isDeleted) {
    return (
      <div
        className="py-2 text-sm text-muted-foreground italic"
        style={{ marginLeft: `${Math.min(depth * 16, 64)}px` }}
      >
        [deleted]
      </div>
    );
  }

  return (
    <div
      className="border-l-2 border-border/50 hover:border-primary/50 transition-colors"
      style={{ marginLeft: `${Math.min(depth * 16, 64)}px` }}
    >
      <div className="pl-3 py-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <User className="h-3 w-3" />
          <span className="font-medium text-foreground">{comment.author}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            {formatNumber(comment.score)}
          </span>
          <span>•</span>
          <span>{formatTimeAgo(comment.createdUtc)}</span>
        </div>

        {/* Comment body */}
        {!isCollapsed && (
          <>
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.body}
            </p>

            {/* Nested replies */}
            {hasReplies && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Collapsed indicator */}
        {isCollapsed && hasReplies && (
          <span className="text-xs text-muted-foreground">
            [{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}]
          </span>
        )}
      </div>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2" style={{ marginLeft: `${(i % 3) * 16}px` }}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ThreadPreviewModal({
  thread,
  isOpen,
  onClose,
  onFetchComments,
}: ThreadPreviewModalProps) {
  const [fullThread, setFullThread] = useState<RedditThread | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (isOpen && thread) {
      setFullThread(null);
      setIsLoadingComments(true);
      onFetchComments(thread)
        .then((result) => {
          setFullThread(result || thread);
        })
        .finally(() => {
          setIsLoadingComments(false);
        });
    }
  }, [isOpen, thread, onFetchComments]);

  if (!thread) return null;

  const displayThread = fullThread || thread;
  const comments = displayThread.comments || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          {/* Subreddit and metadata */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs bg-secondary/50">
              r/{thread.subreddit}
            </Badge>
            {thread.flair && (
              <Badge variant="secondary" className="text-xs">
                {thread.flair}
              </Badge>
            )}
          </div>
          
          <DialogTitle className="text-xl font-heading leading-snug pr-8">
            {thread.title}
          </DialogTitle>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {thread.author}
            </span>
            <span className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              {formatNumber(thread.score)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {thread.numComments} comments
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTimeAgo(thread.createdUtc)}
            </span>
            {thread.awards > 0 && (
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4 text-primary" />
                {thread.awards}
              </span>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {/* Thread body */}
          {thread.selftext && (
            <div className="mb-6 pb-6 border-b border-border/50">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {thread.selftext}
              </p>
            </div>
          )}

          {/* Comments section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
                {isLoadingComments && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </h3>
              <span className="text-sm text-muted-foreground">
                {comments.length} loaded
              </span>
            </div>

            {isLoadingComments ? (
              <CommentsSkeleton />
            ) : comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentNode key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments available
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-secondary/30">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://reddit.com${thread.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Reddit
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
