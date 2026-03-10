/**
 * CategoryForm — Form for creating/editing custom categories.
 */
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { CategoryFormData } from '@/types/symbolEditor';

const COLOR_PRESETS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F97316',
  '#06B6D4', '#EC4899', '#8B5CF6', '#10B981', '#F43F5E',
  '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#6366F1',
  '#14B8A6', '#E11D48', '#7C3AED', '#0EA5E9', '#84CC16',
];

const ICON_PRESETS = [
  '📁', '📂', '🏷️', '🎯', '💡', '⭐', '🔥', '❤️',
  '🎵', '🎮', '📚', '🍳', '🏠', '🚗', '🌈', '🌟',
  '🎨', '📱', '💻', '🔧', '🧩', '🎭', '🎪', '🎠',
  '🌺', '🍀', '🐾', '👑', '🎓', '🏆', '🎁', '💎',
];

export default function CategoryForm() {
  const {
    editingCategory,
    categoryFormData,
    categoryFormErrors,
    isCategoryFormDirty,
    setCategoryFormField,
    resetCategoryForm,
    createCategory,
    updateCategory,
    validateCategoryForm,
  } = useSymbolEditorStore();

  const isEditing = !!editingCategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCategoryForm()) return;

    if (isEditing) {
      updateCategory();
    } else {
      createCategory();
    }
  };

  const handleFieldChange = <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K]
  ) => {
    setCategoryFormField(field, value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview */}
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all"
          style={{
            borderColor: categoryFormData.color || '#6B7280',
            backgroundColor: `${categoryFormData.color}15`,
          }}
        >
          <span className="text-3xl">{categoryFormData.icon || '📁'}</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {categoryFormData.label || 'Category Name'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categoryFormData.description || 'Description'}
            </p>
          </div>
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={categoryFormData.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          placeholder="Enter category name"
          maxLength={30}
          className={`w-full px-3 py-2 rounded-lg border ${
            categoryFormErrors.label
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
        />
        {categoryFormErrors.label && (
          <p className="text-red-500 text-xs mt-1">{categoryFormErrors.label}</p>
        )}
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icon / Emoji <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={categoryFormData.icon}
          onChange={(e) => handleFieldChange('icon', e.target.value)}
          placeholder="Select an icon"
          className={`w-full px-3 py-2 rounded-lg border ${
            categoryFormErrors.icon
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
        />
        {categoryFormErrors.icon && (
          <p className="text-red-500 text-xs mt-1">{categoryFormErrors.icon}</p>
        )}
        <div className="grid grid-cols-8 gap-1 mt-2">
          {ICON_PRESETS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => handleFieldChange('icon', icon)}
              className={`p-2 text-xl rounded transition ${
                categoryFormData.icon === icon
                  ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Color <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="color"
            value={categoryFormData.color}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={categoryFormData.color}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            placeholder="#6B7280"
            className={`flex-1 px-3 py-2 rounded-lg border ${
              categoryFormErrors.color
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
          />
        </div>
        {categoryFormErrors.color && (
          <p className="text-red-500 text-xs mt-1">{categoryFormErrors.color}</p>
        )}
        <div className="grid grid-cols-10 gap-1">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleFieldChange('color', color)}
              className={`w-full aspect-square rounded-lg border-2 transition ${
                categoryFormData.color === color
                  ? 'border-gray-800 dark:border-white scale-110'
                  : 'border-transparent hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={categoryFormData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Brief description of this category"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!isCategoryFormDirty && isEditing}
          className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isEditing ? 'Update Category' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={resetCategoryForm}
          className="py-2.5 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          {isEditing ? 'Cancel' : 'Reset'}
        </button>
      </div>
    </form>
  );
}
