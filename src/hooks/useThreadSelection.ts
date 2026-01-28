import { useState, useCallback, useMemo } from 'react';
import { RedditThread } from '@/types/reddit.types';
import { calculateTokenEstimate } from '@/lib/reddit-api';

interface UseThreadSelectionReturn {
  selectedIds: Set<string>;
  selectedThreads: RedditThread[];
  isSelected: (id: string) => boolean;
  toggle: (thread: RedditThread) => void;
  selectAll: (threads: RedditThread[]) => void;
  clearAll: () => void;
  selectTopN: (threads: RedditThread[], n: number) => void;
  totalTokens: number;
  count: number;
}

export function useThreadSelection(): UseThreadSelectionReturn {
  const [selectedMap, setSelectedMap] = useState<Map<string, RedditThread>>(new Map());

  const selectedIds = useMemo(() => new Set(selectedMap.keys()), [selectedMap]);
  const selectedThreads = useMemo(() => Array.from(selectedMap.values()), [selectedMap]);

  const isSelected = useCallback(
    (id: string) => selectedMap.has(id),
    [selectedMap]
  );

  const toggle = useCallback((thread: RedditThread) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(thread.id)) {
        next.delete(thread.id);
      } else {
        next.set(thread.id, thread);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((threads: RedditThread[]) => {
    setSelectedMap(new Map(threads.map((t) => [t.id, t])));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedMap(new Map());
  }, []);

  const selectTopN = useCallback((threads: RedditThread[], n: number) => {
    const top = threads.slice(0, n);
    setSelectedMap(new Map(top.map((t) => [t.id, t])));
  }, []);

  const totalTokens = useMemo(() => {
    return selectedThreads.reduce((sum, thread) => {
      return sum + calculateTokenEstimate(thread);
    }, 0);
  }, [selectedThreads]);

  return {
    selectedIds,
    selectedThreads,
    isSelected,
    toggle,
    selectAll,
    clearAll,
    selectTopN,
    totalTokens,
    count: selectedMap.size,
  };
}
