/**
 * Unit tests for the analytics service
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackEvent,
  getEvents,
  clearEvents,
  trackSymbolUsage,
  trackSymbolCoOccurrences,
  getSymbolUsage,
  getTopSymbols,
  getSymbolUsageByCategory,
  trackCategoryAccess,
  getCategoryUsage,
  startSession,
  endSession,
  getCurrentSession,
  updateCurrentSession,
  getSessions,
  getRecentSessions,
  getCommunicationStats,
  getDailyActivity,
  getWeeklyActivity,
  getMonthlyActivity,
  getHourlyDistribution,
  getGoals,
  addGoal,
  updateGoal,
  removeGoal,
  getMilestones,
  checkAndUpdateMilestones,
  generateInsights,
  generateRecommendations,
  getDailyUsageChartData,
  getCategoryDistributionChartData,
  getHourlyChartData,
  getTimeSeriesData,
  generateCaregiverReport,
  exportAnalyticsCSV,
  exportAnalyticsJSON,
  clearAllAnalytics,
} from '@/services/analyticsService';
import type { AACSymbol } from '@/types';

const mockSymbol: AACSymbol = {
  id: 'test-symbol-1',
  label: 'Hello',
  emoji: '👋',
  category: 'greetings',
  keywords: ['hello', 'hi'],
  order: 1,
};

const mockSymbol2: AACSymbol = {
  id: 'test-symbol-2',
  label: 'Want',
  emoji: '👉',
  category: 'actions',
  keywords: ['want', 'need'],
  order: 2,
};

describe('analyticsService', () => {
  beforeEach(() => {
    clearAllAnalytics();
    localStorage.clear();
  });

  // ── Event Tracking ──────────────────────────────────────────────────

  describe('event tracking', () => {
    it('should track an event', () => {
      trackEvent('symbol_selected', { symbolId: 'test' });
      const events = getEvents();
      expect(events.length).toBeGreaterThanOrEqual(1);
      const symbolEvents = events.filter(e => e.type === 'symbol_selected');
      expect(symbolEvents.length).toBe(1);
      expect(symbolEvents[0].data?.symbolId).toBe('test');
    });

    it('should track multiple events', () => {
      trackEvent('symbol_selected');
      trackEvent('sentence_generated');
      trackEvent('sentence_spoken');
      const events = getEvents();
      const types = events.map(e => e.type);
      expect(types).toContain('symbol_selected');
      expect(types).toContain('sentence_generated');
      expect(types).toContain('sentence_spoken');
    });

    it('should filter events by type', () => {
      trackEvent('symbol_selected');
      trackEvent('sentence_generated');
      trackEvent('symbol_selected');
      const filtered = getEvents({ type: 'symbol_selected' });
      expect(filtered.length).toBe(2);
    });

    it('should clear events', () => {
      trackEvent('symbol_selected');
      trackEvent('sentence_generated');
      clearEvents();
      const events = getEvents();
      expect(events.filter(e => e.type === 'symbol_selected').length).toBe(0);
    });

    it('should assign session id to events', () => {
      trackEvent('symbol_selected');
      const events = getEvents();
      const symbolEvent = events.find(e => e.type === 'symbol_selected');
      expect(symbolEvent?.sessionId).toBeTruthy();
    });
  });

  // ── Symbol Usage ────────────────────────────────────────────────────

  describe('symbol usage tracking', () => {
    it('should track symbol usage', () => {
      trackSymbolUsage(mockSymbol, 0);
      const usage = getSymbolUsage();
      const symbolRecord = usage.find(u => u.symbolId === mockSymbol.id);
      expect(symbolRecord).toBeTruthy();
      expect(symbolRecord!.totalUses).toBe(1);
      expect(symbolRecord!.label).toBe('Hello');
    });

    it('should increment usage count', () => {
      trackSymbolUsage(mockSymbol, 0);
      trackSymbolUsage(mockSymbol, 1);
      trackSymbolUsage(mockSymbol, 2);
      const usage = getSymbolUsage();
      const record = usage.find(u => u.symbolId === mockSymbol.id);
      expect(record!.totalUses).toBe(3);
    });

    it('should track co-occurrences', () => {
      trackSymbolUsage(mockSymbol, 0);
      trackSymbolUsage(mockSymbol2, 1);
      trackSymbolCoOccurrences([mockSymbol.id, mockSymbol2.id]);
      const usage = getSymbolUsage();
      const record = usage.find(u => u.symbolId === mockSymbol.id);
      expect(record!.coOccurrences[mockSymbol2.id]).toBe(1);
    });

    it('should return top symbols sorted by usage', () => {
      trackSymbolUsage(mockSymbol, 0);
      trackSymbolUsage(mockSymbol, 1);
      trackSymbolUsage(mockSymbol2, 0);
      const top = getTopSymbols(5);
      expect(top[0].symbolId).toBe(mockSymbol.id);
      expect(top[0].totalUses).toBe(2);
    });

    it('should get usage by category', () => {
      trackSymbolUsage(mockSymbol, 0);
      trackSymbolUsage(mockSymbol, 1);
      const byCategory = getSymbolUsageByCategory();
      expect(byCategory['greetings']).toBe(2);
    });
  });

  // ── Category Usage ──────────────────────────────────────────────────

  describe('category usage tracking', () => {
    it('should track category access', () => {
      trackCategoryAccess('greetings');
      const usage = getCategoryUsage();
      const record = usage.find(u => u.categoryId === 'greetings');
      expect(record).toBeTruthy();
      expect(record!.totalSelections).toBe(1);
    });

    it('should increment category selections', () => {
      trackCategoryAccess('actions');
      trackCategoryAccess('actions');
      trackCategoryAccess('actions');
      const usage = getCategoryUsage();
      const record = usage.find(u => u.categoryId === 'actions');
      expect(record!.totalSelections).toBe(3);
    });
  });

  // ── Session Management ──────────────────────────────────────────────

  describe('session management', () => {
    it('should start a session', () => {
      const sessionId = startSession();
      expect(sessionId).toBeTruthy();
      const current = getCurrentSession();
      expect(current).toBeTruthy();
      expect(current!.id).toBe(sessionId);
    });

    it('should end a session', () => {
      startSession();
      endSession();
      const sessions = getSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });

    it('should record session duration', () => {
      startSession();
      // Small delay simulated by ending immediately
      endSession();
      const sessions = getSessions();
      const last = sessions[sessions.length - 1];
      expect(last.endedAt).toBeTruthy();
      expect(last.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should update current session', () => {
      startSession();
      updateCurrentSession({ symbolsSelected: 5, sentencesGenerated: 2 });
      const current = getCurrentSession();
      expect(current!.symbolsSelected).toBe(5);
      expect(current!.sentencesGenerated).toBe(2);
    });

    it('should get recent sessions', () => {
      startSession();
      endSession();
      startSession();
      endSession();
      const recent = getRecentSessions(5);
      expect(recent.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Communication Stats ─────────────────────────────────────────────

  describe('communication stats', () => {
    it('should return stats with zero values initially', () => {
      const stats = getCommunicationStats();
      expect(stats.totalSentencesGenerated).toBe(0);
      expect(stats.totalSymbolsSelected).toBe(0);
      expect(stats.averageDailySymbols).toBeDefined();
    });

    it('should count events in stats', () => {
      trackEvent('symbol_selected');
      trackEvent('symbol_selected');
      trackEvent('sentence_generated', { symbolCount: 3 });
      const stats = getCommunicationStats();
      expect(stats.totalSymbolsSelected).toBe(2);
      expect(stats.totalSentencesGenerated).toBe(1);
    });
  });

  // ── Daily Activity ──────────────────────────────────────────────────

  describe('daily activity', () => {
    it('should return daily activity array', () => {
      const activity = getDailyActivity('week');
      expect(Array.isArray(activity)).toBe(true);
      expect(activity.length).toBeGreaterThan(0);
    });

    it('should return weekly activity', () => {
      const weekly = getWeeklyActivity('month');
      expect(Array.isArray(weekly)).toBe(true);
    });

    it('should return monthly activity', () => {
      const monthly = getMonthlyActivity('year');
      expect(Array.isArray(monthly)).toBe(true);
    });

    it('should return hourly distribution', () => {
      const hourly = getHourlyDistribution();
      expect(hourly.length).toBe(24);
      expect(hourly[0]).toHaveProperty('hour');
      expect(hourly[0]).toHaveProperty('count');
      expect(hourly[0]).toHaveProperty('percentage');
    });
  });

  // ── Goals ───────────────────────────────────────────────────────────

  describe('goals', () => {
    it('should add a goal', () => {
      const goal = addGoal('daily_symbols', 'Use 10 symbols', 'Use 10 symbols daily', 10);
      expect(goal.id).toBeTruthy();
      expect(goal.title).toBe('Use 10 symbols');
      expect(goal.targetValue).toBe(10);
    });

    it('should get goals', () => {
      addGoal('daily_symbols', 'Goal 1', 'desc', 10);
      addGoal('streak_days', 'Goal 2', 'desc', 7);
      const goals = getGoals();
      expect(goals.length).toBe(2);
    });

    it('should update a goal', () => {
      const goal = addGoal('daily_symbols', 'Goal', 'desc', 10);
      updateGoal(goal.id, { currentValue: 5 });
      const goals = getGoals();
      const updated = goals.find(g => g.id === goal.id);
      expect(updated!.currentValue).toBe(5);
    });

    it('should remove a goal', () => {
      const goal = addGoal('daily_symbols', 'Goal', 'desc', 10);
      removeGoal(goal.id);
      const goals = getGoals();
      expect(goals.find(g => g.id === goal.id)).toBeUndefined();
    });
  });

  // ── Milestones ──────────────────────────────────────────────────────

  describe('milestones', () => {
    it('should return milestones', () => {
      const milestones = getMilestones();
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones[0]).toHaveProperty('id');
      expect(milestones[0]).toHaveProperty('title');
      expect(milestones[0]).toHaveProperty('requirement');
    });

    it('should check milestones against stats', () => {
      const stats = getCommunicationStats();
      const achieved = checkAndUpdateMilestones(stats);
      expect(Array.isArray(achieved)).toBe(true);
    });
  });

  // ── Insights ────────────────────────────────────────────────────────

  describe('insights', () => {
    it('should generate insights', () => {
      const stats = getCommunicationStats();
      const insights = generateInsights(stats, 'week');
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should generate recommendations', () => {
      const stats = getCommunicationStats();
      const recs = generateRecommendations(stats);
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });
  });

  // ── Chart Data ──────────────────────────────────────────────────────

  describe('chart data', () => {
    it('should generate daily usage chart', () => {
      const chart = getDailyUsageChartData('week');
      expect(chart).toHaveProperty('labels');
      expect(chart).toHaveProperty('datasets');
      expect(chart.datasets.length).toBe(2);
    });

    it('should generate category distribution chart', () => {
      trackCategoryAccess('greetings');
      trackCategoryAccess('actions');
      const chart = getCategoryDistributionChartData();
      expect(chart).toHaveProperty('segments');
      expect(chart).toHaveProperty('total');
    });

    it('should generate hourly chart', () => {
      const chart = getHourlyChartData();
      expect(chart.labels.length).toBe(24);
      expect(chart.datasets.length).toBe(1);
    });

    it('should generate time series data', () => {
      const data = getTimeSeriesData('symbols', 'week');
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('value');
    });
  });

  // ── Reports ─────────────────────────────────────────────────────────

  describe('reports', () => {
    it('should generate caregiver report', () => {
      const report = generateCaregiverReport({
        period: 'week',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        includeCategories: true,
        includeSymbols: true,
        includeSessions: true,
        includeGoals: true,
        includeMilestones: true,
        format: 'detailed',
      });
      expect(report).toHaveProperty('communicationStats');
      expect(report).toHaveProperty('topSymbols');
      expect(report).toHaveProperty('insights');
      expect(report).toHaveProperty('recommendations');
    });

    it('should export CSV', () => {
      const csv = exportAnalyticsCSV('week');
      expect(typeof csv).toBe('string');
      expect(csv).toContain('Date');
      expect(csv).toContain('Symbols Selected');
    });

    it('should export JSON', () => {
      const json = exportAnalyticsJSON('week');
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('communicationStats');
    });
  });

  // ── Reset ───────────────────────────────────────────────────────────

  describe('reset', () => {
    it('should clear all analytics', () => {
      trackEvent('symbol_selected');
      trackSymbolUsage(mockSymbol, 0);
      addGoal('daily_symbols', 'Goal', 'desc', 10);
      clearAllAnalytics();
      expect(getEvents().length).toBe(0);
      expect(getSymbolUsage().length).toBe(0);
      expect(getGoals().length).toBe(0);
    });
  });
});
