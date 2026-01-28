import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SubredditList } from '@/components/search/SubredditBadge';
import { ThreadGrid } from '@/components/threads/ThreadGrid';
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
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Index = () => {
  const {
    query,
    setQuery,
    subreddits,
    threads,
    isLoading,
    error,
    search,
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
  const [successData, setSuccessData] = useState<{
    filename: string;
    savings: { originalTokens: number; toonTokens: number; savings: number };
  } | null>(null);

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

  const hasSearched = threads.length > 0 || subreddits.length > 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-semibold">
              Reddit<span className="text-primary">Context</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!hasSearched && (
        <section className="py-20 md:py-32 px-4">
          <div className="container mx-auto text-center space-y-8">
            {/* Tagline */}
            <div className="space-y-4 max-w-3xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm">
                <Sparkles className="h-4 w-4" />
                TOON Format — 50-70% Token Savings
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
                Transform Reddit Wisdom
                <br />
                <span className="text-gradient-gold">into AI Context</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Intelligently extract Reddit discussions and convert them into 
                token-optimized files ready for ChatGPT and Claude.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto pt-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="p-6 bg-card/30 rounded-xl border border-border/30">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">Smart Discovery</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically finds the most relevant subreddits for your topic
                </p>
              </div>
              <div className="p-6 bg-card/30 rounded-xl border border-border/30">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">TOON Format</h3>
                <p className="text-sm text-muted-foreground">
                  Proprietary format saves 50-70% tokens while preserving context
                </p>
              </div>
              <div className="p-6 bg-card/30 rounded-xl border border-border/30">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading font-semibold mb-2">No API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Works instantly with no configuration or Reddit account required
                </p>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="pt-8 animate-bounce">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
            </div>
          </div>
        </section>
      )}

      {/* Search Results Section */}
      {hasSearched && (
        <main className="container mx-auto px-4 py-8 pb-32">
          {/* Search Bar (compact) */}
          <div className="mb-8">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>

          {/* Subreddit Results */}
          <div className="mb-8">
            <SubredditList subreddits={subreddits} isLoading={isLoading} />
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12 text-destructive">
              <p>Error: {error}</p>
              <Button variant="outline" onClick={handleSearch} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Thread Results */}
          <ThreadGrid
            threads={threads}
            isLoading={isLoading}
            isSelected={isSelected}
            onToggle={toggle}
            onSelectAll={() => selectAll(threads)}
            onClearAll={clearAll}
            onSelectTopN={(n) => selectTopN(threads, n)}
            selectedCount={selectedCount}
          />

          {/* Empty State */}
          {!isLoading && threads.length === 0 && subreddits.length > 0 && (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground">
                No threads found for this topic. Try a different search term.
              </p>
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </main>
      )}

      {/* Floating Export Button */}
      <FloatingExportButton
        count={selectedCount}
        totalTokens={totalTokens}
        onClick={() => setShowExportPanel(true)}
      />

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
