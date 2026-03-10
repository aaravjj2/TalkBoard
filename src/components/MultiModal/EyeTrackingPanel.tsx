import { useMultiModalStore } from '@/stores/multiModalStore';

export default function EyeTrackingPanel() {
  const {
    eyeTrackingSettings,
    eyeTrackingState,
    updateEyeTrackingSettings,
  } = useMultiModalStore();

  const calibrationPoints = [
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 90, y: 10 },
    { x: 10, y: 50 },
    { x: 50, y: 50 },
    { x: 90, y: 50 },
    { x: 10, y: 90 },
    { x: 50, y: 90 },
    { x: 90, y: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                eyeTrackingState?.isTracking
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className="text-xl">👁️</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Eye Tracking {eyeTrackingState?.isTracking ? 'Active' : 'Inactive'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {eyeTrackingState?.isCalibrated
                  ? `Calibrated (Quality: ${((eyeTrackingState.calibrationQuality || 0) * 100).toFixed(0)}%)`
                  : 'Not calibrated'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              eyeTrackingState?.isTracking
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {eyeTrackingState?.isTracking ? 'Online' : 'Offline'}
          </span>
        </div>

        {eyeTrackingState?.isTracking && eyeTrackingState.currentGaze && (
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="text-gray-500 dark:text-gray-400">Gaze X</p>
              <p className="font-mono font-medium dark:text-white">
                {eyeTrackingState.currentGaze.x.toFixed(0)}px
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="text-gray-500 dark:text-gray-400">Gaze Y</p>
              <p className="font-mono font-medium dark:text-white">
                {eyeTrackingState.currentGaze.y.toFixed(0)}px
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dwell Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Dwell Selection
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Dwell Time: {eyeTrackingSettings.dwellTime}ms
            </label>
            <input
              type="range"
              min={200}
              max={3000}
              step={50}
              value={eyeTrackingSettings.dwellTime}
              onChange={(e) =>
                updateEyeTrackingSettings({ dwellTime: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Quick (200ms)</span>
              <span>Slow (3000ms)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Dwell Radius: {eyeTrackingSettings.dwellRadius}px
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={eyeTrackingSettings.dwellRadius}
              onChange={(e) =>
                updateEyeTrackingSettings({ dwellRadius: Number(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Area gaze must stay within for dwell selection to trigger
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Anti-Dwell Radius: {eyeTrackingSettings.antiDwellRadius}px
            </label>
            <input
              type="range"
              min={0}
              max={200}
              step={10}
              value={eyeTrackingSettings.antiDwellRadius}
              onChange={(e) =>
                updateEyeTrackingSettings({ antiDwellRadius: Number(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Prevents accidental re-selection of nearby targets
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Options */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Tracking Options
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <OptionCard
            label="Smoothing"
            description="Reduce jitter in gaze point"
            checked={eyeTrackingSettings.smoothingEnabled}
            onChange={(v) => updateEyeTrackingSettings({ smoothingEnabled: v })}
          />
          <OptionCard
            label="Show Gaze Point"
            description="Display cursor at gaze position"
            checked={eyeTrackingSettings.showGazePoint}
            onChange={(v) => updateEyeTrackingSettings({ showGazePoint: v })}
          />
          <OptionCard
            label="Dwell Indicator"
            description="Visual progress feedback on dwell"
            checked={eyeTrackingSettings.dwellIndicator !== 'none'}
            onChange={(v) => updateEyeTrackingSettings({ dwellIndicator: v ? 'circle' : 'none' })}
          />
          <OptionCard
            label="Blink Detection"
            description="Detect blinks as selection input"
            checked={eyeTrackingSettings.blinkDetection}
            onChange={(v) => updateEyeTrackingSettings({ blinkDetection: v })}
          />
        </div>
      </div>

      {/* Dwell Indicator Style */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Dwell Indicator Style
        </h4>
        <div className="flex gap-2">
          {(['circle', 'fill', 'shrink', 'none'] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateEyeTrackingSettings({ dwellIndicator: style })}
              className={`px-3 py-2 rounded-lg text-sm capitalize ${
                eyeTrackingSettings.dwellIndicator === style
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Gaze Cursor Color */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Gaze Cursor Color
        </h4>
        <div className="flex gap-2">
          {[
            { value: '#3B82F6', label: 'Blue' },
            { value: '#EF4444', label: 'Red' },
            { value: '#10B981', label: 'Green' },
            { value: '#F59E0B', label: 'Yellow' },
            { value: '#8B5CF6', label: 'Purple' },
            { value: '#FFFFFF', label: 'White' },
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => updateEyeTrackingSettings({ gazePointColor: color.value })}
              className={`w-8 h-8 rounded-full border-2 ${
                eyeTrackingSettings.gazePointColor === color.value
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Gaze Cursor Size */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Gaze Cursor Size: {eyeTrackingSettings.gazePointSize}px
        </label>
        <input
          type="range"
          min={4}
          max={40}
          step={2}
          value={eyeTrackingSettings.gazePointSize}
          onChange={(e) =>
            updateEyeTrackingSettings({ gazePointSize: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Calibration */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Calibration
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="relative w-full h-40 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 mb-3">
            {calibrationPoints.map((point, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-colors ${
                  eyeTrackingState?.isCalibrated
                    ? 'bg-green-500 border-green-600'
                    : 'bg-gray-400 border-gray-500'
                }`}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {eyeTrackingState?.isCalibrated
                  ? 'Calibration complete'
                  : 'Calibration required'}
              </p>
              {eyeTrackingState?.isCalibrated && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Quality:{' '}
                  {((eyeTrackingState.calibrationQuality || 0) * 100).toFixed(0)}%
                </p>
              )}
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              onClick={() => {
                /* calibration requires tracker to be active */
              }}
            >
              {eyeTrackingState?.isCalibrated ? 'Re-calibrate' : 'Start Calibration'}
            </button>
          </div>

          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
            <p className="font-medium">Note:</p>
            <p>
              Eye tracking simulation uses mouse position as a proxy. For real
              eye tracking, connect a supported hardware tracker (e.g., Tobii,
              EyeLink, or webcam-based solutions).
            </p>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Advanced Settings
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Smoothing Factor: {(eyeTrackingSettings.smoothingFactor * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={eyeTrackingSettings.smoothingFactor}
              onChange={(e) =>
                updateEyeTrackingSettings({ smoothingFactor: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Fixation Threshold: {eyeTrackingSettings.fixationThreshold}ms
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={eyeTrackingSettings.fixationThreshold}
              onChange={(e) =>
                updateEyeTrackingSettings({ fixationThreshold: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Blink Threshold: {eyeTrackingSettings.blinkThreshold}ms
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={eyeTrackingSettings.blinkThreshold}
              onChange={(e) =>
                updateEyeTrackingSettings({ blinkThreshold: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
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
