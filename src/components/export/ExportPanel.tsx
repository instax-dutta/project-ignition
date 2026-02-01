import { useState } from 'react';
import { RedditThread, OptimizationLevel } from '@/types/reddit.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileText,
  Gauge,
  Zap,
  Target,
  Crown,
  TrendingDown,
  CheckCircle,
  Loader2,
  FileCode
} from 'lucide-react';
import {
  generateTOON,
  calculateTokenSavings,
  downloadTOON,
  generateFilename,
  generateMarkdown,
  downloadMarkdown,
  generateMarkdownFilename
} from '@/lib/toon-generator';

interface ExportPanelProps {
  threads: RedditThread[];
  query: string;
  onSuccess: (savings: { originalTokens: number; toonTokens: number; savings: number }) => void;
  onClose?: () => void;
}

export function ExportPanel({ threads, query, onSuccess, onClose }: ExportPanelProps) {
  const [filename, setFilename] = useState(generateFilename(query));
  const [level, setLevel] = useState<OptimizationLevel>('balanced');
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'toon' | 'markdown' | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const optimizationOptions = [
    {
      value: 'maximum' as OptimizationLevel,
      label: 'Maximum Quality',
      icon: Crown,
      description: 'Keeps everything, minimal compression',
      savings: '30-40%',
    },
    {
      value: 'balanced' as OptimizationLevel,
      label: 'Balanced',
      icon: Target,
      description: 'Recommended for most use cases',
      savings: '50-60%',
      recommended: true,
    },
    {
      value: 'aggressive' as OptimizationLevel,
      label: 'Aggressive',
      icon: Zap,
      description: 'Maximum token savings',
      savings: '60-70%',
    },
  ];

  const handlePreview = () => {
    const content = generateTOON(threads, query, { level });
    setPreviewContent(content);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportingFormat('toon');

    try {
      // Simulate processing time for UX
      await new Promise((r) => setTimeout(r, 500));

      const content = generateTOON(threads, query, { level });
      const savings = calculateTokenSavings(threads, content);

      downloadTOON(content, filename);
      onSuccess(savings);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const handleMarkdownExport = async () => {
    setIsExporting(true);
    setExportingFormat('markdown');

    try {
      // Simulate processing time for UX
      await new Promise((r) => setTimeout(r, 500));

      const content = generateMarkdown(threads, query, { level });
      const mdFilename = generateMarkdownFilename(query);

      downloadMarkdown(content, mdFilename);

      // Calculate savings for TOON format for comparison
      const toonContent = generateTOON(threads, query, { level });
      const savings = calculateTokenSavings(threads, toonContent);
      onSuccess(savings);
    } catch (error) {
      console.error('Markdown export failed:', error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-heading text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Export Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filename */}
        <div className="space-y-2">
          <Label htmlFor="filename" className="text-sm font-medium">
            Filename
          </Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-secondary/50 border-border/50 focus:border-primary"
          />
        </div>

        {/* Optimization Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Optimization Level</Label>
          <div className="grid gap-3">
            {optimizationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLevel(option.value)}
                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${level === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 bg-secondary/30 hover:bg-secondary/50'
                  }`}
              >
                <option.icon className={`h-5 w-5 mt-0.5 ${level === option.value ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    {option.recommended && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                  <p className="text-sm text-primary mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {option.savings} token reduction
                  </p>
                </div>
                {level === option.value && (
                  <CheckCircle className="h-5 w-5 text-primary absolute top-4 right-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            {previewContent ? (
              <div className="relative">
                <pre className="p-4 bg-secondary/30 rounded-lg text-xs font-mono overflow-auto max-h-60 text-muted-foreground">
                  {previewContent.slice(0, 1000)}
                  {previewContent.length > 1000 && '\n\n... (truncated)'}
                </pre>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handlePreview}
                className="w-full border-dashed"
              >
                Generate Preview
              </Button>
            )}
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-heading font-bold text-foreground">
                  {threads.length}
                </p>
                <p className="text-xs text-muted-foreground">Threads</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-heading font-bold text-foreground">
                  {threads.reduce((sum, t) => sum + t.numComments, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-heading font-bold text-primary">
                  ~{level === 'aggressive' ? '65' : level === 'balanced' ? '55' : '35'}%
                </p>
                <p className="text-xs text-muted-foreground">Savings</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="gold"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || threads.length === 0}
            className="w-full"
          >
            {isExporting && exportingFormat === 'toon' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                TOON Format
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleMarkdownExport}
            disabled={isExporting || threads.length === 0}
            className="w-full border-primary/50 hover:bg-primary/10"
          >
            {isExporting && exportingFormat === 'markdown' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileCode className="h-4 w-4" />
                Markdown
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
