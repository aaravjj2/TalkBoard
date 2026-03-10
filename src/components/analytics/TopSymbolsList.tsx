/**
 * TopSymbolsList — Ranked list of most-used symbols with usage bars.
 */

import type { SymbolUsageRecord } from '@/types/analytics';

interface TopSymbolsListProps {
  symbols: SymbolUsageRecord[];
  maxItems?: number;
  showCategory?: boolean;
  showLastUsed?: boolean;
  emptyMessage?: string;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function TopSymbolsList({
  symbols,
  maxItems = 10,
  showCategory = true,
  showLastUsed = true,
  emptyMessage = 'No symbols used yet',
}: TopSymbolsListProps) {
  const displaySymbols = symbols.slice(0, maxItems);
  const maxUses = displaySymbols.length > 0 ? displaySymbols[0].totalUses : 1;

  if (displaySymbols.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {displaySymbols.map((symbol, index) => {
        const barWidth = (symbol.totalUses / maxUses) * 100;

        return (
          <div
            key={symbol.symbolId}
            className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {/* Rank */}
            <span className="w-5 text-xs font-medium text-gray-400 dark:text-gray-500 text-right flex-shrink-0">
              {index + 1}
            </span>

            {/* Emoji */}
            <span className="text-xl flex-shrink-0 w-8 text-center">
              {symbol.emoji}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {symbol.label}
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">
                  {symbol.totalUses.toLocaleString()}
                </span>
              </div>

              {/* Usage bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-3 mt-0.5">
                {showCategory && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                    {symbol.category}
                  </span>
                )}
                {showLastUsed && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {timeAgo(symbol.lastUsedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
