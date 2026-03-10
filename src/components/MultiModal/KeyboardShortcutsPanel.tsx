import { useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';

const MODIFIER_KEYS = ['Ctrl', 'Alt', 'Shift', 'Meta'] as const;

const COMMON_KEYS = [
  'Space', 'Enter', 'Escape', 'Tab', 'Backspace', 'Delete',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

const ACTION_CATEGORIES = {
  Navigation: [
    'navigate_home', 'navigate_back', 'navigate_settings', 'navigate_history',
    'navigate_categories', 'navigate_favorites', 'navigate_help',
  ],
  Communication: [
    'speak_sentence', 'clear_sentence', 'undo_last', 'redo_last',
    'copy_sentence', 'save_phrase', 'repeat_last',
  ],
  Selection: [
    'select_symbol', 'next_symbol', 'previous_symbol', 'confirm_selection',
    'cancel_selection', 'select_all', 'deselect_all',
  ],
  View: [
    'zoom_in', 'zoom_out', 'toggle_fullscreen', 'toggle_dark_mode',
    'toggle_sidebar', 'scroll_up', 'scroll_down',
  ],
  System: [
    'open_keyboard', 'toggle_voice', 'toggle_scanning',
    'take_screenshot', 'open_quick_phrases', 'toggle_prediction',
  ],
};

export default function KeyboardShortcutsPanel() {
  const {
    keyboardSettings,
    updateKeyboardSettings,
    addShortcut,
    removeShortcut,
    toggleShortcut,
  } = useMultiModalStore();

  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcut, setNewShortcut] = useState({
    key: 'Space',
    modifiers: [] as string[],
    action: 'speak_sentence',
    description: '',
  });
  const [recording, setRecording] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModifier = (mod: string) => {
    setNewShortcut((prev) => ({
      ...prev,
      modifiers: prev.modifiers.includes(mod)
        ? prev.modifiers.filter((m) => m !== mod)
        : [...prev.modifiers, mod],
    }));
  };

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return;

    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.metaKey) modifiers.push('Meta');

    setNewShortcut((prev) => ({ ...prev, key, modifiers }));
    setRecording(false);
  };

  const handleAddShortcut = () => {
    if (!newShortcut.key || !newShortcut.action) return;
    const keys = [...newShortcut.modifiers, newShortcut.key].join('+');
    addShortcut({
      keys,
      action: newShortcut.action,
      description: newShortcut.description || `${keys} → ${newShortcut.action}`,
      category: 'system',
    });
    setNewShortcut({ key: 'Space', modifiers: [], action: 'speak_sentence', description: '' });
    setShowAddShortcut(false);
  };

  const shortcuts = keyboardSettings.shortcuts || [];
  const filteredShortcuts = shortcuts.filter((s) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        s.action.toLowerCase().includes(query) ||
        s.keys.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }
    if (filterCategory !== 'all') {
      const categoryActions = ACTION_CATEGORIES[filterCategory as keyof typeof ACTION_CATEGORIES] || [];
      return categoryActions.includes(s.action);
    }
    return true;
  });

  const formatShortcut = (shortcut: { keys: string }) => {
    return shortcut.keys;
  };

  return (
    <div className="space-y-6">
      {/* Keyboard Accessibility */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Keyboard Accessibility
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <AccessibilityToggle
            label="Sticky Keys"
            description="Press modifier keys sequentially instead of simultaneously"
            checked={keyboardSettings.stickyKeys}
            onChange={(v) => updateKeyboardSettings({ stickyKeys: v })}
          />
          <AccessibilityToggle
            label="Filter Keys"
            description="Ignore brief or repeated keystrokes"
            checked={keyboardSettings.filterKeys}
            onChange={(v) => updateKeyboardSettings({ filterKeys: v })}
          />
          <AccessibilityToggle
            label="Bounce Keys"
            description="Ignore unintended repeated keystrokes"
            checked={keyboardSettings.bounceKeys}
            onChange={(v) => updateKeyboardSettings({ bounceKeys: v })}
          />
          <AccessibilityToggle
            label="Tab Navigation"
            description="Navigate between elements using Tab key"
            checked={keyboardSettings.tabNavigation}
            onChange={(v) => updateKeyboardSettings({ tabNavigation: v })}
          />
        </div>
      </div>

      {/* Key Repeat Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Key Repeat
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Repeat Delay: {keyboardSettings.keyRepeatDelay}ms
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={keyboardSettings.keyRepeatDelay}
              onChange={(e) =>
                updateKeyboardSettings({ keyRepeatDelay: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Repeat Rate: {keyboardSettings.keyRepeatRate}ms
            </label>
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={keyboardSettings.keyRepeatRate}
              onChange={(e) =>
                updateKeyboardSettings({ keyRepeatRate: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          {keyboardSettings.filterKeys && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Filter Threshold: {keyboardSettings.filterKeysDelay}ms
              </label>
              <input
                type="range"
                min={50}
                max={1000}
                step={25}
                value={keyboardSettings.filterKeysDelay}
                onChange={(e) =>
                  updateKeyboardSettings({ filterKeysDelay: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          )}

          {keyboardSettings.bounceKeys && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Bounce Threshold: {keyboardSettings.bounceKeysDelay}ms
              </label>
              <input
                type="range"
                min={50}
                max={1000}
                step={25}
                value={keyboardSettings.bounceKeysDelay}
                onChange={(e) =>
                  updateKeyboardSettings({ bounceKeysDelay: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts ({shortcuts.length})
          </h4>
          <button
            onClick={() => setShowAddShortcut(!showAddShortcut)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showAddShortcut ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {/* Add Shortcut Form */}
        {showAddShortcut && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-3">
            {/* Key Capture */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Key Combination
              </label>
              <div className="flex gap-2">
                <div
                  tabIndex={0}
                  onKeyDown={handleKeyCapture}
                  onClick={() => setRecording(true)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm cursor-pointer ${
                    recording
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'dark:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  {recording ? (
                    <span className="text-blue-600 dark:text-blue-400 animate-pulse">
                      Press any key combination...
                    </span>
                  ) : (
                    <span className="font-mono dark:text-white">
                      {[...newShortcut.modifiers, newShortcut.key].join(' + ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modifiers */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Modifiers
              </label>
              <div className="flex gap-1">
                {MODIFIER_KEYS.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => toggleModifier(mod)}
                    className={`px-3 py-1 rounded text-sm font-mono ${
                      newShortcut.modifiers.includes(mod)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Key */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Key
              </label>
              <select
                value={newShortcut.key}
                onChange={(e) =>
                  setNewShortcut({ ...newShortcut, key: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {COMMON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Action
              </label>
              <select
                value={newShortcut.action}
                onChange={(e) =>
                  setNewShortcut({ ...newShortcut, action: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {Object.entries(ACTION_CATEGORIES).map(([cat, actions]) => (
                  <optgroup key={cat} label={cat}>
                    {actions.map((a) => (
                      <option key={a} value={a}>
                        {a.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Description */}
            <input
              type="text"
              value={newShortcut.description}
              onChange={(e) =>
                setNewShortcut({ ...newShortcut, description: e.target.value })
              }
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <button
              onClick={handleAddShortcut}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add Shortcut
            </button>
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shortcuts..."
            className="flex-1 px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Categories</option>
            {Object.keys(ACTION_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Shortcut List */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {filteredShortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className={`flex items-center gap-2 p-2 rounded border text-sm ${
                shortcut.enabled
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              <kbd className="px-2 py-0.5 font-mono text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-gray-900 dark:text-white min-w-[60px] text-center">
                {formatShortcut(shortcut)}
              </kbd>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600 dark:text-gray-400 flex-1 capitalize">
                {shortcut.action.replace(/_/g, ' ')}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                {shortcut.category}
              </span>
              <button
                onClick={() => toggleShortcut(shortcut.id)}
                className={`text-xs px-2 py-0.5 rounded ${
                  shortcut.enabled
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {shortcut.enabled ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => removeShortcut(shortcut.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          {filteredShortcuts.length === 0 && (
            <p className="text-center py-4 text-sm text-gray-400">
              No shortcuts found
            </p>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Tips
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Use Sticky Keys to press modifier keys one at a time</li>
          <li>Filter Keys help ignore accidental brief key presses</li>
          <li>Bounce Keys prevent unintended repeated keystrokes</li>
          <li>Click the key capture box and press any key combination to record it</li>
          <li>Shortcuts can be scoped to specific pages or made global</li>
        </ul>
      </div>
    </div>
  );
}

function AccessibilityToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`p-3 rounded-lg border text-left ${
        checked
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </button>
  );
}
