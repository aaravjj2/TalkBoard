/**
 * SymbolList — Displays all custom symbols with filtering, search, selection,
 * and bulk actions.
 */
import { useState, useMemo } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { CustomSymbol } from '@/types/symbolEditor';

interface SymbolListProps {
  onEdit?: (symbol: CustomSymbol) => void;
}

export default function SymbolList({ onEdit }: SymbolListProps) {
  const {
    searchQuery,
    filterCategory,
    showHidden,
    selection,
    getCustomSymbols,
    searchSymbols,
    editSymbol,
    deleteSymbol,
    duplicateSymbol,
    hideSymbol,
    showSymbol,
    toggleSelection,
    selectAll,
    deselectAll,
    bulkDelete,
    bulkHide,
    bulkShow,
    setSearchQuery,
    setFilterCategory,
    setShowHidden,
  } = useSymbolEditorStore();

  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allSymbols = useMemo(() => {
    let symbols = searchQuery ? searchSymbols(searchQuery) : getCustomSymbols();

    if (filterCategory) {
      symbols = symbols.filter((s) => s.category === filterCategory);
    }

    if (!showHidden) {
      symbols = symbols.filter((s) => !s.isHidden);
    }

    // Sort
    symbols = [...symbols].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.label.localeCompare(b.label);
          break;
        case 'date':
          cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return symbols;
  }, [searchQuery, filterCategory, showHidden, sortBy, sortDir, searchSymbols, getCustomSymbols]);

  const selectedCount = selection.symbolIds.length;
  const hasSelection = selectedCount > 0;
  const allSelected = allSymbols.length > 0 && selectedCount === allSymbols.length;

  const handleEdit = (symbol: CustomSymbol) => {
    editSymbol(symbol);
    onEdit?.(symbol);
  };

  const handleToggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleBulkAction = (action: 'delete' | 'hide' | 'show') => {
    const ids = selection.symbolIds;
    switch (action) {
      case 'delete':
        bulkDelete(ids);
        break;
      case 'hide':
        bulkHide(ids);
        break;
      case 'show':
        bulkShow(ids);
        break;
    }
    deselectAll();
  };

  const categoryColors: Record<string, string> = {
    people: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    actions: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    food: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    feelings: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    places: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    objects: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    social: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    time: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    descriptors: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    questions: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  };

  return (
    <div className="space-y-3">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symbols..."
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <select
          value={filterCategory || ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
        >
          <option value="">All Categories</option>
          <option value="people">People</option>
          <option value="actions">Actions</option>
          <option value="food">Food</option>
          <option value="feelings">Feelings</option>
          <option value="places">Places</option>
          <option value="objects">Objects</option>
          <option value="social">Social</option>
          <option value="time">Time</option>
          <option value="descriptors">Descriptors</option>
          <option value="questions">Questions</option>
        </select>
        <div className="flex border rounded-lg overflow-hidden border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Sort & Show Hidden */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 dark:text-gray-400">Sort:</span>
          {(['name', 'date', 'category'] as const).map((field) => (
            <button
              key={field}
              onClick={() => handleToggleSort(field)}
              className={`px-2 py-1 rounded ${
                sortBy === field
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {field}{sortBy === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-gray-500 dark:text-gray-400">Show hidden</span>
        </label>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedCount} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => handleBulkAction('hide')}
            className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
          >
            Hide
          </button>
          <button
            onClick={() => handleBulkAction('show')}
            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
          >
            Show
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
          >
            Delete
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Select All */}
      <div className="flex items-center gap-2">
        <button
          onClick={allSelected ? deselectAll : selectAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {allSymbols.length} symbol{allSymbols.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {allSymbols.map((symbol) => {
            const isSelected = selection.symbolIds.includes(symbol.id);
            return (
              <div
                key={symbol.id}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } ${symbol.isHidden ? 'opacity-50' : ''}`}
                style={{
                  backgroundColor: isSelected
                    ? undefined
                    : symbol.backgroundColor || undefined,
                  borderColor: isSelected
                    ? undefined
                    : symbol.borderColor || undefined,
                }}
                onClick={() => toggleSelection(symbol.id)}
              >
                {/* Checkbox */}
                <div className="absolute top-1 left-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(symbol.id)}
                    className="w-4 h-4 rounded opacity-50 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Hidden badge */}
                {symbol.isHidden && (
                  <span className="absolute top-1 right-1 text-xs">🙈</span>
                )}

                {/* Emoji */}
                <span className="text-3xl">{symbol.emoji}</span>

                {/* Label */}
                <span
                  className="mt-1 text-xs font-medium text-center truncate w-full"
                  style={{ color: symbol.textColor || undefined }}
                >
                  {symbol.label}
                </span>

                {/* Category badge */}
                <span
                  className={`mt-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                    categoryColors[symbol.category] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {symbol.category}
                </span>

                {/* Actions */}
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(symbol);
                    }}
                    className="p-1 text-xs bg-white dark:bg-gray-600 rounded shadow hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-1">
          {allSymbols.map((symbol) => {
            const isSelected = selection.symbolIds.includes(symbol.id);
            return (
              <div
                key={symbol.id}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                } ${symbol.isHidden ? 'opacity-50' : ''}`}
                onClick={() => toggleSelection(symbol.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(symbol.id)}
                  className="w-4 h-4 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-2xl">{symbol.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {symbol.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {symbol.keywords.slice(0, 3).join(', ')}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    categoryColors[symbol.category] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {symbol.category}
                </span>
                {symbol.isHidden && (
                  <span className="text-xs text-gray-400">🙈</span>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(symbol);
                    }}
                    className="p-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSymbol(symbol.id);
                    }}
                    className="p-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded transition"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      symbol.isHidden
                        ? showSymbol(symbol.id)
                        : hideSymbol(symbol.id);
                    }}
                    className="p-1 text-xs text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded transition"
                    title={symbol.isHidden ? 'Show' : 'Hide'}
                  >
                    {symbol.isHidden ? '👁️' : '🙈'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSymbol(symbol.id);
                    }}
                    className="p-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {allSymbols.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎨</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery || filterCategory
              ? 'No symbols match your search or filter'
              : 'No custom symbols yet. Create your first one!'}
          </p>
        </div>
      )}
    </div>
  );
}
