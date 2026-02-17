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
  FileText,
  Zap,
  Shield,
  ChevronDown,
  Github,
  LayoutTemplate
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
      staggerChildren: 0.15,
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

  // Handle URL parameters from templates
  useEffect(() => {
    const q = searchParams.get('q');
    const autoSearch = searchParams.get('autoSearch');
    if (q && autoSearch === 'true') {
      setQuery(q);
      // Delay search to allow state to update
      setTimeout(() => search(), 100);
    }
  }, [searchParams, search, setQuery]);

  const handleSearch = async () => {
    clearAll();
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-semibold">
              Ignition
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
              className="text-muted-foreground hover:text-foreground"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <a
              href="https://github.com/instax-dutta/project-ignition"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 border border-transparent hover:border-primary/20"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Contribute Now</span>
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      {!hasSearched && (
        <section className="py-20 md:py-32 px-4 overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto text-center space-y-8"
          >
            {/* Tagline */}
            <motion.div variants={itemVariants} className="space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm">
                <Sparkles className="h-4 w-4" />
                TOON Format — 50-70% Token Savings
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
                Ignition: <span className="text-gradient-primary">Ultimate Information Access</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Ignition to Ultimate Information of Reddit access to LLMs through token optimised files (TOON format) through human not direct api endpoints for ai agents.
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

            {/* Templates Link */}
            <motion.div variants={itemVariants}>
              <Button
                variant="link"
                onClick={() => navigate('/templates')}
                className="text-muted-foreground hover:text-primary"
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Or try a pre-built template
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12"
            >
              <div className="p-6 bg-card/30 rounded-xl border border-border/30 hover:bg-card/40 transition-colors">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">Smart Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically finds the most relevant subreddits for your topic
                </p>
              </div>
              <div className="p-6 bg-card/30 rounded-xl border border-border/30 hover:bg-card/40 transition-colors">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">TOON Format</h3>
                <p className="text-sm text-muted-foreground">
                  Proprietary format saves 50-70% tokens while preserving context
                </p>
              </div>
              <div className="p-6 bg-card/30 rounded-xl border border-border/30 hover:bg-card/40 transition-colors">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">No API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Works instantly with no configuration or Reddit account required
                </p>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              variants={itemVariants}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="pt-8"
            >
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Search Results Section */}
      {hasSearched && (
        <main className="container mx-auto px-4 py-8 pb-32">
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

          {/* Filters */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <SearchFilters
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
            />
          </motion.div>

          {/* Subreddit Results */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
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
      <footer className="border-t border-border/30 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with the <span className="text-primary font-medium">TOON</span> format —
            Token Optimized Object Notation
          </p>
          <p className="mt-2 text-xs">
            Reddit content is fetched via public JSON endpoints. No Reddit account required.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
