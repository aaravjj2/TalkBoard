import { describe, it, expect, beforeEach } from 'vitest';
import { useSymbolStore } from '@/stores/symbolStore';
import { act } from '@testing-library/react';
import type { AACSymbol, SelectedSymbol, GeneratedSentence } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const makeSelected = (sym: AACSymbol): SelectedSymbol => ({
  ...sym,
  instanceId: uuidv4(),
  selectedAt: new Date().toISOString(),
});

const mockSymbol: AACSymbol = {
  id: 'test-1',
  label: 'Hello',
  emoji: '👋',
  category: 'social',
  keywords: ['hi', 'greeting'],
  order: 0,
};

const mockSymbol2: AACSymbol = {
  id: 'test-2',
  label: 'World',
  emoji: '🌍',
  category: 'places',
  keywords: ['earth', 'globe'],
  order: 1,
};

describe('symbolStore', () => {
  beforeEach(() => {
    // Reset store state
    const store = useSymbolStore.getState();
    store.clearSymbols();
    store.clearHistory();
    store.setActiveCategory('people');
    store.setSearchQuery('');
  });

  describe('activeCategory', () => {
    it('should default to "people"', () => {
      const { activeCategory } = useSymbolStore.getState();
      expect(activeCategory).toBe('people');
    });

    it('should update active category', () => {
      act(() => {
        useSymbolStore.getState().setActiveCategory('food');
      });
      expect(useSymbolStore.getState().activeCategory).toBe('food');
    });
  });

  describe('selectedSymbols', () => {
    it('should start empty', () => {
      const { selectedSymbols } = useSymbolStore.getState();
      expect(selectedSymbols).toEqual([]);
    });

    it('should add a symbol', () => {
      act(() => {
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
      });
      const { selectedSymbols } = useSymbolStore.getState();
      expect(selectedSymbols).toHaveLength(1);
      expect(selectedSymbols[0].id).toBe('test-1');
      expect(selectedSymbols[0].label).toBe('Hello');
      expect(selectedSymbols[0].emoji).toBe('👋');
      expect(selectedSymbols[0].instanceId).toBeDefined();
    });

    it('should add multiple symbols', () => {
      act(() => {
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol2));
      });
      expect(useSymbolStore.getState().selectedSymbols).toHaveLength(2);
    });

    it('should remove a symbol by instanceId', () => {
      const sel = makeSelected(mockSymbol);
      act(() => {
        useSymbolStore.getState().addSymbol(sel);
      });
      act(() => {
        useSymbolStore.getState().removeSymbol(sel.instanceId);
      });
      expect(useSymbolStore.getState().selectedSymbols).toHaveLength(0);
    });

    it('should remove last symbol', () => {
      act(() => {
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol2));
      });
      act(() => {
        useSymbolStore.getState().removeLastSymbol();
      });
      const { selectedSymbols } = useSymbolStore.getState();
      expect(selectedSymbols).toHaveLength(1);
      expect(selectedSymbols[0].id).toBe('test-1');
    });

    it('should clear all symbols', () => {
      act(() => {
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol2));
      });
      act(() => {
        useSymbolStore.getState().clearSymbols();
      });
      expect(useSymbolStore.getState().selectedSymbols).toHaveLength(0);
    });

    it('should allow adding same symbol multiple times', () => {
      act(() => {
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
        useSymbolStore.getState().addSymbol(makeSelected(mockSymbol));
      });
      expect(useSymbolStore.getState().selectedSymbols).toHaveLength(3);
    });
  });

  describe('AI state', () => {
    it('should default to idle status', () => {
      const { aiStatus } = useSymbolStore.getState();
      expect(aiStatus).toBe('idle');
    });

    it('should set AI status', () => {
      act(() => {
        useSymbolStore.getState().setAIStatus('loading');
      });
      expect(useSymbolStore.getState().aiStatus).toBe('loading');
    });

    it('should set generated sentence', () => {
      act(() => {
        useSymbolStore.getState().setGeneratedSentence('Hello world');
      });
      expect(useSymbolStore.getState().generatedSentence).toBe('Hello world');
    });

    it('should set AI error', () => {
      act(() => {
        useSymbolStore.getState().setAIError({ code: 'network', message: 'Network error' });
      });
      expect(useSymbolStore.getState().aiError).toEqual({ code: 'network', message: 'Network error' });
    });
  });

  describe('searchQuery', () => {
    it('should default to empty', () => {
      expect(useSymbolStore.getState().searchQuery).toBe('');
    });

    it('should update search query', () => {
      act(() => {
        useSymbolStore.getState().setSearchQuery('hello');
      });
      expect(useSymbolStore.getState().searchQuery).toBe('hello');
    });
  });

  describe('history', () => {
    const mockHistoryEntry = {
      symbols: [{ id: 'test-1', label: 'Hello', emoji: '👋' }],
      sentence: 'Hello there!',
      spokenAt: new Date().toISOString(),
      isFavorite: false,
    };

    it('should start with empty history', () => {
      expect(useSymbolStore.getState().history).toEqual([]);
    });

    it('should add to history', () => {
      act(() => {
        useSymbolStore.getState().addToHistory(mockHistoryEntry);
      });
      expect(useSymbolStore.getState().history).toHaveLength(1);
      expect(useSymbolStore.getState().history[0].sentence).toBe('Hello there!');
      expect(useSymbolStore.getState().history[0].id).toBeDefined();
    });

    it('should toggle favorite', () => {
      act(() => {
        useSymbolStore.getState().addToHistory(mockHistoryEntry);
      });
      const id = useSymbolStore.getState().history[0].id;
      act(() => {
        useSymbolStore.getState().toggleFavorite(id);
      });
      expect(useSymbolStore.getState().history[0].isFavorite).toBe(true);

      act(() => {
        useSymbolStore.getState().toggleFavorite(id);
      });
      expect(useSymbolStore.getState().history[0].isFavorite).toBe(false);
    });

    it('should remove from history', () => {
      act(() => {
        useSymbolStore.getState().addToHistory(mockHistoryEntry);
      });
      const id = useSymbolStore.getState().history[0].id;
      act(() => {
        useSymbolStore.getState().removeFromHistory(id);
      });
      expect(useSymbolStore.getState().history).toHaveLength(0);
    });

    it('should clear history', () => {
      act(() => {
        useSymbolStore.getState().addToHistory(mockHistoryEntry);
        useSymbolStore.getState().addToHistory({
          ...mockHistoryEntry,
          sentence: 'Another one',
        });
      });
      act(() => {
        useSymbolStore.getState().clearHistory();
      });
      expect(useSymbolStore.getState().history).toHaveLength(0);
    });
  });
});
