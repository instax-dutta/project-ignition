import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getPopularTopics } from '@/lib/subreddit-database';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function SearchBar({ value, onChange, onSearch, isLoading }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popularTopics = getPopularTopics();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (topic: string) => {
    onChange(topic);
    setShowSuggestions(false);
    setTimeout(() => onSearch(), 100);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
      <div
        className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''
          }`}
      >
        <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />

        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Enter topic (e.g., startup ideas, AI news, cooking tips)"
              className="h-14 pl-12 pr-4 text-lg bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all duration-200 rounded-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden md:block">
              Press /
            </span>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="xl"
            disabled={isLoading || !value.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span className="hidden sm:inline">Extract</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !value && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-secondary border border-border rounded-lg shadow-card z-50 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3">Popular topics</p>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleSuggestionClick(topic)}
                className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors duration-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
