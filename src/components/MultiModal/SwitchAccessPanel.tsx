import { useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';
import type { ScanMethod } from '@/types/multiModal';

export default function SwitchAccessPanel() {
  const {
    switchSettings,
    scanState,
    updateSwitchSettings,
  } = useMultiModalStore();

  const [testMode, setTestMode] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);

  const scanMethods: { value: ScanMethod; label: string; description: string }[] = [
    {
      value: 'linear',
      label: 'Linear',
      description: 'Scans one item at a time from left to right, top to bottom',
    },
    {
      value: 'row_column',
      label: 'Row-Column',
      description: 'First scans rows, then items within the selected row',
    },
    {
      value: 'group',
      label: 'Group',
      description: 'Divides items into groups, narrows down progressively',
    },
    {
      value: 'tree',
      label: 'Binary Tree',
      description: 'Splits items in half each selection for faster access',
    },
  ];

  const testGrid = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    label: `Item ${i + 1}`,
    emoji: ['😀', '😊', '🤗', '😎', '🤔', '👋', '❤️', '⭐', '🎵', '🏠', '🍎', '🌈'][i],
  }));

  return (
    <div className="space-y-6">
      {/* Scan Method */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Scan Method
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {scanMethods.map((method) => (
            <button
              key={method.value}
              onClick={() => updateSwitchSettings({ scanMethod: method.value })}
              className={`p-3 rounded-lg border text-left ${
                switchSettings.scanMethod === method.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {method.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {method.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Scan Timing */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Scan Timing
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Scan Speed: {switchSettings.scanSpeed}ms
            </label>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={switchSettings.scanSpeed}
              onChange={(e) =>
                updateSwitchSettings({ scanSpeed: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Fast (500ms)</span>
              <span>Slow (5000ms)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Scan Delay: {switchSettings.scanDelay}ms
            </label>
            <input
              type="range"
              min={100}
              max={3000}
              step={100}
              value={switchSettings.scanDelay}
              onChange={(e) =>
                updateSwitchSettings({ scanDelay: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Repeat Rate: {switchSettings.repeatRate}ms
            </label>
            <input
              type="range"
              min={0}
              max={2000}
              step={100}
              value={switchSettings.repeatRate}
              onChange={(e) =>
                updateSwitchSettings({ repeatRate: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Acceptance Delay: {switchSettings.acceptanceDelay}ms
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={switchSettings.acceptanceDelay}
              onChange={(e) =>
                updateSwitchSettings({ acceptanceDelay: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Scan Options */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Scan Options
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <ToggleOption
            label="Auto Scan"
            description="Automatic scanning without switch input"
            checked={switchSettings.autoScanEnabled}
            onChange={(v) => updateSwitchSettings({ autoScanEnabled: v })}
          />
          <ToggleOption
            label="Pause on First"
            description="Pause on first item when entering a group"
            checked={switchSettings.pauseOnFirst}
            onChange={(v) => updateSwitchSettings({ pauseOnFirst: v })}
          />
          <ToggleOption
            label="Auditory Cues"
            description="Sound feedback during scanning"
            checked={switchSettings.auditoryCueEnabled}
            onChange={(v) => updateSwitchSettings({ auditoryCueEnabled: v })}
          />
          <ToggleOption
            label="Scan Wrapping"
            description="Wrap to start after reaching end"
            checked={switchSettings.wrapping}
            onChange={(v) => updateSwitchSettings({ wrapping: v })}
          />
        </div>
      </div>

      {/* Highlight Size */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Highlight Size: {switchSettings.highlightSize}px
        </h4>
        <input
          type="range"
          min={2}
          max={8}
          step={1}
          value={switchSettings.highlightSize}
          onChange={(e) =>
            updateSwitchSettings({ highlightSize: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Highlight Color */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Highlight Color
        </h4>
        <div className="flex gap-2">
          {[
            { value: '#3B82F6', label: 'Blue' },
            { value: '#EF4444', label: 'Red' },
            { value: '#10B981', label: 'Green' },
            { value: '#F59E0B', label: 'Yellow' },
            { value: '#8B5CF6', label: 'Purple' },
            { value: '#F97316', label: 'Orange' },
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => updateSwitchSettings({ highlightColor: color.value })}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                switchSettings.highlightColor === color.value
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Switch Configuration */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Switch Assignments
        </h4>
        <div className="space-y-2">
          {(switchSettings.switches || []).map((sw) => (
            <div
              key={sw.id}
              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-lg">🔘</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {sw.label || 'Switch'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Key: {sw.key} → {sw.action} (hold: {sw.holdTime}ms)
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  sw.enabled
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {sw.enabled ? 'Active' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Scan Status
          </h4>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              scanState.isScanning
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {scanState.isScanning ? 'Scanning' : 'Idle'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Group</p>
            <p className="font-medium dark:text-white">{scanState.currentGroup + 1}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Item</p>
            <p className="font-medium dark:text-white">{scanState.currentItem + 1}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Level</p>
            <p className="font-medium dark:text-white capitalize">{scanState.scanLevel}</p>
          </div>
        </div>
      </div>

      {/* Test Area */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Test Area
          </h4>
          <button
            onClick={() => {
              setTestMode(!testMode);
              setHighlightedCell(null);
            }}
            className={`px-3 py-1 text-sm rounded-lg ${
              testMode
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {testMode ? 'Stop Test' : 'Start Test'}
          </button>
        </div>

        {testMode && (
          <div className="grid grid-cols-4 gap-2">
            {testGrid.map((item) => (
              <button
                key={item.id}
                onClick={() => setHighlightedCell(item.id)}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                  highlightedCell === item.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                style={
                  highlightedCell === item.id
                    ? {
                        borderColor: switchSettings.highlightColor,
                        boxShadow: `0 0 8px ${switchSettings.highlightColor}40`,
                      }
                    : undefined
                }
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleOption({
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
        <span className={`w-3 h-3 rounded-full ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </button>
  );
}
