/**
 * AdaptiveLearningPage — Dashboard for adaptive learning features.
 */
import { useEffect, useState } from 'react';
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';
import {
  VocabularyInsights,
  LearningSessionPanel,
  RecommendationCards,
  AdaptiveLearningSettingsPanel,
  PatternViewer,
} from '@/components/AdaptiveLearning';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
  { id: 'patterns', label: 'Patterns', icon: '🔗' },
  { id: 'sessions', label: 'Sessions', icon: '📋' },
  { id: 'recommendations', label: 'Tips', icon: '💡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdaptiveLearningPage() {
  const {
    isInitialized,
    settings,
    vocabularyMetrics,
    currentPredictions,
    predictionAccuracy,
    sessionHistory,
    recommendations,
    topSymbols,
    sequentialPatterns,
    initialize,
    refreshVocabulary,
    refreshRecommendations,
  } = useAdaptiveLearningStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4" data-testid="adaptive-learning-page">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
        dark:border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500
              rounded-full flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Adaptive Learning
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {settings.enabled ? 'Learning from your patterns' : 'Disabled'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <span>{settings.algorithm} algorithm</span>
            <span>·</span>
            <span>{settings.adaptationSpeed} speed</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
        dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
        dark:border-gray-700 p-4 sm:p-6">
        {activeTab === 'overview' && (
          <OverviewTab
            vocabularyMetrics={vocabularyMetrics}
            predictionAccuracy={predictionAccuracy}
            sessionCount={sessionHistory.length}
            patternCount={sequentialPatterns.length}
            topSymbolCount={topSymbols.length}
            recommendationCount={recommendations.filter((r) => !r.dismissed).length}
            onRefreshVocab={refreshVocabulary}
            onRefreshRecs={refreshRecommendations}
          />
        )}
        {activeTab === 'vocabulary' && <VocabularyInsights />}
        {activeTab === 'patterns' && <PatternViewer />}
        {activeTab === 'sessions' && <LearningSessionPanel />}
        {activeTab === 'recommendations' && <RecommendationCards />}
        {activeTab === 'settings' && <AdaptiveLearningSettingsPanel />}
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({
  vocabularyMetrics,
  predictionAccuracy,
  sessionCount,
  patternCount,
  topSymbolCount,
  recommendationCount,
  onRefreshVocab,
  onRefreshRecs,
}: {
  vocabularyMetrics: { totalUniqueSymbols: number; activeVocabularySize: number; vocabularyDiversity: number; vocabularyGrowthRate: number };
  predictionAccuracy: number;
  sessionCount: number;
  patternCount: number;
  topSymbolCount: number;
  recommendationCount: number;
  onRefreshVocab: () => void;
  onRefreshRecs: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={onRefreshVocab}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600
              text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100
              dark:hover:bg-gray-700 transition-colors"
          >
            📊 Update Metrics
          </button>
          <button
            onClick={onRefreshRecs}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600
              text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100
              dark:hover:bg-gray-700 transition-colors"
          >
            💡 Get Tips
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon="📚" label="Vocabulary" value={vocabularyMetrics.totalUniqueSymbols} />
        <StatCard icon="🟢" label="Active" value={vocabularyMetrics.activeVocabularySize} />
        <StatCard icon="🎯" label="Accuracy" value={`${Math.round(predictionAccuracy * 100)}%`} />
        <StatCard icon="📋" label="Sessions" value={sessionCount} />
        <StatCard icon="🔗" label="Patterns" value={patternCount} />
        <StatCard icon="💡" label="Tips" value={recommendationCount} />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20
          dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
          <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">
            Vocabulary Health
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(vocabularyMetrics.vocabularyDiversity * 100)}%
            </span>
            <span className="text-sm text-blue-500 dark:text-blue-400 mb-1">
              diversity score
            </span>
          </div>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
            {vocabularyMetrics.vocabularyDiversity > 0.7
              ? '✅ Great diversity! You use a wide variety of symbols.'
              : vocabularyMetrics.vocabularyDiversity > 0.4
                ? '📈 Good diversity. Try exploring more categories.'
                : '💡 Consider using more varied symbols.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20
          dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
          <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">
            Growth Rate
          </h4>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              +{vocabularyMetrics.vocabularyGrowthRate}
            </span>
            <span className="text-sm text-green-500 dark:text-green-400 mb-1">
              new symbols/week
            </span>
          </div>
          <p className="text-xs text-green-500 dark:text-green-400 mt-2">
            {vocabularyMetrics.vocabularyGrowthRate > 5
              ? '🚀 Excellent growth! Keep exploring!'
              : vocabularyMetrics.vocabularyGrowthRate > 0
                ? '📈 Steady growth. Great progress!'
                : '💡 Try adding new symbols to your vocabulary.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
      <span className="text-xl">{icon}</span>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
