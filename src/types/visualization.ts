// ─── Data Visualization Types ────────────────────────────────────────────────

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'donut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'heatmap'
  | 'treemap'
  | 'gauge'
  | 'progress'
  | 'sparkline';

export type TimeRange =
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'all'
  | 'custom';

export type AggregationType =
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | 'count'
  | 'median'
  | 'percentile';

export type DataSourceType =
  | 'usage'
  | 'communication'
  | 'symbols'
  | 'vocabulary'
  | 'sessions'
  | 'goals'
  | 'input_modes'
  | 'learning'
  | 'performance';

// ─── Chart Data ──────────────────────────────────────────────────────────────

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, string | number>;
}

export interface DataSeries {
  id: string;
  name: string;
  color: string;
  data: DataPoint[];
  type?: ChartType;
  visible?: boolean;
}

export interface ChartData {
  series: DataSeries[];
  categories?: string[];
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: ChartData;
  width?: number | string;
  height?: number | string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
  interactive?: boolean;
  stacked?: boolean;
  colors?: string[];
  backgroundColor?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'table' | 'list' | 'progress' | 'text';
  title: string;
  description?: string;
  gridColumn?: string;
  gridRow?: string;
  chartConfig?: ChartConfig;
  statConfig?: StatConfig;
  tableConfig?: TableConfig;
  listConfig?: ListConfig;
  progressConfig?: ProgressConfig;
}

export interface StatConfig {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
  color?: string;
}

export interface TableConfig {
  columns: TableColumn[];
  rows: Record<string, string | number>[];
  sortable?: boolean;
  filterable?: boolean;
  pageSize?: number;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'progress';
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ListConfig {
  items: ListItem[];
  maxItems?: number;
  showIndex?: boolean;
  itemStyle?: 'default' | 'compact' | 'card';
}

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  badge?: { label: string; color: string };
}

export interface ProgressConfig {
  value: number;
  max: number;
  label: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  title: string;
  description: string;
  dataSource: DataSourceType;
  timeRange: TimeRange;
  customDateRange?: { start: string; end: string };
  aggregation: AggregationType;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  tags?: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'usage' | 'progress' | 'communication' | 'accessibility' | 'custom';
  widgets: Omit<DashboardWidget, 'id'>[];
  thumbnail?: string;
  isBuiltIn?: boolean;
}

// ─── Visualization State ─────────────────────────────────────────────────────

export interface VisualizationState {
  reports: Report[];
  templates: ReportTemplate[];
  activeReportId: string | null;
  timeRange: TimeRange;
  customDateRange: { start: string; end: string } | null;
  refreshInterval: number;
  isLoading: boolean;
  lastRefreshed: string | null;
  exportFormat: 'png' | 'svg' | 'csv' | 'json' | 'pdf';
}

// ─── Color Palette ───────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  accent: ['#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6'],
  categorical: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4',
  ],
  sequential: {
    blue: ['#EFF6FF', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'],
    green: ['#F0FDF4', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A'],
    red: ['#FEF2F2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626'],
    purple: ['#FAF5FF', '#E9D5FF', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'],
  },
  diverging: ['#DC2626', '#F87171', '#FCA5A5', '#FEE2E2', '#E0F2FE', '#93C5FD', '#60A5FA', '#3B82F6'],
} as const;

export const CHART_THEMES = {
  light: {
    background: '#FFFFFF',
    text: '#111827',
    gridLine: '#E5E7EB',
    axis: '#6B7280',
    tooltip: { bg: '#1F2937', text: '#F9FAFB' },
  },
  dark: {
    background: '#1F2937',
    text: '#F9FAFB',
    gridLine: '#374151',
    axis: '#9CA3AF',
    tooltip: { bg: '#F9FAFB', text: '#1F2937' },
  },
} as const;
