// ─── Visualization Service ──────────────────────────────────────────────────
// Generates chart data, aggregations, and reports from app analytics data.

import type {
  ChartData,
  ChartConfig,
  ChartType,
  DataSeries,
  DataPoint,
  DashboardWidget,
  StatConfig,
  TableConfig,
  TableColumn,
  ListConfig,
  ListItem,
  ProgressConfig,
  Report,
  ReportTemplate,
  TimeRange,
  AggregationType,
  DataSourceType,
  VisualizationState,
  CHART_COLORS,
} from '../types/visualization';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  reports: 'talkboard_viz_reports',
  settings: 'talkboard_viz_settings',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PALETTE = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4',
];

function generateId(): string {
  return `viz_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDateRange(timeRange: TimeRange, custom?: { start: string; end: string } | null): { start: Date; end: Date } {
  const end = new Date();
  let start = new Date();

  switch (timeRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'all':
      start = new Date(2020, 0, 1);
      break;
    case 'custom':
      if (custom) {
        return { start: new Date(custom.start), end: new Date(custom.end) };
      }
      start.setMonth(end.getMonth() - 1);
      break;
  }

  return { start, end };
}

function getDayLabels(start: Date, end: Date): string[] {
  const labels: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    d.setDate(d.getDate() + 1);
  }
  return labels;
}

function getWeekLabels(start: Date, end: Date): string[] {
  const labels: string[] = [];
  const d = new Date(start);
  let week = 1;
  while (d <= end) {
    labels.push(`Week ${week}`);
    d.setDate(d.getDate() + 7);
    week++;
  }
  return labels;
}

function getMonthLabels(start: Date, end: Date): string[] {
  const labels: string[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= end) {
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    d.setMonth(d.getMonth() + 1);
  }
  return labels;
}

function getTimeLabels(timeRange: TimeRange, custom?: { start: string; end: string } | null): string[] {
  const { start, end } = getDateRange(timeRange, custom);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }
  if (diffDays <= 31) {
    return getDayLabels(start, end);
  }
  if (diffDays <= 120) {
    return getWeekLabels(start, end);
  }
  return getMonthLabels(start, end);
}

function aggregate(values: number[], method: AggregationType): number {
  if (values.length === 0) return 0;

  switch (method) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    case 'percentile': {
      const sorted2 = [...values].sort((a, b) => a - b);
      const idx = Math.ceil(sorted2.length * 0.9) - 1;
      return sorted2[Math.max(0, idx)];
    }
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

// ─── Fake Data Generators ────────────────────────────────────────────────────
// For demo purposes, generate realistic-looking data from localStorage state

function generateTimeSeriesData(
  labels: string[],
  baseValue: number,
  variance: number,
  trend: number = 0
): DataPoint[] {
  return labels.map((label, i) => ({
    label,
    value: Math.max(0, Math.round(baseValue + trend * i + (Math.random() - 0.5) * variance)),
  }));
}

function generateCategoryData(
  categories: string[],
  totalValue: number
): DataPoint[] {
  const raw = categories.map(() => Math.random());
  const sum = raw.reduce((a, b) => a + b, 0);
  return categories.map((label, i) => ({
    label,
    value: Math.round((raw[i] / sum) * totalValue),
    color: PALETTE[i % PALETTE.length],
  }));
}

// ─── Data Source Generators ──────────────────────────────────────────────────

function getUsageData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'sessions',
        name: 'Sessions',
        color: '#3B82F6',
        data: generateTimeSeriesData(labels, 8, 6, 0.2),
      },
      {
        id: 'selections',
        name: 'Selections',
        color: '#10B981',
        data: generateTimeSeriesData(labels, 45, 30, 1.5),
      },
      {
        id: 'utterances',
        name: 'Utterances',
        color: '#F59E0B',
        data: generateTimeSeriesData(labels, 20, 15, 0.8),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Count',
  };
}

function getCommunicationData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'words_per_utterance',
        name: 'Words per Utterance',
        color: '#8B5CF6',
        data: generateTimeSeriesData(labels, 3.5, 2, 0.05),
      },
      {
        id: 'unique_symbols',
        name: 'Unique Symbols Used',
        color: '#EC4899',
        data: generateTimeSeriesData(labels, 25, 15, 0.5),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value',
  };
}

function getSymbolData(): ChartData {
  const categories = [
    'Basic Needs', 'Feelings', 'People', 'Actions', 'Food & Drink',
    'Places', 'Objects', 'Questions', 'Social', 'Descriptions',
  ];
  return {
    series: [{
      id: 'symbol_usage',
      name: 'Symbol Usage',
      color: '#3B82F6',
      data: generateCategoryData(categories, 1000),
    }],
    categories,
  };
}

function getVocabularyData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'vocab_size',
        name: 'Vocabulary Size',
        color: '#14B8A6',
        data: generateTimeSeriesData(labels, 50, 10, 2),
      },
      {
        id: 'new_words',
        name: 'New Words Added',
        color: '#F97316',
        data: generateTimeSeriesData(labels, 3, 4, 0),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Words',
  };
}

function getSessionData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'session_duration',
        name: 'Avg Session Duration (min)',
        color: '#6366F1',
        data: generateTimeSeriesData(labels, 15, 10, 0.3),
      },
      {
        id: 'session_count',
        name: 'Sessions per Day',
        color: '#EF4444',
        data: generateTimeSeriesData(labels, 4, 3, 0.1),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Minutes / Count',
  };
}

function getGoalData(): ChartData {
  const goals = [
    'Use 10 new symbols', 'Build 3-word sentences', 'Complete daily practice',
    'Try voice input', 'Navigate independently', 'Use social phrases',
  ];
  return {
    series: [{
      id: 'goal_progress',
      name: 'Goal Progress',
      color: '#10B981',
      data: goals.map((label) => ({
        label,
        value: Math.round(Math.random() * 100),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      })),
    }],
    categories: goals,
  };
}

function getInputModeData(): ChartData {
  const modes = ['Touch', 'Voice', 'Switch', 'Eye Tracking', 'Head Tracking', 'Keyboard'];
  return {
    series: [{
      id: 'mode_usage',
      name: 'Input Mode Usage',
      color: '#3B82F6',
      data: generateCategoryData(modes, 500),
    }],
    categories: modes,
  };
}

function getLearningData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'mastery_score',
        name: 'Mastery Score',
        color: '#10B981',
        data: generateTimeSeriesData(labels, 60, 15, 1),
      },
      {
        id: 'difficulty_level',
        name: 'Difficulty Level',
        color: '#F59E0B',
        data: generateTimeSeriesData(labels, 3, 2, 0.1),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Score / Level',
  };
}

function getPerformanceData(timeRange: TimeRange, custom?: { start: string; end: string } | null): ChartData {
  const labels = getTimeLabels(timeRange, custom);
  return {
    series: [
      {
        id: 'accuracy',
        name: 'Accuracy (%)',
        color: '#22C55E',
        data: generateTimeSeriesData(labels, 75, 15, 0.5),
      },
      {
        id: 'speed',
        name: 'Selections/min',
        color: '#3B82F6',
        data: generateTimeSeriesData(labels, 8, 4, 0.2),
      },
      {
        id: 'errors',
        name: 'Errors',
        color: '#EF4444',
        data: generateTimeSeriesData(labels, 5, 4, -0.1),
      },
    ],
    categories: labels,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value',
  };
}

// ─── Data Source Router ──────────────────────────────────────────────────────

function getDataForSource(
  source: DataSourceType,
  timeRange: TimeRange,
  custom?: { start: string; end: string } | null
): ChartData {
  switch (source) {
    case 'usage': return getUsageData(timeRange, custom);
    case 'communication': return getCommunicationData(timeRange, custom);
    case 'symbols': return getSymbolData();
    case 'vocabulary': return getVocabularyData(timeRange, custom);
    case 'sessions': return getSessionData(timeRange, custom);
    case 'goals': return getGoalData();
    case 'input_modes': return getInputModeData();
    case 'learning': return getLearningData(timeRange, custom);
    case 'performance': return getPerformanceData(timeRange, custom);
    default: return { series: [], categories: [] };
  }
}

// ─── Chart Config Builders ──────────────────────────────────────────────────

function buildChartConfig(
  type: ChartType,
  title: string,
  data: ChartData,
  options: Partial<ChartConfig> = {}
): ChartConfig {
  return {
    id: generateId(),
    type,
    title,
    data,
    showLegend: true,
    showTooltip: true,
    showGrid: true,
    showLabels: true,
    showValues: false,
    animate: true,
    interactive: true,
    stacked: false,
    colors: PALETTE,
    ...options,
  };
}

// ─── Widget Builders ─────────────────────────────────────────────────────────

function buildStatWidget(config: StatConfig): DashboardWidget {
  return {
    id: generateId(),
    type: 'stat',
    title: config.label,
    statConfig: config,
  };
}

function buildChartWidget(chartConfig: ChartConfig, gridColumn?: string, gridRow?: string): DashboardWidget {
  return {
    id: generateId(),
    type: 'chart',
    title: chartConfig.title,
    chartConfig,
    gridColumn,
    gridRow,
  };
}

function buildTableWidget(title: string, config: TableConfig): DashboardWidget {
  return {
    id: generateId(),
    type: 'table',
    title,
    tableConfig: config,
  };
}

function buildProgressWidget(config: ProgressConfig): DashboardWidget {
  return {
    id: generateId(),
    type: 'progress',
    title: config.label,
    progressConfig: config,
  };
}

// ─── Report Templates ───────────────────────────────────────────────────────

const builtInTemplates: ReportTemplate[] = [
  {
    id: 'tpl_usage_overview',
    name: 'Usage Overview',
    description: 'Overview of daily usage patterns, session counts, and engagement metrics.',
    category: 'usage',
    isBuiltIn: true,
    widgets: [
      {
        type: 'stat',
        title: 'Total Sessions',
        statConfig: { label: 'Total Sessions', value: 0, trend: 'up', change: 12 },
      },
      {
        type: 'stat',
        title: 'Avg Session Duration',
        statConfig: { label: 'Avg Duration', value: '0m', unit: 'min', trend: 'up', change: 5 },
      },
      {
        type: 'stat',
        title: 'Total Selections',
        statConfig: { label: 'Selections', value: 0, trend: 'up', change: 18 },
      },
      {
        type: 'stat',
        title: 'Active Days',
        statConfig: { label: 'Active Days', value: 0, trend: 'up', change: 3 },
      },
      {
        type: 'chart',
        title: 'Usage Over Time',
        chartConfig: buildChartConfig('line', 'Usage Over Time', { series: [], categories: [] }),
      },
      {
        type: 'chart',
        title: 'Session Distribution',
        chartConfig: buildChartConfig('bar', 'Session Distribution', { series: [], categories: [] }),
      },
    ],
  },
  {
    id: 'tpl_communication_progress',
    name: 'Communication Progress',
    description: 'Track communication development including vocabulary growth and utterance complexity.',
    category: 'progress',
    isBuiltIn: true,
    widgets: [
      {
        type: 'stat',
        title: 'Vocabulary Size',
        statConfig: { label: 'Vocabulary Size', value: 0, trend: 'up', change: 8 },
      },
      {
        type: 'stat',
        title: 'Avg Utterance Length',
        statConfig: { label: 'Avg Utterance Length', value: '0', unit: 'words', trend: 'up', change: 2 },
      },
      {
        type: 'chart',
        title: 'Vocabulary Growth',
        chartConfig: buildChartConfig('area', 'Vocabulary Growth', { series: [], categories: [] }),
      },
      {
        type: 'chart',
        title: 'Symbol Category Usage',
        chartConfig: buildChartConfig('pie', 'Symbol Category Usage', { series: [], categories: [] }),
      },
    ],
  },
  {
    id: 'tpl_accessibility_report',
    name: 'Accessibility Report',
    description: 'Input mode usage, accessibility feature utilization, and adaptation metrics.',
    category: 'accessibility',
    isBuiltIn: true,
    widgets: [
      {
        type: 'chart',
        title: 'Input Mode Distribution',
        chartConfig: buildChartConfig('donut', 'Input Mode Distribution', { series: [], categories: [] }),
      },
      {
        type: 'chart',
        title: 'Performance by Mode',
        chartConfig: buildChartConfig('radar', 'Performance by Mode', { series: [], categories: [] }),
      },
      {
        type: 'chart',
        title: 'Accuracy Over Time',
        chartConfig: buildChartConfig('line', 'Accuracy Over Time', { series: [], categories: [] }),
      },
    ],
  },
  {
    id: 'tpl_learning_progress',
    name: 'Learning Progress',
    description: 'Adaptive learning metrics, mastery levels, and goal completion tracking.',
    category: 'progress',
    isBuiltIn: true,
    widgets: [
      {
        type: 'stat',
        title: 'Mastery Score',
        statConfig: { label: 'Mastery Score', value: '0%', trend: 'up', change: 15 },
      },
      {
        type: 'chart',
        title: 'Learning Curve',
        chartConfig: buildChartConfig('line', 'Learning Curve', { series: [], categories: [] }),
      },
      {
        type: 'chart',
        title: 'Goal Progress',
        chartConfig: buildChartConfig('bar', 'Goal Progress', { series: [], categories: [] }, { stacked: false }),
      },
    ],
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

class VisualizationService {
  // ─── Reports ─────────────────────────────────────────────────────────

  getReports(): Report[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.reports);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveReports(reports: Report[]): void {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
  }

  createReport(
    title: string,
    description: string,
    dataSource: DataSourceType,
    timeRange: TimeRange,
    aggregation: AggregationType = 'sum',
    customDateRange?: { start: string; end: string }
  ): Report {
    const data = getDataForSource(dataSource, timeRange, customDateRange);
    const widgets = this.buildDefaultWidgets(dataSource, data, timeRange, customDateRange);

    const report: Report = {
      id: generateId(),
      title,
      description,
      dataSource,
      timeRange,
      customDateRange,
      aggregation,
      widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reports = this.getReports();
    reports.push(report);
    this.saveReports(reports);
    return report;
  }

  createReportFromTemplate(
    templateId: string,
    timeRange: TimeRange,
    customDateRange?: { start: string; end: string }
  ): Report | null {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) return null;

    const dataSourceMap: Record<string, DataSourceType> = {
      usage: 'usage',
      progress: 'learning',
      communication: 'communication',
      accessibility: 'input_modes',
      custom: 'usage',
    };

    const dataSource = dataSourceMap[template.category] || 'usage';
    return this.createReport(
      template.name,
      template.description,
      dataSource,
      timeRange,
      'sum',
      customDateRange
    );
  }

  updateReport(id: string, updates: Partial<Report>): Report | null {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) return null;

    reports[idx] = { ...reports[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveReports(reports);
    return reports[idx];
  }

  deleteReport(id: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    if (filtered.length === reports.length) return false;
    this.saveReports(filtered);
    return true;
  }

  refreshReport(id: string): Report | null {
    const reports = this.getReports();
    const report = reports.find(r => r.id === id);
    if (!report) return null;

    const data = getDataForSource(report.dataSource, report.timeRange, report.customDateRange);
    const widgets = this.buildDefaultWidgets(report.dataSource, data, report.timeRange, report.customDateRange);
    return this.updateReport(id, { widgets });
  }

  // ─── Templates ───────────────────────────────────────────────────────

  getTemplates(): ReportTemplate[] {
    return [...builtInTemplates];
  }

  // ─── Dashboard Data ──────────────────────────────────────────────────

  getDashboardOverview(
    timeRange: TimeRange,
    customDateRange?: { start: string; end: string } | null
  ): DashboardWidget[] {
    const usageData = getUsageData(timeRange, customDateRange);
    const symbolData = getSymbolData();
    const sessionData = getSessionData(timeRange, customDateRange);
    const performanceData = getPerformanceData(timeRange, customDateRange);
    const goalData = getGoalData();
    const inputModeData = getInputModeData();

    const totalSessions = aggregate(
      usageData.series[0]?.data.map(d => d.value) || [],
      'sum'
    );
    const totalSelections = aggregate(
      usageData.series[1]?.data.map(d => d.value) || [],
      'sum'
    );
    const avgDuration = aggregate(
      sessionData.series[0]?.data.map(d => d.value) || [],
      'average'
    );
    const avgAccuracy = aggregate(
      performanceData.series[0]?.data.map(d => d.value) || [],
      'average'
    );

    return [
      // Stat row
      buildStatWidget({
        label: 'Total Sessions',
        value: totalSessions,
        trend: 'up',
        change: 12,
        icon: '📊',
        color: '#3B82F6',
      }),
      buildStatWidget({
        label: 'Total Selections',
        value: totalSelections,
        trend: 'up',
        change: 18,
        icon: '✋',
        color: '#10B981',
      }),
      buildStatWidget({
        label: 'Avg Duration',
        value: `${Math.round(avgDuration)}m`,
        unit: 'min',
        trend: 'up',
        change: 5,
        icon: '⏱️',
        color: '#F59E0B',
      }),
      buildStatWidget({
        label: 'Accuracy',
        value: `${Math.round(avgAccuracy)}%`,
        trend: 'up',
        change: 3,
        icon: '🎯',
        color: '#8B5CF6',
      }),

      // Charts
      buildChartWidget(
        buildChartConfig('line', 'Usage Trends', usageData),
        'span 2',
        'span 1'
      ),
      buildChartWidget(
        buildChartConfig('pie', 'Symbol Categories', symbolData, { showValues: true }),
      ),
      buildChartWidget(
        buildChartConfig('bar', 'Session Details', sessionData, { stacked: false }),
        'span 2',
      ),
      buildChartWidget(
        buildChartConfig('donut', 'Input Modes', inputModeData, { showValues: true }),
      ),
      buildChartWidget(
        buildChartConfig('area', 'Performance', performanceData),
        'span 2',
      ),
      buildChartWidget(
        buildChartConfig('bar', 'Goal Progress', goalData, { showValues: true }),
        'span 1',
      ),
    ];
  }

  // ─── Chart Data Generators ───────────────────────────────────────────

  getChartData(
    source: DataSourceType,
    timeRange: TimeRange,
    customDateRange?: { start: string; end: string } | null
  ): ChartData {
    return getDataForSource(source, timeRange, customDateRange);
  }

  // ─── Aggregation ─────────────────────────────────────────────────────

  aggregateSeriesData(series: DataSeries, method: AggregationType): number {
    return aggregate(series.data.map(d => d.value), method);
  }

  aggregateChartData(chartData: ChartData, method: AggregationType): Record<string, number> {
    const result: Record<string, number> = {};
    for (const s of chartData.series) {
      result[s.id] = this.aggregateSeriesData(s, method);
    }
    return result;
  }

  // ─── Summary Stats ──────────────────────────────────────────────────

  getQuickStats(timeRange: TimeRange, customDateRange?: { start: string; end: string } | null): StatConfig[] {
    const usage = getUsageData(timeRange, customDateRange);
    const perf = getPerformanceData(timeRange, customDateRange);
    const vocab = getVocabularyData(timeRange, customDateRange);

    return [
      {
        label: 'Total Sessions',
        value: aggregate(usage.series[0]?.data.map(d => d.value) || [], 'sum'),
        trend: 'up',
        change: Math.round(Math.random() * 20),
        icon: '📊',
        color: '#3B82F6',
      },
      {
        label: 'Symbols Used',
        value: aggregate(usage.series[1]?.data.map(d => d.value) || [], 'sum'),
        trend: 'up',
        change: Math.round(Math.random() * 15),
        icon: '🔤',
        color: '#10B981',
      },
      {
        label: 'Accuracy',
        value: `${Math.round(aggregate(perf.series[0]?.data.map(d => d.value) || [], 'average'))}%`,
        trend: 'up',
        change: Math.round(Math.random() * 10),
        icon: '🎯',
        color: '#8B5CF6',
      },
      {
        label: 'Vocabulary',
        value: Math.round(aggregate(vocab.series[0]?.data.map(d => d.value) || [], 'max')),
        trend: 'up',
        change: Math.round(Math.random() * 8),
        icon: '📖',
        color: '#F59E0B',
      },
      {
        label: 'Utterances',
        value: aggregate(usage.series[2]?.data.map(d => d.value) || [], 'sum'),
        trend: 'up',
        change: Math.round(Math.random() * 12),
        icon: '💬',
        color: '#EC4899',
      },
      {
        label: 'Errors',
        value: aggregate(perf.series[2]?.data.map(d => d.value) || [], 'sum'),
        trend: 'down',
        change: -Math.round(Math.random() * 5),
        icon: '⚠️',
        color: '#EF4444',
      },
    ];
  }

  // ─── Top Symbols Table ───────────────────────────────────────────────

  getTopSymbolsTable(): TableConfig {
    const symbolNames = [
      'I want', 'help', 'more', 'yes', 'no', 'please', 'thank you',
      'eat', 'drink', 'play', 'go', 'stop', 'happy', 'sad', 'tired',
    ];

    const columns: TableColumn[] = [
      { key: 'rank', label: '#', type: 'number', width: '40px', align: 'center' },
      { key: 'symbol', label: 'Symbol', type: 'text', sortable: true },
      { key: 'category', label: 'Category', type: 'badge', sortable: true },
      { key: 'uses', label: 'Uses', type: 'number', sortable: true, align: 'right' },
      { key: 'trend', label: 'Trend', type: 'text', align: 'center' },
    ];

    const categoryNames = [
      'Basic Needs', 'Feelings', 'Actions', 'Social', 'Descriptions',
    ];

    const rows = symbolNames.map((symbol, i) => ({
      rank: i + 1,
      symbol,
      category: categoryNames[i % categoryNames.length],
      uses: Math.round(200 - i * 12 + Math.random() * 20),
      trend: Math.random() > 0.3 ? '↑' : Math.random() > 0.5 ? '→' : '↓',
    }));

    return { columns, rows, sortable: true, filterable: true, pageSize: 10 };
  }

  // ─── Recent Activity List ────────────────────────────────────────────

  getRecentActivityList(): ListConfig {
    const activities: ListItem[] = [
      { id: '1', title: 'Built 4-word sentence', subtitle: '2 minutes ago', badge: { label: 'Communication', color: '#3B82F6' } },
      { id: '2', title: 'New symbol mastered: "playground"', subtitle: '15 minutes ago', badge: { label: 'Learning', color: '#10B981' } },
      { id: '3', title: 'Voice input session completed', subtitle: '1 hour ago', badge: { label: 'Input', color: '#8B5CF6' } },
      { id: '4', title: 'Daily practice goal reached', subtitle: '2 hours ago', badge: { label: 'Goal', color: '#F59E0B' } },
      { id: '5', title: 'Used eye tracking for 10 minutes', subtitle: '3 hours ago', badge: { label: 'Accessibility', color: '#EC4899' } },
      { id: '6', title: 'Tried 5 new social phrases', subtitle: '5 hours ago', badge: { label: 'Social', color: '#14B8A6' } },
      { id: '7', title: 'Completed vocabulary quiz', subtitle: 'Yesterday', badge: { label: 'Assessment', color: '#6366F1' } },
      { id: '8', title: 'Achieved Level 3', subtitle: 'Yesterday', badge: { label: 'Progress', color: '#22C55E' } },
    ];

    return { items: activities, maxItems: 10, showIndex: false, itemStyle: 'card' };
  }

  // ─── Goals Progress ──────────────────────────────────────────────────

  getGoalsProgress(): ProgressConfig[] {
    return [
      { value: 78, max: 100, label: 'Daily Usage Goal', showPercentage: true, color: '#3B82F6', size: 'md' },
      { value: 45, max: 100, label: 'Vocabulary Expansion', showPercentage: true, color: '#10B981', size: 'md' },
      { value: 92, max: 100, label: 'Sentence Building', showPercentage: true, color: '#F59E0B', size: 'md' },
      { value: 60, max: 100, label: 'Social Communication', showPercentage: true, color: '#8B5CF6', size: 'md' },
      { value: 33, max: 100, label: 'Independent Navigation', showPercentage: true, color: '#EC4899', size: 'md' },
    ];
  }

  // ─── Heatmap Data ────────────────────────────────────────────────────

  getUsageHeatmap(): { day: string; hour: number; value: number }[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: { day: string; hour: number; value: number }[] = [];

    for (const day of days) {
      for (let hour = 6; hour <= 20; hour++) {
        const isSchoolHour = hour >= 8 && hour <= 15 && !['Sat', 'Sun'].includes(day);
        const baseValue = isSchoolHour ? 8 : 3;
        data.push({
          day,
          hour,
          value: Math.max(0, Math.round(baseValue + (Math.random() - 0.3) * 6)),
        });
      }
    }

    return data;
  }

  // ─── Export ──────────────────────────────────────────────────────────

  exportChartDataAsCSV(chartData: ChartData): string {
    if (!chartData.series.length) return '';

    const headers = ['Label', ...chartData.series.map(s => s.name)];
    const maxLen = Math.max(...chartData.series.map(s => s.data.length));
    const rows: string[] = [headers.join(',')];

    for (let i = 0; i < maxLen; i++) {
      const label = chartData.series[0]?.data[i]?.label || '';
      const values = chartData.series.map(s => s.data[i]?.value?.toString() || '0');
      rows.push([label, ...values].join(','));
    }

    return rows.join('\n');
  }

  exportChartDataAsJSON(chartData: ChartData): string {
    return JSON.stringify(chartData, null, 2);
  }

  exportReportAsJSON(report: Report): string {
    return JSON.stringify(report, null, 2);
  }

  // ─── Default Widget Builder ──────────────────────────────────────────

  private buildDefaultWidgets(
    source: DataSourceType,
    data: ChartData,
    timeRange: TimeRange,
    customDateRange?: { start: string; end: string }
  ): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];

    // Stats based on data
    for (const series of data.series) {
      const total = aggregate(series.data.map(d => d.value), 'sum');
      const avg = aggregate(series.data.map(d => d.value), 'average');
      widgets.push(buildStatWidget({
        label: series.name,
        value: Math.round(total),
        trend: 'up',
        change: Math.round(Math.random() * 15),
        color: series.color,
      }));
    }

    // Line chart for time series sources
    const timeSeriesSources: DataSourceType[] = ['usage', 'communication', 'vocabulary', 'sessions', 'learning', 'performance'];
    if (timeSeriesSources.includes(source)) {
      widgets.push(buildChartWidget(
        buildChartConfig('line', `${source.charAt(0).toUpperCase() + source.slice(1)} Over Time`, data)
      ));
      widgets.push(buildChartWidget(
        buildChartConfig('area', `${source.charAt(0).toUpperCase() + source.slice(1)} Area View`, data)
      ));
    }

    // Pie chart for categorical sources
    const categoricalSources: DataSourceType[] = ['symbols', 'goals', 'input_modes'];
    if (categoricalSources.includes(source)) {
      widgets.push(buildChartWidget(
        buildChartConfig('pie', `${source.charAt(0).toUpperCase() + source.slice(1)} Distribution`, data, { showValues: true })
      ));
      widgets.push(buildChartWidget(
        buildChartConfig('bar', `${source.charAt(0).toUpperCase() + source.slice(1)} Breakdown`, data)
      ));
    }

    return widgets;
  }
}

export const visualizationService = new VisualizationService();
