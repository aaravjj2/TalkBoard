import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSymbols } from '@/hooks/useSymbols';
import { useSymbolStore } from '@/stores/symbolStore';
import type { AACSymbol } from '@/types';

describe('useSymbols', () => {
  beforeEach(() => {
    act(() => {
      const store = useSymbolStore.getState();
      store.clearSymbols();
      store.setActiveCategory('people');
      store.setSearchQuery('');
    });
  });

  describe('category management', () => {
    it('returns current active category', () => {
      const { result } = renderHook(() => useSymbols());
      expect(result.current.activeCategory).toBe('people');
    });

    it('changes active category', () => {
      const { result } = renderHook(() => useSymbols());
      act(() => {
        result.current.setActiveCategory('actions');
      });
      expect(result.current.activeCategory).toBe('actions');
    });

    it('returns symbols for active category', () => {
      const { result } = renderHook(() => useSymbols());
      expect(result.current.categorySymbols.length).toBeGreaterThan(0);
      result.current.categorySymbols.forEach((s) => {
        expect(s.category).toBe('people');
      });
    });

    it('updates symbols when category changes', () => {
      const { result } = renderHook(() => useSymbols());
      const peopleSymbols = result.current.categorySymbols;

      act(() => {
        result.current.setActiveCategory('food');
      });

      const foodSymbols = result.current.categorySymbols;
      expect(foodSymbols).not.toEqual(peopleSymbols);
      foodSymbols.forEach((s) => {
        expect(s.category).toBe('food');
      });
    });
  });

  describe('symbol selection', () => {
    it('starts with empty selection', () => {
      const { result } = renderHook(() => useSymbols());
      expect(result.current.selectedSymbols).toEqual([]);
    });

    it('selects a symbol', () => {
      const { result } = renderHook(() => useSymbols());
      const symbol = result.current.categorySymbols[0];

      act(() => {
        result.current.selectSymbol(symbol);
      });

      expect(result.current.selectedSymbols).toHaveLength(1);
      expect(result.current.selectedSymbols[0].id).toBe(symbol.id);
      expect(result.current.selectedSymbols[0].instanceId).toBeDefined();
    });

    it('selects multiple symbols', () => {
      const { result } = renderHook(() => useSymbols());
      const symbols = result.current.categorySymbols.slice(0, 3);

      act(() => {
        symbols.forEach((s) => result.current.selectSymbol(s));
      });

      expect(result.current.selectedSymbols).toHaveLength(3);
    });

    it('removes a symbol by instanceId', () => {
      const { result } = renderHook(() => useSymbols());
      const symbol = result.current.categorySymbols[0];

      act(() => {
        result.current.selectSymbol(symbol);
      });

      const instanceId = result.current.selectedSymbols[0].instanceId;

      act(() => {
        result.current.removeSymbol(instanceId);
      });

      expect(result.current.selectedSymbols).toHaveLength(0);
    });

    it('removes last symbol', () => {
      const { result } = renderHook(() => useSymbols());
      const symbols = result.current.categorySymbols.slice(0, 3);

      act(() => {
        symbols.forEach((s) => result.current.selectSymbol(s));
      });

      act(() => {
        result.current.removeLastSymbol();
      });

      expect(result.current.selectedSymbols).toHaveLength(2);
    });

    it('clears all symbols', () => {
      const { result } = renderHook(() => useSymbols());
      const symbols = result.current.categorySymbols.slice(0, 3);

      act(() => {
        symbols.forEach((s) => result.current.selectSymbol(s));
      });

      act(() => {
        result.current.clearSymbols();
      });

      expect(result.current.selectedSymbols).toHaveLength(0);
    });

    it('generates selectedLabels string', () => {
      const { result } = renderHook(() => useSymbols());
      const symbols = result.current.categorySymbols.slice(0, 2);

      act(() => {
        symbols.forEach((s) => result.current.selectSymbol(s));
      });

      expect(Array.isArray(result.current.selectedLabels)).toBe(true);
      expect(result.current.selectedLabels.length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    it('starts with empty search query', () => {
      const { result } = renderHook(() => useSymbols());
      expect(result.current.searchQuery).toBe('');
    });

    it('updates search query', () => {
      const { result } = renderHook(() => useSymbols());
      act(() => {
        result.current.setSearchQuery('hello');
      });
      expect(result.current.searchQuery).toBe('hello');
    });

    it('returns filtered symbols when searching', () => {
      const { result } = renderHook(() => useSymbols());
      act(() => {
        result.current.setSearchQuery('hello');
      });
      // filteredSymbols should return matching results
      expect(Array.isArray(result.current.filteredSymbols)).toBe(true);
    });

    it('clears search query', () => {
      const { result } = renderHook(() => useSymbols());
      act(() => {
        result.current.setSearchQuery('hello');
      });
      act(() => {
        result.current.setSearchQuery('');
      });
      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('allSymbols', () => {
    it('returns all symbols array', () => {
      const { result } = renderHook(() => useSymbols());
      expect(result.current.allSymbols.length).toBeGreaterThan(0);
    });

    it('can lookup symbol by id', () => {
      const { result } = renderHook(() => useSymbols());
      const firstSymbol = result.current.allSymbols[0];
      const found = result.current.getSymbolById(firstSymbol.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstSymbol.id);
    });
  });
});
