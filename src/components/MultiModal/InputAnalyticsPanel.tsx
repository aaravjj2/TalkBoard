import { useMultiModalStore } from '@/stores/multiModalStore';
import type { InputMode, InputModeAnalytics } from '@/types/multiModal';

const MODE_COLORS: Record<InputMode, string> = {
  touch: '#3B82F6',
  voice: '#EF4444',
  switch: '#10B981',
  eye_tracking: '#8B5CF6',
  gesture: '#F59E0B',
  keyboard: '#6366F1',
  mouse: '#EC4899',
  head_tracking: '#14B8A6',
};

const MODE_LABELS: Record<InputMode, string> = {
  touch: 'Touch',
  voice: 'Voice',
  switch: 'Switch',
  eye_tracking: 'Eye Tracking',
  gesture: 'Gesture',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  head_tracking: 'Head Tracking',
};

const MODE_ICONS: Record<InputMode, string> = {
  touch: '👆',
  voice: '🎤',
  switch: '🔘',
  eye_tracking: '👁️',
  gesture: '🤚',
  keyboard: '⌨️',
  mouse: '🖱️',
  head_tracking: '🗣️',
};

export default function InputAnalyticsPanel() {
  const {
    modeAnalytics,
    performanceMetrics,
    inputHistory,
    modeConfigs,
    refreshAnalytics,
  } = useMultiModalStore();

  const activeModes = modeConfigs.filter((m) => m.enabled);
  const totalInteractions = modeAnalytics
    .reduce((sum, a) => sum + (a?.totalInteractions || 0), 0);

  // Build a record from array for easy lookup
  const analyticsRecord = Object.fromEntries(
    modeAnalytics.map((a) => [a.mode, a])
  ) as Record<InputMode, InputModeAnalytics | undefined>;

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={() => refreshAnalytics()}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Overall Performance */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Overall Performance
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Total Interactions"
            value={totalInteractions.toLocaleString()}
            color="blue"
          />
          <MetricCard
            label="Accuracy"
            value={`${((performanceMetrics?.overallAccuracy || 0) * 100).toFixed(1)}%`}
            color="green"
          />
          <MetricCard
            label="Symbols/Min"
            value={(performanceMetrics?.symbolsPerMinute || 0).toFixed(1)}
            color="purple"
          />
          <MetricCard
            label="Active Modes"
            value={String(activeModes.length)}
            color="orange"
          />
        </div>
      </div>

      {/* Mode Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Input Mode Distribution
        </h4>
        {totalInteractions > 0 ? (
          <>
            {/* Bar chart */}
            <div className="h-6 flex rounded-lg overflow-hidden mb-3">
              {Object.entries(performanceMetrics?.modeDistribution || {})
                .filter(([, pct]) => (pct as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([mode, pct]) => (
                  <div
                    key={mode}
                    className="relative group"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: MODE_COLORS[mode as InputMode] || '#9CA3AF',
                      minWidth: (pct as number) > 0 ? '8px' : '0',
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {MODE_LABELS[mode as InputMode]}: {(pct as number).toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(performanceMetrics?.modeDistribution || {})
                .filter(([, pct]) => (pct as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([mode, pct]) => (
                  <div key={mode} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: MODE_COLORS[mode as InputMode] || '#9CA3AF',
                      }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {MODE_LABELS[mode as InputMode]}
                    </span>
                    <span className="text-gray-400">
                      {(pct as number).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No interaction data yet. Start using input modes to see distribution.
          </p>
        )}
      </div>

      {/* Per-Mode Analytics */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Per-Mode Analytics
        </h4>
        <div className="space-y-2">
          {modeAnalytics
            .filter((data) => data && (data.totalInteractions || 0) > 0)
            .sort((a, b) => (b?.totalInteractions || 0) - (a?.totalInteractions || 0))
            .map((data) => (
              <ModeAnalyticsRow
                key={data.mode}
                mode={data.mode}
                data={data}
              />
            ))}

          {modeAnalytics.every((d) => !d || d.totalInteractions === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">
              No per-mode analytics data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Peak Usage Time */}
      {performanceMetrics?.peakPerformanceTime && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Usage Patterns
          </h4>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Peak Usage Time:{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {performanceMetrics.peakPerformanceTime}
              </span>
            </p>
            {performanceMetrics.sessionDuration > 0 && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Session Duration:{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(performanceMetrics.sessionDuration)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Input History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recent Input Events ({inputHistory.length})
        </h4>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {inputHistory.slice(0, 50).map((event, i) => (
            <div
              key={event.id || i}
              className="flex items-center gap-2 p-2 text-xs border border-gray-100 dark:border-gray-800 rounded"
            >
              <span>{MODE_ICONS[event.mode]}</span>
              <span className="text-gray-500 dark:text-gray-400 min-w-[60px]">
                {MODE_LABELS[event.mode]}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 dark:text-gray-300 capitalize flex-1">
                {event.type.replace(/_/g, ' ')}
              </span>
              {event.target && (
                <span className="text-gray-400 truncate max-w-[100px]">
                  {event.target}
                </span>
              )}
              <span className="text-gray-400 min-w-[55px] text-right">
                {formatTime(event.timestamp)}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  event.success ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={event.success ? 'Success' : 'Failed'}
              />
            </div>
          ))}
          {inputHistory.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No input events recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
          Recommendations
        </h4>
        <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
          {totalInteractions === 0 && (
            <li>Start using different input modes to generate analytics data</li>
          )}
          {(performanceMetrics?.overallAccuracy || 0) < 0.8 && totalInteractions > 10 && (
            <li>
              Accuracy is below 80%. Consider adjusting sensitivity settings or
              trying a different input mode.
            </li>
          )}
          {activeModes.length === 1 && (
            <li>
              Only one input mode is active. Enable additional modes for fallback
              options and improved accessibility.
            </li>
          )}
          {activeModes.length > 4 && (
            <li>
              Many modes are active. Consider disabling unused modes to reduce
              complexity and potential conflicts.
            </li>
          )}
          <li>Review peak usage times to understand interaction patterns</li>
          <li>Monitor error rates per mode for optimization opportunities</li>
        </ul>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function ModeAnalyticsRow({
  mode,
  data,
}: {
  mode: InputMode;
  data: {
    totalInteractions: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  };
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span>{MODE_ICONS[mode]}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {MODE_LABELS[mode]}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {data.totalInteractions.toLocaleString()} interactions
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
          <p
            className={`text-sm font-medium ${
              data.successRate >= 0.8
                ? 'text-green-600 dark:text-green-400'
                : data.successRate >= 0.6
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {(data.successRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data.averageResponseTime.toFixed(0)}ms
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Error Rate</p>
          <p
            className={`text-sm font-medium ${
              data.errorRate <= 0.05
                ? 'text-green-600 dark:text-green-400'
                : data.errorRate <= 0.15
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {(data.errorRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      {/* Success bar */}
      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            data.successRate >= 0.8
              ? 'bg-green-500'
              : data.successRate >= 0.6
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${data.successRate * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
