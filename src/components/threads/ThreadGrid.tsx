import { RedditThread } from '@/types/reddit.types';
import { ThreadCard } from './ThreadCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Square, Zap, Filter } from 'lucide-react';

interface ThreadGridProps {
  threads: RedditThread[];
  isLoading: boolean;
  isSelected: (id: string) => boolean;
  onToggle: (thread: RedditThread) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectTopN: (n: number) => void;
  selectedCount: number;
  onThreadClick?: (thread: RedditThread) => void;
}

export function ThreadGrid({
  threads,
  isLoading,
  isSelected,
  onToggle,
  onSelectAll,
  onClearAll,
  onSelectTopN,
  selectedCount,
  onThreadClick,
}: ThreadGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
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
