/**
 * SymbolEditorPage — Full-featured page for creating/editing custom symbols,
 * categories, and communication boards with import/export.
 */
import { useState } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import {
  SymbolForm,
  SymbolList,
  CategoryForm,
  CategoryList,
  BoardForm,
  BoardList,
  BoardGridEditor,
  ImportExportPanel,
  TemplateSelector,
  EditorToolbar,
  EditorNotification,
} from '@/components/symbolEditor';
import type { Board, CustomSymbol } from '@/types/symbolEditor';

type EditorTab = 'symbols' | 'boards' | 'categories' | 'import-export';

export default function SymbolEditorPage() {
  const {
    activeEditorTab,
    setActiveTab,
    mode,
    editingSymbol,
    editingBoard,
    editingCategory,
    newSymbol,
    newBoard,
    newCategory,
    getStats,
    saveBackup,
    restoreBackup,
    setNotification,
  } = useSymbolEditorStore();

  const [showBoardEditor, setShowBoardEditor] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const stats = getStats();

  const tabs: { id: EditorTab; label: string; icon: string }[] = [
    { id: 'symbols', label: 'Symbols', icon: '🎯' },
    { id: 'boards', label: 'Boards', icon: '📋' },
    { id: 'categories', label: 'Categories', icon: '📂' },
    { id: 'import-export', label: 'Import/Export', icon: '📦' },
  ];

  const handleSymbolEdit = (_symbol: CustomSymbol) => {
    // Symbol form is now populated via editSymbol()
  };

  const handleBoardEdit = (board: Board) => {
    setEditingBoardId(board.id);
  };

  const handleBoardCreated = (board: Board) => {
    setEditingBoardId(board.id);
    setShowBoardEditor(true);
    setShowTemplates(false);
  };

  const handleBackup = () => {
    saveBackup();
    setNotification({ type: 'success', message: 'Backup saved' });
  };

  const handleRestore = () => {
    if (confirm('Restore from backup? This will overwrite current data.')) {
      const ok = restoreBackup();
      setNotification(
        ok
          ? { type: 'success', message: 'Backup restored' }
          : { type: 'error', message: 'No backup found' }
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Symbol Editor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create and manage custom symbols, categories, and boards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 dark:text-gray-500 flex gap-3">
            <span>{stats.totalSymbols} symbols</span>
            <span>{stats.totalCategories} categories</span>
            <span>{stats.totalBoards} boards</span>
          </div>
          <button
            onClick={handleBackup}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Save backup"
          >
            💾 Backup
          </button>
          <button
            onClick={handleRestore}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Restore from backup"
          >
            📥 Restore
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowBoardEditor(false);
              setShowTemplates(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition ${
              activeEditorTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[60vh]">
        {/* ─── Symbols Tab ─────────────────────────────────────────── */}
        {activeEditorTab === 'symbols' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingSymbol ? 'Edit Symbol' : 'New Symbol'}
                </h2>
                {editingSymbol && (
                  <button
                    onClick={newSymbol}
                    className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                  >
                    + New
                  </button>
                )}
              </div>
              <SymbolForm />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Custom Symbols
              </h2>
              <SymbolList onEdit={handleSymbolEdit} />
            </div>
          </div>
        )}

        {/* ─── Boards Tab ──────────────────────────────────────────── */}
        {activeEditorTab === 'boards' && (
          <div>
            {showTemplates ? (
              <TemplateSelector
                onClose={() => setShowTemplates(false)}
                onCreated={handleBoardCreated}
              />
            ) : showBoardEditor && editingBoardId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowBoardEditor(false);
                      setEditingBoardId(null);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    ← Back to Boards
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Board Editor
                  </h2>
                </div>
                <EditorToolbar />
                <BoardGridEditor boardId={editingBoardId} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingBoard ? 'Edit Board' : 'New Board'}
                    </h2>
                    <div className="flex gap-1">
                      {editingBoard && (
                        <button
                          onClick={newBoard}
                          className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                        >
                          + New
                        </button>
                      )}
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="px-3 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                      >
                        📄 Templates
                      </button>
                    </div>
                  </div>
                  <BoardForm />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Your Boards
                  </h2>
                  <BoardList
                    onEdit={(board) => {
                      handleBoardEdit(board);
                      setShowBoardEditor(true);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Categories Tab ──────────────────────────────────────── */}
        {activeEditorTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                {editingCategory && (
                  <button
                    onClick={newCategory}
                    className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
                  >
                    + New
                  </button>
                )}
              </div>
              <CategoryForm />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Custom Categories
              </h2>
              <CategoryList />
            </div>
          </div>
        )}

        {/* ─── Import/Export Tab ────────────────────────────────────── */}
        {activeEditorTab === 'import-export' && (
          <div className="max-w-lg mx-auto">
            <ImportExportPanel />
          </div>
        )}
      </div>

      {/* Editor notification */}
      <EditorNotification />
    </div>
  );
}
