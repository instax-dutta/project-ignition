import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Download, 
  TrendingDown, 
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

interface SuccessModalProps {
  filename: string;
  savings: {
    originalTokens: number;
    toonTokens: number;
    savings: number;
  };
  onClose: () => void;
  onNewSearch: () => void;
}

export function SuccessModal({ filename, savings, onClose, onNewSearch }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInstructions = () => {
    const instructions = `To use this TOON file with ChatGPT or Claude:
1. Open your AI assistant
2. Start a new conversation
3. Paste the contents of ${filename}
4. Ask questions about the Reddit discussions

The TOON format is optimized for AI context, saving you ${savings.savings}% in tokens.`;

    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg border-primary/30 shadow-glow">
        <CardContent className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
            <div className="relative w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold">
              Your TOON File is Ready!
            </h2>
            <p className="text-muted-foreground">
              {filename}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-muted-foreground line-through">
                {savings.originalTokens.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Original</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <TrendingDown className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {savings.savings}% saved
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">
                {savings.toonTokens.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">TOON</p>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm">
            <Sparkles className="h-4 w-4" />
            You saved {(savings.originalTokens - savings.toonTokens).toLocaleString()} tokens!
          </div>

          {/* Instructions */}
          <div className="bg-secondary/30 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-medium">How to use:</p>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Open ChatGPT or Claude</li>
              <li>2. Paste the contents of your TOON file</li>
              <li>3. Ask questions about the discussions</li>
            </ol>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyInstructions}
              className="mt-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Instructions
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              <Download className="h-4 w-4 mr-2" />
              Done
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={onNewSearch}
            >
              Extract Another
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
