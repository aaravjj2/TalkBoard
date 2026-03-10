/**
 * UsageReportViewer — Shows generated usage reports with charts and summaries.
 */
import { useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';

export default function UsageReportViewer() {
  const {
    currentReport,
    reportPeriod,
    isLoading,
    generateReport,
    setReportPeriod,
  } = useCaregiverStore();

  const handleGenerate = () => {
    generateReport(reportPeriod.start, reportPeriod.end);
  };

  // Find max values for chart scaling
  const maxDailyValues = useMemo(() => {
    if (!currentReport?.dailyUsage.length) return { sessions: 1, sentences: 1 };
    return {
      sessions: Math.max(1, ...currentReport.dailyUsage.map((d) => d.sessions)),
      sentences: Math.max(1, ...currentReport.dailyUsage.map((d) => d.sentences)),
    };
  }, [currentReport]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usage Reports</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyze communication patterns and progress
          </p>
        </div>
      </div>

      {/* Report Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={reportPeriod.start}
              onChange={(e) => setReportPeriod(e.target.value, reportPeriod.end)}
              className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={reportPeriod.end}
              onChange={(e) => setReportPeriod(reportPeriod.start, e.target.value)}
              className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
            />
          </div>
          {/* Quick select buttons */}
          <div className="flex gap-2">
            {[
              { label: '7 days', days: 7 },
              { label: '30 days', days: 30 },
              { label: '90 days', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => {
                  const end = new Date().toISOString().split('T')[0];
                  const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
                  setReportPeriod(start, end);
                }}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg
                  text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600
              disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      {!currentReport ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No report generated yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Select a date range and click &quot;Generate Report&quot;
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: currentReport.totalSessions, icon: '📱', color: 'from-blue-500 to-blue-600' },
              { label: 'Total Sentences', value: currentReport.totalSentences, icon: '💬', color: 'from-green-500 to-green-600' },
              { label: 'Symbols Used', value: currentReport.totalSymbolSelections, icon: '🔤', color: 'from-purple-500 to-purple-600' },
              { label: 'Unique Symbols', value: currentReport.uniqueSymbolsUsed, icon: '✨', color: 'from-amber-500 to-amber-600' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Averages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-blue-500">{currentReport.averageSessionDuration}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Session (min)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-green-500">{currentReport.averageSentenceLength.toFixed(1)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Sentence Length</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-purple-500">{currentReport.totalDuration}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Duration (min)</p>
            </div>
          </div>

          {/* Daily Usage Chart */}
          {currentReport.dailyUsage.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Daily Usage</h4>
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 min-w-[400px] h-40">
                  {currentReport.dailyUsage.map((day) => {
                    const sessionHeight = (day.sessions / maxDailyValues.sessions) * 100;
                    const sentenceHeight = (day.sentences / maxDailyValues.sentences) * 100;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${day.date}: ${day.sessions} sessions, ${day.sentences} sentences`}>
                        <div className="w-full flex gap-0.5 items-end h-32">
                          <div
                            className="flex-1 bg-blue-400 dark:bg-blue-500 rounded-t"
                            style={{ height: `${Math.max(2, sessionHeight)}%` }}
                          />
                          <div
                            className="flex-1 bg-green-400 dark:bg-green-500 rounded-t"
                            style={{ height: `${Math.max(2, sentenceHeight)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 -rotate-45 whitespace-nowrap origin-top-left translate-y-1">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6 justify-center text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Sentences</span>
                </div>
              </div>
            </div>
          )}

          {/* Top Symbols & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Symbols */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Top Symbols</h4>
              {currentReport.topSymbols.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data</p>
              ) : (
                <div className="space-y-3">
                  {currentReport.topSymbols.map((sym, i) => {
                    const maxCount = currentReport.topSymbols[0]?.count || 1;
                    const width = (sym.count / maxCount) * 100;
                    return (
                      <div key={sym.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                            {sym.label}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">{sym.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Top Categories</h4>
              {currentReport.topCategories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data</p>
              ) : (
                <div className="space-y-3">
                  {currentReport.topCategories.map((cat, i) => {
                    const maxCount = currentReport.topCategories[0]?.count || 1;
                    const width = (cat.count / maxCount) * 100;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                            {cat.label}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">{cat.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Goal Progress */}
          {currentReport.goalProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Goal Progress</h4>
              <div className="space-y-3">
                {currentReport.goalProgress.map((gp) => {
                  const progress = gp.target > 0 ? (gp.progress / gp.target) * 100 : 0;
                  return (
                    <div key={gp.goalId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{gp.title}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {gp.progress}/{gp.target} ({Math.round(progress)}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Communication Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Communication Trends</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {currentReport.communicationTrends.vocabularyGrowth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vocabulary Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {currentReport.communicationTrends.sentenceLengthTrend >= 0 ? '+' : ''}
                  {currentReport.communicationTrends.sentenceLengthTrend.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sentence Length Trend</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">
                  {currentReport.communicationTrends.usageFrequencyTrend >= 0 ? '+' : ''}
                  {currentReport.communicationTrends.usageFrequencyTrend.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usage Frequency Trend</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
