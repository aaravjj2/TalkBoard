// ─── Data Visualization Page ─────────────────────────────────────────────────

import { useEffect } from 'react';
import { useVisualizationStore } from '../stores/visualizationStore';
import {
  StatGrid,
  ChartRenderer,
  HeatmapChart,
  ProgressGroup,
  DataTable,
  ActivityList,
  ReportBuilder,
  TimeRangeSelector,
} from '../components/Visualization';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'charts', label: 'Charts', icon: '📈' },
  { id: 'tables', label: 'Tables', icon: '📋' },
  { id: 'heatmap', label: 'Heatmap', icon: '🗺️' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'reports', label: 'Reports', icon: '📄' },
];

export default function DataVisualizationPage() {
  const {
    activeTab,
    setActiveTab,
    quickStats,
    dashboardWidgets,
    goalsProgress,
    topSymbolsTable,
    recentActivity,
    usageHeatmap,
    reports,
    activeReportId,
    setActiveReport,
    deleteReport,
    refreshReport,
    getChartData,
    exportChartCSV,
    initialize,
    error,
    clearError,
    lastRefreshed,
    refresh,
  } = useVisualizationStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const chartWidgets = dashboardWidgets.filter(w => w.type === 'chart' && w.chartConfig);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold">Data Visualization</h1>
        <p className="text-blue-100 text-sm mt-1">Charts, reports, and insights</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-sm">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 -mt-4">
        <div className="flex gap-1 overflow-x-auto bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="px-4 mt-4 flex items-center justify-between flex-wrap gap-2">
        <TimeRangeSelector />
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs text-gray-400">
              Updated {new Date(lastRefreshed).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-6">
        {/* ─── Dashboard Tab ──────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <StatGrid stats={quickStats} columns={quickStats.length > 4 ? 6 : 4} />

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chartWidgets.slice(0, 4).map(w => (
                <div
                  key={w.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4
                    ${w.gridColumn === 'span 2' ? 'lg:col-span-2' : ''}`}
                >
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{w.title}</h3>
                  {w.chartConfig && <ChartRenderer config={w.chartConfig} />}
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {topSymbolsTable && (
                <DataTable config={topSymbolsTable} title="Top Symbols" />
              )}
              {recentActivity && (
                <ActivityList config={recentActivity} title="Recent Activity" />
              )}
            </div>
          </>
        )}

        {/* ─── Charts Tab ─────────────────────────────────────────────── */}
        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { source: 'usage' as const, type: 'line' as const, title: 'Usage Trends' },
              { source: 'symbols' as const, type: 'pie' as const, title: 'Symbol Distribution' },
              { source: 'performance' as const, type: 'area' as const, title: 'Performance Metrics' },
              { source: 'input_modes' as const, type: 'donut' as const, title: 'Input Mode Usage' },
              { source: 'sessions' as const, type: 'bar' as const, title: 'Session Analysis' },
              { source: 'vocabulary' as const, type: 'line' as const, title: 'Vocabulary Growth' },
              { source: 'communication' as const, type: 'area' as const, title: 'Communication Trends' },
              { source: 'learning' as const, type: 'line' as const, title: 'Learning Progress' },
            ].map(chart => {
              const chartData = getChartData(chart.source);
              const config = {
                id: `chart-${chart.source}`,
                type: chart.type,
                title: chart.title,
                data: chartData,
                showLegend: true,
                showTooltip: true,
                showGrid: true,
                showLabels: true,
                showValues: chart.type === 'pie' || chart.type === 'donut',
                animate: true,
                interactive: true,
              };
              return (
                <div
                  key={chart.source}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{chart.title}</h3>
                    <button
                      onClick={() => {
                        const csv = exportChartCSV(chartData);
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${chart.source}-data.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      ⬇ Export
                    </button>
                  </div>
                  <ChartRenderer config={config} />
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Tables Tab ─────────────────────────────────────────────── */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            {topSymbolsTable && (
              <DataTable config={topSymbolsTable} title="Top Symbols" />
            )}
            {recentActivity && (
              <ActivityList config={recentActivity} title="Recent Activity" />
            )}
          </div>
        )}

        {/* ─── Heatmap Tab ────────────────────────────────────────────── */}
        {activeTab === 'heatmap' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <HeatmapChart
              data={usageHeatmap}
              title="Usage Activity Heatmap (Interactions by Day & Hour)"
            />
          </div>
        )}

        {/* ─── Goals Tab ──────────────────────────────────────────────── */}
        {activeTab === 'goals' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Goal Progress</h3>
            <ProgressGroup items={goalsProgress} />
          </div>
        )}

        {/* ─── Reports Tab ────────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Create Report</h3>
              <ReportBuilder />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Saved Reports ({reports.length})</h3>
              {reports.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <p className="text-gray-400">No reports yet. Create one to get started.</p>
                </div>
              )}
              {reports.map(report => (
                <div
                  key={report.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer transition-all
                    ${activeReportId === report.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                  onClick={() => setActiveReport(activeReportId === report.id ? null : report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{report.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{report.description || 'No description'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {report.dataSource} · {report.timeRange} · {report.widgets.length} widgets ·
                        Updated {new Date(report.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); refreshReport(report.id); }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded"
                        title="Refresh"
                      >
                        🔄
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expanded report view */}
                  {activeReportId === report.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {/* Stat widgets */}
                      {report.widgets.filter(w => w.type === 'stat' && w.statConfig).length > 0 && (
                        <StatGrid
                          stats={report.widgets
                            .filter(w => w.type === 'stat' && w.statConfig)
                            .map(w => w.statConfig!)}
                          columns={4}
                        />
                      )}

                      {/* Chart widgets */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {report.widgets
                          .filter(w => w.type === 'chart' && w.chartConfig)
                          .map(w => (
                            <div key={w.id}>
                              <h5 className="text-xs font-medium text-gray-500 mb-2">{w.title}</h5>
                              <ChartRenderer config={w.chartConfig!} />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
