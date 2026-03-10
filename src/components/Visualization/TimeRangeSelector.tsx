// ─── Time Range Selector ────────────────────────────────────────────────────

import { useVisualizationStore } from '../../stores/visualizationStore';
import type { TimeRange } from '../../types/visualization';

export default function TimeRangeSelector() {
  const { timeRange, setTimeRange, customDateRange, setCustomDateRange } = useVisualizationStore();

  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: '1 Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        {ranges.map(r => (
          <button
            key={r.value}
            onClick={() => setTimeRange(r.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${timeRange === r.value
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {timeRange === 'custom' && (
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={customDateRange?.start || ''}
            onChange={(e) => setCustomDateRange({
              start: e.target.value,
              end: customDateRange?.end || new Date().toISOString().split('T')[0],
            })}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={customDateRange?.end || ''}
            onChange={(e) => setCustomDateRange({
              start: customDateRange?.start || '2024-01-01',
              end: e.target.value,
            })}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          />
        </div>
      )}

      <button
        onClick={() => timeRange !== 'custom' ? setTimeRange('custom' as TimeRange) : setTimeRange('week')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
          ${timeRange === 'custom'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700'}`}
      >
        📅 Custom
      </button>
    </div>
  );
}
