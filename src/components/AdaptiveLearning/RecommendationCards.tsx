/**
 * RecommendationCards — Displays adaptive learning recommendations.
 */
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';

const TYPE_ICONS: Record<string, string> = {
  add_to_board: '📌',
  promote_symbol: '⬆️',
  learn_new_category: '🗂️',
  practice_symbol: '🔁',
  sentence_template: '📝',
  vocabulary_expansion: '📚',
  category_exploration: '🧭',
  communication_strategy: '💡',
  layout_optimization: '🧩',
  quick_phrase_suggestion: '⚡',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-400',
};

export default function RecommendationCards() {
  const {
    recommendations,
    showRecommendations,
    toggleRecommendations,
    refreshRecommendations,
    dismissRecommendation,
    actOnRecommendation,
  } = useAdaptiveLearningStore();

  const activeRecommendations = recommendations.filter(
    (r) => !r.dismissed && !r.acted
  );

  if (activeRecommendations.length === 0 && !showRecommendations) return null;

  return (
    <div className="space-y-3" data-testid="recommendation-cards">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>💡</span>
          Recommendations
          <span className="text-sm font-normal text-gray-400">
            ({activeRecommendations.length})
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={refreshRecommendations}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh recommendations"
          >
            🔄
          </button>
          <button
            onClick={toggleRecommendations}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {showRecommendations ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {showRecommendations && activeRecommendations.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-2">✨</p>
          <p className="text-sm">No recommendations right now. Keep using TalkBoard!</p>
        </div>
      )}

      {showRecommendations && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm
                border border-gray-200 dark:border-gray-700 border-l-4
                ${PRIORITY_COLORS[rec.priority] || 'border-l-gray-300'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TYPE_ICONS[rec.type] || '💡'}</span>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                </div>
                <button
                  onClick={() => dismissRecommendation(rec.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                    flex-shrink-0"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {rec.description}
              </p>

              {/* Confidence indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {Math.round(rec.confidence * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => actOnRecommendation(rec.id)}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded
                    hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Symbol/Category chips */}
              {(rec.symbolIds.length > 0 || rec.categoryIds.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {rec.symbolIds.slice(0, 4).map((id) => (
                    <span key={id} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30
                      text-blue-600 dark:text-blue-300 rounded text-xs">
                      {id}
                    </span>
                  ))}
                  {rec.categoryIds.slice(0, 3).map((id) => (
                    <span key={id} className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30
                      text-green-600 dark:text-green-300 rounded text-xs capitalize">
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
