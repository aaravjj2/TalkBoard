/**
 * SymbolForm — Form for creating/editing custom symbols with emoji picker,
 * color pickers, keyword input, and preview.
 */
import { useState } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { SymbolFormData } from '@/types/symbolEditor';

const EMOJI_QUICK_PICKS = [
  '😀', '😊', '😢', '😡', '😴', '🤔', '😱', '🥰',
  '👋', '👍', '👎', '✋', '🤝', '🙏', '💪', '👏',
  '🏠', '🏫', '🏥', '🏪', '🚗', '🚌', '✈️', '🚢',
  '🍎', '🍕', '🍔', '🥤', '🍦', '🎂', '🥗', '☕',
  '⚽', '🎮', '📚', '🖊️', '💻', '📱', '🎵', '🎨',
  '🐶', '🐱', '🐟', '🦋', '🌺', '🌳', '⭐', '🌈',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
  '✅', '❌', '⚠️', '❓', '💡', '🔔', '🎯', '🏆',
];

const FONT_SIZES = [
  { value: 'small' as const, label: 'Small' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'large' as const, label: 'Large' },
];

export default function SymbolForm() {
  const {
    editingSymbol,
    symbolFormData,
    symbolFormErrors,
    isSymbolFormDirty,
    mode,
    setSymbolFormField,
    resetSymbolForm,
    createSymbol,
    updateSymbol,
    validateSymbolForm,
  } = useSymbolEditorStore();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPickers, setShowColorPickers] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSymbolForm()) return;

    if (mode === 'edit' && editingSymbol) {
      updateSymbol();
    } else {
      createSymbol();
    }
  };

  const handleFieldChange = <K extends keyof SymbolFormData>(
    field: K,
    value: SymbolFormData[K]
  ) => {
    setSymbolFormField(field, value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview */}
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 p-4 min-w-[100px] min-h-[100px] transition-all"
          style={{
            backgroundColor: symbolFormData.backgroundColor || '#FFFFFF',
            borderColor: symbolFormData.borderColor || '#E5E7EB',
            color: symbolFormData.textColor || '#1F2937',
          }}
        >
          <span
            className={`${
              symbolFormData.fontSize === 'small'
                ? 'text-2xl'
                : symbolFormData.fontSize === 'large'
                ? 'text-5xl'
                : 'text-4xl'
            }`}
          >
            {symbolFormData.emoji || '❓'}
          </span>
          <span
            className={`mt-1 font-medium ${
              symbolFormData.fontSize === 'small'
                ? 'text-xs'
                : symbolFormData.fontSize === 'large'
                ? 'text-lg'
                : 'text-sm'
            }`}
          >
            {symbolFormData.label || 'Label'}
          </span>
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={symbolFormData.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          placeholder="Enter symbol label"
          maxLength={50}
          className={`w-full px-3 py-2 rounded-lg border ${
            symbolFormErrors.label
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
        />
        {symbolFormErrors.label && (
          <p className="text-red-500 text-xs mt-1">{symbolFormErrors.label}</p>
        )}
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Emoji / Icon <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={symbolFormData.emoji}
            onChange={(e) => handleFieldChange('emoji', e.target.value)}
            placeholder="Type or select emoji"
            className={`flex-1 px-3 py-2 rounded-lg border ${
              symbolFormErrors.emoji
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2`}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition"
          >
            😀
          </button>
        </div>
        {symbolFormErrors.emoji && (
          <p className="text-red-500 text-xs mt-1">{symbolFormErrors.emoji}</p>
        )}
        {showEmojiPicker && (
          <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_QUICK_PICKS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleFieldChange('emoji', emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={symbolFormData.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${
            symbolFormErrors.category
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="people">People</option>
          <option value="actions">Actions</option>
          <option value="food">Food & Drink</option>
          <option value="feelings">Feelings</option>
          <option value="places">Places</option>
          <option value="objects">Objects</option>
          <option value="social">Social</option>
          <option value="time">Time</option>
          <option value="descriptors">Descriptors</option>
          <option value="questions">Questions</option>
        </select>
        {symbolFormErrors.category && (
          <p className="text-red-500 text-xs mt-1">{symbolFormErrors.category}</p>
        )}
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          value={symbolFormData.keywords}
          onChange={(e) => handleFieldChange('keywords', e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {symbolFormData.keywords && (
          <div className="flex flex-wrap gap-1 mt-1">
            {symbolFormData.keywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
              .map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {keyword}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Font Size
        </label>
        <div className="flex gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => handleFieldChange('fontSize', size.value)}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                symbolFormData.fontSize === size.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization Toggle */}
      <button
        type="button"
        onClick={() => setShowColorPickers(!showColorPickers)}
        className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
      >
        <span>{showColorPickers ? '▼' : '▶'}</span>
        Color Customization
      </button>

      {showColorPickers && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Background Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={symbolFormData.backgroundColor || '#FFFFFF'}
                onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={symbolFormData.backgroundColor}
                onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {symbolFormData.backgroundColor && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('backgroundColor', '')}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Text Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={symbolFormData.textColor || '#1F2937'}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={symbolFormData.textColor}
                onChange={(e) => handleFieldChange('textColor', e.target.value)}
                placeholder="#1F2937"
                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {symbolFormData.textColor && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('textColor', '')}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Border Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={symbolFormData.borderColor || '#E5E7EB'}
                onChange={(e) => handleFieldChange('borderColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={symbolFormData.borderColor}
                onChange={(e) => handleFieldChange('borderColor', e.target.value)}
                placeholder="#E5E7EB"
                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {symbolFormData.borderColor && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('borderColor', '')}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={symbolFormData.tags}
          onChange={(e) => handleFieldChange('tags', e.target.value)}
          placeholder="tag1, tag2"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (for caregivers)
        </label>
        <textarea
          value={symbolFormData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Optional notes about this symbol"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Hidden toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={symbolFormData.isHidden}
          onChange={(e) => handleFieldChange('isHidden', e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Hidden (not visible in symbol grid)
        </span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!isSymbolFormDirty && mode === 'edit'}
          className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {mode === 'edit' ? 'Update Symbol' : 'Create Symbol'}
        </button>
        <button
          type="button"
          onClick={resetSymbolForm}
          className="py-2.5 px-4 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          {mode === 'edit' ? 'Cancel' : 'Reset'}
        </button>
      </div>
    </form>
  );
}
