import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SubredditList } from '@/components/search/SubredditBadge';
import { ThreadGrid } from '@/components/threads/ThreadGrid';
import { ThreadPreviewModal } from '@/components/threads/ThreadPreviewModal';
import { ExportPanel } from '@/components/export/ExportPanel';
import { SuccessModal } from '@/components/export/SuccessModal';
import { FloatingExportButton } from '@/components/export/FloatingExportButton';
import { useRedditSearch } from '@/hooks/useRedditSearch';
import { useThreadSelection } from '@/hooks/useThreadSelection';
import { RedditThread } from '@/types/reddit.types';
import { generateFilename } from '@/lib/toon-generator';
import {
  Sparkles,
  Zap,
  ChevronDown,
  Github,
  LayoutTemplate,
  ArrowRight,
  Database,
  Target,
  Gauge,
  Users,
  MessageSquare,
  Lightbulb,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    query,
    setQuery,
    subreddits,
    threads,
    isLoading,
    error,
    search,
    fetchComments,
    timeFilter,
    setTimeFilter,
    sortOption,
    setSortOption,
  } = useRedditSearch();

  const {
    selectedThreads,
    isSelected,
    toggle,
    selectAll,
    clearAll,
    selectTopN,
    totalTokens,
    count: selectedCount,
  } = useThreadSelection();

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [previewThread, setPreviewThread] = useState<RedditThread | null>(null);
  const [successData, setSuccessData] = useState<{
    filename: string;
    savings: { originalTokens: number; toonTokens: number; savings: number };
  } | null>(null);
  const [showTips, setShowTips] = useState(true);

  // Handle URL parameters from templates
  useEffect(() => {
    const q = searchParams.get('q');
    const autoSearch = searchParams.get('autoSearch');
    if (q && autoSearch === 'true') {
      setQuery(q);
      setShowTips(false);
      setTimeout(() => search(), 100);
    }
  }, [searchParams, search, setQuery]);

  const handleSearch = async () => {
    clearAll();
    setShowTips(false);
    await search();
  };

  const handleExportSuccess = (savings: { originalTokens: number; toonTokens: number; savings: number }) => {
    setShowExportPanel(false);
    setSuccessData({
      filename: generateFilename(query),
      savings,
    });
  };

  const handleNewSearch = () => {
    setSuccessData(null);
    setQuery('');
    clearAll();
  };

  const handleThreadClick = (thread: RedditThread) => {
    setPreviewThread(thread);
  };

  const hasSearched = threads.length > 0 || subreddits.length > 0;

  const stats = [
    { icon: Database, label: 'Data Indexed', value: '50M+', desc: 'Reddit posts' },
    { icon: Users, label: 'Communities', value: '15K+', desc: 'Subreddits' },
    { icon: Gauge, label: 'Compression', value: '60%', desc: 'Token savings' },
    { icon: Zap, label: 'Speed', value: '<2s', desc: 'Search time' },
  ];

  const tips = [
    { icon: Target, title: 'Be Specific', desc: 'Try "React hooks best practices 2026"' },
    { icon: MessageSquare, title: 'Include Context', desc: 'Add keywords like "review", "discussion", "help"' },
    { icon: Lightbulb, title: 'Use Templates', desc: 'Start with pre-built templates for common topics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        Skip to main content
      </a>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-30"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md group-hover:bg-primary/50 transition-colors" />
              <div className="relative bg-gradient-to-br from-primary to-violet-500 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight">
                Ignition
              </span>
              <span className="text-xs text-muted-foreground block -mt-0.5">Data Research Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
              className="text-muted-foreground hover:text-foreground"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
            {/* Keyboard shortcuts hint */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/60">
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">/</kbd>
              <span>Search</span>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Esc</kbd>
              <span>Clear</span>
            </div>
            <a
              href="https://github.com/instax-dutta/project-ignition"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all duration-200"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      {!hasSearched && (
        <section id="main-content" aria-label="Hero section" className="py-16 md:py-24 px-4 overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto"
          >
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  TOON Format — Up to 70% Token Savings
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
                  Turn Reddit Data Into{' '}
                  <span className="text-gradient-primary">AI-Ready Assets</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Extract, optimize, and export Reddit discussions for AI models. 
                  Transform unstructured content into structured, token-efficient data.
                </p>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                variants={itemVariants}
                className="max-w-2xl mx-auto pt-4"
              >
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* Quick Tips */}
              <AnimatePresence>
                {showTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center justify-center gap-4 pt-4"
                  >
                    {tips.map((tip, idx) => (
                      <motion.div
                        key={tip.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-border/50"
                      >
                        <tip.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{tip.title}:</span> {tip.desc}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate('/templates')}
                >
                  <LayoutTemplate className="h-5 w-5" />
                  Browse Templates
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="p-4 bg-card/50 rounded-xl border border-border/50 text-center hover:border-primary/30 transition-colors"
                >
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-heading font-bold text-gradient-primary">{stat.value}</p>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              variants={itemVariants}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex justify-center mt-12"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-xs uppercase tracking-widest">Start exploring</span>
                <ChevronDown className="h-5 w-5" />
              </div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Search Results Section */}
      {hasSearched && (
        <main id="main-content" aria-label="Search results" className="container mx-auto px-4 py-8 pb-32">
          {/* Search Bar (compact) */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Results Summary */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <SearchFilters
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
                sortOption={sortOption}
                onSortOptionChange={setSortOption}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {threads.length} results
              </span>
              {subreddits.length > 0 && (
                <span className="text-muted-foreground">
                  from {subreddits.length} communities
                </span>
              )}
            </div>
          </motion.div>

          {/* Subreddit Results */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <SubredditList subreddits={subreddits} isLoading={isLoading} />
          </motion.div>

          {/* Thread Results */}
          <ThreadGrid
            threads={threads}
            isLoading={isLoading}
            error={error}
            isSelected={isSelected}
            onToggle={toggle}
            onSelectAll={() => selectAll(threads)}
            onClearAll={clearAll}
            onSelectTopN={(n) => selectTopN(threads, n)}
            selectedCount={selectedCount}
            onThreadClick={handleThreadClick}
            onRetry={handleSearch}
          />

          {/* Empty State */}
          <AnimatePresence>
            {!isLoading && threads.length === 0 && subreddits.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-4"
              >
                <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No threads found for this topic. Try a different search term.
                </p>
                <Button variant="outline" onClick={() => setQuery('')}>
                  Clear Search
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* Thread Preview Modal */}
      <ThreadPreviewModal
        thread={previewThread}
        isOpen={!!previewThread}
        onClose={() => setPreviewThread(null)}
        onFetchComments={fetchComments}
      />

      {/* Floating Export Button */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <FloatingExportButton
            count={selectedCount}
            totalTokens={totalTokens}
            onClick={() => setShowExportPanel(true)}
          />
        )}
      </AnimatePresence>

      {/* Export Panel Dialog */}
      <Dialog open={showExportPanel} onOpenChange={setShowExportPanel}>
        <DialogContent className="max-w-lg p-0 bg-transparent border-0 shadow-none">
          <ExportPanel
            threads={selectedThreads}
            query={query}
            onSuccess={handleExportSuccess}
            onClose={() => setShowExportPanel(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          filename={successData.filename}
          savings={successData.savings}
          onClose={() => setSuccessData(null)}
          onNewSearch={handleNewSearch}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 mt-auto bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Built with</span>
              <span className="text-primary font-medium">TOON</span>
              <span>— Token Optimized Object Notation</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reddit content fetched via public endpoints. No API key required.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
