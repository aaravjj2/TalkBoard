/**
 * Analytics Service — Comprehensive usage tracking, statistics computation,
 * reporting, and insight generation for the TalkBoard AAC application.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  SymbolUsageRecord,
  CategoryUsageRecord,
  SessionRecord,
  DeviceInfo,
  CommunicationStats,
  DailyActivity,
  WeeklyActivity,
  MonthlyActivity,
  HourlyDistribution,
  TimeSeriesDataPoint,
  Goal,
  GoalType,
  Milestone,
  CaregiverReport,
  ReportInsight,
  ReportPeriod,
  ReportConfig,
  ChartData,
  PieChartData,
  PieSegment,
  ExportOptions,
  CSVRow,
} from '@/types/analytics';
import type { SymbolCategoryId, AACSymbol } from '@/types';
import { CATEGORIES, getCategoryColor } from '@/data/categories';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const ANALYTICS_KEYS = {
  EVENTS: 'talkboard_analytics_events',
  SYMBOL_USAGE: 'talkboard_analytics_symbol_usage',
  CATEGORY_USAGE: 'talkboard_analytics_category_usage',
  SESSIONS: 'talkboard_analytics_sessions',
  CURRENT_SESSION: 'talkboard_analytics_current_session',
  GOALS: 'talkboard_analytics_goals',
  MILESTONES: 'talkboard_analytics_milestones',
  DAILY_ACTIVITY: 'talkboard_analytics_daily_activity',
} as const;

const MAX_EVENTS = 10000;
const MAX_SESSIONS = 500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getISOWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function getDateRange(period: ReportPeriod): { start: string; end: string } {
  const end = getToday();
  const endDate = new Date(end);
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(endDate);
      break;
    case 'week':
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date('2024-01-01');
      break;
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end,
  };
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Analytics storage write failed:', err);
  }
}

// ─── Device Info ─────────────────────────────────────────────────────────────

function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    language: navigator.language,
    online: navigator.onLine,
  };
}

// ─── Event Tracking ──────────────────────────────────────────────────────────

let currentSessionId: string | null = null;

function ensureSession(): string {
  if (!currentSessionId) {
    currentSessionId = startSession();
  }
  return currentSessionId;
}

export function trackEvent(
  type: AnalyticsEventType,
  data?: Record<string, unknown>
): void {
  const sessionId = ensureSession();
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type,
    timestamp: new Date().toISOString(),
    sessionId,
    data,
  };

  const events = loadFromStorage<AnalyticsEvent[]>(ANALYTICS_KEYS.EVENTS, []);
  events.push(event);

  // Keep only recent events
  const trimmed = events.slice(-MAX_EVENTS);
  saveToStorage(ANALYTICS_KEYS.EVENTS, trimmed);

  // Update real-time aggregates
  updateAggregatesOnEvent(event);
}

export function getEvents(
  filter?: Partial<{ type: AnalyticsEventType; from: string; to: string }>
): AnalyticsEvent[] {
  let events = loadFromStorage<AnalyticsEvent[]>(ANALYTICS_KEYS.EVENTS, []);

  if (filter?.type) {
    events = events.filter((e) => e.type === filter.type);
  }
  if (filter?.from) {
    const from = filter.from;
    events = events.filter((e) => e.timestamp >= from);
  }
  if (filter?.to) {
    const to = filter.to;
    events = events.filter((e) => e.timestamp <= to);
  }

  return events;
}

export function clearEvents(): void {
  saveToStorage(ANALYTICS_KEYS.EVENTS, []);
}

// ─── Symbol Usage Tracking ───────────────────────────────────────────────────

export function trackSymbolUsage(symbol: AACSymbol, position: number): void {
  const records = loadFromStorage<Record<string, SymbolUsageRecord>>(
    ANALYTICS_KEYS.SYMBOL_USAGE,
    {}
  );

  const today = getToday();
  const hour = new Date().getHours();

  if (records[symbol.id]) {
    const record = records[symbol.id];
    record.totalUses += 1;
    record.lastUsedAt = new Date().toISOString();
    record.usageByDay[today] = (record.usageByDay[today] || 0) + 1;
    record.usageByHour[hour] = (record.usageByHour[hour] || 0) + 1;
    record.averagePositionInSentence =
      (record.averagePositionInSentence * (record.totalUses - 1) + position) /
      record.totalUses;
  } else {
    const usageByHour = new Array(24).fill(0);
    usageByHour[hour] = 1;

    records[symbol.id] = {
      symbolId: symbol.id,
      label: symbol.label,
      emoji: symbol.emoji,
      category: symbol.category,
      totalUses: 1,
      lastUsedAt: new Date().toISOString(),
      firstUsedAt: new Date().toISOString(),
      usageByDay: { [today]: 1 },
      usageByHour,
      averagePositionInSentence: position,
      coOccurrences: {},
    };
  }

  saveToStorage(ANALYTICS_KEYS.SYMBOL_USAGE, records);
}

export function trackSymbolCoOccurrences(symbolIds: string[]): void {
  const records = loadFromStorage<Record<string, SymbolUsageRecord>>(
    ANALYTICS_KEYS.SYMBOL_USAGE,
    {}
  );

  for (let i = 0; i < symbolIds.length; i++) {
    for (let j = 0; j < symbolIds.length; j++) {
      if (i !== j && records[symbolIds[i]]) {
        const record = records[symbolIds[i]];
        record.coOccurrences[symbolIds[j]] =
          (record.coOccurrences[symbolIds[j]] || 0) + 1;
      }
    }
  }

  saveToStorage(ANALYTICS_KEYS.SYMBOL_USAGE, records);
}

export function getSymbolUsage(): SymbolUsageRecord[] {
  const records = loadFromStorage<Record<string, SymbolUsageRecord>>(
    ANALYTICS_KEYS.SYMBOL_USAGE,
    {}
  );
  return Object.values(records).sort((a, b) => b.totalUses - a.totalUses);
}

export function getTopSymbols(limit: number = 10): SymbolUsageRecord[] {
  return getSymbolUsage().slice(0, limit);
}

export function getSymbolUsageByCategory(): Record<SymbolCategoryId, number> {
  const usage = getSymbolUsage();
  const result: Record<string, number> = {};
  usage.forEach((record) => {
    result[record.category] = (result[record.category] || 0) + record.totalUses;
  });
  return result as Record<SymbolCategoryId, number>;
}

// ─── Category Usage Tracking ─────────────────────────────────────────────────

export function trackCategoryAccess(categoryId: SymbolCategoryId): void {
  const records = loadFromStorage<Record<string, CategoryUsageRecord>>(
    ANALYTICS_KEYS.CATEGORY_USAGE,
    {}
  );

  const today = getToday();
  const cat = CATEGORIES.find((c) => c.id === categoryId);

  if (records[categoryId]) {
    records[categoryId].totalSelections += 1;
    records[categoryId].lastAccessedAt = new Date().toISOString();
    records[categoryId].usageByDay[today] =
      (records[categoryId].usageByDay[today] || 0) + 1;
  } else {
    records[categoryId] = {
      categoryId,
      label: cat?.label || categoryId,
      totalSelections: 1,
      totalTimeSpentMs: 0,
      uniqueSymbolsUsed: 0,
      totalSymbolsAvailable: 0,
      lastAccessedAt: new Date().toISOString(),
      usageByDay: { [today]: 1 },
    };
  }

  saveToStorage(ANALYTICS_KEYS.CATEGORY_USAGE, records);
}

export function getCategoryUsage(): CategoryUsageRecord[] {
  const records = loadFromStorage<Record<string, CategoryUsageRecord>>(
    ANALYTICS_KEYS.CATEGORY_USAGE,
    {}
  );
  return Object.values(records).sort(
    (a, b) => b.totalSelections - a.totalSelections
  );
}

// ─── Session Management ──────────────────────────────────────────────────────

export function startSession(): string {
  const sessionId = uuidv4();
  currentSessionId = sessionId;

  const session: SessionRecord = {
    id: sessionId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMs: 0,
    symbolsSelected: 0,
    sentencesGenerated: 0,
    sentencesSpoken: 0,
    categoriesVisited: [],
    searchQueries: 0,
    quickPhrasesUsed: 0,
    errorsEncountered: 0,
    deviceInfo: getDeviceInfo(),
  };

  saveToStorage(ANALYTICS_KEYS.CURRENT_SESSION, session);

  trackEvent('session_started', { sessionId });

  return sessionId;
}

export function endSession(): void {
  const session = loadFromStorage<SessionRecord | null>(
    ANALYTICS_KEYS.CURRENT_SESSION,
    null
  );

  if (session) {
    session.endedAt = new Date().toISOString();
    session.durationMs =
      new Date(session.endedAt).getTime() -
      new Date(session.startedAt).getTime();

    // Save to sessions history
    const sessions = loadFromStorage<SessionRecord[]>(
      ANALYTICS_KEYS.SESSIONS,
      []
    );
    sessions.push(session);
    saveToStorage(
      ANALYTICS_KEYS.SESSIONS,
      sessions.slice(-MAX_SESSIONS)
    );

    trackEvent('session_ended', {
      sessionId: session.id,
      durationMs: session.durationMs,
    });
  }

  currentSessionId = null;
  saveToStorage(ANALYTICS_KEYS.CURRENT_SESSION, null);
}

export function updateCurrentSession(
  updates: Partial<SessionRecord>
): void {
  const session = loadFromStorage<SessionRecord | null>(
    ANALYTICS_KEYS.CURRENT_SESSION,
    null
  );

  if (session) {
    Object.assign(session, updates);
    saveToStorage(ANALYTICS_KEYS.CURRENT_SESSION, session);
  }
}

export function getCurrentSession(): SessionRecord | null {
  return loadFromStorage<SessionRecord | null>(
    ANALYTICS_KEYS.CURRENT_SESSION,
    null
  );
}

export function getSessions(period?: ReportPeriod): SessionRecord[] {
  let sessions = loadFromStorage<SessionRecord[]>(
    ANALYTICS_KEYS.SESSIONS,
    []
  );

  if (period) {
    const range = getDateRange(period);
    sessions = sessions.filter(
      (s) => s.startedAt >= range.start && s.startedAt <= range.end + 'T23:59:59'
    );
  }

  return sessions;
}

export function getRecentSessions(limit: number = 10): SessionRecord[] {
  const sessions = loadFromStorage<SessionRecord[]>(
    ANALYTICS_KEYS.SESSIONS,
    []
  );
  return sessions.slice(-limit).reverse();
}

// ─── Real-time Aggregate Updates ─────────────────────────────────────────────

function updateAggregatesOnEvent(event: AnalyticsEvent): void {
  const today = getToday();
  const activities = loadFromStorage<Record<string, DailyActivity>>(
    ANALYTICS_KEYS.DAILY_ACTIVITY,
    {}
  );

  if (!activities[today]) {
    activities[today] = {
      date: today,
      symbolSelections: 0,
      sentencesGenerated: 0,
      sentencesSpoken: 0,
      sessionCount: 0,
      totalDurationMs: 0,
      uniqueCategories: 0,
      uniqueSymbols: 0,
    };
  }

  const activity = activities[today];

  switch (event.type) {
    case 'symbol_selected':
      activity.symbolSelections += 1;
      break;
    case 'sentence_generated':
      activity.sentencesGenerated += 1;
      break;
    case 'sentence_spoken':
      activity.sentencesSpoken += 1;
      break;
    case 'session_started':
      activity.sessionCount += 1;
      break;
    case 'category_changed':
      activity.uniqueCategories += 1;
      break;
  }

  saveToStorage(ANALYTICS_KEYS.DAILY_ACTIVITY, activities);
}

// ─── Communication Stats ─────────────────────────────────────────────────────

export function getCommunicationStats(
  period: ReportPeriod = 'all'
): CommunicationStats {
  const events = getEvents();
  const range = getDateRange(period);

  const filtered = events.filter(
    (e) => e.timestamp >= range.start && e.timestamp <= range.end + 'T23:59:59'
  );

  const sentenceEvents = filtered.filter(
    (e) => e.type === 'sentence_generated'
  );
  const spokenEvents = filtered.filter((e) => e.type === 'sentence_spoken');
  const symbolEvents = filtered.filter((e) => e.type === 'symbol_selected');
  const searchEvents = filtered.filter((e) => e.type === 'search_performed');
  const phraseEvents = filtered.filter((e) => e.type === 'quick_phrase_used');

  const sentenceLengths = sentenceEvents
    .map((e) => (e.data?.symbolCount as number) || 0)
    .filter((l) => l > 0);

  const sessions = getSessions(period);
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationMs, 0);

  // Calculate streaks
  const activities = loadFromStorage<Record<string, DailyActivity>>(
    ANALYTICS_KEYS.DAILY_ACTIVITY,
    {}
  );
  const { currentStreak, longestStreak } = calculateStreaks(activities);

  const daysInPeriod = Math.max(1, daysBetween(range.start, range.end));

  return {
    totalSentencesGenerated: sentenceEvents.length,
    totalSentencesSpoken: spokenEvents.length,
    totalSymbolsSelected: symbolEvents.length,
    totalSearches: searchEvents.length,
    totalQuickPhrasesUsed: phraseEvents.length,
    averageSentenceLength:
      sentenceLengths.length > 0
        ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
        : 0,
    averageSymbolsPerSentence:
      sentenceEvents.length > 0
        ? symbolEvents.length / sentenceEvents.length
        : 0,
    longestSentence:
      (sentenceEvents.find(
        (e) =>
          (e.data?.symbolCount as number) ===
          Math.max(...sentenceLengths, 0)
      )?.data?.sentence as string) || '',
    shortestSentence:
      sentenceLengths.length > 0
        ? ((sentenceEvents.find(
            (e) =>
              (e.data?.symbolCount as number) ===
              Math.min(...sentenceLengths)
          )?.data?.sentence as string) || '')
        : '',
    mostCommonSentencePattern: '',
    totalCommunicationTimeMs: totalDuration,
    averageDailySymbols: symbolEvents.length / daysInPeriod,
    streakDays: currentStreak,
    longestStreakDays: longestStreak,
  };
}

function calculateStreaks(activities: Record<string, DailyActivity>): {
  currentStreak: number;
  longestStreak: number;
} {
  const dates = Object.keys(activities).sort();
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff = daysBetween(dates[i - 1], dates[i]);
    if (diff === 1) {
      tempStreak += 1;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if today continues the streak
  const today = getToday();
  const lastDate = dates[dates.length - 1];
  const diffFromToday = daysBetween(lastDate, today);

  if (diffFromToday <= 1) {
    currentStreak = tempStreak;
  }

  return { currentStreak, longestStreak };
}

// ─── Daily Activity ──────────────────────────────────────────────────────────

export function getDailyActivity(
  period: ReportPeriod = 'month'
): DailyActivity[] {
  const activities = loadFromStorage<Record<string, DailyActivity>>(
    ANALYTICS_KEYS.DAILY_ACTIVITY,
    {}
  );

  const range = getDateRange(period);
  const result: DailyActivity[] = [];
  const current = new Date(range.start);
  const end = new Date(range.end);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push(
      activities[dateStr] || {
        date: dateStr,
        symbolSelections: 0,
        sentencesGenerated: 0,
        sentencesSpoken: 0,
        sessionCount: 0,
        totalDurationMs: 0,
        uniqueCategories: 0,
        uniqueSymbols: 0,
      }
    );
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function getWeeklyActivity(
  period: ReportPeriod = 'quarter'
): WeeklyActivity[] {
  const daily = getDailyActivity(period);
  const weeks: Record<string, DailyActivity[]> = {};

  daily.forEach((day) => {
    const weekStart = getISOWeekStart(new Date(day.date));
    if (!weeks[weekStart]) weeks[weekStart] = [];
    weeks[weekStart].push(day);
  });

  const result: WeeklyActivity[] = [];
  const weekStarts = Object.keys(weeks).sort();

  weekStarts.forEach((weekStart, index) => {
    const days = weeks[weekStart];
    const totalSymbols = days.reduce(
      (sum, d) => sum + d.symbolSelections,
      0
    );
    const totalSentences = days.reduce(
      (sum, d) => sum + d.sentencesGenerated,
      0
    );
    const totalSessions = days.reduce((sum, d) => sum + d.sessionCount, 0);

    const mostActiveDay = days.reduce(
      (max, d) => (d.symbolSelections > max.symbolSelections ? d : max),
      days[0]
    );

    const prevWeek = index > 0 ? weekStarts[index - 1] : null;
    const prevTotal = prevWeek
      ? weeks[prevWeek].reduce((sum, d) => sum + d.symbolSelections, 0)
      : 0;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    result.push({
      weekStart,
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalSymbols,
      totalSentences,
      totalSessions,
      averageDailyUsage: totalSymbols / Math.max(1, days.length),
      mostActiveDay: mostActiveDay.date,
      improvementFromLastWeek:
        prevTotal > 0
          ? ((totalSymbols - prevTotal) / prevTotal) * 100
          : 0,
    });
  });

  return result;
}

export function getMonthlyActivity(
  period: ReportPeriod = 'year'
): MonthlyActivity[] {
  const daily = getDailyActivity(period);
  const months: Record<string, DailyActivity[]> = {};

  daily.forEach((day) => {
    const monthKey = getMonthKey(new Date(day.date));
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(day);
  });

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, days]) => {
      const activeDays = days.filter((d) => d.symbolSelections > 0);
      const uniqueCats = new Set<SymbolCategoryId>();
      days.forEach((d) => {
        if (d.uniqueCategories > 0) {
          // Would need actual category tracking per day
        }
      });

      return {
        month,
        totalSymbols: days.reduce((sum, d) => sum + d.symbolSelections, 0),
        totalSentences: days.reduce(
          (sum, d) => sum + d.sentencesGenerated,
          0
        ),
        totalSessions: days.reduce((sum, d) => sum + d.sessionCount, 0),
        activeDays: activeDays.length,
        averageDailyUsage:
          activeDays.length > 0
            ? days.reduce((sum, d) => sum + d.symbolSelections, 0) /
              activeDays.length
            : 0,
        newSymbolsDiscovered: 0,
        topCategories: Array.from(uniqueCats),
      };
    });
}

// ─── Hourly Distribution ─────────────────────────────────────────────────────

export function getHourlyDistribution(): HourlyDistribution[] {
  const symbolUsage = getSymbolUsage();
  const hourCounts = new Array(24).fill(0);

  symbolUsage.forEach((record) => {
    record.usageByHour.forEach((count, hour) => {
      hourCounts[hour] += count;
    });
  });

  const total = hourCounts.reduce((a: number, b: number) => a + b, 0);

  return hourCounts.map((count: number, hour: number) => ({
    hour,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

// ─── Goals & Milestones ──────────────────────────────────────────────────────

const DEFAULT_MILESTONES: Omit<Milestone, 'achievedAt'>[] = [
  {
    id: 'first-symbol',
    title: 'First Symbol',
    description: 'Selected your first symbol',
    icon: '⭐',
    requirement: { metric: 'totalSymbolsSelected', threshold: 1 },
  },
  {
    id: 'first-sentence',
    title: 'First Sentence',
    description: 'Generated your first sentence',
    icon: '💬',
    requirement: { metric: 'totalSentencesGenerated', threshold: 1 },
  },
  {
    id: 'first-speech',
    title: 'Finding Your Voice',
    description: 'Spoke your first sentence aloud',
    icon: '🔊',
    requirement: { metric: 'totalSentencesSpoken', threshold: 1 },
  },
  {
    id: 'ten-sentences',
    title: 'Conversation Starter',
    description: 'Generated 10 sentences',
    icon: '🗣️',
    requirement: { metric: 'totalSentencesGenerated', threshold: 10 },
  },
  {
    id: 'fifty-symbols',
    title: 'Symbol Explorer',
    description: 'Selected 50 symbols',
    icon: '🔍',
    requirement: { metric: 'totalSymbolsSelected', threshold: 50 },
  },
  {
    id: 'hundred-symbols',
    title: 'Power Communicator',
    description: 'Selected 100 symbols',
    icon: '💪',
    requirement: { metric: 'totalSymbolsSelected', threshold: 100 },
  },
  {
    id: 'five-hundred-symbols',
    title: 'Communication Champion',
    description: 'Selected 500 symbols',
    icon: '🏆',
    requirement: { metric: 'totalSymbolsSelected', threshold: 500 },
  },
  {
    id: 'thousand-symbols',
    title: 'Symbol Master',
    description: 'Selected 1000 symbols',
    icon: '👑',
    requirement: { metric: 'totalSymbolsSelected', threshold: 1000 },
  },
  {
    id: 'three-day-streak',
    title: 'Getting Started',
    description: '3-day usage streak',
    icon: '🔥',
    requirement: { metric: 'streakDays', threshold: 3 },
  },
  {
    id: 'seven-day-streak',
    title: 'Weekly Warrior',
    description: '7-day usage streak',
    icon: '🌟',
    requirement: { metric: 'streakDays', threshold: 7 },
  },
  {
    id: 'thirty-day-streak',
    title: 'Monthly Master',
    description: '30-day usage streak',
    icon: '🎯',
    requirement: { metric: 'streakDays', threshold: 30 },
  },
  {
    id: 'all-categories',
    title: 'Category Explorer',
    description: 'Visited all symbol categories',
    icon: '🗺️',
    requirement: { metric: 'categoriesExplored', threshold: 10 },
  },
  {
    id: 'first-search',
    title: 'Searcher',
    description: 'Used search for the first time',
    icon: '🔎',
    requirement: { metric: 'totalSearches', threshold: 1 },
  },
  {
    id: 'first-quick-phrase',
    title: 'Quick Communicator',
    description: 'Used a quick phrase',
    icon: '⚡',
    requirement: { metric: 'totalQuickPhrasesUsed', threshold: 1 },
  },
];

export function getGoals(): Goal[] {
  return loadFromStorage<Goal[]>(ANALYTICS_KEYS.GOALS, []);
}

export function addGoal(
  type: GoalType,
  title: string,
  description: string,
  targetValue: number
): Goal {
  const goal: Goal = {
    id: uuidv4(),
    type,
    title,
    description,
    targetValue,
    currentValue: 0,
    startDate: new Date().toISOString(),
    endDate: null,
    completedAt: null,
    isActive: true,
  };

  const goals = getGoals();
  goals.push(goal);
  saveToStorage(ANALYTICS_KEYS.GOALS, goals);

  return goal;
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index !== -1) {
    Object.assign(goals[index], updates);
    saveToStorage(ANALYTICS_KEYS.GOALS, goals);
  }
}

export function removeGoal(id: string): void {
  const goals = getGoals().filter((g) => g.id !== id);
  saveToStorage(ANALYTICS_KEYS.GOALS, goals);
}

export function getMilestones(): Milestone[] {
  const saved = loadFromStorage<Milestone[]>(ANALYTICS_KEYS.MILESTONES, []);

  if (saved.length === 0) {
    const initial: Milestone[] = DEFAULT_MILESTONES.map((m) => ({
      ...m,
      achievedAt: null,
    }));
    saveToStorage(ANALYTICS_KEYS.MILESTONES, initial);
    return initial;
  }

  return saved;
}

export function checkAndUpdateMilestones(
  stats: CommunicationStats
): Milestone[] {
  const milestones = getMilestones();
  const updated: Milestone[] = [];

  milestones.forEach((milestone) => {
    if (milestone.achievedAt) return;

    const metric = milestone.requirement.metric;
    const threshold = milestone.requirement.threshold;
    let currentValue = 0;

    switch (metric) {
      case 'totalSymbolsSelected':
        currentValue = stats.totalSymbolsSelected;
        break;
      case 'totalSentencesGenerated':
        currentValue = stats.totalSentencesGenerated;
        break;
      case 'totalSentencesSpoken':
        currentValue = stats.totalSentencesSpoken;
        break;
      case 'totalSearches':
        currentValue = stats.totalSearches;
        break;
      case 'totalQuickPhrasesUsed':
        currentValue = stats.totalQuickPhrasesUsed;
        break;
      case 'streakDays':
        currentValue = stats.streakDays;
        break;
      case 'categoriesExplored':
        currentValue = getCategoryUsage().length;
        break;
    }

    if (currentValue >= threshold) {
      milestone.achievedAt = new Date().toISOString();
      updated.push(milestone);
    }
  });

  if (updated.length > 0) {
    saveToStorage(ANALYTICS_KEYS.MILESTONES, milestones);
  }

  return updated;
}

// ─── Insights Generation ─────────────────────────────────────────────────────

export function generateInsights(
  stats: CommunicationStats,
  period: ReportPeriod = 'week'
): ReportInsight[] {
  const insights: ReportInsight[] = [];

  // Usage frequency insight
  if (stats.totalSymbolsSelected > 0) {
    const avgDaily = stats.averageDailySymbols;
    if (avgDaily >= 20) {
      insights.push({
        id: 'high-usage',
        type: 'positive',
        icon: '🌟',
        title: 'Active Communicator',
        description: `Averaging ${Math.round(avgDaily)} symbols per day. Great engagement!`,
        metric: 'averageDailySymbols',
        value: avgDaily,
        trend: 'up',
      });
    } else if (avgDaily >= 5) {
      insights.push({
        id: 'moderate-usage',
        type: 'neutral',
        icon: '📊',
        title: 'Steady Usage',
        description: `Averaging ${Math.round(avgDaily)} symbols per day.`,
        metric: 'averageDailySymbols',
        value: avgDaily,
        trend: 'stable',
      });
    } else {
      insights.push({
        id: 'low-usage',
        type: 'suggestion',
        icon: '💡',
        title: 'Room to Grow',
        description: 'Try using TalkBoard more throughout the day for better communication practice.',
        metric: 'averageDailySymbols',
        value: avgDaily,
        trend: 'down',
      });
    }
  }

  // Streak insight
  if (stats.streakDays >= 7) {
    insights.push({
      id: 'great-streak',
      type: 'positive',
      icon: '🔥',
      title: `${stats.streakDays}-Day Streak!`,
      description: 'Consistent daily usage is key to communication growth.',
      metric: 'streakDays',
      value: stats.streakDays,
    });
  }

  // Vocabulary breadth
  const symbolUsage = getSymbolUsage();
  const uniqueSymbols = symbolUsage.length;
  if (uniqueSymbols >= 50) {
    insights.push({
      id: 'broad-vocab',
      type: 'positive',
      icon: '📚',
      title: 'Growing Vocabulary',
      description: `Using ${uniqueSymbols} unique symbols. Great diversity!`,
      metric: 'uniqueSymbols',
      value: uniqueSymbols,
    });
  }

  // Category exploration
  const catUsage = getCategoryUsage();
  if (catUsage.length >= 8) {
    insights.push({
      id: 'category-explorer',
      type: 'positive',
      icon: '🗺️',
      title: 'Exploring All Categories',
      description: `Using ${catUsage.length} out of 10 categories.`,
      metric: 'categoriesExplored',
      value: catUsage.length,
    });
  } else if (catUsage.length <= 3) {
    insights.push({
      id: 'limited-categories',
      type: 'suggestion',
      icon: '🎯',
      title: 'Try New Categories',
      description: 'Exploring more symbol categories can enhance communication.',
      metric: 'categoriesExplored',
      value: catUsage.length,
    });
  }

  // Sentence complexity
  if (stats.averageSymbolsPerSentence >= 3) {
    insights.push({
      id: 'complex-sentences',
      type: 'positive',
      icon: '📝',
      title: 'Complex Sentences',
      description: `Average of ${stats.averageSymbolsPerSentence.toFixed(1)} symbols per sentence. Building more detailed expressions!`,
      metric: 'averageSymbolsPerSentence',
      value: stats.averageSymbolsPerSentence,
    });
  }

  // Top symbol
  if (symbolUsage.length > 0) {
    const top = symbolUsage[0];
    insights.push({
      id: 'favorite-symbol',
      type: 'neutral',
      icon: top.emoji,
      title: 'Most Used Symbol',
      description: `"${top.label}" has been used ${top.totalUses} times.`,
      metric: 'topSymbol',
      value: top.totalUses,
    });
  }

  return insights;
}

export function generateRecommendations(
  stats: CommunicationStats
): string[] {
  const recommendations: string[] = [];

  if (stats.totalSymbolsSelected === 0) {
    recommendations.push(
      'Start by tapping symbols to build your first sentence!'
    );
  }

  if (stats.totalSentencesSpoken < stats.totalSentencesGenerated * 0.5) {
    recommendations.push(
      'Try speaking your sentences aloud using the Speak button.'
    );
  }

  if (stats.totalSearches === 0) {
    recommendations.push(
      'Use the search bar to quickly find the symbol you need.'
    );
  }

  if (stats.totalQuickPhrasesUsed === 0) {
    recommendations.push(
      'Save frequently used sentences as Quick Phrases for faster communication.'
    );
  }

  if (stats.averageSymbolsPerSentence < 2 && stats.totalSentencesGenerated > 5) {
    recommendations.push(
      'Try combining more symbols to create longer, richer sentences.'
    );
  }

  if (getCategoryUsage().length < 5) {
    recommendations.push(
      'Explore more symbol categories to expand your vocabulary.'
    );
  }

  return recommendations;
}

// ─── Chart Data Generation ───────────────────────────────────────────────────

export function getDailyUsageChartData(
  period: ReportPeriod = 'month'
): ChartData {
  const daily = getDailyActivity(period);

  return {
    labels: daily.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Symbols Selected',
        data: daily.map((d) => d.symbolSelections),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Sentences Generated',
        data: daily.map((d) => d.sentencesGenerated),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

export function getCategoryDistributionChartData(): PieChartData {
  const catUsage = getCategoryUsage();
  const totalSelections = catUsage.reduce(
    (sum, c) => sum + c.totalSelections,
    0
  );

  const segments: PieSegment[] = catUsage.map((cat) => ({
    label: cat.label,
    value: cat.totalSelections,
    percentage:
      totalSelections > 0
        ? (cat.totalSelections / totalSelections) * 100
        : 0,
    color: getCategoryColor(cat.categoryId),
  }));

  return { segments, total: totalSelections };
}

export function getHourlyChartData(): ChartData {
  const hourly = getHourlyDistribution();

  return {
    labels: hourly.map((h) => {
      const ampm = h.hour >= 12 ? 'PM' : 'AM';
      const hour12 = h.hour % 12 || 12;
      return `${hour12}${ampm}`;
    }),
    datasets: [
      {
        label: 'Symbol Selections',
        data: hourly.map((h) => h.count),
        backgroundColor: hourly.map((h) => {
          // Color intensity based on count
          const max = Math.max(...hourly.map((x) => x.count), 1);
          const intensity = Math.round((h.count / max) * 200 + 55);
          return `rgba(59, 130, 246, ${intensity / 255})`;
        }),
        borderWidth: 1,
      },
    ],
  };
}

export function getTimeSeriesData(
  metric: 'symbols' | 'sentences' | 'sessions',
  period: ReportPeriod = 'month'
): TimeSeriesDataPoint[] {
  const daily = getDailyActivity(period);

  return daily.map((d) => ({
    date: d.date,
    value:
      metric === 'symbols'
        ? d.symbolSelections
        : metric === 'sentences'
        ? d.sentencesGenerated
        : d.sessionCount,
    label: new Date(d.date).toLocaleDateString(),
  }));
}

// ─── Full Report Generation ──────────────────────────────────────────────────

export function generateCaregiverReport(
  config: ReportConfig
): CaregiverReport {
  const stats = getCommunicationStats(config.period);
  const topSymbols = getTopSymbols(20);
  const catBreakdown = getCategoryUsage();
  const daily = getDailyActivity(config.period);
  const sessions = getSessions(config.period);
  const goals = getGoals();
  const milestones = getMilestones();
  const insights = generateInsights(stats, config.period);
  const recommendations = generateRecommendations(stats);

  return {
    generatedAt: new Date().toISOString(),
    period: config.period,
    startDate: config.startDate,
    endDate: config.endDate,
    communicationStats: stats,
    topSymbols,
    categoryBreakdown: catBreakdown,
    dailyActivity: daily,
    sessions,
    goals,
    milestones,
    insights,
    recommendations,
  };
}

// ─── Data Export ─────────────────────────────────────────────────────────────

export function exportAnalyticsCSV(
  period: ReportPeriod = 'all'
): string {
  const daily = getDailyActivity(period);

  const headers = [
    'Date',
    'Symbols Selected',
    'Sentences Generated',
    'Sentences Spoken',
    'Sessions',
    'Duration (min)',
  ];

  const rows = daily.map((d) => [
    d.date,
    String(d.symbolSelections),
    String(d.sentencesGenerated),
    String(d.sentencesSpoken),
    String(d.sessionCount),
    String(Math.round(d.totalDurationMs / 60000)),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportAnalyticsJSON(
  period: ReportPeriod = 'all'
): string {
  const config: ReportConfig = {
    period,
    startDate: getDateRange(period).start,
    endDate: getDateRange(period).end,
    includeCategories: true,
    includeSymbols: true,
    includeSessions: true,
    includeGoals: true,
    includeMilestones: true,
    format: 'export',
  };

  const report = generateCaregiverReport(config);
  return JSON.stringify(report, null, 2);
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function clearAllAnalytics(): void {
  Object.values(ANALYTICS_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  currentSessionId = null;
}

// ─── Service Export ──────────────────────────────────────────────────────────

export const analyticsService = {
  // Events
  trackEvent,
  getEvents,
  clearEvents,

  // Symbols
  trackSymbolUsage,
  trackSymbolCoOccurrences,
  getSymbolUsage,
  getTopSymbols,
  getSymbolUsageByCategory,

  // Categories
  trackCategoryAccess,
  getCategoryUsage,

  // Sessions
  startSession,
  endSession,
  getCurrentSession,
  updateCurrentSession,
  getSessions,
  getRecentSessions,

  // Stats
  getCommunicationStats,
  getDailyActivity,
  getWeeklyActivity,
  getMonthlyActivity,
  getHourlyDistribution,

  // Goals & Milestones
  getGoals,
  addGoal,
  updateGoal,
  removeGoal,
  getMilestones,
  checkAndUpdateMilestones,

  // Insights
  generateInsights,
  generateRecommendations,

  // Charts
  getDailyUsageChartData,
  getCategoryDistributionChartData,
  getHourlyChartData,
  getTimeSeriesData,

  // Reports
  generateCaregiverReport,
  exportAnalyticsCSV,
  exportAnalyticsJSON,

  // Reset
  clearAllAnalytics,
};
