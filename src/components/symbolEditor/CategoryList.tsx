/**
 * CategoryList — Displays custom categories with edit/delete actions.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { CustomCategory } from '@/types/symbolEditor';

interface CategoryListProps {
  onEdit?: (category: CustomCategory) => void;
}

export default function CategoryList({ onEdit }: CategoryListProps) {
  const {
    getCustomCategories,
    editCategory,
    deleteCategory,
    getSymbolsByCategory,
  } = useSymbolEditorStore();

  const categories = getCustomCategories();

  const handleEdit = (category: CustomCategory) => {
    editCategory(category);
    onEdit?.(category);
  };

  const handleDelete = (category: CustomCategory) => {
    const symbolCount = getSymbolsByCategory(category.id).length;
    const message = symbolCount > 0
      ? `Delete "${category.label}" and its ${symbolCount} symbols?`
      : `Delete "${category.label}"?`;

    if (confirm(message)) {
      deleteCategory(category.id, symbolCount > 0);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📁</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No custom categories yet. Create your first one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {categories.length} custom categor{categories.length === 1 ? 'y' : 'ies'}
      </p>
      {categories.map((category) => {
        const symbolCount = getSymbolsByCategory(category.id).length;
        return (
          <div
            key={category.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {category.label}
                </h3>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {category.description || 'No description'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {symbolCount} symbol{symbolCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
