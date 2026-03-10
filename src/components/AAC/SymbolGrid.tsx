import { useRef, useMemo } from 'react';
import type { AACSymbol, SymbolCategoryId } from '@/types';
import { useBreakpoint, useKeyboardNavigation } from '@/hooks/useAccessibility';
import { GRID_COLUMNS } from '@/constants';
import { getCategoryColor } from '@/data/categories';

interface SymbolGridProps {
  symbols: AACSymbol[];
  activeCategory: SymbolCategoryId;
  onSymbolSelect: (symbol: AACSymbol) => void;
  gridSize?: 'small' | 'medium' | 'large';
  isSearchResult?: boolean;
}

export default function SymbolGrid({
  symbols,
  activeCategory,
  onSymbolSelect,
  gridSize = 'medium',
  isSearchResult = false,
}: SymbolGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const breakpoint = useBreakpoint();

  const columns = useMemo(() => {
    const cols = GRID_COLUMNS[breakpoint] || 4;
    // Adjust for grid size
    if (gridSize === 'small') return cols + 2;
    if (gridSize === 'large') return Math.max(cols - 1, 2);
    return cols;
  }, [breakpoint, gridSize]);

  const { focusIndex } = useKeyboardNavigation(
    gridRef,
    symbols.length,
    columns,
    (index) => {
      if (symbols[index]) onSymbolSelect(symbols[index]);
    }
  );

  const tileSize = useMemo(() => {
    switch (gridSize) {
      case 'small':
        return 'h-16 text-xs';
      case 'large':
        return 'h-28 text-base';
      default:
        return 'h-20 text-sm';
    }
  }, [gridSize]);

  if (symbols.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500"
        data-testid="symbol-grid-empty"
      >
        <span className="text-4xl mb-2">🔍</span>
        <p className="text-sm">
          {isSearchResult
            ? 'No symbols found. Try a different search.'
            : 'No symbols in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid gap-2 p-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label={
        isSearchResult
          ? 'Search results'
          : `${activeCategory} symbols`
      }
      id={`symbols-${activeCategory}`}
      data-testid="symbol-grid"
    >
      {symbols.map((symbol, index) => {
        const catColor = getCategoryColor(symbol.category);
        return (
          <button
            key={symbol.id}
            onClick={() => onSymbolSelect(symbol)}
            className={`
              symbol-tile ${tileSize}
              flex flex-col items-center justify-center gap-1
              rounded-xl border-2 border-transparent
              bg-white dark:bg-gray-800 shadow-sm
              hover:shadow-md hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-1
              transition-all duration-150 touch-manipulation
              ${focusIndex === index ? 'ring-2 ring-primary-400' : ''}
            `}
            style={{
              borderColor: `${catColor}30`,
              ['--tw-ring-color' as string]: catColor,
            }}
            role="gridcell"
            aria-label={`${symbol.label}. ${symbol.category} symbol`}
            tabIndex={focusIndex === index ? 0 : -1}
            data-testid={`symbol-${symbol.id}`}
          >
            <span
              className={`${gridSize === 'small' ? 'text-xl' : gridSize === 'large' ? 'text-4xl' : 'text-3xl'}`}
              role="img"
              aria-hidden="true"
            >
              {symbol.emoji}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center px-1">
              {symbol.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
