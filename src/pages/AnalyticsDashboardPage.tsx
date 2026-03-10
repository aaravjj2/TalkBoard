/**
 * AnalyticsDashboardPage — Full analytics dashboard with stats, charts,
 * insights, milestones, goals, sessions, and export capabilities.
 */

import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import {
  StatCard,
  PeriodSelector,
  LineChart,
  DonutChart,
  BarChart,
  HeatMap,
  InsightCard,
  MilestoneCard,
  GoalCard,
  SessionList,
  TopSymbolsList,
  StreakDisplay,
  ReportExporter,
} from '@/components/analytics';
import type { CommunicationStats, DailyActivity, ReportPeriod } from '@/types/analytics';

type TabId = 'overview' | 'charts' | 'symbols' | 'sessions' | 'goals' | 'reports';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'charts', label: 'Charts', icon: '📈' },
  { id: 'symbols', label: 'Symbols', icon: '🔤' },
  { id: 'sessions', label: 'Sessions', icon: '⏱️' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'reports', label: 'Reports', icon: '📋' },
];

export default function AnalyticsDashboardPage() {
  const {
    dashboard,
    selectedPeriod,
    setSelectedPeriod,
    loadDashboard,
    loadChartData,
    getDailyUsageChart,
    getCategoryDistributionChart,
    getHourlyChart,
    getTopSymbols,
    getRecentSessions,
    getGoals,
    getMilestones,
    getInsights,
    getRecommendations,
    addGoal,
    updateGoal,
    removeGoal,
    exportCSV,
    exportJSON,
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadChartData();
  }, [loadDashboard, loadChartData]);

  const stats: CommunicationStats = dashboard.communicationStats || {
    totalSentencesGenerated: 0,
    totalSentencesSpoken: 0,
    totalSymbolsSelected: 0,
    totalSearches: 0,
    totalQuickPhrasesUsed: 0,
    averageSentenceLength: 0,
    averageSymbolsPerSentence: 0,
    longestSentence: '',
    shortestSentence: '',
    mostCommonSentencePattern: '',
    totalCommunicationTimeMs: 0,
    averageDailySymbols: 0,
    streakDays: 0,
    longestStreakDays: 0,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track communication progress and discover insights
          </p>
        </div>
        <PeriodSelector
          selected={selectedPeriod}
          onChange={setSelectedPeriod}
          compact
          periods={['day', 'week', 'month', 'quarter', 'year']}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg
              transition-colors border-b-2 whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {dashboard.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Error State */}
      {dashboard.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{dashboard.error}</p>
        </div>
      )}

      {/* Tab Content */}
      {!dashboard.isLoading && !dashboard.error && (
        <>
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              dailyActivity={dashboard.dailyActivity}
              insights={dashboard.insights}
              topSymbols={dashboard.topSymbols}
              milestones={dashboard.milestones}
            />
          )}
          {activeTab === 'charts' && (
            <ChartsTab
              getDailyUsageChart={getDailyUsageChart}
              getCategoryDistributionChart={getCategoryDistributionChart}
              getHourlyChart={getHourlyChart}
              dailyActivity={dashboard.dailyActivity}
              selectedPeriod={selectedPeriod}
            />
          )}
          {activeTab === 'symbols' && (
            <SymbolsTab
              topSymbols={getTopSymbols(20)}
              categoryBreakdown={dashboard.categoryBreakdown}
            />
          )}
          {activeTab === 'sessions' && (
            <SessionsTab sessions={getRecentSessions(20)} stats={stats} />
          )}
          {activeTab === 'goals' && (
            <GoalsTab
              goals={getGoals()}
              milestones={getMilestones()}
              stats={stats}
              onAddGoal={(type, title, desc, target) => addGoal(type, title, desc, target)}
              onUpdateGoal={updateGoal}
              onRemoveGoal={removeGoal}
              showAddGoal={showAddGoal}
              setShowAddGoal={setShowAddGoal}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsTab
              insights={getInsights()}
              recommendations={getRecommendations()}
              period={selectedPeriod}
              onExportCSV={exportCSV}
              onExportJSON={exportJSON}
              stats={stats}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
  dailyActivity,
  insights,
  topSymbols,
  milestones,
}: {
  stats: CommunicationStats;
  dailyActivity: DailyActivity[];
  insights: import('@/types/analytics').ReportInsight[];
  topSymbols: import('@/types/analytics').SymbolUsageRecord[];
  milestones: import('@/types/analytics').Milestone[];
}) {
  return (
    <div className="space-y-6">
      {/* Streak */}
      <StreakDisplay
        currentStreak={stats.streakDays}
        longestStreak={stats.longestStreakDays}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Sentences"
          value={stats.totalSentencesGenerated}
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Sentences Spoken"
          value={stats.totalSentencesSpoken}
          icon="🔊"
          color="green"
        />
        <StatCard
          title="Symbols Selected"
          value={stats.totalSymbolsSelected}
          icon="🔤"
          color="purple"
        />
        <StatCard
          title="Communication Time"
          value={stats.totalCommunicationTimeMs}
          icon="⏱️"
          color="orange"
          format="duration"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Avg Symbols/Sentence"
          value={stats.averageSymbolsPerSentence}
          icon="📏"
          color="teal"
          format="decimal"
          size="sm"
        />
        <StatCard
          title="Daily Average"
          value={stats.averageDailySymbols}
          icon="📅"
          color="indigo"
          format="decimal"
          size="sm"
        />
        <StatCard
          title="Searches"
          value={stats.totalSearches}
          icon="🔍"
          color="pink"
          size="sm"
        />
        <StatCard
          title="Quick Phrases"
          value={stats.totalQuickPhrasesUsed}
          icon="⚡"
          color="red"
          size="sm"
        />
      </div>

      {/* Insights & Top Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Insights
          </h2>
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
              Start using TalkBoard to see insights!
            </p>
          )}
        </div>

        {/* Top Symbols */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Most Used Symbols
          </h2>
          <TopSymbolsList symbols={topSymbols} maxItems={8} />
        </div>
      </div>

      {/* Activity Heat Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <HeatMap
          title="Activity Calendar"
          data={dailyActivity.map((d) => ({
            date: d.date,
            value: d.symbolSelections,
          }))}
          weeks={12}
          valueLabel="symbols"
        />
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Milestones
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {milestones.slice(0, 8).map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Charts Tab ──────────────────────────────────────────────────────────────

function ChartsTab({
  getDailyUsageChart,
  getCategoryDistributionChart,
  getHourlyChart,
  dailyActivity,
  selectedPeriod,
}: {
  getDailyUsageChart: () => import('@/types/analytics').ChartData;
  getCategoryDistributionChart: () => import('@/types/analytics').PieChartData;
  getHourlyChart: () => import('@/types/analytics').ChartData;
  dailyActivity: DailyActivity[];
  selectedPeriod: ReportPeriod;
}) {
  const dailyChart = getDailyUsageChart();
  const categoryChart = getCategoryDistributionChart();
  const hourlyChart = getHourlyChart();

  return (
    <div className="space-y-6">
      {/* Daily Usage Line Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <LineChart
          title="Daily Usage Trends"
          labels={dailyChart.labels}
          datasets={dailyChart.datasets.map((ds) => ({
            label: ds.label,
            data: ds.data,
            color: ds.borderColor as string || '#3B82F6',
            fill: ds.fill,
          }))}
          height={300}
          showGrid
          showDots
          showLegend
          yAxisLabel="Count"
        />
      </div>

      {/* Category Distribution + Hourly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex justify-center">
          <DonutChart
            title="Category Distribution"
            segments={categoryChart.segments.map((s) => ({
              label: s.label,
              value: s.value,
              color: s.color,
            }))}
            size={220}
            centerLabel="Total"
          />
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <BarChart
            title="Usage by Hour"
            data={hourlyChart.labels.map((label, i) => ({
              label,
              value: hourlyChart.datasets[0]?.data[i] || 0,
            }))}
            direction="vertical"
            height={220}
            colorScheme="blue"
          />
        </div>
      </div>

      {/* Weekly Summary Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <BarChart
          title="Daily Symbol Selections"
          data={dailyActivity.slice(-14).map((d) => ({
            label: new Date(d.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
            value: d.symbolSelections,
            tooltip: `${d.sentencesGenerated} sentences generated`,
          }))}
          direction="vertical"
          height={200}
          colorScheme="green"
        />
      </div>
    </div>
  );
}

// ─── Symbols Tab ─────────────────────────────────────────────────────────────

function SymbolsTab({
  topSymbols,
  categoryBreakdown,
}: {
  topSymbols: import('@/types/analytics').SymbolUsageRecord[];
  categoryBreakdown: import('@/types/analytics').CategoryUsageRecord[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Symbols Full List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Top 20 Symbols
          </h2>
          <TopSymbolsList symbols={topSymbols} maxItems={20} showCategory showLastUsed />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Category Usage
          </h2>
          <BarChart
            data={categoryBreakdown.map((cat) => ({
              label: cat.label,
              value: cat.totalSelections,
              tooltip: `Last used: ${new Date(cat.lastAccessedAt).toLocaleDateString()}`,
            }))}
            direction="horizontal"
            colorScheme="rainbow"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sessions Tab ────────────────────────────────────────────────────────────

function SessionsTab({
  sessions,
  stats,
}: {
  sessions: import('@/types/analytics').SessionRecord[];
  stats: CommunicationStats;
}) {
  return (
    <div className="space-y-6">
      {/* Session Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          icon="📱"
          color="blue"
          size="sm"
        />
        <StatCard
          title="Total Time"
          value={stats.totalCommunicationTimeMs}
          icon="⏱️"
          color="green"
          format="duration"
          size="sm"
        />
        <StatCard
          title="Avg Duration"
          value={sessions.length > 0 ? stats.totalCommunicationTimeMs / sessions.length : 0}
          icon="⏳"
          color="purple"
          format="duration"
          size="sm"
        />
        <StatCard
          title="Avg Symbols/Session"
          value={sessions.length > 0 ? stats.totalSymbolsSelected / sessions.length : 0}
          icon="🔤"
          color="orange"
          format="decimal"
          size="sm"
        />
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Recent Sessions
        </h2>
        <SessionList sessions={sessions} maxItems={20} showDetails />
      </div>
    </div>
  );
}

// ─── Goals Tab ───────────────────────────────────────────────────────────────

function GoalsTab({
  goals,
  milestones,
  stats,
  onAddGoal,
  onUpdateGoal,
  onRemoveGoal,
  showAddGoal,
  setShowAddGoal,
}: {
  goals: import('@/types/analytics').Goal[];
  milestones: import('@/types/analytics').Milestone[];
  stats: CommunicationStats;
  onAddGoal: (type: import('@/types/analytics').GoalType, title: string, desc: string, target: number) => void;
  onUpdateGoal: (id: string, updates: Partial<import('@/types/analytics').Goal>) => void;
  onRemoveGoal: (id: string) => void;
  showAddGoal: boolean;
  setShowAddGoal: (show: boolean) => void;
}) {
  const [goalType, setGoalType] = useState<import('@/types/analytics').GoalType>('daily_symbols');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);

  function handleAddGoal() {
    if (!goalTitle.trim()) return;
    onAddGoal(goalType, goalTitle.trim(), goalDesc.trim(), goalTarget);
    setGoalTitle('');
    setGoalDesc('');
    setGoalTarget(10);
    setShowAddGoal(false);
  }

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Goals
          </h2>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Goal Type
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as import('@/types/analytics').GoalType)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="daily_symbols">Daily Symbols</option>
                  <option value="daily_sentences">Daily Sentences</option>
                  <option value="weekly_sessions">Weekly Sessions</option>
                  <option value="streak_days">Streak Days</option>
                  <option value="categories_explored">Categories Explored</option>
                  <option value="unique_symbols">Unique Symbols</option>
                  <option value="vocabulary_growth">Vocabulary Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  min={1}
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Use 20 symbols daily"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!goalTitle.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

        {/* Goals list */}
        {goals.length > 0 ? (
          <div className="space-y-2">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={onUpdateGoal}
                onRemove={onRemoveGoal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <p className="text-lg mb-1">🎯</p>
            <p className="text-sm">Set your first communication goal!</p>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Milestones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              showProgress
              currentValue={getMilestoneProgress(milestone, stats)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getMilestoneProgress(
  milestone: import('@/types/analytics').Milestone,
  stats: CommunicationStats
): number {
  const metric = milestone.requirement.metric;
  switch (metric) {
    case 'totalSymbolsSelected':
      return stats.totalSymbolsSelected;
    case 'totalSentencesGenerated':
      return stats.totalSentencesGenerated;
    case 'totalSentencesSpoken':
      return stats.totalSentencesSpoken;
    case 'totalSearches':
      return stats.totalSearches;
    case 'totalQuickPhrasesUsed':
      return stats.totalQuickPhrasesUsed;
    case 'streakDays':
      return stats.streakDays;
    default:
      return 0;
  }
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────

function ReportsTab({
  insights,
  recommendations,
  period,
  onExportCSV,
  onExportJSON,
  stats,
}: {
  insights: import('@/types/analytics').ReportInsight[];
  recommendations: string[];
  period: ReportPeriod;
  onExportCSV: (period: ReportPeriod) => string;
  onExportJSON: (period: ReportPeriod) => string;
  stats: CommunicationStats;
}) {
  return (
    <div className="space-y-6">
      {/* Export */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Data
          </h2>
          <ReportExporter
            period={period}
            onExportCSV={onExportCSV}
            onExportJSON={onExportJSON}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Download your analytics data for sharing with caregivers or therapists.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Summary Report
        </h2>
        <div className="space-y-3">
          <SummaryRow label="Total sentences" value={stats.totalSentencesGenerated.toLocaleString()} />
          <SummaryRow label="Total spoken" value={stats.totalSentencesSpoken.toLocaleString()} />
          <SummaryRow label="Total symbols" value={stats.totalSymbolsSelected.toLocaleString()} />
          <SummaryRow label="Avg symbols/sentence" value={stats.averageSymbolsPerSentence.toFixed(1)} />
          <SummaryRow label="Daily average" value={stats.averageDailySymbols.toFixed(1)} />
          <SummaryRow label="Current streak" value={`${stats.streakDays} days`} />
          <SummaryRow label="Longest streak" value={`${stats.longestStreakDays} days`} />
          <SummaryRow label="Total searches" value={stats.totalSearches.toLocaleString()} />
          <SummaryRow label="Quick phrases used" value={stats.totalQuickPhrasesUsed.toLocaleString()} />
        </div>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Analysis
        </h2>
        {insights.length > 0 ? (
          <div className="space-y-2">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">
            More data needed for analysis.
          </p>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 Recommendations
          </h2>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-amber-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
