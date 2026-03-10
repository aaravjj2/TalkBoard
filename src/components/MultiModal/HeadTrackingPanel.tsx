import { useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';
import type { HeadPose } from '@/types/multiModal';

export default function HeadTrackingPanel() {
  const {
    headTrackingSettings,
    headTrackingState,
    updateHeadTrackingSettings,
  } = useMultiModalStore();

  const [showInfo, setShowInfo] = useState(false);

  const clickGestures: { value: string; label: string; icon: string }[] = [
    { value: 'dwell', label: 'Dwell (hold still)', icon: '⏱️' },
    { value: 'blink', label: 'Blink', icon: '😑' },
    { value: 'smile', label: 'Smile', icon: '😊' },
    { value: 'raise_eyebrows', label: 'Raise Eyebrows', icon: '😲' },
  ];

  const boundaryBehaviors: { value: string; label: string; description: string }[] = [
    { value: 'stop', label: 'Stop', description: 'Stop at screen edges' },
    { value: 'wrap', label: 'Wrap', description: 'Wrap around to opposite edge' },
    { value: 'bounce', label: 'Bounce', description: 'Bounce back from edges' },
  ];

  const cursorHeadPose: HeadPose | null = headTrackingState?.currentPose || null;

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                headTrackingState?.isTracking
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className="text-xl">🗣️</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Head Tracking {headTrackingState?.isTracking ? 'Active' : 'Inactive'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {headTrackingState?.isTracking
                  ? 'Tracking head movement'
                  : 'Uses webcam or mouse simulation'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              headTrackingState?.isTracking
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {headTrackingState?.isTracking ? 'Online' : 'Offline'}
          </span>
        </div>

        {cursorHeadPose && (
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Yaw</p>
              <p className="font-mono font-medium dark:text-white">
                {cursorHeadPose.yaw.toFixed(1)}°
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pitch</p>
              <p className="font-mono font-medium dark:text-white">
                {cursorHeadPose.pitch.toFixed(1)}°
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Roll</p>
              <p className="font-mono font-medium dark:text-white">
                {cursorHeadPose.roll.toFixed(1)}°
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Movement Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Movement Settings
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Sensitivity: {(headTrackingSettings.sensitivity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.1}
              value={headTrackingSettings.sensitivity}
              onChange={(e) =>
                updateHeadTrackingSettings({ sensitivity: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Smoothing: {(headTrackingSettings.smoothing * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={headTrackingSettings.smoothing}
              onChange={(e) =>
                updateHeadTrackingSettings({ smoothing: Number(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Higher smoothing reduces jitter but adds latency
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Dead Zone: {headTrackingSettings.deadZone}px
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={headTrackingSettings.deadZone}
              onChange={(e) =>
                updateHeadTrackingSettings({ deadZone: Number(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum movement required before cursor starts moving
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Cursor Speed: {(headTrackingSettings.cursorSpeed * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={headTrackingSettings.cursorSpeed}
              onChange={(e) =>
                updateHeadTrackingSettings({ cursorSpeed: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Axis Inversion */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Axis Settings
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <AxisToggle
            label="Invert X"
            description="Mirror horizontal movement"
            checked={headTrackingSettings.invertX}
            onChange={(v) => updateHeadTrackingSettings({ invertX: v })}
          />
          <AxisToggle
            label="Invert Y"
            description="Mirror vertical movement"
            checked={headTrackingSettings.invertY}
            onChange={(v) => updateHeadTrackingSettings({ invertY: v })}
          />
        </div>
      </div>

      {/* Click Gesture */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Click Gesture
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Select the gesture that triggers a click/selection
        </p>
        <div className="space-y-1">
          {clickGestures.map((gesture) => (
            <button
              key={gesture.value}
              onClick={() =>
                updateHeadTrackingSettings({ clickGesture: gesture.value })
              }
              className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left ${
                headTrackingSettings.clickGesture === gesture.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{gesture.icon}</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {gesture.label}
              </span>
              {headTrackingSettings.clickGesture === gesture.value && (
                <span className="text-xs ml-auto text-purple-600 dark:text-purple-400">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Boundary Behavior */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Boundary Behavior
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {boundaryBehaviors.map((behavior) => (
            <button
              key={behavior.value}
              onClick={() =>
                updateHeadTrackingSettings({ boundaryBehavior: behavior.value })
              }
              className={`p-3 rounded-lg border text-left ${
                headTrackingSettings.boundaryBehavior === behavior.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {behavior.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {behavior.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Movement Preview
        </h4>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="relative w-full h-40 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 overflow-hidden">
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-3 -translate-y-3">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 dark:bg-gray-600" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Dead zone indicator */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50"
              style={{
                width: headTrackingSettings.deadZone * 2,
                height: headTrackingSettings.deadZone * 2,
                transform: `translate(-${headTrackingSettings.deadZone}px, -${headTrackingSettings.deadZone}px)`,
              }}
            />

            {/* Virtual cursor */}
            {cursorHeadPose && (
              <div
                className="absolute w-3 h-3 rounded-full bg-purple-500 shadow-lg"
                style={{
                  left: `calc(50% + ${cursorHeadPose.yaw * headTrackingSettings.sensitivity}px)`,
                  top: `calc(50% + ${cursorHeadPose.pitch * headTrackingSettings.sensitivity}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
              Move mouse to simulate head movement
            </p>
          </div>

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1" />
              Cursor
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full border border-dashed border-gray-400 mr-1" />
              Dead Zone
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>{showInfo ? '▼' : '▶'}</span>
          How Head Tracking Works
        </button>

        {showInfo && (
          <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <p>
              Head tracking maps head movements to cursor movements on screen.
              Turning your head left/right moves the cursor horizontally, while
              tilting up/down moves it vertically.
            </p>
            <p>
              In simulation mode, mouse position relative to the screen center
              acts as a proxy for head position. Connect a webcam-based head
              tracker or hardware sensor for real tracking.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Adjust sensitivity for comfortable movement range</li>
              <li>Use dead zone to prevent unintentional small movements</li>
              <li>Smoothing reduces jitter but adds slight delay</li>
              <li>Select a click gesture that is comfortable for the user</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function AxisToggle({
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
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            checked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </button>
  );
}
