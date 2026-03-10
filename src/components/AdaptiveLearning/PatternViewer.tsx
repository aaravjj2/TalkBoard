/**
 * PatternViewer — Shows discovered sequential communication patterns.
 */
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';

export default function PatternViewer() {
  const { sequentialPatterns, topSymbols } = useAdaptiveLearningStore();

  return (
    <div className="space-y-6" data-testid="pattern-viewer">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Communication Patterns
      </h3>

      {/* Top Symbols */}
      {topSymbols.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Most Used Symbols
          </h4>
          <div className="space-y-2">
            {topSymbols.slice(0, 10).map((record, idx) => {
              const maxUses = topSymbols[0]?.totalUses || 1;
              const pct = (record.totalUses / maxUses) * 100;
              return (
                <div key={record.symbolId} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-5 text-right">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-24
                    truncate">
                    {record.symbolId}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {record.totalUses}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sequential Patterns */}
      {sequentialPatterns.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Common Sequences
          </h4>
          <div className="space-y-3">
            {sequentialPatterns.slice(0, 15).map((pattern) => (
              <div key={pattern.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-1 mb-2 flex-wrap">
                  {pattern.sequence.map((symbolId, idx) => (
                    <span key={`${symbolId}-${idx}`} className="flex items-center">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30
                        text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        {symbolId}
                      </span>
                      {idx < pattern.sequence.length - 1 && (
                        <span className="text-gray-400 mx-0.5">→</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Used {pattern.frequency}x</span>
                  <span>Confidence: {Math.round(pattern.confidence * 100)}%</span>
                  <span>Support: {Math.round(pattern.support * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No patterns discovered yet. Keep using TalkBoard to build your communication profile.</p>
        </div>
      )}

      {/* Time Distribution */}
      {topSymbols.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Activity by Time of Day
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => {
              const total = topSymbols.reduce(
                (sum, r) => sum + r.timeDistribution[time],
                0
              );
              const maxTotal = Math.max(
                ...(['morning', 'afternoon', 'evening', 'night'] as const).map((t) =>
                  topSymbols.reduce((sum, r) => sum + r.timeDistribution[t], 0)
                ),
                1
              );
              const pct = (total / maxTotal) * 100;
              const icons: Record<string, string> = {
                morning: '🌅',
                afternoon: '☀️',
                evening: '🌆',
                night: '🌙',
              };

              return (
                <div key={time} className="text-center">
                  <span className="text-2xl">{icons[time]}</span>
                  <div className="h-20 flex items-end mt-2 mb-1">
                    <div
                      className="w-full bg-gradient-to-t from-amber-400 to-amber-200
                        dark:from-amber-600 dark:to-amber-800 rounded-t"
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{time}</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{total}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Distribution */}
      {topSymbols.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Activity by Day
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day, idx) => {
              const dayKeys = [
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
              ] as const;
              const total = topSymbols.reduce(
                (sum, r) => sum + r.dayDistribution[dayKeys[idx]],
                0
              );
              const maxTotal = Math.max(
                ...dayKeys.map((d) =>
                  topSymbols.reduce((sum, r) => sum + r.dayDistribution[d], 0)
                ),
                1
              );
              const pct = (total / maxTotal) * 100;

              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{day}</p>
                  <div className="h-16 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300
                        dark:from-blue-600 dark:to-blue-800 rounded-t"
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">
                    {total}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
