/**
 * Symbol Editor Types — Types for custom symbol creation, board management,
 * symbol packs, import/export, and the symbol editor UI.
 */

// ─── Custom Symbol Types ─────────────────────────────────────────────────────

export interface CustomSymbolImage {
  /** Data URL or blob URL for the image */
  src: string;
  /** Image format */
  format: 'png' | 'svg' | 'jpeg' | 'webp' | 'emoji';
  /** Width in pixels (for raster images) */
  width?: number;
  /** Height in pixels (for raster images) */
  height?: number;
  /** Alt text */
  alt: string;
}

export interface CustomSymbolAudio {
  /** Data URL or blob URL for the audio */
  src: string;
  /** Audio format */
  format: 'mp3' | 'wav' | 'ogg';
  /** Duration in milliseconds */
  durationMs: number;
  /** Whether this is a custom recording vs TTS generated */
  isRecording: boolean;
}

export interface CustomSymbol {
  id: string;
  label: string;
  /** Emoji character(s) or image */
  emoji: string;
  /** Optional custom image to display instead of emoji */
  image?: CustomSymbolImage;
  /** Optional custom audio to play instead of TTS */
  audio?: CustomSymbolAudio;
  /** Category the symbol belongs to */
  category: string;
  /** Search keywords */
  keywords: string[];
  /** Sort order within category */
  order: number;
  /** Always custom */
  isCustom: true;
  /** When created */
  createdAt: string;
  /** When last modified */
  updatedAt: string;
  /** Who created it */
  createdBy: 'user' | 'caregiver';
  /** Background color override */
  backgroundColor?: string;
  /** Text color override */
  textColor?: string;
  /** Border color override */
  borderColor?: string;
  /** Font size override */
  fontSize?: 'small' | 'medium' | 'large';
  /** Whether symbol is hidden from the grid */
  isHidden: boolean;
  /** Optional notes (for caregivers) */
  notes?: string;
  /** Tags for grouping and filtering */
  tags: string[];
}

// ─── Custom Category Types ───────────────────────────────────────────────────

export interface CustomCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  isCustom: true;
  createdAt: string;
  updatedAt: string;
  symbolCount: number;
}

// ─── Board Types ─────────────────────────────────────────────────────────────

export type BoardLayout = 'grid' | 'flow' | 'scene' | 'keyboard';

export interface BoardCell {
  /** Position in grid */
  row: number;
  col: number;
  /** Span multiple cells */
  rowSpan: number;
  colSpan: number;
  /** Symbol placed in this cell (null for empty) */
  symbolId: string | null;
  /** Background color for cell */
  backgroundColor?: string;
  /** Whether cell is locked from editing */
  isLocked: boolean;
}

export interface BoardPage {
  id: string;
  name: string;
  /** Grid cells */
  cells: BoardCell[];
  /** Number of rows */
  rows: number;
  /** Number of columns */
  cols: number;
  /** Background color */
  backgroundColor?: string;
  /** Background image */
  backgroundImage?: string;
  /** Page order */
  order: number;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  /** Layout type */
  layout: BoardLayout;
  /** Pages in this board */
  pages: BoardPage[];
  /** Currently active page index */
  activePageIndex: number;
  /** Board thumbnail */
  thumbnail?: string;
  /** Grid dimensions */
  gridRows: number;
  gridCols: number;
  /** Appearance */
  cellGap: number;
  cellPadding: number;
  borderRadius: number;
  showLabels: boolean;
  /** Metadata */
  createdAt: string;
  updatedAt: string;
  createdBy: 'user' | 'caregiver' | 'system';
  /** Whether this is the default board */
  isDefault: boolean;
  /** Tags for organization */
  tags: string[];
  /** Symbol IDs used in this board */
  symbolIds: string[];
}

// ─── Symbol Pack Types (Import/Export) ───────────────────────────────────────

export interface SymbolPackMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  createdAt: string;
  symbolCount: number;
  categoryCount: number;
  boardCount: number;
  tags: string[];
  license: string;
  /** Language/locale */
  locale: string;
  /** Minimum app version supported */
  minAppVersion?: string;
  /** Preview image */
  previewImage?: string;
}

export interface SymbolPack {
  metadata: SymbolPackMetadata;
  symbols: CustomSymbol[];
  categories: CustomCategory[];
  boards: Board[];
}

export interface SymbolPackExportOptions {
  /** Include custom symbols */
  includeSymbols: boolean;
  /** Include custom categories */
  includeCategories: boolean;
  /** Include boards */
  includeBoards: boolean;
  /** Include images as data URLs */
  includeImages: boolean;
  /** Include audio as data URLs */
  includeAudio: boolean;
  /** Export format */
  format: 'json' | 'obf' | 'obz';
  /** Pack name */
  name: string;
  /** Pack description */
  description: string;
  /** Author name */
  author: string;
}

