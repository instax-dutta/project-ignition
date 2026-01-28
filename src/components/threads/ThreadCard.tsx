import { RedditThread } from '@/types/reddit.types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp, 
  MessageSquare, 
  Clock, 
  Award,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { calculateTokenEstimate } from '@/lib/reddit-api';

interface ThreadCardProps {
  thread: RedditThread;
  isSelected: boolean;
  onToggle: () => void;
  onClick?: () => void;
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

export function ThreadCard({ thread, isSelected, onToggle, onClick }: ThreadCardProps) {
  const tokenEstimate = calculateTokenEstimate(thread);
  const isHighQuality = thread.score > 500 && thread.numComments > 50;
  const isTrending = thread.upvoteRatio > 0.9 && thread.score > 100;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-card ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border/50 hover:border-border bg-card/50 hover:bg-card'
      }`}
      onClick={onClick}
    >
      {/* Selection indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/30'
        }`}
      />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-secondary/50 border-border/50">
                    r/{thread.subreddit}
                  </Badge>
                  {thread.flair && (
                    <Badge variant="secondary" className="text-xs">
                      {thread.flair}
                    </Badge>
                  )}
                  {isHighQuality && (
                    <Badge className="text-xs bg-primary/20 text-primary border-0">
                      <Award className="h-3 w-3 mr-1" />
                      Quality
                    </Badge>
                  )}
                  {isTrending && (
                    <Badge className="text-xs bg-green-500/20 text-green-400 border-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <h3 className="font-heading text-base font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {thread.title}
                </h3>
              </div>
            </div>

            {/* Preview text */}
            {thread.selftext && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {thread.selftext.slice(0, 200)}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

            {/* Token estimate */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                ~{formatNumber(tokenEstimate)} tokens
              </span>
              <a
                href={`https://reddit.com${thread.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View on Reddit
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
