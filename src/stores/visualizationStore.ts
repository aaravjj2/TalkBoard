// ─── Data Visualization Store ────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Report,
  ReportTemplate,
  TimeRange,
  AggregationType,
  DataSourceType,
  DashboardWidget,
  StatConfig,
  ProgressConfig,
  ChartData,
  TableConfig,
  ListConfig,
} from '../types/visualization';
import { visualizationService } from '../services/visualizationService';

interface VisualizationState {
  // Data
  reports: Report[];
  templates: ReportTemplate[];
  dashboardWidgets: DashboardWidget[];
  quickStats: StatConfig[];
  goalsProgress: ProgressConfig[];
  topSymbolsTable: TableConfig | null;
  recentActivity: ListConfig | null;
  usageHeatmap: { day: string; hour: number; value: number }[];

  // UI State
  activeReportId: string | null;
  activeTab: string;
  timeRange: TimeRange;
  customDateRange: { start: string; end: string } | null;
  exportFormat: 'csv' | 'json';
  isLoading: boolean;
  lastRefreshed: string | null;
  error: string | null;
}

interface VisualizationActions {
  initialize: () => void;
  refresh: () => void;

  // Time range
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;

  // Reports
  createReport: (
    title: string,
    description: string,
    dataSource: DataSourceType,
    timeRange: TimeRange,
    aggregation?: AggregationType,
    customDateRange?: { start: string; end: string }
  ) => void;
  createReportFromTemplate: (templateId: string) => void;
  deleteReport: (id: string) => void;
  refreshReport: (id: string) => void;
  setActiveReport: (id: string | null) => void;

  // Chart data
  getChartData: (source: DataSourceType) => ChartData;

  // Export
  exportChartCSV: (data: ChartData) => string;
  exportChartJSON: (data: ChartData) => string;
  exportReportJSON: (reportId: string) => string | null;
  setExportFormat: (format: 'csv' | 'json') => void;

  // UI
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

export const useVisualizationStore = create<VisualizationState & VisualizationActions>()(
  persist(
    (set, get) => ({
      // ─── Initial State ─────────────────────────────────────────────────

      reports: [],
      templates: [],
      dashboardWidgets: [],
      quickStats: [],
      goalsProgress: [],
      topSymbolsTable: null,
      recentActivity: null,
      usageHeatmap: [],

      activeReportId: null,
      activeTab: 'dashboard',
      timeRange: 'week',
      customDateRange: null,
      exportFormat: 'csv',
      isLoading: false,
      lastRefreshed: null,
      error: null,

      // ─── Initialize ────────────────────────────────────────────────────

      initialize: () => {
        try {
          const { timeRange, customDateRange } = get();
          const reports = visualizationService.getReports();
          const templates = visualizationService.getTemplates();
          const dashboardWidgets = visualizationService.getDashboardOverview(timeRange, customDateRange);
          const quickStats = visualizationService.getQuickStats(timeRange, customDateRange);
          const goalsProgress = visualizationService.getGoalsProgress();
          const topSymbolsTable = visualizationService.getTopSymbolsTable();
          const recentActivity = visualizationService.getRecentActivityList();
          const usageHeatmap = visualizationService.getUsageHeatmap();

          set({
            reports,
            templates,
            dashboardWidgets,
            quickStats,
            goalsProgress,
            topSymbolsTable,
            recentActivity,
            usageHeatmap,
            lastRefreshed: new Date().toISOString(),
            error: null,
          });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Failed to initialize visualization' });
        }
      },

      refresh: () => {
        get().initialize();
      },

      // ─── Time Range ────────────────────────────────────────────────────

      setTimeRange: (range) => {
        set({ timeRange: range });
        get().refresh();
      },

      setCustomDateRange: (range) => {
        set({ customDateRange: range, timeRange: 'custom' });
        get().refresh();
      },

      // ─── Reports ──────────────────────────────────────────────────────

      createReport: (title, description, dataSource, timeRange, aggregation, customDateRange) => {
        try {
          const report = visualizationService.createReport(
            title, description, dataSource, timeRange,
            aggregation || 'sum', customDateRange
          );
          set({ reports: [...get().reports, report], activeReportId: report.id });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Failed to create report' });
        }
      },

      createReportFromTemplate: (templateId) => {
        try {
          const { timeRange, customDateRange } = get();
          const report = visualizationService.createReportFromTemplate(
            templateId, timeRange,
            customDateRange ? customDateRange : undefined
          );
          if (report) {
            set({ reports: [...get().reports, report], activeReportId: report.id });
          }
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Failed to create report from template' });
        }
      },

      deleteReport: (id) => {
        visualizationService.deleteReport(id);
        const { reports, activeReportId } = get();
        set({
          reports: reports.filter(r => r.id !== id),
          activeReportId: activeReportId === id ? null : activeReportId,
        });
      },

      refreshReport: (id) => {
        const updated = visualizationService.refreshReport(id);
        if (updated) {
          set({
            reports: get().reports.map(r => r.id === id ? updated : r),
          });
        }
      },

      setActiveReport: (id) => set({ activeReportId: id }),

      // ─── Chart Data ───────────────────────────────────────────────────

      getChartData: (source) => {
        const { timeRange, customDateRange } = get();
        return visualizationService.getChartData(source, timeRange, customDateRange);
      },

      // ─── Export ───────────────────────────────────────────────────────

      exportChartCSV: (data) => visualizationService.exportChartDataAsCSV(data),
      exportChartJSON: (data) => visualizationService.exportChartDataAsJSON(data),
      exportReportJSON: (reportId) => {
        const report = get().reports.find(r => r.id === reportId);
        return report ? visualizationService.exportReportAsJSON(report) : null;
      },
      setExportFormat: (format) => set({ exportFormat: format }),

      // ─── UI ───────────────────────────────────────────────────────────

      setActiveTab: (tab) => set({ activeTab: tab }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-visualization',
      partialize: (state) => ({
        activeTab: state.activeTab,
        timeRange: state.timeRange,
        exportFormat: state.exportFormat,
      }),
    }
  )
);