export interface SymbolPackImportResult {
  success: boolean;
  symbolsImported: number;
  categoriesImported: number;
  boardsImported: number;
  errors: string[];
  warnings: string[];
  pack: SymbolPack | null;
}

// ─── Editor State Types ──────────────────────────────────────────────────────

export type EditorMode = 'create' | 'edit' | 'bulk-edit' | 'arrange';

export type EditorTool =
  | 'select'
  | 'move'
  | 'resize'
  | 'color'
  | 'text'
  | 'delete'
  | 'duplicate'
  | 'group';

export interface EditorSelection {
  /** Selected symbol IDs */
  symbolIds: string[];
  /** Selected cell positions */
  cellPositions: { row: number; col: number }[];
}

export interface EditorClipboard {
  /** Copied symbols */
  symbols: CustomSymbol[];
  /** Copied cells */
  cells: BoardCell[];
  /** Copy operation type */
  operation: 'copy' | 'cut';
}

export interface EditorHistoryEntry {
  /** Action description */
  action: string;
  /** Timestamp */
  timestamp: string;
  /** State snapshot for undo */
  previousState: EditorSnapshot;
  /** State snapshot for redo */
  newState: EditorSnapshot;
}

export interface EditorSnapshot {
  symbols: CustomSymbol[];
  categories: CustomCategory[];
  boards: Board[];
}

export interface EditorState {
  /** Current mode */
  mode: EditorMode;
  /** Current tool */
  activeTool: EditorTool;
  /** Currently editing symbol */
  editingSymbol: CustomSymbol | null;
  /** Currently editing board */
  editingBoard: Board | null;
  /** Selection */
  selection: EditorSelection;
  /** Clipboard */
  clipboard: EditorClipboard | null;
  /** Undo/redo history */
  history: EditorHistoryEntry[];
  /** Current position in history */
  historyIndex: number;
  /** Max undo history size */
  maxHistorySize: number;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Current zoom level (percent) */
  zoom: number;
  /** Whether grid lines are visible */
  showGrid: boolean;
  /** Whether snap-to-grid is enabled */
  snapToGrid: boolean;
  /** Grid cell size in pixels */
  gridCellSize: number;
  /** Whether the editor panel is open */
  isEditorOpen: boolean;
  /** Active tab in editor */
  activeEditorTab: 'symbols' | 'boards' | 'categories' | 'import-export';
}

// ─── Symbol Form Types ───────────────────────────────────────────────────────

export interface SymbolFormData {
  label: string;
  emoji: string;
  category: string;
  keywords: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: 'small' | 'medium' | 'large';
  notes: string;
  tags: string;
  isHidden: boolean;
}

export interface SymbolFormErrors {
  label?: string;
  emoji?: string;
  category?: string;
  keywords?: string;
  backgroundColor?: string;
  textColor?: string;
}

// ─── Board Form Types ────────────────────────────────────────────────────────

export interface BoardFormData {
  name: string;
  description: string;
  layout: BoardLayout;
  gridRows: number;
  gridCols: number;
  cellGap: number;
  cellPadding: number;
  borderRadius: number;
  showLabels: boolean;
  backgroundColor: string;
  tags: string;
}

export interface BoardFormErrors {
  name?: string;
  description?: string;
  gridRows?: string;
  gridCols?: string;
}

// ─── Category Form Types ─────────────────────────────────────────────────────

export interface CategoryFormData {
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface CategoryFormErrors {
  label?: string;
  icon?: string;
  color?: string;
}

// ─── Template Types ──────────────────────────────────────────────────────────

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layout: BoardLayout;
  gridRows: number;
  gridCols: number;
  /** Pre-defined cell configurations */
  cells: Partial<BoardCell>[];
  /** Category of template */
  templateCategory: 'basic' | 'advanced' | 'scene' | 'custom';
  /** Tags */
  tags: string[];
}

export interface SymbolTemplate {
  id: string;
  name: string;
  description: string;
  /** Symbols in this template */
  symbols: Omit<CustomSymbol, 'id' | 'createdAt' | 'updatedAt'>[];
  /** Template category */
  templateCategory: string;
  /** Tags */
  tags: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}

// ─── Drag and Drop Types ─────────────────────────────────────────────────────

export type DragItemType = 'symbol' | 'cell' | 'category' | 'board-page';

export interface DragItem {
  type: DragItemType;
  id: string;
  data: CustomSymbol | BoardCell | CustomCategory | BoardPage;
  sourceIndex: number;
  sourceContainer: string;
}

export interface DropTarget {
  type: 'grid-cell' | 'category-list' | 'trash' | 'board-page-list';
  position?: { row: number; col: number };
  index?: number;
  containerId: string;
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dropTarget: DropTarget | null;
  dragPreview: { x: number; y: number } | null;
}
