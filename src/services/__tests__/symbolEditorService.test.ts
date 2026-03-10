/**
 * symbolEditorService tests — Custom symbols, categories, boards,
 * validation, import/export, templates, bulk operations.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock uuid with incrementing values
let uuidCounter = 0;
vi.mock('uuid', () => ({ v4: () => `mock-uuid-${++uuidCounter}` }));

import {
  getCustomSymbols,
  getCustomSymbol,
  createCustomSymbol,
  updateCustomSymbol,
  deleteCustomSymbol,
  deleteCustomSymbols,
  duplicateCustomSymbol,
  reorderCustomSymbols,
  hideCustomSymbol,
  showCustomSymbol,
  searchCustomSymbols,
  getCustomSymbolsByCategory,
  getCustomSymbolStats,
  getCustomCategories,
  getCustomCategory,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  reorderCustomCategories,
  getBoards,
  getBoard,
  getActiveBoard,
  setActiveBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  duplicateBoard,
  addBoardPage,
  removeBoardPage,
  setCellSymbol,
  setCellColor,
  toggleCellLock,
  clearBoardPage,
  swapCells,
  validateSymbolForm,
  validateBoardForm,
  validateCategoryForm,
  getBoardTemplates,
  createEditorSnapshot,
  restoreEditorSnapshot,
  saveBackup,
  loadBackup,
  restoreBackup,
  bulkHideSymbols,
  bulkShowSymbols,
  bulkMoveSymbols,
  bulkTagSymbols,
  getEditorStats,
  clearAllEditorData,
  exportSymbolPack,
  importSymbolPack,
} from '@/services/symbolEditorService';
import type { SymbolFormData, BoardFormData, CategoryFormData } from '@/types/symbolEditor';

function makeSymbolForm(overrides?: Partial<SymbolFormData>): SymbolFormData {
  return {
    label: 'Test Symbol',
    emoji: '🧪',
    category: 'people',
    keywords: 'test, sample',
    backgroundColor: '',
    textColor: '',
    borderColor: '',
    fontSize: 'medium',
    notes: '',
    tags: 'demo',
    isHidden: false,
    ...overrides,
  };
}

function makeBoardForm(overrides?: Partial<BoardFormData>): BoardFormData {
  return {
    name: 'Test Board',
    description: 'Test description',
    layout: 'grid',
    gridRows: 3,
    gridCols: 3,
    cellGap: 4,
    cellPadding: 8,
    borderRadius: 12,
    showLabels: true,
    backgroundColor: '#FFFFFF',
    tags: '',
    ...overrides,
  };
}

function makeCategoryForm(overrides?: Partial<CategoryFormData>): CategoryFormData {
  return {
    label: 'Test Category',
    icon: '🏷️',
    color: '#FF0000',
    description: 'A test category',
    ...overrides,
  };
}

describe('symbolEditorService', () => {
  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
  });

  // ─── Custom Symbols ─────────────────────────────────────────────

  describe('Custom Symbols CRUD', () => {
    it('starts with empty symbols', () => {
      expect(getCustomSymbols()).toEqual([]);
    });

    it('creates a custom symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      expect(sym.label).toBe('Test Symbol');
      expect(sym.emoji).toBe('🧪');
      expect(sym.category).toBe('people');
      expect(sym.keywords).toEqual(['test', 'sample']);
      expect(sym.isCustom).toBe(true);
      expect(sym.tags).toEqual(['demo']);
      expect(sym.id).toContain('custom_');
    });

    it('retrieves a single symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      const found = getCustomSymbol(sym.id);
      expect(found?.label).toBe('Test Symbol');
    });

    it('returns undefined for missing symbol', () => {
      expect(getCustomSymbol('nope')).toBeUndefined();
    });

    it('updates a custom symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      const updated = updateCustomSymbol(sym.id, { label: 'Updated' });
      expect(updated?.label).toBe('Updated');
    });

    it('returns null when updating missing symbol', () => {
      expect(updateCustomSymbol('nope', { label: 'x' })).toBeNull();
    });

    it('deletes a custom symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      expect(deleteCustomSymbol(sym.id)).toBe(true);
      expect(getCustomSymbols()).toHaveLength(0);
    });

    it('returns false when deleting missing symbol', () => {
      expect(deleteCustomSymbol('nope')).toBe(false);
    });

    it('bulk deletes symbols', () => {
      const s1 = createCustomSymbol(makeSymbolForm({ label: 'A' }));
      const s2 = createCustomSymbol(makeSymbolForm({ label: 'B' }));
      createCustomSymbol(makeSymbolForm({ label: 'C' }));
      const count = deleteCustomSymbols([s1.id, s2.id]);
      expect(count).toBe(2);
      expect(getCustomSymbols()).toHaveLength(1);
    });

    it('duplicates a symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      const dup = duplicateCustomSymbol(sym.id);
      expect(dup).not.toBeNull();
      expect(dup!.label).toContain('(copy)');
      expect(dup!.id).not.toBe(sym.id);
    });

    it('returns null when duplicating missing symbol', () => {
      expect(duplicateCustomSymbol('nope')).toBeNull();
    });

    it('hides and shows a symbol', () => {
      const sym = createCustomSymbol(makeSymbolForm());
      expect(hideCustomSymbol(sym.id)).toBe(true);
      expect(getCustomSymbol(sym.id)?.isHidden).toBe(true);
      expect(showCustomSymbol(sym.id)).toBe(true);
      expect(getCustomSymbol(sym.id)?.isHidden).toBe(false);
    });

    it('reorders symbols', () => {
      const s1 = createCustomSymbol(makeSymbolForm({ label: 'A', category: 'people' }));
      const s2 = createCustomSymbol(makeSymbolForm({ label: 'B', category: 'people' }));
      reorderCustomSymbols('people', [s2.id, s1.id]);
      const syms = getCustomSymbols();
      const symA = syms.find(s => s.label === 'A')!;
      const symB = syms.find(s => s.label === 'B')!;
      expect(symB.order).toBe(0);
      expect(symA.order).toBe(1);
    });
  });

  describe('Symbol Search & Filter', () => {
    it('searches symbols by label', () => {
      createCustomSymbol(makeSymbolForm({ label: 'Apple' }));
      createCustomSymbol(makeSymbolForm({ label: 'Banana' }));
      const results = searchCustomSymbols('apple');
      expect(results).toHaveLength(1);
      expect(results[0].label).toBe('Apple');
    });

    it('searches symbols by keyword', () => {
      createCustomSymbol(makeSymbolForm({ label: 'Fruit', keywords: 'apple, orange' }));
      const results = searchCustomSymbols('orange');
      expect(results).toHaveLength(1);
    });

    it('gets symbols by category', () => {
      createCustomSymbol(makeSymbolForm({ category: 'food' }));
      createCustomSymbol(makeSymbolForm({ category: 'people' }));
      createCustomSymbol(makeSymbolForm({ category: 'food' }));
      expect(getCustomSymbolsByCategory('food')).toHaveLength(2);
    });

    it('returns stats', () => {
      createCustomSymbol(makeSymbolForm({ category: 'food' }));
      createCustomSymbol(makeSymbolForm({ category: 'food', isHidden: true }));
      createCustomSymbol(makeSymbolForm({ category: 'people' }));
      const stats = getCustomSymbolStats();
      expect(stats.total).toBe(3);
      expect(stats.hidden).toBe(1);
      expect(stats.byCategory['food']).toBe(2);
      expect(stats.byCategory['people']).toBe(1);
    });
  });

  // ─── Custom Categories ──────────────────────────────────────────

  describe('Custom Categories CRUD', () => {
    it('starts with empty categories', () => {
      expect(getCustomCategories()).toEqual([]);
    });

    it('creates a category', () => {
      const cat = createCustomCategory(makeCategoryForm());
      expect(cat.label).toBe('Test Category');
      expect(cat.icon).toBe('🏷️');
      expect(cat.color).toBe('#FF0000');
    });

    it('retrieves a single category', () => {
      const cat = createCustomCategory(makeCategoryForm());
      expect(getCustomCategory(cat.id)?.label).toBe('Test Category');
    });

    it('updates a category', () => {
      const cat = createCustomCategory(makeCategoryForm());
      const updated = updateCustomCategory(cat.id, { label: 'Updated Cat' });
      expect(updated?.label).toBe('Updated Cat');
    });

    it('deletes a category', () => {
      const cat = createCustomCategory(makeCategoryForm());
      const result = deleteCustomCategory(cat.id);
      expect(result.deleted).toBe(true);
      expect(getCustomCategories()).toHaveLength(0);
    });

    it('cascade deletes symbols when deleting category', () => {
      const cat = createCustomCategory(makeCategoryForm());
      createCustomSymbol(makeSymbolForm({ category: cat.id }));
      createCustomSymbol(makeSymbolForm({ category: cat.id }));
      const result = deleteCustomCategory(cat.id, true);
      expect(result.deleted).toBe(true);
      expect(result.symbolsAffected).toBe(2);
    });

    it('reorders categories', () => {
      const c1 = createCustomCategory(makeCategoryForm({ label: 'A' }));
      const c2 = createCustomCategory(makeCategoryForm({ label: 'B' }));
      reorderCustomCategories([c2.id, c1.id]);
      const cats = getCustomCategories();
      const catA = cats.find(c => c.label === 'A')!;
      const catB = cats.find(c => c.label === 'B')!;
      // reorderCustomCategories uses idx+10 offset
      expect(catB.order).toBeLessThan(catA.order);
    });
  });

  // ─── Boards ─────────────────────────────────────────────────────

  describe('Board CRUD', () => {
    it('starts with empty boards', () => {
      expect(getBoards()).toEqual([]);
    });

    it('creates a board with correct grid dimensions', () => {
      const board = createBoard(makeBoardForm({ gridRows: 3, gridCols: 4 }));
      expect(board.name).toBe('Test Board');
      expect(board.pages).toHaveLength(1);
      expect(board.pages[0].rows).toBe(3);
      expect(board.pages[0].cols).toBe(4);
      expect(board.pages[0].cells).toHaveLength(12);
    });

    it('retrieves a single board', () => {
      const board = createBoard(makeBoardForm());
      expect(getBoard(board.id)?.name).toBe('Test Board');
    });

    it('sets and gets active board', () => {
      const board = createBoard(makeBoardForm());
      setActiveBoard(board.id);
      expect(getActiveBoard()?.id).toBe(board.id);
    });

    it('updates a board', () => {
      const board = createBoard(makeBoardForm());
      const updated = updateBoard(board.id, { name: 'Updated Board' });
      expect(updated?.name).toBe('Updated Board');
    });

    it('deletes a board', () => {
      const board = createBoard(makeBoardForm());
      expect(deleteBoard(board.id)).toBe(true);
      expect(getBoards()).toHaveLength(0);
    });

    it('duplicates a board', () => {
      const board = createBoard(makeBoardForm());
      const dup = duplicateBoard(board.id);
      expect(dup).not.toBeNull();
      expect(dup!.name).toContain('(copy)');
      expect(dup!.id).not.toBe(board.id);
    });

    it('makes first board default', () => {
      const board = createBoard(makeBoardForm());
      expect(board.isDefault).toBe(true);
    });
  });

  describe('Board Page Management', () => {
    it('adds a page to a board', () => {
      const board = createBoard(makeBoardForm());
      const page = addBoardPage(board.id);
      expect(page).not.toBeNull();
      expect(getBoard(board.id)?.pages).toHaveLength(2);
    });

    it('removes a page from a board', () => {
      const board = createBoard(makeBoardForm());
      addBoardPage(board.id);
      const thirdPage = addBoardPage(board.id);
      expect(thirdPage).not.toBeNull();
      const result = removeBoardPage(board.id, thirdPage!.id);
      expect(result).toBe(true);
      expect(getBoard(board.id)?.pages).toHaveLength(2);
    });

    it('cannot remove last page', () => {
      const board = createBoard(makeBoardForm());
      const result = removeBoardPage(board.id, board.pages[0].id);
      expect(result).toBe(false);
    });
  });

  describe('Board Cell Operations', () => {
    it('sets a cell symbol', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      expect(setCellSymbol(board.id, pageId, 0, 0, 'sym1')).toBe(true);
      const updated = getBoard(board.id)!;
      const cell = updated.pages[0].cells.find((c) => c.row === 0 && c.col === 0);
      expect(cell?.symbolId).toBe('sym1');
    });

    it('clears a cell symbol', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      setCellSymbol(board.id, pageId, 0, 0, 'sym1');
      setCellSymbol(board.id, pageId, 0, 0, null);
      const updated = getBoard(board.id)!;
      const cell = updated.pages[0].cells.find((c) => c.row === 0 && c.col === 0);
      expect(cell?.symbolId).toBeNull();
    });

    it('sets a cell background color', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      expect(setCellColor(board.id, pageId, 0, 0, '#ff0000')).toBe(true);
      const cell = getBoard(board.id)!.pages[0].cells.find(
        (c) => c.row === 0 && c.col === 0
      );
      expect(cell?.backgroundColor).toBe('#ff0000');
    });

    it('toggles cell lock', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      toggleCellLock(board.id, pageId, 0, 0);
      let cell = getBoard(board.id)!.pages[0].cells.find(
        (c) => c.row === 0 && c.col === 0
      );
      expect(cell?.isLocked).toBe(true);
      toggleCellLock(board.id, pageId, 0, 0);
      cell = getBoard(board.id)!.pages[0].cells.find(
        (c) => c.row === 0 && c.col === 0
      );
      expect(cell?.isLocked).toBe(false);
    });

    it('cannot modify a locked cell', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      setCellSymbol(board.id, pageId, 0, 0, 'sym1');
      toggleCellLock(board.id, pageId, 0, 0);
      // Try to set symbol on locked cell
      expect(setCellSymbol(board.id, pageId, 0, 0, 'sym2')).toBe(false);
      expect(
        getBoard(board.id)!.pages[0].cells.find(
          (c) => c.row === 0 && c.col === 0
        )?.symbolId
      ).toBe('sym1');
    });

    it('clears unlocked cells on a page', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      setCellSymbol(board.id, pageId, 0, 0, 'sym1');
      setCellSymbol(board.id, pageId, 0, 1, 'sym2');
      toggleCellLock(board.id, pageId, 0, 0);
      clearBoardPage(board.id, pageId);
      const cells = getBoard(board.id)!.pages[0].cells;
      // Locked cell should still have its symbol
      expect(cells.find((c) => c.row === 0 && c.col === 0)?.symbolId).toBe('sym1');
      // Unlocked cell should be cleared
      expect(cells.find((c) => c.row === 0 && c.col === 1)?.symbolId).toBeNull();
    });

    it('swaps two cells', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      setCellSymbol(board.id, pageId, 0, 0, 'symA');
      setCellSymbol(board.id, pageId, 1, 1, 'symB');
      expect(
        swapCells(board.id, pageId, { row: 0, col: 0 }, { row: 1, col: 1 })
      ).toBe(true);
      const cells = getBoard(board.id)!.pages[0].cells;
      expect(cells.find((c) => c.row === 0 && c.col === 0)?.symbolId).toBe('symB');
      expect(cells.find((c) => c.row === 1 && c.col === 1)?.symbolId).toBe('symA');
    });

    it('cannot swap locked cells', () => {
      const board = createBoard(makeBoardForm({ gridRows: 2, gridCols: 2 }));
      const pageId = board.pages[0].id;
      setCellSymbol(board.id, pageId, 0, 0, 'symA');
      toggleCellLock(board.id, pageId, 0, 0);
      expect(
        swapCells(board.id, pageId, { row: 0, col: 0 }, { row: 1, col: 1 })
      ).toBe(false);
    });
  });

  // ─── Validation ─────────────────────────────────────────────────

  describe('Form Validation', () => {
    it('validates symbol form — empty label', () => {
      const errors = validateSymbolForm(makeSymbolForm({ label: '' }));
      expect(errors.label).toBeDefined();
    });

    it('validates symbol form — empty emoji', () => {
      const errors = validateSymbolForm(makeSymbolForm({ emoji: '' }));
      expect(errors.emoji).toBeDefined();
    });

    it('validates symbol form — valid form', () => {
      const errors = validateSymbolForm(makeSymbolForm());
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('validates symbol form — label too long', () => {
      const errors = validateSymbolForm(makeSymbolForm({ label: 'a'.repeat(51) }));
      expect(errors.label).toBeDefined();
    });

    it('validates board form — empty name', () => {
      const errors = validateBoardForm(makeBoardForm({ name: '' }));
      expect(errors.name).toBeDefined();
    });

    it('validates board form — valid form', () => {
      const errors = validateBoardForm(makeBoardForm());
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('validates category form — empty label', () => {
      const errors = validateCategoryForm(makeCategoryForm({ label: '' }));
      expect(errors.label).toBeDefined();
    });

    it('validates category form — valid form', () => {
      const errors = validateCategoryForm(makeCategoryForm());
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  // ─── Templates ──────────────────────────────────────────────────

  describe('Board Templates', () => {
    it('returns templates', () => {
      const templates = getBoardTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].name).toBeDefined();
      expect(templates[0].gridRows).toBeGreaterThan(0);
      expect(templates[0].gridCols).toBeGreaterThan(0);
    });

    it('each template has required fields', () => {
      for (const t of getBoardTemplates()) {
        expect(t.id).toBeDefined();
        expect(t.name).toBeDefined();
        expect(t.layout).toBeDefined();
      }
    });
  });

  // ─── Snapshots & Backup ─────────────────────────────────────────

  describe('Snapshots & Backup', () => {
    it('creates and restores a snapshot', () => {
      createCustomSymbol(makeSymbolForm({ label: 'Original' }));
      const snapshot = createEditorSnapshot();
      createCustomSymbol(makeSymbolForm({ label: 'Extra' }));
      expect(getCustomSymbols()).toHaveLength(2);
      restoreEditorSnapshot(snapshot);
      expect(getCustomSymbols()).toHaveLength(1);
      expect(getCustomSymbols()[0].label).toBe('Original');
    });

    it('saves and restores backup', () => {
      createCustomSymbol(makeSymbolForm({ label: 'Backed Up' }));
      saveBackup();
      // clearAllEditorData also removes backup, so manually clear only main data
      localStorage.removeItem('talkboard_custom_symbols');
      localStorage.removeItem('talkboard_custom_categories');
      localStorage.removeItem('talkboard_boards');
      expect(getCustomSymbols()).toHaveLength(0);
      expect(restoreBackup()).toBe(true);
      expect(getCustomSymbols()).toHaveLength(1);
    });

    it('loadBackup returns null when none exists', () => {
      expect(loadBackup()).toBeNull();
    });
  });

  // ─── Bulk Operations ────────────────────────────────────────────

  describe('Bulk Operations', () => {
    it('bulk hides symbols', () => {
      const s1 = createCustomSymbol(makeSymbolForm({ label: 'A' }));
      const s2 = createCustomSymbol(makeSymbolForm({ label: 'B' }));
      expect(bulkHideSymbols([s1.id, s2.id])).toBe(2);
      expect(getCustomSymbol(s1.id)?.isHidden).toBe(true);
      expect(getCustomSymbol(s2.id)?.isHidden).toBe(true);
    });

    it('bulk shows symbols', () => {
      const s1 = createCustomSymbol(makeSymbolForm({ label: 'A', isHidden: true }));
      const s2 = createCustomSymbol(makeSymbolForm({ label: 'B', isHidden: true }));
      expect(bulkShowSymbols([s1.id, s2.id])).toBe(2);
      expect(getCustomSymbol(s1.id)?.isHidden).toBe(false);
    });

    it('bulk moves symbols to a category', () => {
      const s1 = createCustomSymbol(makeSymbolForm({ category: 'people' }));
      const s2 = createCustomSymbol(makeSymbolForm({ category: 'people' }));
      expect(bulkMoveSymbols([s1.id, s2.id], 'food')).toBe(2);
      expect(getCustomSymbol(s1.id)?.category).toBe('food');
    });

    it('bulk tags symbols', () => {
      const s1 = createCustomSymbol(makeSymbolForm());
      const s2 = createCustomSymbol(makeSymbolForm());
      expect(bulkTagSymbols([s1.id, s2.id], 'important')).toBe(2);
      expect(getCustomSymbol(s1.id)?.tags).toContain('important');
    });
  });

  // ─── Import / Export ────────────────────────────────────────────

  describe('Import / Export', () => {
    it('exports a symbol pack as JSON', () => {
      createCustomSymbol(makeSymbolForm({ label: 'ExportMe' }));
      createCustomCategory(makeCategoryForm({ label: 'ExpCat' }));
      const json = exportSymbolPack({
        includeSymbols: true,
        includeCategories: true,
        includeBoards: true,
        includeImages: false,
        includeAudio: false,
        format: 'json',
        name: 'Test Pack',
        description: 'Test export',
        author: 'Tester',
      });
      const parsed = JSON.parse(json);
      expect(parsed.metadata.name).toBe('Test Pack');
      expect(parsed.symbols).toHaveLength(1);
      expect(parsed.categories).toHaveLength(1);
    });

    it('imports a valid symbol pack', () => {
      const sym = createCustomSymbol(makeSymbolForm({ label: 'Existing' }));
      const packJson = JSON.stringify({
        metadata: {
          id: 'pack-1',
          name: 'Import Pack',
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          symbolCount: 1,
        },
        symbols: [
          {
            id: 'imported_1',
            label: 'Imported',
            emoji: '📥',
            category: 'people',
            keywords: [],
            order: 0,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
            isHidden: false,
            tags: [],
          },
        ],
        categories: [],
        boards: [],
      });
      const result = importSymbolPack(packJson);
      expect(result.success).toBe(true);
      expect(result.symbolsImported).toBe(1);
      expect(getCustomSymbols()).toHaveLength(2);
    });

    it('rejects invalid JSON on import', () => {
      const result = importSymbolPack('not valid json {{{');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ─── Stats & Clear ─────────────────────────────────────────────

  describe('Stats & Clear', () => {
    it('returns editor stats', () => {
      createCustomSymbol(makeSymbolForm());
      createCustomCategory(makeCategoryForm());
      createBoard(makeBoardForm());
      const stats = getEditorStats();
      expect(stats.customSymbolCount).toBe(1);
      expect(stats.customCategoryCount).toBe(1);
      expect(stats.boardCount).toBe(1);
    });

    it('clears all editor data', () => {
      createCustomSymbol(makeSymbolForm());
      createCustomCategory(makeCategoryForm());
      createBoard(makeBoardForm());
      clearAllEditorData();
      expect(getCustomSymbols()).toHaveLength(0);
      expect(getCustomCategories()).toHaveLength(0);
      expect(getBoards()).toHaveLength(0);
    });
  });
});
