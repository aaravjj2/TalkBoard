/**
 * BoardList — Lists all boards with actions: edit, duplicate, delete,
 * set as active, and create from templates.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { Board } from '@/types/symbolEditor';

interface BoardListProps {
  onEdit?: (board: Board) => void;
}

export default function BoardList({ onEdit }: BoardListProps) {
  const {
    getBoards,
    getActiveBoard,
    setActiveBoard,
    editBoard,
    deleteBoardAction,
    duplicateBoardAction,
    getTemplates,
    createFromTemplate,
  } = useSymbolEditorStore();

  const boards = getBoards();
  const activeBoard = getActiveBoard();
  const templates = getTemplates();

  const handleEdit = (board: Board) => {
    editBoard(board);
    onEdit?.(board);
  };

  const handleDelete = (board: Board) => {
    if (confirm(`Delete board "${board.name}"?`)) {
      deleteBoardAction(board.id);
    }
  };

  const layoutIcons: Record<string, string> = {
    grid: '▦',
    flow: '→',
    scene: '🏞️',
    keyboard: '⌨️',
  };

  return (
    <div className="space-y-4">
      {/* Boards List */}
      {boards.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Your Boards ({boards.length})
          </h3>
          {boards.map((board) => {
            const isActive = activeBoard?.id === board.id;
            const totalCells = board.pages.reduce(
              (acc, page) => acc + page.cells.length,
              0
            );
            const filledCells = board.pages.reduce(
              (acc, page) =>
                acc + page.cells.filter((c) => c.symbolId !== null).length,
              0
            );

            return (
              <div
                key={board.id}
                className={`p-3 rounded-xl border-2 transition ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {layoutIcons[board.layout] || '▦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {board.name}
                      </h4>
                      {board.isDefault && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
                          Default
                        </span>
                      )}
                      {isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    {board.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {board.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {board.gridRows}×{board.gridCols}
                      </span>
                      <span>{board.pages.length} page{board.pages.length !== 1 ? 's' : ''}</span>
                      <span>
                        {filledCells}/{totalCells} cells
                      </span>
                      <span>{board.layout}</span>
                    </div>
                    {board.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {board.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => setActiveBoard(board.id)}
                        className="p-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                        title="Set as active"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(board)}
                      className="p-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => duplicateBoardAction(board.id)}
                      className="p-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(board)}
                      className="p-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {boards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No custom boards yet. Create one from scratch or use a template!
          </p>
        </div>
      )}

      {/* Templates */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Quick Start Templates
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => createFromTemplate(template.id)}
              className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition text-left"
            >
              <span className="text-xl">{template.thumbnail}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {template.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {template.description}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {template.gridRows}×{template.gridCols} • {template.layout}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
