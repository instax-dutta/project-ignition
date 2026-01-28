import { SubredditMatch } from '@/types/reddit.types';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';

interface SubredditBadgeProps {
  subreddit: SubredditMatch;
  size?: 'sm' | 'default';
}

export function SubredditBadge({ subreddit, size = 'default' }: SubredditBadgeProps) {
  const confidence = subreddit.weight;
  
  const getConfidenceColor = () => {
    if (confidence >= 80) return 'bg-primary/20 text-primary border-primary/30';
    if (confidence >= 50) return 'bg-secondary text-foreground border-border';
    return 'bg-muted text-muted-foreground border-border/50';
  };

  const getConfidenceStars = () => {
    if (confidence >= 80) return 5;
    if (confidence >= 60) return 4;
    if (confidence >= 40) return 3;
    return 2;
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getConfidenceColor()} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      } transition-all duration-200 hover:scale-105`}
    >
      <span className="font-medium">r/{subreddit.name}</span>
      {size === 'default' && (
        <span className="ml-2 flex items-center gap-0.5">
          {Array.from({ length: getConfidenceStars() }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
        </span>
      )}
    </Badge>
  );
}

interface SubredditListProps {
  subreddits: SubredditMatch[];
  isLoading?: boolean;
}

export function SubredditList({ subreddits, isLoading }: SubredditListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 bg-secondary rounded-full" />
        ))}
      </div>
    );
  }

  if (subreddits.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <span>Found {subreddits.length} relevant communities</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {subreddits.map((sub) => (
          <SubredditBadge key={sub.name} subreddit={sub} />
        ))}
      </div>
    </div>
  );
}
