/**
 * Analytics Types — Comprehensive type definitions for usage tracking,
 * reporting, and insights in the TalkBoard AAC application.
 */

import type { SymbolCategoryId } from './index';

// ─── Usage Events ────────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | 'symbol_selected'
  | 'symbol_deselected'
  | 'sentence_generated'
  | 'sentence_spoken'
  | 'category_changed'
  | 'search_performed'
  | 'quick_phrase_used'
  | 'quick_phrase_added'
  | 'quick_phrase_deleted'
  | 'settings_changed'
  | 'theme_toggled'
  | 'voice_changed'
  | 'profile_updated'
  | 'caregiver_mode_entered'
  | 'caregiver_mode_exited'
  | 'session_started'
  | 'session_ended'
  | 'tts_error'
  | 'ai_error'
  | 'custom_symbol_created'
  | 'custom_symbol_deleted'
  | 'board_layout_changed'
  | 'export_data'
  | 'import_data'
  | 'history_cleared'
  | 'favorites_toggled';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  sessionId: string;
  data?: Record<string, unknown>;
}

// ─── Symbol Usage Stats ──────────────────────────────────────────────────────

export interface SymbolUsageRecord {
  symbolId: string;
  label: string;
  emoji: string;
  category: SymbolCategoryId;
  totalUses: number;
  lastUsedAt: string;
  firstUsedAt: string;
  usageByDay: Record<string, number>; // ISO date → count
  usageByHour: number[]; // 24 entries (0-23)
  averagePositionInSentence: number;
  coOccurrences: Record<string, number>; // symbolId → count
}

export interface CategoryUsageRecord {
  categoryId: SymbolCategoryId;
  label: string;
  totalSelections: number;
  totalTimeSpentMs: number;
  uniqueSymbolsUsed: number;
  totalSymbolsAvailable: number;
  lastAccessedAt: string;
  usageByDay: Record<string, number>;
}

// ─── Session Stats ───────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  symbolsSelected: number;
  sentencesGenerated: number;
  sentencesSpoken: number;
  categoriesVisited: SymbolCategoryId[];
  searchQueries: number;
  quickPhrasesUsed: number;
  errorsEncountered: number;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  touchSupported: boolean;
  language: string;
  online: boolean;
}

// ─── Communication Stats ─────────────────────────────────────────────────────

export interface CommunicationStats {
  totalSentencesGenerated: number;
  totalSentencesSpoken: number;
  totalSymbolsSelected: number;
  totalSearches: number;
  totalQuickPhrasesUsed: number;
  averageSentenceLength: number;
  averageSymbolsPerSentence: number;
  longestSentence: string;
  shortestSentence: string;
  mostCommonSentencePattern: string;
  totalCommunicationTimeMs: number;
  averageDailySymbols: number;
  streakDays: number;
  longestStreakDays: number;
}

// ─── Time-based Analytics ────────────────────────────────────────────────────

export interface TimeSeriesDataPoint {
  date: string; // ISO date
  value: number;
  label?: string;
}

export interface HourlyDistribution {
  hour: number; // 0-23
  count: number;
  percentage: number;
}

export interface DailyActivity {
  date: string;
  symbolSelections: number;
  sentencesGenerated: number;
  sentencesSpoken: number;
  sessionCount: number;
  totalDurationMs: number;
  uniqueCategories: number;
  uniqueSymbols: number;
}

export interface WeeklyActivity {
  weekStart: string;
  weekEnd: string;
  totalSymbols: number;
  totalSentences: number;
  totalSessions: number;
  averageDailyUsage: number;
  mostActiveDay: string;
  improvementFromLastWeek: number; // percentage
}

export interface MonthlyActivity {
  month: string; // YYYY-MM
  totalSymbols: number;
  totalSentences: number;
  totalSessions: number;
  activeDays: number;
  averageDailyUsage: number;
  newSymbolsDiscovered: number;
  topCategories: SymbolCategoryId[];
}

// ─── Goals & Milestones ──────────────────────────────────────────────────────

export type GoalType =
  | 'daily_symbols'
  | 'daily_sentences'
  | 'weekly_sessions'
  | 'streak_days'
  | 'categories_explored'
  | 'unique_symbols'
  | 'vocabulary_growth';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string | null;
  completedAt: string | null;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achievedAt: string | null;
  requirement: {
    metric: string;
    threshold: number;
  };
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface ReportConfig {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  includeCategories: boolean;
  includeSymbols: boolean;
  includeSessions: boolean;
  includeGoals: boolean;
  includeMilestones: boolean;
  format: 'summary' | 'detailed' | 'export';
}

export interface CaregiverReport {
  generatedAt: string;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  communicationStats: CommunicationStats;
  topSymbols: SymbolUsageRecord[];
  categoryBreakdown: CategoryUsageRecord[];
  dailyActivity: DailyActivity[];
  sessions: SessionRecord[];
  goals: Goal[];
  milestones: Milestone[];
  insights: ReportInsight[];
  recommendations: string[];
}

export interface ReportInsight {
  id: string;
  type: 'positive' | 'neutral' | 'suggestion';
  icon: string;
  title: string;
  description: string;
  metric?: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

// ─── Dashboard State ─────────────────────────────────────────────────────────

export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  selectedPeriod: ReportPeriod;
  communicationStats: CommunicationStats | null;
  topSymbols: SymbolUsageRecord[];
  categoryBreakdown: CategoryUsageRecord[];
  recentSessions: SessionRecord[];
  dailyActivity: DailyActivity[];
  weeklyActivity: WeeklyActivity[];
  goals: Goal[];
  milestones: Milestone[];
  insights: ReportInsight[];
}

// ─── Chart Types ─────────────────────────────────────────────────────────────

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface PieChartData {
  segments: PieSegment[];
  total: number;
}

export interface PieSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
  icon?: string;
}

// ─── Export Formats ──────────────────────────────────────────────────────────

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  period: ReportPeriod;
  includeRawData: boolean;
  includeCharts: boolean;
  anonymize: boolean;
}

export interface CSVRow {
  [key: string]: string | number | boolean;
}
