/**
 * Unit tests for the analytics Zustand store
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { clearAllAnalytics, trackEvent, trackSymbolUsage, trackCategoryAccess } from '@/services/analyticsService';
import type { AACSymbol } from '@/types';

const mockSymbol: AACSymbol = {
  id: 'test-sym',
  label: 'Go',
  emoji: '🚀',
  category: 'actions',
  keywords: ['go'],
  order: 1,
};

describe('analyticsStore', () => {
  beforeEach(() => {
    clearAllAnalytics();
    localStorage.clear();
    // Reset the store
    useAnalyticsStore.setState({
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
    });
  });

  // ── Period ──────────────────────────────────────────────────────────

  describe('period selection', () => {
    it('should default to week', () => {
      const period = useAnalyticsStore.getState().selectedPeriod;
      expect(period).toBe('week');
    });

    it('should change period', () => {
      useAnalyticsStore.getState().setSelectedPeriod('month');
      expect(useAnalyticsStore.getState().selectedPeriod).toBe('month');
    });
  });

  // ── Dashboard ───────────────────────────────────────────────────────

  describe('dashboard', () => {
    it('should load dashboard without error', () => {
      useAnalyticsStore.getState().loadDashboard();
      const { dashboard } = useAnalyticsStore.getState();
      expect(dashboard.isLoading).toBe(false);
      expect(dashboard.error).toBeNull();
    });

    it('should populate dashboard data', () => {
      trackEvent('symbol_selected');
      trackCategoryAccess('greetings');
      useAnalyticsStore.getState().loadDashboard();
      const { dashboard } = useAnalyticsStore.getState();
      expect(dashboard.communicationStats).toBeTruthy();
      expect(dashboard.communicationStats!.totalSymbolsSelected).toBe(1);
    });

    it('should refresh dashboard', () => {
      useAnalyticsStore.getState().refreshDashboard();
      const { dashboard } = useAnalyticsStore.getState();
      expect(dashboard.isLoading).toBe(false);
    });

    it('should set dashboard loading', () => {
      useAnalyticsStore.getState().setDashboardLoading(true);
      expect(useAnalyticsStore.getState().dashboard.isLoading).toBe(true);
    });

    it('should set dashboard error', () => {
      useAnalyticsStore.getState().setDashboardError('Test error');
      expect(useAnalyticsStore.getState().dashboard.error).toBe('Test error');
    });
  });

  // ── Sessions ────────────────────────────────────────────────────────

  describe('sessions', () => {
    it('should begin a session', () => {
      useAnalyticsStore.getState().beginSession();
      const state = useAnalyticsStore.getState();
      expect(state.isSessionActive).toBe(true);
      expect(state.currentSessionId).toBeTruthy();
    });

    it('should finish a session', () => {
      useAnalyticsStore.getState().beginSession();
      useAnalyticsStore.getState().finishSession();
      const state = useAnalyticsStore.getState();
      expect(state.isSessionActive).toBe(false);
      expect(state.currentSessionId).toBeNull();
    });

    it('should get recent sessions', () => {
      useAnalyticsStore.getState().beginSession();
      useAnalyticsStore.getState().finishSession();
      const sessions = useAnalyticsStore.getState().getRecentSessions(5);
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Stats ───────────────────────────────────────────────────────────

  describe('stats', () => {
    it('should get communication stats', () => {
      const stats = useAnalyticsStore.getState().getCommunicationStats();
      expect(stats).toHaveProperty('totalSymbolsSelected');
      expect(stats).toHaveProperty('totalSentencesGenerated');
    });

    it('should get top symbols', () => {
      trackSymbolUsage(mockSymbol, 0);
      const top = useAnalyticsStore.getState().getTopSymbols(5);
      expect(top.length).toBe(1);
      expect(top[0].symbolId).toBe('test-sym');
    });

    it('should get category usage', () => {
      trackCategoryAccess('actions');
      const usage = useAnalyticsStore.getState().getCategoryUsage();
      expect(usage.find(u => u.categoryId === 'actions')).toBeTruthy();
    });

    it('should get daily activity', () => {
      const activity = useAnalyticsStore.getState().getDailyActivity();
      expect(Array.isArray(activity)).toBe(true);
    });

    it('should get weekly activity', () => {
      const weekly = useAnalyticsStore.getState().getWeeklyActivity();
      expect(Array.isArray(weekly)).toBe(true);
    });

    it('should get monthly activity', () => {
      const monthly = useAnalyticsStore.getState().getMonthlyActivity();
      expect(Array.isArray(monthly)).toBe(true);
    });

    it('should get hourly distribution', () => {
      const hourly = useAnalyticsStore.getState().getHourlyDistribution();
      expect(hourly.length).toBe(24);
    });

    it('should get time series data', () => {
      const data = useAnalyticsStore.getState().getTimeSeriesData('symbols');
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // ── Charts ──────────────────────────────────────────────────────────

  describe('charts', () => {
    it('should load chart data', () => {
      useAnalyticsStore.getState().loadChartData();
      const state = useAnalyticsStore.getState();
      expect(state.dailyUsageChart).toBeTruthy();
      expect(state.categoryDistributionChart).toBeTruthy();
      expect(state.hourlyChart).toBeTruthy();
    });

    it('should get daily usage chart with caching', () => {
      const chart = useAnalyticsStore.getState().getDailyUsageChart();
      expect(chart).toHaveProperty('labels');
      expect(chart).toHaveProperty('datasets');
      // Call again to test cache hit
      const chart2 = useAnalyticsStore.getState().getDailyUsageChart();
      expect(chart2).toEqual(chart);
    });

    it('should get category distribution chart', () => {
      const chart = useAnalyticsStore.getState().getCategoryDistributionChart();
      expect(chart).toHaveProperty('segments');
      expect(chart).toHaveProperty('total');
    });

    it('should get hourly chart', () => {
      const chart = useAnalyticsStore.getState().getHourlyChart();
      expect(chart.labels.length).toBe(24);
    });
  });

  // ── Goals ───────────────────────────────────────────────────────────

  describe('goals', () => {
    it('should add a goal', () => {
      const goal = useAnalyticsStore.getState().addGoal(
        'daily_symbols', 'Test Goal', 'Test desc', 10
      );
      expect(goal.id).toBeTruthy();
      expect(goal.title).toBe('Test Goal');
    });

    it('should get goals', () => {
      useAnalyticsStore.getState().addGoal('daily_symbols', 'G1', 'd', 10);
      useAnalyticsStore.getState().addGoal('streak_days', 'G2', 'd', 7);
      const goals = useAnalyticsStore.getState().getGoals();
      expect(goals.length).toBe(2);
    });

    it('should update a goal', () => {
      const goal = useAnalyticsStore.getState().addGoal(
        'daily_symbols', 'G', 'd', 10
      );
      useAnalyticsStore.getState().updateGoal(goal.id, { currentValue: 5 });
      const goals = useAnalyticsStore.getState().getGoals();
      const updated = goals.find(g => g.id === goal.id);
      expect(updated!.currentValue).toBe(5);
    });

    it('should remove a goal', () => {
      const goal = useAnalyticsStore.getState().addGoal(
        'daily_symbols', 'G', 'd', 10
      );
      useAnalyticsStore.getState().removeGoal(goal.id);
      const goals = useAnalyticsStore.getState().getGoals();
      expect(goals.find(g => g.id === goal.id)).toBeUndefined();
    });
  });

  // ── Milestones ──────────────────────────────────────────────────────

  describe('milestones', () => {
    it('should get milestones', () => {
      const milestones = useAnalyticsStore.getState().getMilestones();
      expect(milestones.length).toBeGreaterThan(0);
    });

    it('should check milestones', () => {
      const achieved = useAnalyticsStore.getState().checkMilestones();
      expect(Array.isArray(achieved)).toBe(true);
    });

    it('should dismiss milestone notification', () => {
      useAnalyticsStore.setState({
        showMilestoneNotification: true,
        newMilestones: [{ id: 'test', title: 'T', description: 'D', icon: '🏆', requirement: 1, progress: 1, achieved: true }],
      });
      useAnalyticsStore.getState().dismissMilestoneNotification();
      expect(useAnalyticsStore.getState().showMilestoneNotification).toBe(false);
      expect(useAnalyticsStore.getState().newMilestones.length).toBe(0);
    });
  });

  // ── Insights ────────────────────────────────────────────────────────

  describe('insights', () => {
    it('should get insights', () => {
      const insights = useAnalyticsStore.getState().getInsights();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should get recommendations', () => {
      const recs = useAnalyticsStore.getState().getRecommendations();
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });
  });

  // ── Reports ─────────────────────────────────────────────────────────

  describe('reports', () => {
    it('should generate a report', () => {
      const report = useAnalyticsStore.getState().generateReport();
      expect(report).toHaveProperty('communicationStats');
      expect(report).toHaveProperty('topSymbols');
      expect(useAnalyticsStore.getState().isGeneratingReport).toBe(false);
      expect(useAnalyticsStore.getState().lastReport).toBeTruthy();
    });

    it('should export CSV', () => {
      const csv = useAnalyticsStore.getState().exportCSV();
      expect(typeof csv).toBe('string');
      expect(csv).toContain('Date');
    });

    it('should export JSON', () => {
      const json = useAnalyticsStore.getState().exportJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('communicationStats');
    });
  });

  // ── Reset ───────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should clear all analytics data', () => {
      trackEvent('symbol_selected');
      useAnalyticsStore.getState().addGoal('daily_symbols', 'G', 'd', 10);
      useAnalyticsStore.getState().clearAnalytics();
      const goals = useAnalyticsStore.getState().getGoals();
      expect(goals.length).toBe(0);
    });
  });
});
