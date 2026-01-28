import { RedditThread } from '@/types/reddit.types';
import { ThreadCard } from './ThreadCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Square, Zap, Filter, AlertCircle, RefreshCw } from 'lucide-react';

interface ThreadGridProps {
  threads: RedditThread[];
  isLoading: boolean;
  error?: string | null;
  isSelected: (id: string) => boolean;
  onToggle: (thread: RedditThread) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectTopN: (n: number) => void;
  selectedCount: number;
  onThreadClick?: (thread: RedditThread) => void;
  onRetry?: () => void;
}

function ThreadCardSkeleton() {
  return (
    <div className="border border-border/50 rounded-lg p-4 bg-card/30 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThreadGrid({
  threads,
  isLoading,
  error,
  isSelected,
  onToggle,
  onSelectAll,
  onClearAll,
  onSelectTopN,
  selectedCount,
  onThreadClick,
  onRetry,
}: ThreadGridProps) {
  // Error state with retry
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4 animate-fade-in">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h3 className="font-heading text-lg font-semibold">Failed to fetch Reddit data</h3>
          <p className="text-sm text-muted-foreground">
            {error.includes('All proxies failed') 
              ? "All CORS proxies are currently unavailable. Reddit may be blocking requests or there's a network issue."
              : error}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ThreadCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return null;
  }

  const allSelected = threads.every((t) => isSelected(t.id));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{threads.length} threads found</span>
          {selectedCount > 0 && (
            <span className="text-primary font-medium">
              • {selectedCount} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onClearAll : onSelectAll}
            className="text-sm"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Clear All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Select All
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectTopN(5)}
            className="text-sm"
          >
            <Zap className="h-4 w-4 mr-1" />
            Top 5
          </Button>
        </div>
      </div>

      {/* Thread List */}
      <div className="grid gap-4">
        {threads.map((thread, idx) => (
          <div
            key={thread.id}
            className="animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <ThreadCard
              thread={thread}
              isSelected={isSelected(thread.id)}
              onToggle={() => onToggle(thread)}
              onClick={() => onThreadClick?.(thread)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
