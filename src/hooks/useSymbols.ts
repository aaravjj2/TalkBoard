import { useMemo, useCallback } from 'react';
import { useSymbolStore } from '@/stores/symbolStore';
import {
  ALL_SYMBOLS,
  SYMBOLS_BY_CATEGORY,
  SYMBOL_MAP,
  searchSymbols,
} from '@/data/symbols';
import type { AACSymbol, SymbolCategoryId, SelectedSymbol } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useSymbols() {
  const {
    activeCategory,
    setActiveCategory,
    selectedSymbols,
    addSymbol,
    removeSymbol,
    removeLastSymbol,
    clearSymbols,
    reorderSymbols,
    searchQuery,
    setSearchQuery,
  } = useSymbolStore();

  const categorySymbols = useMemo(
    () => SYMBOLS_BY_CATEGORY[activeCategory] || [],
    [activeCategory]
  );

  const filteredSymbols = useMemo(() => {
    if (!searchQuery.trim()) return categorySymbols;
    return searchSymbols(searchQuery);
  }, [searchQuery, categorySymbols]);

  const selectSymbol = useCallback(
    (symbol: AACSymbol) => {
      const selected: SelectedSymbol = {
        ...symbol,
        instanceId: uuidv4(),
        selectedAt: new Date().toISOString(),
      };
      addSymbol(selected);
    },
    [addSymbol]
  );

  const getSymbolById = useCallback(
    (id: string): AACSymbol | undefined => SYMBOL_MAP.get(id),
    []
  );

  const selectedLabels = useMemo(
    () => selectedSymbols.map((s) => s.label),
    [selectedSymbols]
  );

  return {
    // Category
    activeCategory,
    setActiveCategory,
    categorySymbols,

    // Search
    searchQuery,
    setSearchQuery,
    filteredSymbols,

    // Selection
    selectedSymbols,
    selectSymbol,
    removeSymbol,
    removeLastSymbol,
    clearSymbols,
    reorderSymbols,
    selectedLabels,

    // Lookup
    allSymbols: ALL_SYMBOLS,
    getSymbolById,
  };
}
