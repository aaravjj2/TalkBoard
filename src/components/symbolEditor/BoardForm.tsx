/**
 * BoardForm — Form for creating/editing custom boards.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { BoardFormData, BoardLayout } from '@/types/symbolEditor';

const LAYOUT_OPTIONS: { value: BoardLayout; label: string; icon: string; desc: string }[] = [
  { value: 'grid', label: 'Grid', icon: '▦', desc: 'Standard grid layout' },
  { value: 'flow', label: 'Flow', icon: '→', desc: 'Horizontal flow layout' },
  { value: 'scene', label: 'Scene', icon: '🏞️', desc: 'Interactive scene' },
  { value: 'keyboard', label: 'Keyboard', icon: '⌨️', desc: 'Keyboard-style layout' },
];

export default function BoardForm() {
  const {
    editingBoard,
    boardFormData,
    boardFormErrors,
    isBoardFormDirty,
    setBoardFormField,
    resetBoardForm,
    createBoardAction,
    updateBoardAction,
    validateBoardForm,
  } = useSymbolEditorStore();

  const isEditing = !!editingBoard;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBoardForm()) return;

    if (isEditing) {
      updateBoardAction();
    } else {
      createBoardAction();
    }
  };

  const handleFieldChange = <K extends keyof BoardFormData>(
    field: K,
    value: BoardFormData[K]
  ) => {
    setBoardFormField(field, value);
  };

  // Preview grid
  const previewRows = Math.min(boardFormData.gridRows, 8);
  const previewCols = Math.min(boardFormData.gridCols, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Grid Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          {boardFormData.gridRows}×{boardFormData.gridCols} grid preview
        </p>
        <div
          className="mx-auto"
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${previewRows}, 1fr)`,
            gridTemplateColumns: `repeat(${previewCols}, 1fr)`,
            gap: `${Math.min(boardFormData.cellGap, 4)}px`,
            maxWidth: '300px',
          }}
        >
          {Array.from({ length: previewRows * previewCols }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              style={{
                borderRadius: `${Math.min(boardFormData.borderRadius, 8)}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Board Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={boardFormData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="My Board"
          maxLength={100}
          className={`w-full px-3 py-2 rounded-lg border ${
            boardFormErrors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
        />
        {boardFormErrors.name && (
          <p className="text-red-500 text-xs mt-1">{boardFormErrors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={boardFormData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe this board"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Layout Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFieldChange('layout', opt.value)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition text-left ${
                boardFormData.layout === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rows
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={boardFormData.gridRows}
            onChange={(e) => handleFieldChange('gridRows', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 rounded-lg border ${
              boardFormErrors.gridRows
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {boardFormErrors.gridRows && (
            <p className="text-red-500 text-xs mt-1">{boardFormErrors.gridRows}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Columns
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={boardFormData.gridCols}
            onChange={(e) => handleFieldChange('gridCols', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 rounded-lg border ${
              boardFormErrors.gridCols
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {boardFormErrors.gridCols && (
            <p className="text-red-500 text-xs mt-1">{boardFormErrors.gridCols}</p>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Appearance
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Cell Gap
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={boardFormData.cellGap}
              onChange={(e) => handleFieldChange('cellGap', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Padding
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={boardFormData.cellPadding}
              onChange={(e) => handleFieldChange('cellPadding', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Radius
            </label>
            <input
              type="number"
              min={0}
              max={24}
              value={boardFormData.borderRadius}
              onChange={(e) => handleFieldChange('borderRadius', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={boardFormData.showLabels}
            onChange={(e) => handleFieldChange('showLabels', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Show symbol labels
          </span>
        </label>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={boardFormData.tags}
          onChange={(e) => handleFieldChange('tags', e.target.value)}
          placeholder="tag1, tag2"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!isBoardFormDirty && isEditing}
          className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isEditing ? 'Update Board' : 'Create Board'}
        </button>
        <button
          type="button"
          onClick={resetBoardForm}
          className="py-2.5 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          {isEditing ? 'Cancel' : 'Reset'}
        </button>
      </div>
    </form>
  );
}
