/**
 * symbolEditorStore tests — Zustand store for custom symbols,
 * categories, boards, editor UI state, undo/redo, selection, clipboard.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

vi.mock('uuid', () => ({ v4: () => `mock-${Math.random().toString(36).slice(2, 8)}` }));

import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { CustomSymbol, CustomCategory, Board } from '@/types/symbolEditor';

function resetStore() {
  localStorage.clear();
  useSymbolEditorStore.setState(useSymbolEditorStore.getInitialState());
}

describe('symbolEditorStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ─── Editor UI ──────────────────────────────────────────────────

  describe('Editor UI', () => {
    it('starts closed', () => {
      expect(useSymbolEditorStore.getState().isEditorOpen).toBe(false);
    });

    it('opens and closes', () => {
      act(() => useSymbolEditorStore.getState().openEditor());
      expect(useSymbolEditorStore.getState().isEditorOpen).toBe(true);
      act(() => useSymbolEditorStore.getState().closeEditor());
      expect(useSymbolEditorStore.getState().isEditorOpen).toBe(false);
    });

    it('opens to specific tab', () => {
      act(() => useSymbolEditorStore.getState().openEditor('boards'));
      expect(useSymbolEditorStore.getState().activeEditorTab).toBe('boards');
    });

    it('sets active tab', () => {
      act(() => useSymbolEditorStore.getState().setActiveTab('categories'));
      expect(useSymbolEditorStore.getState().activeEditorTab).toBe('categories');
    });

    it('sets mode', () => {
      act(() => useSymbolEditorStore.getState().setMode('edit'));
      expect(useSymbolEditorStore.getState().mode).toBe('edit');
    });

    it('sets tool', () => {
      act(() => useSymbolEditorStore.getState().setTool('color'));
      expect(useSymbolEditorStore.getState().activeTool).toBe('color');
    });
  });

  // ─── Symbol CRUD ────────────────────────────────────────────────

  describe('Symbol CRUD', () => {
    it('creates a symbol from form data', () => {
      const store = useSymbolEditorStore.getState();
      act(() => {
        store.setSymbolFormField('label', 'Hello');
        store.setSymbolFormField('emoji', '👋');
        store.setSymbolFormField('category', 'greetings');
      });
      let result: CustomSymbol | null = null;
      act(() => {
        result = useSymbolEditorStore.getState().createSymbol();
      });
      expect(result).not.toBeNull();
      expect(result!.label).toBe('Hello');
    });

    it('validates before creating — rejects blank label', () => {
      const store = useSymbolEditorStore.getState();
      act(() => {
        store.setSymbolFormField('label', '');
        store.setSymbolFormField('emoji', '👋');
      });
      const valid = useSymbolEditorStore.getState().validateSymbolForm();
      expect(valid).toBe(false);
      expect(useSymbolEditorStore.getState().symbolFormErrors.label).toBeDefined();
    });

    it('deletes a symbol', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'ToDelete');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '🗑️');
      });
      let sym: CustomSymbol | null = null;
      act(() => {
        sym = useSymbolEditorStore.getState().createSymbol();
      });
      expect(sym).not.toBeNull();
      let result = false;
      act(() => {
        result = useSymbolEditorStore.getState().deleteSymbol(sym!.id);
      });
      expect(result).toBe(true);
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(0);
    });

    it('duplicates a symbol', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'Original');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '🌟');
      });
      let sym: CustomSymbol | null = null;
      act(() => {
        sym = useSymbolEditorStore.getState().createSymbol();
      });
      let dup: CustomSymbol | null = null;
      act(() => {
        dup = useSymbolEditorStore.getState().duplicateSymbol(sym!.id);
      });
      expect(dup).not.toBeNull();
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(2);
    });

    it('hides and shows a symbol', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'HideMe');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '👁️');
      });
      let sym: CustomSymbol | null = null;
      act(() => {
        sym = useSymbolEditorStore.getState().createSymbol();
      });
      act(() => {
        useSymbolEditorStore.getState().hideSymbol(sym!.id);
      });
      const syms1 = useSymbolEditorStore.getState().getCustomSymbols();
      expect(syms1.find((s) => s.id === sym!.id)?.isHidden).toBe(true);
      act(() => {
        useSymbolEditorStore.getState().showSymbol(sym!.id);
      });
      const syms2 = useSymbolEditorStore.getState().getCustomSymbols();
      expect(syms2.find((s) => s.id === sym!.id)?.isHidden).toBe(false);
    });
  });

  // ─── Symbol Form ────────────────────────────────────────────────

  describe('Symbol Form', () => {
    it('sets form fields', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'Test');
      });
      expect(useSymbolEditorStore.getState().symbolFormData.label).toBe('Test');
      expect(useSymbolEditorStore.getState().isSymbolFormDirty).toBe(true);
    });

    it('resets form', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'Dirty');
        useSymbolEditorStore.getState().resetSymbolForm();
      });
      expect(useSymbolEditorStore.getState().symbolFormData.label).toBe('');
      expect(useSymbolEditorStore.getState().isSymbolFormDirty).toBe(false);
    });

    it('populates form when editing a symbol', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'MySymbol');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '✨');
      });
      let sym: CustomSymbol | null = null;
      act(() => {
        sym = useSymbolEditorStore.getState().createSymbol();
      });
      act(() => {
        useSymbolEditorStore.getState().resetSymbolForm();
        useSymbolEditorStore.getState().editSymbol(sym!);
      });
      expect(useSymbolEditorStore.getState().symbolFormData.label).toBe('MySymbol');
      expect(useSymbolEditorStore.getState().editingSymbol?.id).toBe(sym!.id);
    });

    it('newSymbol resets to create mode', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'Anything');
        useSymbolEditorStore.getState().newSymbol();
      });
      expect(useSymbolEditorStore.getState().editingSymbol).toBeNull();
      expect(useSymbolEditorStore.getState().mode).toBe('create');
    });
  });

  // ─── Category CRUD ──────────────────────────────────────────────

  describe('Category CRUD', () => {
    it('creates a category', () => {
      act(() => {
        useSymbolEditorStore.getState().setCategoryFormField('label', 'Emotions');
        useSymbolEditorStore.getState().setCategoryFormField('icon', '😊');
        useSymbolEditorStore.getState().setCategoryFormField('color', '#FF0000');
      });
      let cat: CustomCategory | null = null;
      act(() => {
        cat = useSymbolEditorStore.getState().createCategory();
      });
      expect(cat).not.toBeNull();
      expect(cat!.label).toBe('Emotions');
    });

    it('deletes a category', () => {
      act(() => {
        useSymbolEditorStore.getState().setCategoryFormField('label', 'Del');
        useSymbolEditorStore.getState().setCategoryFormField('icon', '🗑️');
      });
      let cat: CustomCategory | null = null;
      act(() => {
        cat = useSymbolEditorStore.getState().createCategory();
      });
      let result = { deleted: false, symbolsAffected: 0 };
      act(() => {
        result = useSymbolEditorStore.getState().deleteCategory(cat!.id);
      });
      expect(result.deleted).toBe(true);
    });
  });

  // ─── Board CRUD ─────────────────────────────────────────────────

  describe('Board CRUD', () => {
    it('creates a board', () => {
      act(() => {
        useSymbolEditorStore.getState().setBoardFormField('name', 'My Board');
        useSymbolEditorStore.getState().setBoardFormField('gridRows', 4);
        useSymbolEditorStore.getState().setBoardFormField('gridCols', 5);
      });
      let board: Board | null = null;
      act(() => {
        board = useSymbolEditorStore.getState().createBoardAction();
      });
      expect(board).not.toBeNull();
      expect(board!.name).toBe('My Board');
      expect(board!.pages[0].cells).toHaveLength(20);
    });

    it('deletes a board', () => {
      act(() => {
        useSymbolEditorStore.getState().setBoardFormField('name', 'DelBoard');
      });
      let board: Board | null = null;
      act(() => {
        board = useSymbolEditorStore.getState().createBoardAction();
      });
      let result = false;
      act(() => {
        result = useSymbolEditorStore.getState().deleteBoardAction(board!.id);
      });
      expect(result).toBe(true);
    });

    it('duplicates a board', () => {
      act(() => {
        useSymbolEditorStore.getState().setBoardFormField('name', 'DupBoard');
      });
      let board: Board | null = null;
      act(() => {
        board = useSymbolEditorStore.getState().createBoardAction();
      });
      let dup: Board | null = null;
      act(() => {
        dup = useSymbolEditorStore.getState().duplicateBoardAction(board!.id);
      });
      expect(dup).not.toBeNull();
      expect(useSymbolEditorStore.getState().getBoards()).toHaveLength(2);
    });

    it('creates from template', () => {
      const templates = useSymbolEditorStore.getState().getTemplates();
      expect(templates.length).toBeGreaterThan(0);
      let board: Board | null = null;
      act(() => {
        board = useSymbolEditorStore.getState().createFromTemplate(templates[0].id);
      });
      expect(board).not.toBeNull();
      expect(useSymbolEditorStore.getState().getBoards()).toHaveLength(1);
    });
  });

  // ─── Selection ──────────────────────────────────────────────────

  describe('Selection', () => {
    it('selects and deselects', () => {
      act(() => useSymbolEditorStore.getState().selectSymbol('s1'));
      expect(useSymbolEditorStore.getState().selection.symbolIds).toContain('s1');
      act(() => useSymbolEditorStore.getState().deselectSymbol('s1'));
      expect(useSymbolEditorStore.getState().selection.symbolIds).not.toContain('s1');
    });

    it('toggles selection', () => {
      act(() => useSymbolEditorStore.getState().toggleSelection('s1'));
      expect(useSymbolEditorStore.getState().selection.symbolIds).toContain('s1');
      act(() => useSymbolEditorStore.getState().toggleSelection('s1'));
      expect(useSymbolEditorStore.getState().selection.symbolIds).not.toContain('s1');
    });

    it('deselects all', () => {
      act(() => {
        useSymbolEditorStore.getState().selectSymbol('s1');
        useSymbolEditorStore.getState().selectSymbol('s2');
        useSymbolEditorStore.getState().deselectAll();
      });
      expect(useSymbolEditorStore.getState().selection.symbolIds).toHaveLength(0);
    });
  });

  // ─── Undo/Redo ─────────────────────────────────────────────────

  describe('Undo/Redo', () => {
    it('starts with no undo/redo', () => {
      expect(useSymbolEditorStore.getState().canUndo()).toBe(false);
      expect(useSymbolEditorStore.getState().canRedo()).toBe(false);
    });

    it('pushHistory enables undo', () => {
      act(() => useSymbolEditorStore.getState().pushHistory('test'));
      expect(useSymbolEditorStore.getState().canUndo()).toBe(true);
    });

    it('undo then redo works', () => {
      act(() => useSymbolEditorStore.getState().pushHistory('action1'));
      act(() => useSymbolEditorStore.getState().undo());
      expect(useSymbolEditorStore.getState().canRedo()).toBe(true);
      act(() => useSymbolEditorStore.getState().redo());
      expect(useSymbolEditorStore.getState().canRedo()).toBe(false);
    });
  });

  // ─── View ───────────────────────────────────────────────────────

  describe('View', () => {
    it('sets zoom within bounds', () => {
      act(() => useSymbolEditorStore.getState().setZoom(200));
      expect(useSymbolEditorStore.getState().zoom).toBe(200);
      act(() => useSymbolEditorStore.getState().setZoom(10));
      expect(useSymbolEditorStore.getState().zoom).toBe(25);
      act(() => useSymbolEditorStore.getState().setZoom(500));
      expect(useSymbolEditorStore.getState().zoom).toBe(400);
    });

    it('toggles grid', () => {
      const initial = useSymbolEditorStore.getState().showGrid;
      act(() => useSymbolEditorStore.getState().toggleGrid());
      expect(useSymbolEditorStore.getState().showGrid).toBe(!initial);
    });

    it('toggles snap to grid', () => {
      const initial = useSymbolEditorStore.getState().snapToGrid;
      act(() => useSymbolEditorStore.getState().toggleSnapToGrid());
      expect(useSymbolEditorStore.getState().snapToGrid).toBe(!initial);
    });
  });

  // ─── Search & Filter ───────────────────────────────────────────

  describe('Search & Filter', () => {
    it('sets search query', () => {
      act(() => useSymbolEditorStore.getState().setSearchQuery('hello'));
      expect(useSymbolEditorStore.getState().searchQuery).toBe('hello');
    });

    it('sets filter category', () => {
      act(() => useSymbolEditorStore.getState().setFilterCategory('food'));
      expect(useSymbolEditorStore.getState().filterCategory).toBe('food');
    });

    it('sets show hidden', () => {
      act(() => useSymbolEditorStore.getState().setShowHidden(true));
      expect(useSymbolEditorStore.getState().showHidden).toBe(true);
    });
  });

  // ─── Notifications ─────────────────────────────────────────────

  describe('Notifications', () => {
    it('sets and dismisses notifications', () => {
      act(() =>
        useSymbolEditorStore.getState().setNotification({
          type: 'success',
          message: 'Saved!',
        })
      );
      expect(useSymbolEditorStore.getState().notification?.message).toBe('Saved!');
      act(() => useSymbolEditorStore.getState().dismissNotification());
      expect(useSymbolEditorStore.getState().notification).toBeNull();
    });
  });

  // ─── Bulk Operations ───────────────────────────────────────────

  describe('Bulk Operations', () => {
    it('bulk hides symbols', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'A');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '🅰️');
      });
      let s1: CustomSymbol | null = null;
      act(() => {
        s1 = useSymbolEditorStore.getState().createSymbol();
      });
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'B');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '🅱️');
      });
      let s2: CustomSymbol | null = null;
      act(() => {
        s2 = useSymbolEditorStore.getState().createSymbol();
      });
      let count = 0;
      act(() => {
        count = useSymbolEditorStore.getState().bulkHide([s1!.id, s2!.id]);
      });
      expect(count).toBe(2);
    });

    it('bulk deletes symbols', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'X');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '❌');
      });
      let sym: CustomSymbol | null = null;
      act(() => {
        sym = useSymbolEditorStore.getState().createSymbol();
      });
      let count = 0;
      act(() => {
        count = useSymbolEditorStore.getState().bulkDelete([sym!.id]);
      });
      expect(count).toBe(1);
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(0);
    });
  });

  // ─── Utility ────────────────────────────────────────────────────

  describe('Utility', () => {
    it('returns editor stats', () => {
      const stats = useSymbolEditorStore.getState().getStats();
      expect(stats.customSymbolCount).toBe(0);
      expect(stats.customCategoryCount).toBe(0);
      expect(stats.boardCount).toBe(0);
    });

    it('clears all data', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'ClearMe');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '🧹');
        useSymbolEditorStore.getState().createSymbol();
        useSymbolEditorStore.getState().clearAll();
      });
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(0);
      expect(useSymbolEditorStore.getState().notification?.type).toBe('info');
    });

    it('backup and restore', () => {
      act(() => {
        useSymbolEditorStore.getState().setSymbolFormField('label', 'BackupMe');
        useSymbolEditorStore.getState().setSymbolFormField('emoji', '💾');
        useSymbolEditorStore.getState().createSymbol();
        useSymbolEditorStore.getState().saveBackup();
      });
      // Manually clear data keys without clearing backup
      localStorage.removeItem('talkboard_custom_symbols');
      localStorage.removeItem('talkboard_custom_categories');
      localStorage.removeItem('talkboard_boards');
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(0);
      let restored = false;
      act(() => {
        restored = useSymbolEditorStore.getState().restoreBackup();
      });
      expect(restored).toBe(true);
      expect(useSymbolEditorStore.getState().getCustomSymbols()).toHaveLength(1);
    });
  });
});
