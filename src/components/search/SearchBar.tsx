import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Loader2, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    "What are the best React patterns in 2026?",
    "Find startup ideas discussions...",
    "Search AI and machine learning trends...",
    "Discover gaming recommendations...",
    "Explore personal finance strategies...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
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

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative group"
        >
          {/* Glow effect on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-violet-500 to-primary rounded-xl opacity-0 transition-all duration-500 group-focus-within:opacity-30 blur-lg" />

          <div className="relative flex items-center gap-2 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-violet-500 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            
            <div className="relative flex-1 flex items-center">
              <Search className={`absolute left-4 h-5 w-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholders[placeholderIndex]}
                className="h-14 pl-12 pr-20 text-base bg-transparent border-0 focus:bg-transparent focus:ring-0 placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />
              <AnimatePresence>
                {value && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 p-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="pr-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="hero"
                  size="sm"
                  disabled={isLoading || !value.trim()}
                  className="h-10 px-5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Extract</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Keyboard shortcut hint */}
        <AnimatePresence>
          {!isFocused && !value && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">/</kbd>
                <span>to search</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Quick Suggestions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
          <TrendingUp className="h-3 w-3 inline mr-1" />
          Trending:
        </span>
        <AnimatePresence mode="popLayout">
          {popularTopics.slice(0, 6).map((topic, idx) => (
            <motion.button
              key={topic}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSuggestionClick(topic)}
              className="px-3 py-1.5 text-xs bg-secondary/50 text-muted-foreground border border-border/50 rounded-full transition-colors duration-200 hover:border-primary/30"
            >
              {topic}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
