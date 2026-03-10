/**
 * Symbol Editor Service — CRUD operations for custom symbols, categories,
 * boards, and symbol packs. Handles persistence, validation, import/export.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  CustomSymbol,
  CustomCategory,
  Board,
  BoardPage,
  BoardCell,
  SymbolPack,
  SymbolPackMetadata,
  SymbolPackExportOptions,
  SymbolPackImportResult,
  SymbolFormData,
  SymbolFormErrors,
  BoardFormData,
  BoardFormErrors,
  CategoryFormData,
  CategoryFormErrors,
  BoardTemplate,
  ValidationResult,
  EditorSnapshot,
} from '@/types/symbolEditor';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  CUSTOM_SYMBOLS: 'talkboard_custom_symbols',
  CUSTOM_CATEGORIES: 'talkboard_custom_categories',
  BOARDS: 'talkboard_boards',
  ACTIVE_BOARD: 'talkboard_active_board',
  EDITOR_PREFERENCES: 'talkboard_editor_preferences',
  BACKUP_SNAPSHOT: 'talkboard_editor_backup',
} as const;

// ─── Helper: Safe localStorage ───────────────────────────────────────────────

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// ─── Custom Symbols CRUD ─────────────────────────────────────────────────────

export function getCustomSymbols(): CustomSymbol[] {
  return loadData<CustomSymbol[]>(STORAGE_KEYS.CUSTOM_SYMBOLS, []);
}

export function getCustomSymbol(id: string): CustomSymbol | undefined {
  return getCustomSymbols().find((s) => s.id === id);
}

export function createCustomSymbol(data: SymbolFormData): CustomSymbol {
  const symbols = getCustomSymbols();
  const now = new Date().toISOString();

  const newSymbol: CustomSymbol = {
    id: `custom_${uuidv4()}`,
    label: data.label.trim(),
    emoji: data.emoji.trim(),
    category: data.category,
    keywords: data.keywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean),
    order: symbols.filter((s) => s.category === data.category).length,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
    createdBy: 'user',
    backgroundColor: data.backgroundColor || undefined,
    textColor: data.textColor || undefined,
    borderColor: data.borderColor || undefined,
    fontSize: data.fontSize,
    isHidden: data.isHidden,
    notes: data.notes || undefined,
    tags: data.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  };

  symbols.push(newSymbol);
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, symbols);
  return newSymbol;
}

export function updateCustomSymbol(
  id: string,
  updates: Partial<SymbolFormData>
): CustomSymbol | null {
  const symbols = getCustomSymbols();
  const index = symbols.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const existing = symbols[index];
  const now = new Date().toISOString();

  const updated: CustomSymbol = {
    ...existing,
    ...(updates.label !== undefined && { label: updates.label.trim() }),
    ...(updates.emoji !== undefined && { emoji: updates.emoji.trim() }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.keywords !== undefined && {
      keywords: updates.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
    }),
    ...(updates.backgroundColor !== undefined && {
      backgroundColor: updates.backgroundColor || undefined,
    }),
    ...(updates.textColor !== undefined && {
      textColor: updates.textColor || undefined,
    }),
    ...(updates.borderColor !== undefined && {
      borderColor: updates.borderColor || undefined,
    }),
    ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
    ...(updates.isHidden !== undefined && { isHidden: updates.isHidden }),
    ...(updates.notes !== undefined && {
      notes: updates.notes || undefined,
    }),
    ...(updates.tags !== undefined && {
      tags: updates.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    }),
    updatedAt: now,
  };

  symbols[index] = updated;
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, symbols);
  return updated;
}

export function deleteCustomSymbol(id: string): boolean {
  const symbols = getCustomSymbols();
  const filtered = symbols.filter((s) => s.id !== id);
  if (filtered.length === symbols.length) return false;
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, filtered);
  return true;
}

export function deleteCustomSymbols(ids: string[]): number {
  const symbols = getCustomSymbols();
  const idSet = new Set(ids);
  const filtered = symbols.filter((s) => !idSet.has(s.id));
  const deleted = symbols.length - filtered.length;
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, filtered);
  return deleted;
}

export function duplicateCustomSymbol(id: string): CustomSymbol | null {
  const original = getCustomSymbol(id);
  if (!original) return null;

  const symbols = getCustomSymbols();
  const now = new Date().toISOString();

  const duplicate: CustomSymbol = {
    ...original,
    id: `custom_${uuidv4()}`,
    label: `${original.label} (copy)`,
    createdAt: now,
    updatedAt: now,
    order: symbols.filter((s) => s.category === original.category).length,
  };

  symbols.push(duplicate);
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, symbols);
  return duplicate;
}

export function reorderCustomSymbols(
  categoryId: string,
  symbolIds: string[]
): void {
  const symbols = getCustomSymbols();
  const orderMap = new Map(symbolIds.map((id, idx) => [id, idx]));

  const updated = symbols.map((s) => {
    const newOrder = orderMap.get(s.id);
    if (s.category === categoryId && newOrder !== undefined) {
      return { ...s, order: newOrder, updatedAt: new Date().toISOString() };
    }
    return s;
  });

  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, updated);
}

export function hideCustomSymbol(id: string): boolean {
  const symbols = getCustomSymbols();
  const index = symbols.findIndex((s) => s.id === id);
  if (index === -1) return false;
  symbols[index] = { ...symbols[index], isHidden: true, updatedAt: new Date().toISOString() };
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, symbols);
  return true;
}

export function showCustomSymbol(id: string): boolean {
  const symbols = getCustomSymbols();
  const index = symbols.findIndex((s) => s.id === id);
  if (index === -1) return false;
  symbols[index] = { ...symbols[index], isHidden: false, updatedAt: new Date().toISOString() };
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, symbols);
  return true;
}

export function searchCustomSymbols(query: string): CustomSymbol[] {
  if (!query.trim()) return getCustomSymbols();
  const q = query.toLowerCase().trim();
  return getCustomSymbols().filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.keywords.some((k) => k.includes(q)) ||
      s.tags.some((t) => t.includes(q)) ||
      s.category.toLowerCase().includes(q)
  );
}

export function getCustomSymbolsByCategory(
  categoryId: string
): CustomSymbol[] {
  return getCustomSymbols()
    .filter((s) => s.category === categoryId && !s.isHidden)
    .sort((a, b) => a.order - b.order);
}

export function getCustomSymbolStats(): {
  total: number;
  hidden: number;
  byCategory: Record<string, number>;
  recentlyEdited: CustomSymbol[];
} {
  const symbols = getCustomSymbols();
  const byCategory: Record<string, number> = {};
  for (const s of symbols) {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  }

  const sorted = [...symbols].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return {
    total: symbols.length,
    hidden: symbols.filter((s) => s.isHidden).length,
    byCategory,
    recentlyEdited: sorted.slice(0, 10),
  };
}

// ─── Custom Categories CRUD ──────────────────────────────────────────────────

export function getCustomCategories(): CustomCategory[] {
  return loadData<CustomCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES, []);
}

export function getCustomCategory(id: string): CustomCategory | undefined {
  return getCustomCategories().find((c) => c.id === id);
}

export function createCustomCategory(
  data: CategoryFormData
): CustomCategory {
  const categories = getCustomCategories();
  const now = new Date().toISOString();

  const newCategory: CustomCategory = {
    id: `cat_${uuidv4()}`,
    label: data.label.trim(),
    icon: data.icon.trim(),
    color: data.color,
    description: data.description.trim(),
    order: categories.length + 10,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
    symbolCount: 0,
  };

  categories.push(newCategory);
  saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  return newCategory;
}

export function updateCustomCategory(
  id: string,
  updates: Partial<CategoryFormData>
): CustomCategory | null {
  const categories = getCustomCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const existing = categories[index];
  const now = new Date().toISOString();

  const updated: CustomCategory = {
    ...existing,
    ...(updates.label !== undefined && { label: updates.label.trim() }),
    ...(updates.icon !== undefined && { icon: updates.icon.trim() }),
    ...(updates.color !== undefined && { color: updates.color }),
    ...(updates.description !== undefined && {
      description: updates.description.trim(),
    }),
    updatedAt: now,
  };

  categories[index] = updated;
  saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
  return updated;
}

export function deleteCustomCategory(
  id: string,
  deleteSymbols: boolean = false
): {
  deleted: boolean;
  symbolsAffected: number;
} {
  const categories = getCustomCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) {
    return { deleted: false, symbolsAffected: 0 };
  }

  saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, filtered);

  let symbolsAffected = 0;
  if (deleteSymbols) {
    const symbols = getCustomSymbols();
    const remaining = symbols.filter((s) => s.category !== id);
    symbolsAffected = symbols.length - remaining.length;
    saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, remaining);
  }

  return { deleted: true, symbolsAffected };
}

export function reorderCustomCategories(categoryIds: string[]): void {
  const categories = getCustomCategories();
  const orderMap = new Map(categoryIds.map((id, idx) => [id, idx + 10]));

  const updated = categories.map((c) => {
    const newOrder = orderMap.get(c.id);
    if (newOrder !== undefined) {
      return { ...c, order: newOrder, updatedAt: new Date().toISOString() };
    }
    return c;
  });

  saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, updated);
}

// ─── Board CRUD ──────────────────────────────────────────────────────────────

export function getBoards(): Board[] {
  return loadData<Board[]>(STORAGE_KEYS.BOARDS, []);
}

export function getBoard(id: string): Board | undefined {
  return getBoards().find((b) => b.id === id);
}

export function getActiveBoard(): Board | null {
  const activeBoardId = loadData<string | null>(
    STORAGE_KEYS.ACTIVE_BOARD,
    null
  );
  if (!activeBoardId) return null;
  return getBoard(activeBoardId) || null;
}

export function setActiveBoard(boardId: string): void {
  saveData(STORAGE_KEYS.ACTIVE_BOARD, boardId);
}

export function createBoard(data: BoardFormData): Board {
  const boards = getBoards();
  const now = new Date().toISOString();
  const boardId = `board_${uuidv4()}`;

  // Create initial page with empty cells
  const cells: BoardCell[] = [];
  for (let row = 0; row < data.gridRows; row++) {
    for (let col = 0; col < data.gridCols; col++) {
      cells.push({
        row,
        col,
        rowSpan: 1,
        colSpan: 1,
        symbolId: null,
        isLocked: false,
      });
    }
  }

  const initialPage: BoardPage = {
    id: uuidv4(),
    name: 'Page 1',
    cells,
    rows: data.gridRows,
    cols: data.gridCols,
    order: 0,
  };

  const newBoard: Board = {
    id: boardId,
    name: data.name.trim(),
    description: data.description.trim(),
    layout: data.layout,
    pages: [initialPage],
    activePageIndex: 0,
    gridRows: data.gridRows,
    gridCols: data.gridCols,
    cellGap: data.cellGap,
    cellPadding: data.cellPadding,
    borderRadius: data.borderRadius,
    showLabels: data.showLabels,
    createdAt: now,
    updatedAt: now,
    createdBy: 'user',
    isDefault: boards.length === 0,
    tags: data.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    symbolIds: [],
  };

  boards.push(newBoard);
  saveData(STORAGE_KEYS.BOARDS, boards);
  return newBoard;
}

export function updateBoard(
  id: string,
  updates: Partial<BoardFormData>
): Board | null {
  const boards = getBoards();
  const index = boards.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = boards[index];
  const now = new Date().toISOString();

  const updated: Board = {
    ...existing,
    ...(updates.name !== undefined && { name: updates.name.trim() }),
    ...(updates.description !== undefined && {
      description: updates.description.trim(),
    }),
    ...(updates.layout !== undefined && { layout: updates.layout }),
    ...(updates.gridRows !== undefined && { gridRows: updates.gridRows }),
    ...(updates.gridCols !== undefined && { gridCols: updates.gridCols }),
    ...(updates.cellGap !== undefined && { cellGap: updates.cellGap }),
    ...(updates.cellPadding !== undefined && {
      cellPadding: updates.cellPadding,
    }),
    ...(updates.borderRadius !== undefined && {
      borderRadius: updates.borderRadius,
    }),
    ...(updates.showLabels !== undefined && {
      showLabels: updates.showLabels,
    }),
    ...(updates.tags !== undefined && {
      tags: updates.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    }),
    updatedAt: now,
  };

  boards[index] = updated;
  saveData(STORAGE_KEYS.BOARDS, boards);
  return updated;
}

export function deleteBoard(id: string): boolean {
  const boards = getBoards();
  const filtered = boards.filter((b) => b.id !== id);
  if (filtered.length === boards.length) return false;

  // If deleting default board, make the first remaining one default
  if (
    filtered.length > 0 &&
    !filtered.some((b) => b.isDefault)
  ) {
    filtered[0] = { ...filtered[0], isDefault: true };
  }

  saveData(STORAGE_KEYS.BOARDS, filtered);

  // Clear active board if it was the deleted one
  const activeBoardId = loadData<string | null>(
    STORAGE_KEYS.ACTIVE_BOARD,
    null
  );
  if (activeBoardId === id) {
    saveData(
      STORAGE_KEYS.ACTIVE_BOARD,
      filtered.length > 0 ? filtered[0].id : null
    );
  }

  return true;
}

export function duplicateBoard(id: string): Board | null {
  const original = getBoard(id);
  if (!original) return null;

  const boards = getBoards();
  const now = new Date().toISOString();

  const duplicate: Board = {
    ...original,
    id: `board_${uuidv4()}`,
    name: `${original.name} (copy)`,
    pages: original.pages.map((p) => ({
      ...p,
      id: uuidv4(),
      cells: p.cells.map((c) => ({ ...c })),
    })),
    createdAt: now,
    updatedAt: now,
    isDefault: false,
  };

  boards.push(duplicate);
  saveData(STORAGE_KEYS.BOARDS, boards);
  return duplicate;
}

// ─── Board Page Management ───────────────────────────────────────────────────

export function addBoardPage(boardId: string, name?: string): BoardPage | null {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return null;

  const cells: BoardCell[] = [];
  for (let row = 0; row < board.gridRows; row++) {
    for (let col = 0; col < board.gridCols; col++) {
      cells.push({
        row,
        col,
        rowSpan: 1,
        colSpan: 1,
        symbolId: null,
        isLocked: false,
      });
    }
  }

  const newPage: BoardPage = {
    id: uuidv4(),
    name: name || `Page ${board.pages.length + 1}`,
    cells,
    rows: board.gridRows,
    cols: board.gridCols,
    order: board.pages.length,
  };

  board.pages.push(newPage);
  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return newPage;
}

export function removeBoardPage(
  boardId: string,
  pageId: string
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board || board.pages.length <= 1) return false;

  board.pages = board.pages.filter((p) => p.id !== pageId);
  if (board.activePageIndex >= board.pages.length) {
    board.activePageIndex = board.pages.length - 1;
  }
  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

export function reorderBoardPages(
  boardId: string,
  pageIds: string[]
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const pageMap = new Map(board.pages.map((p) => [p.id, p]));
  const reordered = pageIds
    .map((id) => pageMap.get(id))
    .filter((p): p is BoardPage => p !== undefined);

  if (reordered.length !== board.pages.length) return false;

  board.pages = reordered.map((p, i) => ({ ...p, order: i }));
  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

// ─── Board Cell Operations ───────────────────────────────────────────────────

export function setCellSymbol(
  boardId: string,
  pageId: string,
  row: number,
  col: number,
  symbolId: string | null
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const page = board.pages.find((p) => p.id === pageId);
  if (!page) return false;

  const cell = page.cells.find((c) => c.row === row && c.col === col);
  if (!cell || cell.isLocked) return false;

  cell.symbolId = symbolId;
  board.updatedAt = new Date().toISOString();

  // Update board symbolIds
  const allSymbolIds = new Set<string>();
  for (const p of board.pages) {
    for (const c of p.cells) {
      if (c.symbolId) allSymbolIds.add(c.symbolId);
    }
  }
  board.symbolIds = Array.from(allSymbolIds);

  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

export function setCellColor(
  boardId: string,
  pageId: string,
  row: number,
  col: number,
  backgroundColor: string
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const page = board.pages.find((p) => p.id === pageId);
  if (!page) return false;

  const cell = page.cells.find((c) => c.row === row && c.col === col);
  if (!cell) return false;

  cell.backgroundColor = backgroundColor;
  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

export function toggleCellLock(
  boardId: string,
  pageId: string,
  row: number,
  col: number
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const page = board.pages.find((p) => p.id === pageId);
  if (!page) return false;

  const cell = page.cells.find((c) => c.row === row && c.col === col);
  if (!cell) return false;

  cell.isLocked = !cell.isLocked;
  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

export function clearBoardPage(boardId: string, pageId: string): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const page = board.pages.find((p) => p.id === pageId);
  if (!page) return false;

  page.cells = page.cells.map((c) => ({
    ...c,
    symbolId: c.isLocked ? c.symbolId : null,
    backgroundColor: c.isLocked ? c.backgroundColor : undefined,
  }));

  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

export function swapCells(
  boardId: string,
  pageId: string,
  from: { row: number; col: number },
  to: { row: number; col: number }
): boolean {
  const boards = getBoards();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return false;

  const page = board.pages.find((p) => p.id === pageId);
  if (!page) return false;

  const cellA = page.cells.find(
    (c) => c.row === from.row && c.col === from.col
  );
  const cellB = page.cells.find(
    (c) => c.row === to.row && c.col === to.col
  );
  if (!cellA || !cellB || cellA.isLocked || cellB.isLocked) return false;

  const tempSymbol = cellA.symbolId;
  const tempBg = cellA.backgroundColor;
  cellA.symbolId = cellB.symbolId;
  cellA.backgroundColor = cellB.backgroundColor;
  cellB.symbolId = tempSymbol;
  cellB.backgroundColor = tempBg;

  board.updatedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.BOARDS, boards);
  return true;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateSymbolForm(data: SymbolFormData): SymbolFormErrors {
  const errors: SymbolFormErrors = {};

  if (!data.label.trim()) {
    errors.label = 'Label is required';
  } else if (data.label.trim().length > 50) {
    errors.label = 'Label must be 50 characters or less';
  }

  if (!data.emoji.trim()) {
    errors.emoji = 'Emoji or icon is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (data.backgroundColor && !/^#[0-9a-fA-F]{6}$/.test(data.backgroundColor)) {
    errors.backgroundColor = 'Invalid color format (use #RRGGBB)';
  }

  if (data.textColor && !/^#[0-9a-fA-F]{6}$/.test(data.textColor)) {
    errors.textColor = 'Invalid color format (use #RRGGBB)';
  }

  return errors;
}

export function validateBoardForm(data: BoardFormData): BoardFormErrors {
  const errors: BoardFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Board name is required';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Board name must be 100 characters or less';
  }

  if (data.gridRows < 1 || data.gridRows > 20) {
    errors.gridRows = 'Rows must be between 1 and 20';
  }

  if (data.gridCols < 1 || data.gridCols > 20) {
    errors.gridCols = 'Columns must be between 1 and 20';
  }

  return errors;
}

export function validateCategoryForm(
  data: CategoryFormData
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};

  if (!data.label.trim()) {
    errors.label = 'Category name is required';
  } else if (data.label.trim().length > 30) {
    errors.label = 'Category name must be 30 characters or less';
  }

  if (!data.icon.trim()) {
    errors.icon = 'Icon/emoji is required';
  }

  if (!data.color || !/^#[0-9a-fA-F]{6}$/.test(data.color)) {
    errors.color = 'Valid color is required (#RRGGBB)';
  }

  return errors;
}

export function validateSymbolPack(
  pack: unknown
): ValidationResult {
  const errors: { field: string; message: string }[] = [];
  const warnings: { field: string; message: string }[] = [];

  if (!pack || typeof pack !== 'object') {
    errors.push({ field: 'root', message: 'Invalid pack format' });
    return { isValid: false, errors, warnings };
  }

  const p = pack as Record<string, unknown>;

  if (!p.metadata || typeof p.metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Missing metadata' });
  }

  if (!Array.isArray(p.symbols)) {
    errors.push({ field: 'symbols', message: 'Missing symbols array' });
  }

  if (!Array.isArray(p.categories)) {
    warnings.push({
      field: 'categories',
      message: 'Missing categories array — will be ignored',
    });
  }

  if (!Array.isArray(p.boards)) {
    warnings.push({
      field: 'boards',
      message: 'Missing boards array — will be ignored',
    });
  }

  // Validate each symbol
  if (Array.isArray(p.symbols)) {
    for (let i = 0; i < (p.symbols as unknown[]).length; i++) {
      const s = (p.symbols as Record<string, unknown>[])[i];
      if (!s || typeof s !== 'object') {
        errors.push({
          field: `symbols[${i}]`,
          message: 'Invalid symbol entry',
        });
        continue;
      }
      if (!s.label || typeof s.label !== 'string') {
        errors.push({
          field: `symbols[${i}].label`,
          message: 'Missing or invalid label',
        });
      }
      if (!s.emoji || typeof s.emoji !== 'string') {
        warnings.push({
          field: `symbols[${i}].emoji`,
          message: 'Missing emoji — will use default',
        });
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─── Import / Export ─────────────────────────────────────────────────────────

export function exportSymbolPack(
  options: SymbolPackExportOptions
): string {
  const pack: SymbolPack = {
    metadata: {
      id: uuidv4(),
      name: options.name,
      description: options.description,
      version: '1.0.0',
      author: options.author,
      createdAt: new Date().toISOString(),
      symbolCount: 0,
      categoryCount: 0,
      boardCount: 0,
      tags: [],
      license: 'CC-BY-SA-4.0',
      locale: 'en',
    },
    symbols: [],
    categories: [],
    boards: [],
  };

  if (options.includeSymbols) {
    pack.symbols = getCustomSymbols();
    if (!options.includeImages) {
      pack.symbols = pack.symbols.map((s) => ({ ...s, image: undefined }));
    }
    if (!options.includeAudio) {
      pack.symbols = pack.symbols.map((s) => ({ ...s, audio: undefined }));
    }
    pack.metadata.symbolCount = pack.symbols.length;
  }

  if (options.includeCategories) {
    pack.categories = getCustomCategories();
    pack.metadata.categoryCount = pack.categories.length;
  }

  if (options.includeBoards) {
    pack.boards = getBoards();
    pack.metadata.boardCount = pack.boards.length;
  }

  return JSON.stringify(pack, null, 2);
}

export function importSymbolPack(
  jsonString: string
): SymbolPackImportResult {
  const result: SymbolPackImportResult = {
    success: false,
    symbolsImported: 0,
    categoriesImported: 0,
    boardsImported: 0,
    errors: [],
    warnings: [],
    pack: null,
  };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    result.errors.push('Invalid JSON format');
    return result;
  }

  const validation = validateSymbolPack(parsed);
  if (!validation.isValid) {
    result.errors = validation.errors.map(
      (e) => `${e.field}: ${e.message}`
    );
    result.warnings = validation.warnings.map(
      (w) => `${w.field}: ${w.message}`
    );
    return result;
  }

  result.warnings = validation.warnings.map(
    (w) => `${w.field}: ${w.message}`
  );

  const pack = parsed as SymbolPack;
  result.pack = pack;

  // Import symbols
  if (pack.symbols && pack.symbols.length > 0) {
    const existingSymbols = getCustomSymbols();
    const existingIds = new Set(existingSymbols.map((s) => s.id));
    const now = new Date().toISOString();

    const newSymbols = pack.symbols
      .filter((s) => !existingIds.has(s.id))
      .map((s) => ({
        ...s,
        id: existingIds.has(s.id) ? `custom_${uuidv4()}` : s.id,
        isCustom: true as const,
        createdAt: s.createdAt || now,
        updatedAt: now,
      }));

    saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, [
      ...existingSymbols,
      ...newSymbols,
    ]);
    result.symbolsImported = newSymbols.length;
  }

  // Import categories
  if (pack.categories && pack.categories.length > 0) {
    const existingCategories = getCustomCategories();
    const existingIds = new Set(existingCategories.map((c) => c.id));
    const now = new Date().toISOString();

    const newCategories = pack.categories
      .filter((c) => !existingIds.has(c.id))
      .map((c) => ({
        ...c,
        isCustom: true as const,
        createdAt: c.createdAt || now,
        updatedAt: now,
      }));

    saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, [
      ...existingCategories,
      ...newCategories,
    ]);
    result.categoriesImported = newCategories.length;
  }

  // Import boards
  if (pack.boards && pack.boards.length > 0) {
    const existingBoards = getBoards();
    const existingIds = new Set(existingBoards.map((b) => b.id));
    const now = new Date().toISOString();

    const newBoards = pack.boards
      .filter((b) => !existingIds.has(b.id))
      .map((b) => ({
        ...b,
        id: existingIds.has(b.id) ? `board_${uuidv4()}` : b.id,
        createdAt: b.createdAt || now,
        updatedAt: now,
        isDefault: false,
      }));

    saveData(STORAGE_KEYS.BOARDS, [
      ...existingBoards,
      ...newBoards,
    ]);
    result.boardsImported = newBoards.length;
  }

  result.success = true;
  return result;
}

// ─── Board Templates ─────────────────────────────────────────────────────────

export function getBoardTemplates(): BoardTemplate[] {
  return [
    {
      id: 'basic-3x3',
      name: 'Basic 3×3',
      description: 'Simple 3×3 grid for beginners',
      thumbnail: '🟩🟩🟩',
      layout: 'grid',
      gridRows: 3,
      gridCols: 3,
      cells: [],
      templateCategory: 'basic',
      tags: ['beginner', 'simple'],
    },
    {
      id: 'basic-4x4',
      name: 'Basic 4×4',
      description: 'Standard 4×4 grid layout',
      thumbnail: '🟦🟦🟦🟦',
      layout: 'grid',
      gridRows: 4,
      gridCols: 4,
      cells: [],
      templateCategory: 'basic',
      tags: ['standard'],
    },
    {
      id: 'basic-4x5',
      name: 'Standard 4×5',
      description: '20-cell grid for everyday use',
      thumbnail: '🟪🟪🟪🟪🟪',
      layout: 'grid',
      gridRows: 4,
      gridCols: 5,
      cells: [],
      templateCategory: 'basic',
      tags: ['standard', 'everyday'],
    },
    {
      id: 'basic-5x6',
      name: 'Large 5×6',
      description: '30-cell grid for advanced users',
      thumbnail: '🟧🟧🟧🟧🟧🟧',
      layout: 'grid',
      gridRows: 5,
      gridCols: 6,
      cells: [],
      templateCategory: 'basic',
      tags: ['large', 'advanced'],
    },
    {
      id: 'basic-6x8',
      name: 'Extra Large 6×8',
      description: '48-cell grid for power users',
      thumbnail: '🟥🟥🟥🟥🟥🟥🟥🟥',
      layout: 'grid',
      gridRows: 6,
      gridCols: 8,
      cells: [],
      templateCategory: 'advanced',
      tags: ['extra-large', 'power-user'],
    },
    {
      id: 'keyboard-3x10',
      name: 'Keyboard Layout',
      description: 'QWERTY-style keyboard layout (3×10)',
      thumbnail: '⌨️',
      layout: 'keyboard',
      gridRows: 3,
      gridCols: 10,
      cells: [],
      templateCategory: 'advanced',
      tags: ['keyboard', 'typing'],
    },
    {
      id: 'scene-5x5',
      name: 'Scene Board',
      description: 'Interactive scene board (5×5)',
      thumbnail: '🏞️',
      layout: 'scene',
      gridRows: 5,
      gridCols: 5,
      cells: [],
      templateCategory: 'scene',
      tags: ['scene', 'interactive'],
    },
    {
      id: 'flow-1x8',
      name: 'Flow Strip',
      description: 'Single-row flow strip (1×8)',
      thumbnail: '➡️',
      layout: 'flow',
      gridRows: 1,
      gridCols: 8,
      cells: [],
      templateCategory: 'basic',
      tags: ['flow', 'strip'],
    },
  ];
}

export function createBoardFromTemplate(
  templateId: string,
  name?: string
): Board | null {
  const template = getBoardTemplates().find((t) => t.id === templateId);
  if (!template) return null;

  return createBoard({
    name: name || template.name,
    description: template.description,
    layout: template.layout,
    gridRows: template.gridRows,
    gridCols: template.gridCols,
    cellGap: 4,
    cellPadding: 8,
    borderRadius: 12,
    showLabels: true,
    backgroundColor: '#FFFFFF',
    tags: template.tags.join(', '),
  });
}

// ─── Snapshots & Backup ──────────────────────────────────────────────────────

export function createEditorSnapshot(): EditorSnapshot {
  return {
    symbols: getCustomSymbols(),
    categories: getCustomCategories(),
    boards: getBoards(),
  };
}

export function restoreEditorSnapshot(snapshot: EditorSnapshot): void {
  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, snapshot.symbols);
  saveData(STORAGE_KEYS.CUSTOM_CATEGORIES, snapshot.categories);
  saveData(STORAGE_KEYS.BOARDS, snapshot.boards);
}

export function saveBackup(): void {
  const snapshot = createEditorSnapshot();
  saveData(STORAGE_KEYS.BACKUP_SNAPSHOT, {
    snapshot,
    timestamp: new Date().toISOString(),
  });
}

export function loadBackup(): {
  snapshot: EditorSnapshot;
  timestamp: string;
} | null {
  const backup = loadData<{
    snapshot: EditorSnapshot;
    timestamp: string;
  } | null>(STORAGE_KEYS.BACKUP_SNAPSHOT, null);
  return backup;
}

export function restoreBackup(): boolean {
  const backup = loadBackup();
  if (!backup) return false;
  restoreEditorSnapshot(backup.snapshot);
  return true;
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

export function bulkHideSymbols(ids: string[]): number {
  const symbols = getCustomSymbols();
  const idSet = new Set(ids);
  let count = 0;

  const updated = symbols.map((s) => {
    if (idSet.has(s.id) && !s.isHidden) {
      count++;
      return { ...s, isHidden: true, updatedAt: new Date().toISOString() };
    }
    return s;
  });

  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, updated);
  return count;
}

export function bulkShowSymbols(ids: string[]): number {
  const symbols = getCustomSymbols();
  const idSet = new Set(ids);
  let count = 0;

  const updated = symbols.map((s) => {
    if (idSet.has(s.id) && s.isHidden) {
      count++;
      return { ...s, isHidden: false, updatedAt: new Date().toISOString() };
    }
    return s;
  });

  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, updated);
  return count;
}

export function bulkMoveSymbols(
  ids: string[],
  targetCategory: string
): number {
  const symbols = getCustomSymbols();
  const idSet = new Set(ids);
  let count = 0;

  const updated = symbols.map((s) => {
    if (idSet.has(s.id)) {
      count++;
      return {
        ...s,
        category: targetCategory,
        updatedAt: new Date().toISOString(),
      };
    }
    return s;
  });

  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, updated);
  return count;
}

export function bulkTagSymbols(ids: string[], tag: string): number {
  const symbols = getCustomSymbols();
  const idSet = new Set(ids);
  let count = 0;
  const normalizedTag = tag.toLowerCase().trim();

  const updated = symbols.map((s) => {
    if (idSet.has(s.id) && !s.tags.includes(normalizedTag)) {
      count++;
      return {
        ...s,
        tags: [...s.tags, normalizedTag],
        updatedAt: new Date().toISOString(),
      };
    }
    return s;
  });

  saveData(STORAGE_KEYS.CUSTOM_SYMBOLS, updated);
  return count;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function getEditorStats(): {
  customSymbolCount: number;
  customCategoryCount: number;
  boardCount: number;
  hiddenSymbols: number;
  totalCells: number;
  filledCells: number;
} {
  const symbols = getCustomSymbols();
  const boards = getBoards();
  let totalCells = 0;
  let filledCells = 0;

  for (const board of boards) {
    for (const page of board.pages) {
      totalCells += page.cells.length;
      filledCells += page.cells.filter((c) => c.symbolId !== null).length;
    }
  }

  return {
    customSymbolCount: symbols.length,
    customCategoryCount: getCustomCategories().length,
    boardCount: boards.length,
    hiddenSymbols: symbols.filter((s) => s.isHidden).length,
    totalCells,
    filledCells,
  };
}

export function clearAllEditorData(): void {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_SYMBOLS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.BOARDS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_BOARD);
  localStorage.removeItem(STORAGE_KEYS.EDITOR_PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.BACKUP_SNAPSHOT);
}

// ─── Export service object ───────────────────────────────────────────────────

export const symbolEditorService = {
  // Custom symbols
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
  // Custom categories
  getCustomCategories,
  getCustomCategory,
  createCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  reorderCustomCategories,
  // Boards
  getBoards,
  getBoard,
  getActiveBoard,
  setActiveBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  duplicateBoard,
  // Board pages
  addBoardPage,
  removeBoardPage,
  reorderBoardPages,
  // Board cells
  setCellSymbol,
  setCellColor,
  toggleCellLock,
  clearBoardPage,
  swapCells,
  // Validation
  validateSymbolForm,
  validateBoardForm,
  validateCategoryForm,
  validateSymbolPack,
  // Import / Export
  exportSymbolPack,
  importSymbolPack,
  // Templates
  getBoardTemplates,
  createBoardFromTemplate,
  // Snapshots
  createEditorSnapshot,
  restoreEditorSnapshot,
  saveBackup,
  loadBackup,
  restoreBackup,
  // Bulk operations
  bulkHideSymbols,
  bulkShowSymbols,
  bulkMoveSymbols,
  bulkTagSymbols,
  // Utility
  getEditorStats,
  clearAllEditorData,
};
