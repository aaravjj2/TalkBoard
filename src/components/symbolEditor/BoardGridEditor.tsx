/**
 * BoardGridEditor — Visual grid cell editor.
 * Renders a board page as a grid and lets users click cells to
 * assign/remove symbols, set colours, and toggle locks.
 */
import { useState, useMemo } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import { useSymbolStore } from '@/stores/symbolStore';
import type { BoardCell, BoardPage } from '@/types/symbolEditor';
import { CATEGORIES } from '@/data/categories';

interface BoardGridEditorProps {
  boardId: string;
  pageIndex?: number;
}

export default function BoardGridEditor({
  boardId,
  pageIndex = 0,
}: BoardGridEditorProps) {
  const {
    getBoards,
    setCellSymbol,
    setCellColor,
    toggleCellLock,
    clearPage,
    swapCells,
    addPage,
    removePage,
    getCustomSymbols,
  } = useSymbolEditorStore();

  const builtinSymbols = useSymbolStore((s) => s.symbols);

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activePageIdx, setActivePageIdx] = useState(pageIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [swapMode, setSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const board = getBoards().find((b) => b.id === boardId);
  if (!board) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Board not found.
      </div>
    );
  }

  const page: BoardPage | undefined = board.pages[activePageIdx];
  if (!page) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Page not found.
      </div>
    );
  }

  const pageId = page.id;

  const customSymbols = getCustomSymbols();

  // Build lookup for placed symbols
  const allSymbols = useMemo(() => {
    const map = new Map<string, { label: string; emoji: string }>();
    builtinSymbols.forEach((s) => map.set(s.id, { label: s.label, emoji: s.emoji }));
    customSymbols.forEach((s) =>
      map.set(s.id, { label: s.label, emoji: s.emoji || '❓' })
    );
    return map;
  }, [builtinSymbols, customSymbols]);

  // Filter symbols for picker
  const filteredSymbols = useMemo(() => {
    let syms = [
      ...builtinSymbols.map((s) => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
        category: s.category,
      })),
      ...customSymbols.map((s) => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji || '❓',
        category: s.category,
      })),
    ];
    if (selectedCategory !== 'all') {
      syms = syms.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      syms = syms.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return syms;
  }, [builtinSymbols, customSymbols, searchQuery, selectedCategory]);

  // Build grid
  const rows = page.rows;
  const cols = page.cols;
  const cellMap = new Map<string, BoardCell>();
  page.cells.forEach((c) => cellMap.set(`${c.row}-${c.col}`, c));

  const handleCellClick = (row: number, col: number) => {
    if (swapMode) {
      if (!swapSource) {
        setSwapSource({ row, col });
      } else {
        swapCells(
          boardId,
          pageId,
          { row: swapSource.row, col: swapSource.col },
          { row, col }
        );
        setSwapSource(null);
        setSwapMode(false);
      }
      return;
    }
    setSelectedCell({ row, col });
    setSymbolPickerOpen(true);
  };

  const handleAssignSymbol = (symbolId: string) => {
    if (selectedCell) {
      setCellSymbol(
        boardId,
        pageId,
        selectedCell.row,
        selectedCell.col,
        symbolId
      );
      setSymbolPickerOpen(false);
      setSelectedCell(null);
    }
  };

  const handleClearCell = () => {
    if (selectedCell) {
      setCellSymbol(
        boardId,
        pageId,
        selectedCell.row,
        selectedCell.col,
        null
      );
      setSymbolPickerOpen(false);
      setSelectedCell(null);
    }
  };

  const handleSetCellColor = (color: string) => {
    if (selectedCell) {
      setCellColor(
        boardId,
        pageId,
        selectedCell.row,
        selectedCell.col,
        color
      );
    }
  };

  const handleToggleCellLock = () => {
    if (selectedCell) {
      toggleCellLock(
        boardId,
        pageId,
        selectedCell.row,
        selectedCell.col
      );
    }
  };

  const cellColorPresets = [
    '#ffffff',
    '#fee2e2',
    '#fef3c7',
    '#d1fae5',
    '#dbeafe',
    '#ede9fe',
    '#fce7f3',
    '#e5e7eb',
    '#fef9c3',
    '#ccfbf1',
    '#e0e7ff',
    '#fde68a',
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Board: {board.name}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            setSwapMode(!swapMode);
            setSwapSource(null);
          }}
          className={`px-3 py-1.5 text-xs rounded-lg transition ${
            swapMode
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          🔄 {swapMode ? (swapSource ? 'Pick target...' : 'Pick source...') : 'Swap'}
        </button>
        <button
          onClick={() => {
            if (confirm('Clear all unlocked cells on this page?')) {
              clearPage(boardId, pageId);
            }
          }}
          className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
        >
          🧹 Clear Page
        </button>
      </div>

      {/* Page tabs */}
      {board.pages.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          {board.pages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePageIdx(idx)}
              className={`px-3 py-1 text-xs rounded-lg ${
                idx === activePageIdx
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } transition`}
            >
              Page {idx + 1}
            </button>
          ))}
          <button
            onClick={() => addPage(boardId)}
            className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
            title="Add page"
          >
            +
          </button>
          {board.pages.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Remove page ${activePageIdx + 1}?`)) {
                  removePage(boardId, page.id);
                  setActivePageIdx(Math.max(0, activePageIdx - 1));
                }
              }}
              className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              title="Remove page"
            >
              −
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div
        className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2"
        style={{ maxHeight: '60vh' }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(60px, auto))`,
            gap: `${board.cellGap}px`,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = cellMap.get(`${r}-${c}`);
              const symbolInfo = cell?.symbolId
                ? allSymbols.get(cell.symbolId)
                : null;
              const isSelected =
                selectedCell?.row === r && selectedCell?.col === c;
              const isSwapSource =
                swapSource?.row === r && swapSource?.col === c;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition min-h-[60px] p-1 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : isSwapSource
                      ? 'border-orange-500 ring-2 ring-orange-300'
                      : cell?.isLocked
                      ? 'border-yellow-400 dark:border-yellow-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                  style={{
                    backgroundColor: cell?.backgroundColor || undefined,
                    borderRadius: `${board.borderRadius}px`,
                    padding: `${board.cellPadding}px`,
                  }}
                  title={`Cell (${r},${c})${cell?.isLocked ? ' [Locked]' : ''}`}
                >
                  {cell?.isLocked && (
                    <span className="absolute top-0.5 right-0.5 text-[8px]">
                      🔒
                    </span>
                  )}
                  {symbolInfo ? (
                    <>
                      <span className="text-xl">{symbolInfo.emoji}</span>
                      {board.showLabels && (
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 truncate max-w-full mt-0.5">
                          {symbolInfo.label}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-sm">
                      +
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Grid info */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
        {rows} × {cols} grid • Page {activePageIdx + 1} of {board.pages.length} •
        Click a cell to assign a symbol
      </div>

      {/* Symbol Picker Modal */}
      {symbolPickerOpen && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                Cell ({selectedCell.row}, {selectedCell.col})
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setColorPickerOpen(!colorPickerOpen);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  🎨
                </button>
                <button
                  onClick={handleToggleCellLock}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {cellMap.get(`${selectedCell.row}-${selectedCell.col}`)
                    ?.isLocked
                    ? '🔓 Unlock'
                    : '🔒 Lock'}
                </button>
                <button
                  onClick={handleClearCell}
                  className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setSymbolPickerOpen(false);
                    setSelectedCell(null);
                    setColorPickerOpen(false);
                  }}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Color picker */}
            {colorPickerOpen && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Cell background:
                </p>
                <div className="flex gap-1 flex-wrap">
                  {cellColorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleSetCellColor(color)}
                      className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-blue-400 transition"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    onChange={(e) => handleSetCellColor(e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2">
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol list */}
            <div className="flex-1 overflow-y-auto p-3">
              {filteredSymbols.length > 0 ? (
                <div className="grid grid-cols-6 gap-1.5">
                  {filteredSymbols.map((sym) => (
                    <button
                      key={sym.id}
                      onClick={() => handleAssignSymbol(sym.id)}
                      className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition"
                    >
                      <span className="text-xl">{sym.emoji}</span>
                      <span className="text-[9px] text-gray-600 dark:text-gray-400 truncate max-w-full mt-0.5">
                        {sym.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No symbols found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
