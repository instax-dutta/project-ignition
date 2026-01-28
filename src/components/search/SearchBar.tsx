import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const popularTopics = getPopularTopics();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Enter topic (e.g., startup ideas)",
    "Search for AI news...",
    "Best cooking tips and recipes...",
    "Latest gaming releases...",
    "Investment strategies for 2026...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    }
  };

  const handleSuggestionClick = (topic: string) => {
    onChange(topic);
    setTimeout(() => onSearch(), 100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative group"
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholders[placeholderIndex]}
                className="h-14 pl-12 pr-4 text-lg bg-secondary/50 border-border/50 focus:border-primary focus:bg-secondary transition-all duration-200 rounded-lg placeholder:transition-opacity placeholder:duration-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden md:block">
                Press /
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            </motion.div>
          </div>
        </motion.div>
      </form>

      {/* Inline Suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mr-1">Trending:</span>
        <AnimatePresence>
          {popularTopics.slice(0, 5).map((topic, idx) => (
            <motion.button
              key={topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleSuggestionClick(topic)}
              className="px-3 py-1 text-xs bg-secondary/30 text-muted-foreground border border-border/50 rounded-full transition-colors duration-200"
            >
              {topic}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
