/**
 * TemplateSelector — displays a full-screen grid of board templates
 * with previews and one-click creation.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { Board, BoardTemplate } from '@/types/symbolEditor';

interface TemplateSelectorProps {
  onClose?: () => void;
  onCreated?: (board: Board) => void;
}

export default function TemplateSelector({
  onClose,
  onCreated,
}: TemplateSelectorProps) {
  const { getTemplates, createFromTemplate } = useSymbolEditorStore();
  const templates = getTemplates();

  const handleSelect = (template: BoardTemplate) => {
    const board = createFromTemplate(template.id);
    if (board) {
      onCreated?.(board);
    }
    onClose?.();
  };

  const layoutDescriptions: Record<string, string> = {
    grid: 'Standard grid layout with uniform cells',
    flow: 'Horizontal flow for quick sequential access',
    scene: 'Scene-based layout for visual contexts',
    keyboard: 'Keyboard-style layout with narrow rows',
  };

  const layoutColors: Record<string, string> = {
    grid: 'from-blue-400 to-blue-600',
    flow: 'from-green-400 to-green-600',
    scene: 'from-purple-400 to-purple-600',
    keyboard: 'from-amber-400 to-amber-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Board Templates
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose a template to quickly create a new board
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            layoutDescription={
              layoutDescriptions[template.layout] || 'Custom layout'
            }
            layoutColor={layoutColors[template.layout] || 'from-gray-400 to-gray-600'}
            onSelect={() => handleSelect(template)}
          />
        ))}
      </div>

      {/* Custom board hint */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Need something different? Use the &quot;New Board&quot; form to create
          a fully custom board.
        </p>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: BoardTemplate;
  layoutDescription: string;
  layoutColor: string;
  onSelect: () => void;
}

function TemplateCard({
  template,
  layoutDescription,
  layoutColor,
  onSelect,
}: TemplateCardProps) {
  const rows = Math.min(template.gridRows, 6);
  const cols = Math.min(template.gridCols, 8);

  return (
    <button
      onClick={onSelect}
      className="group flex flex-col rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition overflow-hidden text-left"
    >
      {/* Mini grid preview */}
      <div
        className={`w-full p-3 bg-gradient-to-br ${layoutColor} bg-opacity-10`}
      >
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            maxWidth: '180px',
          }}
        >
          {Array.from({ length: rows * cols }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-white/40 dark:bg-white/20 border border-white/30"
              style={{ minHeight: '8px' }}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{template.thumbnail}</span>
          <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {template.name}
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {template.description}
        </p>
        <div className="mt-auto flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            {template.gridRows}×{template.gridCols}
          </span>
          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            {template.layout}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          {layoutDescription}
        </p>
      </div>
    </button>
  );
}
