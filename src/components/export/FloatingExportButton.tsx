import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingExportButtonProps {
  count: number;
  totalTokens: number;
  onClick: () => void;
}

export function FloatingExportButton({ count, totalTokens, onClick }: FloatingExportButtonProps) {
  if (count === 0) return null;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
      <Button
        variant="gold"
        size="xl"
        onClick={onClick}
        className="shadow-xl hover:shadow-2xl group"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-background text-foreground text-xs rounded-full flex items-center justify-center font-bold">
              {count}
            </span>
          </div>
          <div className="text-left">
            <div className="font-semibold">Export Selected</div>
            <div className="text-xs opacity-80">~{formatTokens(totalTokens)} tokens</div>
          </div>
        </div>
      </Button>
    </div>
  );
}
