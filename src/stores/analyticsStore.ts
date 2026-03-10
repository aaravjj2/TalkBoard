/**
 * Analytics Zustand Store — State management for the analytics dashboard,
 * real-time tracking, goals, milestones, and report generation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ReportPeriod,
  DashboardState,
  Goal,
  GoalType,
  Milestone,
  CommunicationStats,
  SymbolUsageRecord,
  CategoryUsageRecord,
  SessionRecord,
  DailyActivity,
  WeeklyActivity,
  MonthlyActivity,
  ReportInsight,
  ChartData,
  PieChartData,
  HourlyDistribution,
  TimeSeriesDataPoint,
  CaregiverReport,
  ReportConfig,
} from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';

// ─── Store State ─────────────────────────────────────────────────────────────

interface AnalyticsState {
  // Dashboard state
  dashboard: DashboardState;

  // Period selection
  selectedPeriod: ReportPeriod;

  // Active session tracking
  isSessionActive: boolean;
  currentSessionId: string | null;

  // Cached chart data
  dailyUsageChart: ChartData | null;
  categoryDistributionChart: PieChartData | null;
  hourlyChart: ChartData | null;

  // Report generation
  isGeneratingReport: boolean;
  lastReport: CaregiverReport | null;

  // Notifications for new milestones
  newMilestones: Milestone[];
  showMilestoneNotification: boolean;
}

// ─── Store Actions ───────────────────────────────────────────────────────────

interface AnalyticsActions {
  // Dashboard actions
  loadDashboard: () => void;
  refreshDashboard: () => void;
  setSelectedPeriod: (period: ReportPeriod) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDashboardError: (error: string | null) => void;

  // Session actions
  beginSession: () => void;
  finishSession: () => void;

  // Stats access
  getCommunicationStats: () => CommunicationStats;
  getTopSymbols: (count?: number) => SymbolUsageRecord[];
  getCategoryUsage: () => CategoryUsageRecord[];
  getDailyActivity: () => DailyActivity[];
  getWeeklyActivity: () => WeeklyActivity[];
  getMonthlyActivity: () => MonthlyActivity[];
  getHourlyDistribution: () => HourlyDistribution[];
  getRecentSessions: (limit?: number) => SessionRecord[];
  getTimeSeriesData: (metric: 'symbols' | 'sentences' | 'sessions') => TimeSeriesDataPoint[];

  // Chart data
  loadChartData: () => void;
  getDailyUsageChart: () => ChartData;
  getCategoryDistributionChart: () => PieChartData;
  getHourlyChart: () => ChartData;

  // Goals
  getGoals: () => Goal[];
  addGoal: (type: GoalType, title: string, description: string, target: number) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  // Milestones
  getMilestones: () => Milestone[];
  checkMilestones: () => Milestone[];
  dismissMilestoneNotification: () => void;

  // Insights
  getInsights: () => ReportInsight[];
  getRecommendations: () => string[];

  // Reports
  generateReport: (period?: ReportPeriod) => CaregiverReport;
  exportCSV: (period?: ReportPeriod) => string;
  exportJSON: (period?: ReportPeriod) => string;

  // Reset
  clearAnalytics: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialDashboardState: DashboardState = {
  isLoading: false,
  error: null,
  selectedPeriod: 'week',
  communicationStats: null,
  topSymbols: [],
  categoryBreakdown: [],
  recentSessions: [],
  dailyActivity: [],
  weeklyActivity: [],
  goals: [],
  milestones: [],
  insights: [],
};

const initialState: AnalyticsState = {
  dashboard: initialDashboardState,
  selectedPeriod: 'week',
  isSessionActive: false,
  currentSessionId: null,
  dailyUsageChart: null,
  categoryDistributionChart: null,
  hourlyChart: null,
  isGeneratingReport: false,
  lastReport: null,
  newMilestones: [],
  showMilestoneNotification: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Dashboard ─────────────────────────────────────────────────────

      loadDashboard: () => {
        const period = get().selectedPeriod;
        set((state) => ({
          dashboard: { ...state.dashboard, isLoading: true, error: null },
        }));

        try {
          const stats = analyticsService.getCommunicationStats(period);
          const topSymbols = analyticsService.getTopSymbols(20);
          const categoryBreakdown = analyticsService.getCategoryUsage();
          const recentSessions = analyticsService.getRecentSessions(10);
          const dailyActivity = analyticsService.getDailyActivity(period);
          const weeklyActivity = analyticsService.getWeeklyActivity(period);
          const goals = analyticsService.getGoals();
          const milestones = analyticsService.getMilestones();
          const insights = analyticsService.generateInsights(stats, period);

          set({
            dashboard: {
              isLoading: false,
              error: null,
              selectedPeriod: period,
              communicationStats: stats,
              topSymbols,
              categoryBreakdown,
              recentSessions,
              dailyActivity,
              weeklyActivity,
              goals,
              milestones,
              insights,
            },
          });
        } catch (err) {
          set((state) => ({
            dashboard: {
              ...state.dashboard,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Failed to load analytics',
            },
          }));
        }
      },

      refreshDashboard: () => {
        get().loadDashboard();
        get().loadChartData();
      },

      setSelectedPeriod: (period) => {
        set({ selectedPeriod: period });
        get().loadDashboard();
        get().loadChartData();
      },

      setDashboardLoading: (loading) => {
        set((state) => ({
          dashboard: { ...state.dashboard, isLoading: loading },
        }));
      },

      setDashboardError: (error) => {
        set((state) => ({
          dashboard: { ...state.dashboard, error },
        }));
      },

      // ── Sessions ──────────────────────────────────────────────────────

      beginSession: () => {
        const sessionId = analyticsService.startSession();
        set({ isSessionActive: true, currentSessionId: sessionId });
      },

      finishSession: () => {
        analyticsService.endSession();
        set({ isSessionActive: false, currentSessionId: null });
      },

      // ── Stats ─────────────────────────────────────────────────────────

      getCommunicationStats: () => {
        return analyticsService.getCommunicationStats(get().selectedPeriod);
      },

      getTopSymbols: (count = 10) => {
        return analyticsService.getTopSymbols(count);
      },

      getCategoryUsage: () => {
        return analyticsService.getCategoryUsage();
      },

      getDailyActivity: () => {
        return analyticsService.getDailyActivity(get().selectedPeriod);
      },

      getWeeklyActivity: () => {
        return analyticsService.getWeeklyActivity(get().selectedPeriod);
      },

      getMonthlyActivity: () => {
        return analyticsService.getMonthlyActivity(get().selectedPeriod);
      },

      getHourlyDistribution: () => {
        return analyticsService.getHourlyDistribution();
      },

      getRecentSessions: (limit = 10) => {
        return analyticsService.getRecentSessions(limit);
      },

      getTimeSeriesData: (metric) => {
        return analyticsService.getTimeSeriesData(metric, get().selectedPeriod);
      },

      // ── Charts ────────────────────────────────────────────────────────

      loadChartData: () => {
        const period = get().selectedPeriod;
        const dailyUsageChart = analyticsService.getDailyUsageChartData(period);
        const categoryDistributionChart =
          analyticsService.getCategoryDistributionChartData();
        const hourlyChart = analyticsService.getHourlyChartData();

        set({
          dailyUsageChart,
          categoryDistributionChart,
          hourlyChart,
        });
      },

      getDailyUsageChart: () => {
        const cached = get().dailyUsageChart;
        if (cached) return cached;
        const chart = analyticsService.getDailyUsageChartData(
          get().selectedPeriod
        );
        set({ dailyUsageChart: chart });
        return chart;
      },

      getCategoryDistributionChart: () => {
        const cached = get().categoryDistributionChart;
        if (cached) return cached;
        const chart = analyticsService.getCategoryDistributionChartData();
        set({ categoryDistributionChart: chart });
        return chart;
      },

      getHourlyChart: () => {
        const cached = get().hourlyChart;
        if (cached) return cached;
        const chart = analyticsService.getHourlyChartData();
        set({ hourlyChart: chart });
        return chart;
      },

      // ── Goals ─────────────────────────────────────────────────────────

      getGoals: () => {
        return analyticsService.getGoals();
      },

      addGoal: (type, title, description, target) => {
        const goal = analyticsService.addGoal(type, title, description, target);
        get().loadDashboard();
        return goal;
      },

      updateGoal: (id, updates) => {
        analyticsService.updateGoal(id, updates);
        get().loadDashboard();
      },

      removeGoal: (id) => {
        analyticsService.removeGoal(id);
        get().loadDashboard();
      },

      // ── Milestones ────────────────────────────────────────────────────

      getMilestones: () => {
        return analyticsService.getMilestones();
      },

      checkMilestones: () => {
        const stats = analyticsService.getCommunicationStats();
        const newlyAchieved = analyticsService.checkAndUpdateMilestones(stats);

        if (newlyAchieved.length > 0) {
          set({
            newMilestones: newlyAchieved,
            showMilestoneNotification: true,
          });
        }

        return newlyAchieved;
      },

      dismissMilestoneNotification: () => {
        set({ showMilestoneNotification: false, newMilestones: [] });
      },

      // ── Insights ──────────────────────────────────────────────────────

      getInsights: () => {
        const stats = analyticsService.getCommunicationStats(
          get().selectedPeriod
        );
        return analyticsService.generateInsights(stats, get().selectedPeriod);
      },

      getRecommendations: () => {
        const stats = analyticsService.getCommunicationStats(
          get().selectedPeriod
        );
        return analyticsService.generateRecommendations(stats);
      },

      // ── Reports ───────────────────────────────────────────────────────

      generateReport: (period) => {
        const p = period || get().selectedPeriod;
        set({ isGeneratingReport: true });

        const config: ReportConfig = {
          period: p,
          startDate: '',
          endDate: new Date().toISOString(),
          includeCategories: true,
          includeSymbols: true,
          includeSessions: true,
          includeGoals: true,
          includeMilestones: true,
          format: 'detailed',
        };

        const report = analyticsService.generateCaregiverReport(config);
        set({ isGeneratingReport: false, lastReport: report });
        return report;
      },

      exportCSV: (period) => {
        return analyticsService.exportAnalyticsCSV(
          period || get().selectedPeriod
        );
      },

      exportJSON: (period) => {
        return analyticsService.exportAnalyticsJSON(
          period || get().selectedPeriod
        );
      },

      // ── Reset ─────────────────────────────────────────────────────────

      clearAnalytics: () => {
        analyticsService.clearAllAnalytics();
        set({
          ...initialState,
        });
      },
    }),
    {
      name: 'talkboard-analytics',
      partialize: (state) => ({
        selectedPeriod: state.selectedPeriod,
      }),
    }
  )
);
