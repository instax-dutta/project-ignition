import { Download, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FloatingExportButtonProps {
  count: number;
  totalTokens: number;
  onClick: () => void;
}

export function FloatingExportButton({ count, totalTokens, onClick }: FloatingExportButtonProps) {
  if (count === 0) return null;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  // Calculate estimated savings with TOON
  const savingsPercent = 60;
  const savedTokens = Math.round(totalTokens * (savingsPercent / 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        variant="gold"
        size="xl"
        onClick={onClick}
        className="shadow-xl hover:shadow-2xl group relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
            <Download className="h-5 w-5 group-hover:scale-110 transition-transform relative z-10" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white/20 text-white text-xs rounded-full flex items-center justify-center font-bold border border-white/30">
              {count}
            </span>
          </div>
          <div className="text-left">
            <div className="font-semibold flex items-center gap-2">
              Export {count} {count === 1 ? 'Thread' : 'Threads'}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs opacity-90 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                ~{formatTokens(totalTokens)} tokens
              </span>
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                Save ~{formatTokens(savedTokens)}
              </span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 opacity-50" />
        </div>
      </Button>
    </motion.div>
  );
}
