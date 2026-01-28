import { TimeFilter, SortOption } from '@/types/reddit.types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface SearchFiltersProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
}

const timeFilterOptions: { value: TimeFilter; label: string }[] = [
  { value: 'hour', label: 'Past Hour' },
  { value: 'day', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
  { value: 'all', label: 'All Time' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'top', label: 'Top Voted' },
  { value: 'new', label: 'Newest First' },
  { value: 'comments', label: 'Most Comments' },
];

export function SearchFilters({
  timeFilter,
  onTimeFilterChange,
  sortOption,
  onSortOptionChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filters:</span>
      </div>

      {/* Time Filter */}
      <Select value={timeFilter} onValueChange={(v) => onTimeFilterChange(v as TimeFilter)}>
        <SelectTrigger className="w-[140px] h-9 bg-secondary/50 border-border/50">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {timeFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Option */}
      <Select value={sortOption} onValueChange={(v) => onSortOptionChange(v as SortOption)}>
        <SelectTrigger className="w-[150px] h-9 bg-secondary/50 border-border/50">
          <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
