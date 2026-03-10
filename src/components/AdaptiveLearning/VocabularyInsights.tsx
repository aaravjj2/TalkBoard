/**
 * VocabularyInsights — Shows vocabulary metrics, growth, and trends.
 */
import { useEffect } from 'react';
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';

export default function VocabularyInsights() {
  const {
    vocabularyMetrics,
    vocabularyHistory,
    isInitialized,
    initialize,
    refreshVocabulary,
  } = useAdaptiveLearningStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const m = vocabularyMetrics;

  return (
    <div className="space-y-6" data-testid="vocabulary-insights">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Vocabulary Insights
        </h3>
        <button
          onClick={refreshVocabulary}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg
            hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Symbols"
          value={m.totalUniqueSymbols}
          icon="📚"
          color="blue"
        />
        <StatCard
          label="Active (7d)"
          value={m.activeVocabularySize}
          icon="🟢"
          color="green"
        />
        <StatCard
          label="Core Vocab"
          value={m.coreVocabularySize}
          icon="⭐"
          color="amber"
        />
        <StatCard
          label="Fringe"
          value={m.fringeVocabularySize}
          icon="🔍"
          color="gray"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Growth Rate</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            +{m.vocabularyGrowthRate}/wk
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Diversity</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {(m.vocabularyDiversity * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Sentence</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {m.avgSymbolsPerSentence.toFixed(1)} symbols
          </p>
        </div>
      </div>

      {/* Category Spread */}
      {Object.keys(m.categorySpread).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Category Spread</h4>
          <div className="space-y-2">
            {Object.entries(m.categorySpread)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const max = Math.max(...Object.values(m.categorySpread));
                const pct = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={category} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-24 truncate capitalize">
                      {category}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Growth History Chart */}
      {vocabularyHistory.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Vocabulary Growth
          </h4>
          <div className="h-32 flex items-end gap-1">
            {vocabularyHistory.slice(-30).map((entry, idx) => {
              const maxVal = Math.max(...vocabularyHistory.slice(-30).map((e) => e.totalSymbols));
              const height = maxVal > 0 ? (entry.totalSymbols / maxVal) * 100 : 0;
              return (
                <div
                  key={entry.date}
                  className="flex-1 bg-blue-400 dark:bg-blue-500 rounded-t min-w-[4px]
                    hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${entry.date}: ${entry.totalSymbols} symbols`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {vocabularyHistory.slice(-30)[0]?.date || ''}
            </span>
            <span className="text-xs text-gray-400">
              {vocabularyHistory[vocabularyHistory.length - 1]?.date || ''}
            </span>
          </div>
        </div>
      )}

      {/* New & Emerging Symbols */}
      {(m.newSymbolsThisWeek.length > 0 || m.emergingSymbols.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {m.newSymbolsThisWeek.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border
              border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                🆕 New This Week ({m.newSymbolsThisWeek.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {m.newSymbolsThisWeek.slice(0, 10).map((id) => (
                  <span key={id} className="px-2 py-0.5 bg-green-100 dark:bg-green-800
                    text-green-700 dark:text-green-200 rounded text-xs">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
          {m.emergingSymbols.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border
              border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                📈 Emerging ({m.emergingSymbols.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {m.emergingSymbols.slice(0, 10).map((id) => (
                  <span key={id} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800
                    text-purple-700 dark:text-purple-200 rounded text-xs">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Declining Symbols */}
      {m.decliningSymbols.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border
          border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
            📉 Declining ({m.decliningSymbols.length})
          </h4>
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            These symbols used to be used frequently but haven't been used recently.
          </p>
          <div className="flex flex-wrap gap-1">
            {m.decliningSymbols.slice(0, 10).map((id) => (
              <span key={id} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-800
                text-amber-700 dark:text-amber-200 rounded text-xs">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    gray: 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300',
  };

  return (
    <div className={`rounded-lg p-3 text-center ${colorClasses[color] || colorClasses.gray}`}>
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-75">{label}</p>
    </div>
  );
}
