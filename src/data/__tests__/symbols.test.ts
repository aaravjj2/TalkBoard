import { describe, it, expect } from 'vitest';
import {
  ALL_SYMBOLS,
  SYMBOLS_BY_CATEGORY,
  SYMBOL_MAP,
  searchSymbols,
  getSymbolById,
  getSymbolsByCategory,
} from '@/data/symbols';
import { CATEGORIES, SYMBOL_CATEGORIES } from '@/data/categories';
import type { SymbolCategoryId } from '@/types';

describe('Symbol Data', () => {
  describe('ALL_SYMBOLS', () => {
    it('should contain symbols', () => {
      expect(ALL_SYMBOLS.length).toBeGreaterThan(0);
    });

    it('should have at least 200 symbols', () => {
      expect(ALL_SYMBOLS.length).toBeGreaterThanOrEqual(200);
    });

    it('should have valid structure for each symbol', () => {
      for (const sym of ALL_SYMBOLS) {
        expect(sym.id).toBeDefined();
        expect(typeof sym.id).toBe('string');
        expect(sym.label).toBeDefined();
        expect(typeof sym.label).toBe('string');
        expect(sym.emoji).toBeDefined();
        expect(typeof sym.emoji).toBe('string');
        expect(sym.category).toBeDefined();
        expect(sym.keywords).toBeDefined();
        expect(Array.isArray(sym.keywords)).toBe(true);
        expect(typeof sym.order).toBe('number');
      }
    });

    it('should have unique IDs', () => {
      const ids = ALL_SYMBOLS.map((s) => s.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('SYMBOLS_BY_CATEGORY', () => {
    it('should have entries for all categories', () => {
      const categoryIds: SymbolCategoryId[] = [
        'people',
        'actions',
        'food',
        'feelings',
        'places',
        'objects',
        'social',
        'time',
        'descriptors',
        'questions',
      ];
      for (const cat of categoryIds) {
        expect(SYMBOLS_BY_CATEGORY[cat]).toBeDefined();
        expect(SYMBOLS_BY_CATEGORY[cat].length).toBeGreaterThan(0);
      }
    });

    it('should have symbols with matching category', () => {
      for (const [cat, symbols] of Object.entries(SYMBOLS_BY_CATEGORY)) {
        for (const sym of symbols) {
          expect(sym.category).toBe(cat);
        }
      }
    });
  });

  describe('SYMBOL_MAP', () => {
    it('should contain all symbols by ID', () => {
      for (const sym of ALL_SYMBOLS) {
        expect(SYMBOL_MAP[sym.id]).toBeDefined();
        expect(SYMBOL_MAP[sym.id].label).toBe(sym.label);
      }
    });
  });

  describe('searchSymbols', () => {
    it('should find symbols by label', () => {
      const results = searchSymbols('hello');
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((s) => s.label.toLowerCase().includes('hello'))
      ).toBe(true);
    });

    it('should find symbols by keyword', () => {
      const results = searchSymbols('greeting');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for nonsense query', () => {
      const results = searchSymbols('xyznonexistent123');
      expect(results).toHaveLength(0);
    });

    it('should be case-insensitive', () => {
      const lower = searchSymbols('happy');
      const upper = searchSymbols('HAPPY');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getSymbolById', () => {
    it('should return symbol by ID', () => {
      const firstId = ALL_SYMBOLS[0].id;
      const sym = getSymbolById(firstId);
      expect(sym).toBeDefined();
      expect(sym?.id).toBe(firstId);
    });

    it('should return undefined for invalid ID', () => {
      expect(getSymbolById('nonexistent-id')).toBeUndefined();
    });
  });

  describe('getSymbolsByCategory', () => {
    it('should return symbols for category', () => {
      const people = getSymbolsByCategory('people');
      expect(people.length).toBeGreaterThan(0);
      expect(people.every((s) => s.category === 'people')).toBe(true);
    });
  });
});

describe('Categories', () => {
  describe('CATEGORIES', () => {
    it('should have 10 categories', () => {
      expect(CATEGORIES).toHaveLength(10);
    });

    it('should have valid structure', () => {
      for (const cat of CATEGORIES) {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.icon).toBeDefined();
        expect(cat.color).toBeDefined();
        expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe('SYMBOL_CATEGORIES', () => {
    it('should be same as CATEGORIES', () => {
      expect(SYMBOL_CATEGORIES).toBe(CATEGORIES);
    });
  });
});
