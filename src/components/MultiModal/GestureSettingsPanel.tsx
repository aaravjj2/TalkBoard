import { useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';
import type { GestureType } from '@/types/multiModal';

const GESTURE_ICONS: Record<GestureType, string> = {
  swipe_left: '👈',
  swipe_right: '👉',
  swipe_up: '👆',
  swipe_down: '👇',
  pinch_in: '🤏',
  pinch_out: '🤌',
  tap: '👆',
  double_tap: '✌️',
  long_press: '✊',
  two_finger_tap: '🤞',
  three_finger_tap: '🤚',
  rotate_cw: '🔄',
  rotate_ccw: '🔃',
  shake: '📳',
};

const ALL_GESTURES: GestureType[] = [
  'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down',
  'pinch_in', 'pinch_out', 'tap', 'double_tap',
  'long_press', 'two_finger_tap', 'three_finger_tap',
  'rotate_cw', 'rotate_ccw', 'shake',
];

const DEFAULT_ACTIONS = [
  'navigate_home', 'navigate_back', 'scroll_up', 'scroll_down',
  'select_symbol', 'clear_sentence', 'speak_sentence', 'undo',
  'open_settings', 'toggle_keyboard', 'next_page', 'previous_page',
  'zoom_in', 'zoom_out', 'open_categories', 'add_to_favorites',
];

export default function GestureSettingsPanel() {
  const {
    gestureSettings,
    updateGestureSettings,
  } = useMultiModalStore();

  const [showAddMapping, setShowAddMapping] = useState(false);
  const [newMapping, setNewMapping] = useState({
    gesture: 'tap' as GestureType,
    action: DEFAULT_ACTIONS[0],
    customAction: '',
    requireFingers: 1,
  });

  const handleAddMapping = () => {
    const action = newMapping.customAction || newMapping.action;
    if (!action) return;

    const mappings = [...(gestureSettings.mappings || [])];
    const existing = mappings.findIndex((m) => m.gesture === newMapping.gesture);
    if (existing >= 0) {
      mappings[existing] = {
        ...mappings[existing],
        action,
        sensitivity: newMapping.requireFingers,
      };
    } else {
      mappings.push({
        id: `gesture_${Date.now()}`,
        gesture: newMapping.gesture,
        action,
        enabled: true,
        sensitivity: newMapping.requireFingers,
        parameters: {},
      });
    }
    updateGestureSettings({ mappings });
    setNewMapping({ gesture: 'tap', action: DEFAULT_ACTIONS[0], customAction: '', requireFingers: 1 });
    setShowAddMapping(false);
  };

  const removeMapping = (id: string) => {
    const mappings = (gestureSettings.mappings || []).filter((m) => m.id !== id);
    updateGestureSettings({ mappings });
  };

  const toggleMapping = (id: string) => {
    const mappings = (gestureSettings.mappings || []).map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    updateGestureSettings({ mappings });
  };

  return (
    <div className="space-y-6">
      {/* Gesture Recognition Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recognition Settings
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Swipe Threshold: {gestureSettings.swipeThreshold}px
            </label>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={gestureSettings.swipeThreshold}
              onChange={(e) =>
                updateGestureSettings({ swipeThreshold: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Sensitive (20px)</span>
              <span>Firm (200px)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Long Press Duration: {gestureSettings.longPressDelay}ms
            </label>
            <input
              type="range"
              min={200}
              max={2000}
              step={50}
              value={gestureSettings.longPressDelay}
              onChange={(e) =>
                updateGestureSettings({ longPressDelay: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Double Tap Interval: {gestureSettings.doubleTapDelay}ms
            </label>
            <input
              type="range"
              min={100}
              max={800}
              step={25}
              value={gestureSettings.doubleTapDelay}
              onChange={(e) =>
                updateGestureSettings({ doubleTapDelay: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Pinch Threshold: {gestureSettings.pinchThreshold}
            </label>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={gestureSettings.pinchThreshold}
              onChange={(e) =>
                updateGestureSettings({ pinchThreshold: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Gesture Options */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Options
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <SettingToggle
            label="Visual Feedback"
            checked={gestureSettings.visualFeedback}
            onChange={(v) => updateGestureSettings({ visualFeedback: v })}
          />
          <SettingToggle
            label="Vibration Feedback"
            checked={gestureSettings.vibrationFeedback}
            onChange={(v) => updateGestureSettings({ vibrationFeedback: v })}
          />
        </div>
      </div>

      {/* Gesture Mappings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Gesture Mappings ({(gestureSettings.mappings || []).length})
          </h4>
          <button
            onClick={() => setShowAddMapping(!showAddMapping)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showAddMapping ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showAddMapping && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Gesture
              </label>
              <select
                value={newMapping.gesture}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, gesture: e.target.value as GestureType })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {ALL_GESTURES.map((g) => (
                  <option key={g} value={g}>
                    {GESTURE_ICONS[g]} {g.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Action
              </label>
              <select
                value={newMapping.action}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, action: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {DEFAULT_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a.replace(/_/g, ' ')}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>

            {newMapping.action === 'custom' && (
              <input
                type="text"
                value={newMapping.customAction}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, customAction: e.target.value })
                }
                placeholder="Custom action name"
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            )}

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Required Fingers: {newMapping.requireFingers}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={newMapping.requireFingers}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, requireFingers: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <button
              onClick={handleAddMapping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add Mapping
            </button>
          </div>
        )}

        <div className="space-y-1">
          {(gestureSettings.mappings || []).map((mapping) => (
            <div
              key={mapping.id}
              className={`flex items-center gap-2 p-2 rounded border ${
                mapping.enabled
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              <span className="text-lg">{GESTURE_ICONS[mapping.gesture]}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize min-w-[100px]">
                {mapping.gesture.replace(/_/g, ' ')}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 capitalize">
                {mapping.action.replace(/_/g, ' ')}
              </span>
              {mapping.sensitivity && mapping.sensitivity > 1 && (
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  S:{mapping.sensitivity}
                </span>
              )}
              <button
                onClick={() => toggleMapping(mapping.id)}
                className={`text-xs px-2 py-0.5 rounded ${
                  mapping.enabled
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {mapping.enabled ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => removeMapping(mapping.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gesture Reference */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Gesture Reference
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ALL_GESTURES.map((gesture) => (
            <div
              key={gesture}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
            >
              <span className="text-lg">{GESTURE_ICONS[gesture]}</span>
              <span className="text-gray-700 dark:text-gray-300 capitalize text-xs">
                {gesture.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700 cursor-pointer">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </label>
  );
}
