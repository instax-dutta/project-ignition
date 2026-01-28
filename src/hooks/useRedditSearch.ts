import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RedditThread, SubredditMatch, TimeFilter, SortOption } from '@/types/reddit.types';
import { findRelevantSubreddits } from '@/lib/subreddit-database';
import { searchMultipleSubreddits, fetchThreadWithComments } from '@/lib/reddit-api';

interface UseRedditSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  subreddits: SubredditMatch[];
  threads: RedditThread[];
  isLoading: boolean;
  error: string | null;
  search: () => Promise<void>;
  fetchComments: (thread: RedditThread) => Promise<RedditThread | null>;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
}

export function useRedditSearch(): UseRedditSearchReturn {
  const [query, setQuery] = useState('');
  const [subreddits, setSubreddits] = useState<SubredditMatch[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [sortOption, setSortOption] = useState<SortOption>('top');
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ['reddit-search', query, subreddits.map(s => s.name), timeFilter, sortOption],
    queryFn: async () => {
      if (!query || subreddits.length === 0) return [];
      return searchMultipleSubreddits(
        subreddits.map(s => s.name),
        query,
        sortOption,
        timeFilter
      );
    },
    enabled: !!query && subreddits.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const search = useCallback(async () => {
    if (!query.trim()) return;

    // Find relevant subreddits - this will trigger the useQuery automatically
    const matches = findRelevantSubreddits(query);
    setSubreddits(matches);
  }, [query]);

  const fetchComments = useCallback(async (thread: RedditThread): Promise<RedditThread | null> => {
    return fetchThreadWithComments(thread.subreddit, thread.id);
  }, []);

  return {
    query,
    setQuery,
    subreddits,
    threads,
    isLoading,
    error: error ? String(error) : null,
    search,
    fetchComments,
    timeFilter,
    setTimeFilter,
    sortOption,
    setSortOption,
  };
}
