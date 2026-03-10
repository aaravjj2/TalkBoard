import { useMultiModalStore } from '@/stores/multiModalStore';
import type { InputMode } from '@/types/multiModal';

const MODE_INFO: Record<
  InputMode,
  { icon: string; label: string; description: string }
> = {
  touch: { icon: '👆', label: 'Touch', description: 'Touchscreen taps and gestures' },
  voice: { icon: '🎤', label: 'Voice', description: 'Speech recognition commands' },
  switch: { icon: '🔘', label: 'Switch', description: 'Switch access with scanning' },
  eye_tracking: { icon: '👁️', label: 'Eye Tracking', description: 'Gaze-based selection with dwell' },
  gesture: { icon: '🤚', label: 'Gesture', description: 'Touch gestures (swipe, pinch, etc.)' },
  keyboard: { icon: '⌨️', label: 'Keyboard', description: 'Keyboard shortcuts' },
  mouse: { icon: '🖱️', label: 'Mouse', description: 'Mouse pointer input' },
  head_tracking: { icon: '🗣️', label: 'Head Tracking', description: 'Head movement cursor control' },
};

export default function InputModeSelector() {
  const {
    settings,
    modeConfigs,
    currentMode,
    enableMode,
    disableMode,
    setPrimaryMode,
  } = useMultiModalStore();

  const allModes: InputMode[] = [
    'touch', 'voice', 'switch', 'eye_tracking',
    'gesture', 'keyboard', 'mouse', 'head_tracking',
  ];

  return (
    <div className="space-y-4">
      {/* Current Primary Mode */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Primary Input Mode
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{MODE_INFO[currentMode].icon}</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {MODE_INFO[currentMode].label}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={settings.autoDetect}
                onChange={() =>
                  useMultiModalStore
                    .getState()
                    .updateSettings({ autoDetect: !settings.autoDetect })
                }
                className="rounded"
              />
              Auto-detect
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={settings.modeSwitchingEnabled}
                onChange={() =>
                  useMultiModalStore
                    .getState()
                    .updateSettings({
                      modeSwitchingEnabled: !settings.modeSwitchingEnabled,
                    })
                }
                className="rounded"
              />
              Mode switching
            </label>
          </div>
        </div>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allModes.map((mode) => {
          const info = MODE_INFO[mode];
          const config = modeConfigs.find((c) => c.mode === mode);
          const isActive = settings.activeModes.includes(mode);
          const isPrimary = currentMode === mode;

          return (
            <div
              key={mode}
              className={`p-4 rounded-lg border transition-colors ${
                isPrimary
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                  : isActive
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {info.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {info.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    isActive ? disableMode(mode) : enableMode(mode)
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`Toggle ${info.label}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      isActive ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {isActive && !isPrimary && (
                <button
                  onClick={() => setPrimaryMode(mode)}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Set as primary
                </button>
              )}
              {isPrimary && (
                <span className="mt-2 inline-block text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">
                  Primary
                </span>
              )}

              {config && config.status === 'error' && (
                <p className="mt-1 text-xs text-red-500">Error — check settings</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Input Feedback
        </h4>
        <div className="flex gap-4 flex-wrap">
          {(['visual', 'auditory', 'haptic'] as const).map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                type="checkbox"
                checked={settings.inputFeedback[type]}
                onChange={() =>
                  useMultiModalStore.getState().updateSettings({
                    inputFeedback: {
                      ...settings.inputFeedback,
                      [type]: !settings.inputFeedback[type],
                    },
                  })
                }
                className="rounded"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
