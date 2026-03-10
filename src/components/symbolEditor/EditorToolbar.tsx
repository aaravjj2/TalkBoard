/**
 * EditorToolbar — tool selection bar + undo/redo + view controls.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { EditorTool } from '@/types/symbolEditor';

export default function EditorToolbar() {
  const {
    activeTool,
    setTool,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
  } = useSymbolEditorStore();

  const tools: { id: EditorTool; icon: string; label: string }[] = [
    { id: 'select', icon: '👆', label: 'Select' },
    { id: 'move', icon: '✋', label: 'Move' },
    { id: 'resize', icon: '↔️', label: 'Resize' },
    { id: 'color', icon: '🎨', label: 'Color' },
    { id: 'text', icon: '📝', label: 'Text' },
    { id: 'delete', icon: '🗑️', label: 'Delete' },
    { id: 'duplicate', icon: '📋', label: 'Duplicate' },
    { id: 'group', icon: '📦', label: 'Group' },
  ];

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];

  return (
    <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-sm">
      {/* Tools */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            className={`p-1.5 rounded-lg text-sm transition ${
              activeTool === tool.id
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Undo"
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Redo"
        >
          ↪️
        </button>
      </div>

      {/* View controls */}
      <div className="flex items-center gap-1.5">
        {/* Grid toggle */}
        <button
          onClick={toggleGrid}
          className={`p-1.5 rounded-lg text-sm transition ${
            showGrid
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={showGrid ? 'Hide grid' : 'Show grid'}
        >
          #
        </button>

        {/* Snap toggle */}
        <button
          onClick={toggleSnapToGrid}
          className={`p-1.5 rounded-lg text-xs font-medium transition ${
            snapToGrid
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={snapToGrid ? 'Disable snap-to-grid' : 'Enable snap-to-grid'}
        >
          ⊞
        </button>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const idx = zoomLevels.indexOf(zoom);
              if (idx > 0) setZoom(zoomLevels[idx - 1]);
            }}
            disabled={zoom <= 25}
            className="p-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            −
          </button>
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="px-1 py-0.5 text-xs bg-transparent text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-400 outline-none"
          >
            {zoomLevels.map((z) => (
              <option key={z} value={z}>
                {z}%
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const idx = zoomLevels.indexOf(zoom);
              if (idx < zoomLevels.length - 1) setZoom(zoomLevels[idx + 1]);
            }}
            disabled={zoom >= 400}
            className="p-1 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
