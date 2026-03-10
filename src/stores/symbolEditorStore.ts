/**
 * Symbol Editor Zustand Store — State management for custom symbols,
 * categories, boards, import/export, and the editor UI.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CustomSymbol,
  CustomCategory,
  Board,
  BoardPage,
  BoardTemplate,
  EditorMode,
  EditorTool,
  EditorSelection,
  EditorClipboard,
  EditorHistoryEntry,
  EditorSnapshot,
  SymbolFormData,
  SymbolFormErrors,
  BoardFormData,
  BoardFormErrors,
  CategoryFormData,
  CategoryFormErrors,
  SymbolPackExportOptions,
  SymbolPackImportResult,
  ValidationResult,
} from '@/types/symbolEditor';
import { symbolEditorService } from '@/services/symbolEditorService';

// ─── Store State ─────────────────────────────────────────────────────────────

interface SymbolEditorState {
  // Editor UI
  isEditorOpen: boolean;
  activeEditorTab: 'symbols' | 'boards' | 'categories' | 'import-export';
  mode: EditorMode;
  activeTool: EditorTool;

  // Symbol editing
  editingSymbol: CustomSymbol | null;
  symbolFormData: SymbolFormData;
  symbolFormErrors: SymbolFormErrors;
  isSymbolFormDirty: boolean;

  // Board editing
  editingBoard: Board | null;
  boardFormData: BoardFormData;
  boardFormErrors: BoardFormErrors;
  isBoardFormDirty: boolean;

  // Category editing
  editingCategory: CustomCategory | null;
  categoryFormData: CategoryFormData;
  categoryFormErrors: CategoryFormErrors;
  isCategoryFormDirty: boolean;

  // Selection
  selection: EditorSelection;

  // Clipboard
  clipboard: EditorClipboard | null;

  // Undo/redo
  history: EditorHistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;

  // View
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridCellSize: number;

  // Search & filter
  searchQuery: string;
  filterCategory: string | null;
  filterTag: string | null;
  showHidden: boolean;

  // Import/Export
  isImporting: boolean;
  isExporting: boolean;
  lastImportResult: SymbolPackImportResult | null;

  // Notifications
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
}

// ─── Store Actions ───────────────────────────────────────────────────────────

interface SymbolEditorActions {
  // Editor UI
  openEditor: (tab?: SymbolEditorState['activeEditorTab']) => void;
  closeEditor: () => void;
  setActiveTab: (tab: SymbolEditorState['activeEditorTab']) => void;
  setMode: (mode: EditorMode) => void;
  setTool: (tool: EditorTool) => void;

  // Symbol CRUD
  getCustomSymbols: () => CustomSymbol[];
  getSymbolsByCategory: (categoryId: string) => CustomSymbol[];
  createSymbol: () => CustomSymbol | null;
  updateSymbol: () => CustomSymbol | null;
  deleteSymbol: (id: string) => boolean;
  deleteSymbols: (ids: string[]) => number;
  duplicateSymbol: (id: string) => CustomSymbol | null;
  hideSymbol: (id: string) => boolean;
  showSymbol: (id: string) => boolean;
  searchSymbols: (query: string) => CustomSymbol[];

  // Symbol form
  setSymbolFormField: <K extends keyof SymbolFormData>(field: K, value: SymbolFormData[K]) => void;
  resetSymbolForm: () => void;
  editSymbol: (symbol: CustomSymbol) => void;
  newSymbol: () => void;
  validateSymbolForm: () => boolean;

  // Category CRUD
  getCustomCategories: () => CustomCategory[];
  createCategory: () => CustomCategory | null;
  updateCategory: () => CustomCategory | null;
  deleteCategory: (id: string, deleteSymbols?: boolean) => { deleted: boolean; symbolsAffected: number };

  // Category form
  setCategoryFormField: <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) => void;
  resetCategoryForm: () => void;
  editCategory: (category: CustomCategory) => void;
  newCategory: () => void;
  validateCategoryForm: () => boolean;

  // Board CRUD
  getBoards: () => Board[];
  getActiveBoard: () => Board | null;
  setActiveBoard: (id: string) => void;
  createBoardAction: () => Board | null;
  updateBoardAction: () => Board | null;
  deleteBoardAction: (id: string) => boolean;
  duplicateBoardAction: (id: string) => Board | null;
  createFromTemplate: (templateId: string, name?: string) => Board | null;
  getTemplates: () => BoardTemplate[];

  // Board form
  setBoardFormField: <K extends keyof BoardFormData>(field: K, value: BoardFormData[K]) => void;
  resetBoardForm: () => void;
  editBoard: (board: Board) => void;
  newBoard: () => void;
  validateBoardForm: () => boolean;

  // Board page management
  addPage: (boardId: string, name?: string) => BoardPage | null;
  removePage: (boardId: string, pageId: string) => boolean;

  // Board cell operations
  setCellSymbol: (boardId: string, pageId: string, row: number, col: number, symbolId: string | null) => boolean;
  setCellColor: (boardId: string, pageId: string, row: number, col: number, color: string) => boolean;
  toggleCellLock: (boardId: string, pageId: string, row: number, col: number) => boolean;
  clearPage: (boardId: string, pageId: string) => boolean;
  swapCells: (boardId: string, pageId: string, from: { row: number; col: number }, to: { row: number; col: number }) => boolean;

  // Selection
  selectSymbol: (id: string) => void;
  deselectSymbol: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;

  // Clipboard
  copySelection: () => void;
  cutSelection: () => void;
  paste: () => void;

  // Undo/redo
  pushHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // View
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;

  // Search & filter
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  setFilterTag: (tag: string | null) => void;
  setShowHidden: (show: boolean) => void;

  // Import/Export
  exportPack: (options: SymbolPackExportOptions) => string;
  importPack: (json: string) => SymbolPackImportResult;
  clearImportResult: () => void;

  // Bulk operations
  bulkHide: (ids: string[]) => number;
  bulkShow: (ids: string[]) => number;
  bulkMove: (ids: string[], category: string) => number;
  bulkTag: (ids: string[], tag: string) => number;
  bulkDelete: (ids: string[]) => number;

  // Utility
  getStats: () => ReturnType<typeof symbolEditorService.getEditorStats>;
  saveBackup: () => void;
  restoreBackup: () => boolean;
  clearAll: () => void;
  setNotification: (n: SymbolEditorState['notification']) => void;
  dismissNotification: () => void;
}

// ─── Initial Form Data ──────────────────────────────────────────────────────

const initialSymbolForm: SymbolFormData = {
  label: '',
  emoji: '',
  category: 'people',
  keywords: '',
  backgroundColor: '',
  textColor: '',
  borderColor: '',
  fontSize: 'medium',
  notes: '',
  tags: '',
  isHidden: false,
};

const initialBoardForm: BoardFormData = {
  name: '',
  description: '',
  layout: 'grid',
  gridRows: 4,
  gridCols: 5,
  cellGap: 4,
  cellPadding: 8,
  borderRadius: 12,
  showLabels: true,
  backgroundColor: '#FFFFFF',
  tags: '',
};

const initialCategoryForm: CategoryFormData = {
  label: '',
  icon: '',
  color: '#6B7280',
  description: '',
};

const initialSelection: EditorSelection = {
  symbolIds: [],
  cellPositions: [],
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSymbolEditorStore = create<SymbolEditorState & SymbolEditorActions>()(
  persist(
    (set, get) => ({
      // ── Initial State ─────────────────────────────────────────────────
      isEditorOpen: false,
      activeEditorTab: 'symbols',
      mode: 'create',
      activeTool: 'select',
      editingSymbol: null,
      symbolFormData: { ...initialSymbolForm },
      symbolFormErrors: {},
      isSymbolFormDirty: false,
      editingBoard: null,
      boardFormData: { ...initialBoardForm },
      boardFormErrors: {},
      isBoardFormDirty: false,
      editingCategory: null,
      categoryFormData: { ...initialCategoryForm },
      categoryFormErrors: {},
      isCategoryFormDirty: false,
      selection: { ...initialSelection },
      clipboard: null,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      zoom: 100,
      showGrid: true,
      snapToGrid: true,
      gridCellSize: 80,
      searchQuery: '',
      filterCategory: null,
      filterTag: null,
      showHidden: false,
      isImporting: false,
      isExporting: false,
      lastImportResult: null,
      notification: null,

      // ── Editor UI ─────────────────────────────────────────────────────

      openEditor: (tab) => {
        set({
          isEditorOpen: true,
          ...(tab && { activeEditorTab: tab }),
        });
      },

      closeEditor: () => {
        set({ isEditorOpen: false });
      },

      setActiveTab: (tab) => set({ activeEditorTab: tab }),
      setMode: (mode) => set({ mode }),
      setTool: (tool) => set({ activeTool: tool }),

      // ── Symbol CRUD ───────────────────────────────────────────────────

      getCustomSymbols: () => symbolEditorService.getCustomSymbols(),

      getSymbolsByCategory: (categoryId) =>
        symbolEditorService.getCustomSymbolsByCategory(categoryId),

      createSymbol: () => {
        const { symbolFormData } = get();
        const errors = symbolEditorService.validateSymbolForm(symbolFormData);
        if (Object.keys(errors).length > 0) {
          set({ symbolFormErrors: errors });
          return null;
        }

        get().pushHistory('Create symbol');
        const symbol = symbolEditorService.createCustomSymbol(symbolFormData);
        set({
          symbolFormData: { ...initialSymbolForm },
          symbolFormErrors: {},
          isSymbolFormDirty: false,
          notification: { type: 'success', message: `Symbol "${symbol.label}" created` },
        });
        return symbol;
      },

      updateSymbol: () => {
        const { editingSymbol, symbolFormData } = get();
        if (!editingSymbol) return null;

        const errors = symbolEditorService.validateSymbolForm(symbolFormData);
        if (Object.keys(errors).length > 0) {
          set({ symbolFormErrors: errors });
          return null;
        }

        get().pushHistory('Update symbol');
        const updated = symbolEditorService.updateCustomSymbol(
          editingSymbol.id,
          symbolFormData
        );
        if (updated) {
          set({
            editingSymbol: updated,
            isSymbolFormDirty: false,
            notification: { type: 'success', message: `Symbol "${updated.label}" updated` },
          });
        }
        return updated;
      },

      deleteSymbol: (id) => {
        get().pushHistory('Delete symbol');
        const result = symbolEditorService.deleteCustomSymbol(id);
        if (result) {
          set({
            editingSymbol: null,
            notification: { type: 'success', message: 'Symbol deleted' },
          });
        }
        return result;
      },

      deleteSymbols: (ids) => {
        get().pushHistory('Delete symbols');
        const count = symbolEditorService.deleteCustomSymbols(ids);
        set({
          selection: { ...initialSelection },
          notification: { type: 'success', message: `${count} symbols deleted` },
        });
        return count;
      },

      duplicateSymbol: (id) => {
        get().pushHistory('Duplicate symbol');
        const dup = symbolEditorService.duplicateCustomSymbol(id);
        if (dup) {
          set({
            notification: { type: 'success', message: `Symbol duplicated as "${dup.label}"` },
          });
        }
        return dup;
      },

      hideSymbol: (id) => {
        get().pushHistory('Hide symbol');
        return symbolEditorService.hideCustomSymbol(id);
      },

      showSymbol: (id) => {
        get().pushHistory('Show symbol');
        return symbolEditorService.showCustomSymbol(id);
      },

      searchSymbols: (query) => symbolEditorService.searchCustomSymbols(query),

      // ── Symbol Form ───────────────────────────────────────────────────

      setSymbolFormField: (field, value) => {
        set((state) => ({
          symbolFormData: { ...state.symbolFormData, [field]: value },
          isSymbolFormDirty: true,
          symbolFormErrors: { ...state.symbolFormErrors, [field]: undefined },
        }));
      },

      resetSymbolForm: () => {
        set({
          symbolFormData: { ...initialSymbolForm },
          symbolFormErrors: {},
          isSymbolFormDirty: false,
          editingSymbol: null,
          mode: 'create',
        });
      },

      editSymbol: (symbol) => {
        set({
          editingSymbol: symbol,
          mode: 'edit',
          symbolFormData: {
            label: symbol.label,
            emoji: symbol.emoji,
            category: symbol.category,
            keywords: symbol.keywords.join(', '),
            backgroundColor: symbol.backgroundColor || '',
            textColor: symbol.textColor || '',
            borderColor: symbol.borderColor || '',
            fontSize: symbol.fontSize || 'medium',
            notes: symbol.notes || '',
            tags: symbol.tags.join(', '),
            isHidden: symbol.isHidden,
          },
          symbolFormErrors: {},
          isSymbolFormDirty: false,
          activeEditorTab: 'symbols',
          isEditorOpen: true,
        });
      },

      newSymbol: () => {
        set({
          editingSymbol: null,
          mode: 'create',
          symbolFormData: { ...initialSymbolForm },
          symbolFormErrors: {},
          isSymbolFormDirty: false,
          activeEditorTab: 'symbols',
          isEditorOpen: true,
        });
      },

      validateSymbolForm: () => {
        const errors = symbolEditorService.validateSymbolForm(get().symbolFormData);
        set({ symbolFormErrors: errors });
        return Object.keys(errors).length === 0;
      },

      // ── Category CRUD ─────────────────────────────────────────────────

      getCustomCategories: () => symbolEditorService.getCustomCategories(),

      createCategory: () => {
        const { categoryFormData } = get();
        const errors = symbolEditorService.validateCategoryForm(categoryFormData);
        if (Object.keys(errors).length > 0) {
          set({ categoryFormErrors: errors });
          return null;
        }

        get().pushHistory('Create category');
        const cat = symbolEditorService.createCustomCategory(categoryFormData);
        set({
          categoryFormData: { ...initialCategoryForm },
          categoryFormErrors: {},
          isCategoryFormDirty: false,
          notification: { type: 'success', message: `Category "${cat.label}" created` },
        });
        return cat;
      },

      updateCategory: () => {
        const { editingCategory, categoryFormData } = get();
        if (!editingCategory) return null;

        const errors = symbolEditorService.validateCategoryForm(categoryFormData);
        if (Object.keys(errors).length > 0) {
          set({ categoryFormErrors: errors });
          return null;
        }

        get().pushHistory('Update category');
        const updated = symbolEditorService.updateCustomCategory(
          editingCategory.id,
          categoryFormData
        );
        if (updated) {
          set({
            editingCategory: updated,
            isCategoryFormDirty: false,
            notification: { type: 'success', message: `Category "${updated.label}" updated` },
          });
        }
        return updated;
      },

      deleteCategory: (id, deleteSymbols = false) => {
        get().pushHistory('Delete category');
        const result = symbolEditorService.deleteCustomCategory(id, deleteSymbols);
        if (result.deleted) {
          set({
            editingCategory: null,
            notification: {
              type: 'success',
              message: `Category deleted${result.symbolsAffected > 0 ? ` (${result.symbolsAffected} symbols removed)` : ''}`,
            },
          });
        }
        return result;
      },

      // ── Category Form ─────────────────────────────────────────────────

      setCategoryFormField: (field, value) => {
        set((state) => ({
          categoryFormData: { ...state.categoryFormData, [field]: value },
          isCategoryFormDirty: true,
          categoryFormErrors: { ...state.categoryFormErrors, [field]: undefined },
        }));
      },

      resetCategoryForm: () => {
        set({
          categoryFormData: { ...initialCategoryForm },
          categoryFormErrors: {},
          isCategoryFormDirty: false,
          editingCategory: null,
        });
      },

      editCategory: (category) => {
        set({
          editingCategory: category,
          categoryFormData: {
            label: category.label,
            icon: category.icon,
            color: category.color,
            description: category.description,
          },
          categoryFormErrors: {},
          isCategoryFormDirty: false,
          activeEditorTab: 'categories',
          isEditorOpen: true,
        });
      },

      newCategory: () => {
        set({
          editingCategory: null,
          categoryFormData: { ...initialCategoryForm },
          categoryFormErrors: {},
          isCategoryFormDirty: false,
          activeEditorTab: 'categories',
          isEditorOpen: true,
        });
      },

      validateCategoryForm: () => {
        const errors = symbolEditorService.validateCategoryForm(get().categoryFormData);
        set({ categoryFormErrors: errors });
        return Object.keys(errors).length === 0;
      },

      // ── Board CRUD ────────────────────────────────────────────────────

      getBoards: () => symbolEditorService.getBoards(),
      getActiveBoard: () => symbolEditorService.getActiveBoard(),
      setActiveBoard: (id) => symbolEditorService.setActiveBoard(id),

      createBoardAction: () => {
        const { boardFormData } = get();
        const errors = symbolEditorService.validateBoardForm(boardFormData);
        if (Object.keys(errors).length > 0) {
          set({ boardFormErrors: errors });
          return null;
        }

        get().pushHistory('Create board');
        const board = symbolEditorService.createBoard(boardFormData);
        set({
          boardFormData: { ...initialBoardForm },
          boardFormErrors: {},
          isBoardFormDirty: false,
          notification: { type: 'success', message: `Board "${board.name}" created` },
        });
        return board;
      },

      updateBoardAction: () => {
        const { editingBoard, boardFormData } = get();
        if (!editingBoard) return null;

        const errors = symbolEditorService.validateBoardForm(boardFormData);
        if (Object.keys(errors).length > 0) {
          set({ boardFormErrors: errors });
          return null;
        }

        get().pushHistory('Update board');
        const updated = symbolEditorService.updateBoard(editingBoard.id, boardFormData);
        if (updated) {
          set({
            editingBoard: updated,
            isBoardFormDirty: false,
            notification: { type: 'success', message: `Board "${updated.name}" updated` },
          });
        }
        return updated;
      },

      deleteBoardAction: (id) => {
        get().pushHistory('Delete board');
        const result = symbolEditorService.deleteBoard(id);
        if (result) {
          set({
            editingBoard: null,
            notification: { type: 'success', message: 'Board deleted' },
          });
        }
        return result;
      },

      duplicateBoardAction: (id) => {
        get().pushHistory('Duplicate board');
        const dup = symbolEditorService.duplicateBoard(id);
        if (dup) {
          set({ notification: { type: 'success', message: `Board duplicated as "${dup.name}"` } });
        }
        return dup;
      },

      createFromTemplate: (templateId, name) => {
        get().pushHistory('Create from template');
        return symbolEditorService.createBoardFromTemplate(templateId, name);
      },

      getTemplates: () => symbolEditorService.getBoardTemplates(),

      // ── Board Form ────────────────────────────────────────────────────

      setBoardFormField: (field, value) => {
        set((state) => ({
          boardFormData: { ...state.boardFormData, [field]: value },
          isBoardFormDirty: true,
          boardFormErrors: { ...state.boardFormErrors, [field]: undefined },
        }));
      },

      resetBoardForm: () => {
        set({
          boardFormData: { ...initialBoardForm },
          boardFormErrors: {},
          isBoardFormDirty: false,
          editingBoard: null,
        });
      },

      editBoard: (board) => {
        set({
          editingBoard: board,
          boardFormData: {
            name: board.name,
            description: board.description,
            layout: board.layout,
            gridRows: board.gridRows,
            gridCols: board.gridCols,
            cellGap: board.cellGap,
            cellPadding: board.cellPadding,
            borderRadius: board.borderRadius,
            showLabels: board.showLabels,
            backgroundColor: '#FFFFFF',
            tags: board.tags.join(', '),
          },
          boardFormErrors: {},
          isBoardFormDirty: false,
          activeEditorTab: 'boards',
          isEditorOpen: true,
        });
      },

      newBoard: () => {
        set({
          editingBoard: null,
          boardFormData: { ...initialBoardForm },
          boardFormErrors: {},
          isBoardFormDirty: false,
          activeEditorTab: 'boards',
          isEditorOpen: true,
        });
      },

      validateBoardForm: () => {
        const errors = symbolEditorService.validateBoardForm(get().boardFormData);
        set({ boardFormErrors: errors });
        return Object.keys(errors).length === 0;
      },

      // ── Board Pages ───────────────────────────────────────────────────

      addPage: (boardId, name) => symbolEditorService.addBoardPage(boardId, name),

      removePage: (boardId, pageId) =>
        symbolEditorService.removeBoardPage(boardId, pageId),

      // ── Board Cells ───────────────────────────────────────────────────

      setCellSymbol: (boardId, pageId, row, col, symbolId) => {
        get().pushHistory('Set cell symbol');
        return symbolEditorService.setCellSymbol(boardId, pageId, row, col, symbolId);
      },

      setCellColor: (boardId, pageId, row, col, color) =>
        symbolEditorService.setCellColor(boardId, pageId, row, col, color),

      toggleCellLock: (boardId, pageId, row, col) =>
        symbolEditorService.toggleCellLock(boardId, pageId, row, col),

      clearPage: (boardId, pageId) => {
        get().pushHistory('Clear page');
        return symbolEditorService.clearBoardPage(boardId, pageId);
      },

      swapCells: (boardId, pageId, from, to) => {
        get().pushHistory('Swap cells');
        return symbolEditorService.swapCells(boardId, pageId, from, to);
      },

      // ── Selection ─────────────────────────────────────────────────────

      selectSymbol: (id) => {
        set((state) => ({
          selection: {
            ...state.selection,
            symbolIds: state.selection.symbolIds.includes(id)
              ? state.selection.symbolIds
              : [...state.selection.symbolIds, id],
          },
        }));
      },

      deselectSymbol: (id) => {
        set((state) => ({
          selection: {
            ...state.selection,
            symbolIds: state.selection.symbolIds.filter((s) => s !== id),
          },
        }));
      },

      selectAll: () => {
        const symbols = symbolEditorService.getCustomSymbols();
        set({
          selection: {
            symbolIds: symbols.map((s) => s.id),
            cellPositions: [],
          },
        });
      },

      deselectAll: () => {
        set({ selection: { ...initialSelection } });
      },

      toggleSelection: (id) => {
        const { selection } = get();
        if (selection.symbolIds.includes(id)) {
          get().deselectSymbol(id);
        } else {
          get().selectSymbol(id);
        }
      },

      // ── Clipboard ─────────────────────────────────────────────────────

      copySelection: () => {
        const { selection } = get();
        const symbols = symbolEditorService.getCustomSymbols().filter(
          (s) => selection.symbolIds.includes(s.id)
        );
        set({
          clipboard: { symbols, cells: [], operation: 'copy' },
        });
      },

      cutSelection: () => {
        const { selection } = get();
        const symbols = symbolEditorService.getCustomSymbols().filter(
          (s) => selection.symbolIds.includes(s.id)
        );
        set({
          clipboard: { symbols, cells: [], operation: 'cut' },
        });
      },

      paste: () => {
        const { clipboard } = get();
        if (!clipboard || clipboard.symbols.length === 0) return;

        get().pushHistory('Paste symbols');
        for (const symbol of clipboard.symbols) {
          const formData: SymbolFormData = {
            label: clipboard.operation === 'copy' ? `${symbol.label} (copy)` : symbol.label,
            emoji: symbol.emoji,
            category: symbol.category,
            keywords: symbol.keywords.join(', '),
            backgroundColor: symbol.backgroundColor || '',
            textColor: symbol.textColor || '',
            borderColor: symbol.borderColor || '',
            fontSize: symbol.fontSize || 'medium',
            notes: symbol.notes || '',
            tags: symbol.tags.join(', '),
            isHidden: symbol.isHidden,
          };
          symbolEditorService.createCustomSymbol(formData);
        }

        if (clipboard.operation === 'cut') {
          symbolEditorService.deleteCustomSymbols(
            clipboard.symbols.map((s) => s.id)
          );
          set({ clipboard: null, selection: { ...initialSelection } });
        }
      },

      // ── Undo / Redo ───────────────────────────────────────────────────

      pushHistory: (action) => {
        const { history, historyIndex, maxHistorySize } = get();
        const snapshot = symbolEditorService.createEditorSnapshot();
        const entry: EditorHistoryEntry = {
          action,
          timestamp: new Date().toISOString(),
          previousState: snapshot,
          newState: snapshot, // Will be updated after the action
        };

        // Trim any redo history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(entry);

        // Limit size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < 0) return;

        const entry = history[historyIndex];
        symbolEditorService.restoreEditorSnapshot(entry.previousState);
        set({ historyIndex: historyIndex - 1 });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const entry = history[historyIndex + 1];
        symbolEditorService.restoreEditorSnapshot(entry.newState);
        set({ historyIndex: historyIndex + 1 });
      },

      canUndo: () => get().historyIndex >= 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // ── View ──────────────────────────────────────────────────────────

      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

      // ── Search & Filter ───────────────────────────────────────────────

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterCategory: (category) => set({ filterCategory: category }),
      setFilterTag: (tag) => set({ filterTag: tag }),
      setShowHidden: (show) => set({ showHidden: show }),

      // ── Import / Export ───────────────────────────────────────────────

      exportPack: (options) => {
        set({ isExporting: true });
        const result = symbolEditorService.exportSymbolPack(options);
        set({
          isExporting: false,
          notification: { type: 'success', message: 'Pack exported successfully' },
        });
        return result;
      },

      importPack: (json) => {
        set({ isImporting: true });
        const result = symbolEditorService.importSymbolPack(json);
        set({
          isImporting: false,
          lastImportResult: result,
          notification: result.success
            ? { type: 'success', message: `Imported ${result.symbolsImported} symbols, ${result.categoriesImported} categories, ${result.boardsImported} boards` }
            : { type: 'error', message: `Import failed: ${result.errors.join(', ')}` },
        });
        return result;
      },

      clearImportResult: () => set({ lastImportResult: null }),

      // ── Bulk Operations ───────────────────────────────────────────────

      bulkHide: (ids) => {
        get().pushHistory('Bulk hide');
        return symbolEditorService.bulkHideSymbols(ids);
      },

      bulkShow: (ids) => {
        get().pushHistory('Bulk show');
        return symbolEditorService.bulkShowSymbols(ids);
      },

      bulkMove: (ids, category) => {
        get().pushHistory('Bulk move');
        return symbolEditorService.bulkMoveSymbols(ids, category);
      },

      bulkTag: (ids, tag) => {
        get().pushHistory('Bulk tag');
        return symbolEditorService.bulkTagSymbols(ids, tag);
      },

      bulkDelete: (ids) => {
        get().pushHistory('Bulk delete');
        return symbolEditorService.deleteCustomSymbols(ids);
      },

      // ── Utility ───────────────────────────────────────────────────────

      getStats: () => symbolEditorService.getEditorStats(),
      saveBackup: () => symbolEditorService.saveBackup(),
      restoreBackup: () => symbolEditorService.restoreBackup(),

      clearAll: () => {
        symbolEditorService.clearAllEditorData();
        set({
          editingSymbol: null,
          editingBoard: null,
          editingCategory: null,
          selection: { ...initialSelection },
          clipboard: null,
          history: [],
          historyIndex: -1,
          notification: { type: 'info', message: 'All editor data cleared' },
        });
      },

      setNotification: (n) => set({ notification: n }),
      dismissNotification: () => set({ notification: null }),
    }),
    {
      name: 'talkboard-symbol-editor',
      partialize: (state) => ({
        activeEditorTab: state.activeEditorTab,
        zoom: state.zoom,
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        gridCellSize: state.gridCellSize,
      }),
    }
  )
);
