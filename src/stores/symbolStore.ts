import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SymbolCategoryId,
  SelectedSymbol,
  GeneratedSentence,
  AIStatus,
  AIError,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SymbolState {
  // Category
  activeCategory: SymbolCategoryId;
  setActiveCategory: (id: SymbolCategoryId) => void;

  // Selection
  selectedSymbols: SelectedSymbol[];
  addSymbol: (symbol: SelectedSymbol) => void;
  removeSymbol: (instanceId: string) => void;
  removeLastSymbol: () => void;
  clearSymbols: () => void;
  reorderSymbols: (from: number, to: number) => void;

  // AI
  aiStatus: AIStatus;
  aiError: AIError | null;
  generatedSentence: string;
  setAIStatus: (status: AIStatus) => void;
  setAIError: (error: AIError | null) => void;
  setGeneratedSentence: (sentence: string) => void;

  // History
  history: GeneratedSentence[];
  addToHistory: (entry: Omit<GeneratedSentence, 'id'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useSymbolStore = create<SymbolState>()(
  persist(
    (set, get) => ({
      // Category
      activeCategory: 'people',
      setActiveCategory: (id) => set({ activeCategory: id }),

      // Selection
      selectedSymbols: [],
      addSymbol: (symbol) =>
        set((state) => ({
          selectedSymbols: [...state.selectedSymbols, symbol],
        })),
      removeSymbol: (instanceId) =>
        set((state) => ({
          selectedSymbols: state.selectedSymbols.filter(
            (s) => s.instanceId !== instanceId
          ),
        })),
      removeLastSymbol: () =>
        set((state) => ({
          selectedSymbols: state.selectedSymbols.slice(0, -1),
        })),
      clearSymbols: () =>
        set({
          selectedSymbols: [],
          generatedSentence: '',
          aiStatus: 'idle',
          aiError: null,
        }),
      reorderSymbols: (from, to) =>
        set((state) => {
          const items = [...state.selectedSymbols];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { selectedSymbols: items };
        }),

      // AI
      aiStatus: 'idle',
      aiError: null,
      generatedSentence: '',
      setAIStatus: (status) => set({ aiStatus: status }),
      setAIError: (error) => set({ aiError: error }),
      setGeneratedSentence: (sentence) =>
        set({ generatedSentence: sentence }),

      // History
      history: [],
      addToHistory: (entry) =>
        set((state) => ({
          history: [
            { ...entry, id: uuidv4() },
            ...state.history,
          ].slice(0, 500),
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          ),
        })),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'talkboard-symbols',
      partialize: (state) => ({
        history: state.history,
        activeCategory: state.activeCategory,
      }),
    }
  )
);
