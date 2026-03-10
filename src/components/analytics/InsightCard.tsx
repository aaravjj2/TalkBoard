/**
 * InsightCard — Displays generated insights with trend indicators.
 */

import type { ReportInsight } from '@/types/analytics';

interface InsightCardProps {
  insight: ReportInsight;
  compact?: boolean;
}

const typeStyles = {
  positive: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
  },
  neutral: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300',
  },
  suggestion: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300',
  },
};

const trendArrows = {
  up: '↗',
  down: '↘',
  stable: '→',
};

export default function InsightCard({ insight, compact = false }: InsightCardProps) {
  const styles = typeStyles[insight.type];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${styles.bg} ${styles.border} border`}>
        <span className="text-lg flex-shrink-0">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {insight.title}
          </p>
        </div>
        {insight.trend && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {trendArrows[insight.trend]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${styles.bg} ${styles.border} p-4 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h4>
            {insight.trend && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${styles.badge}`}>
                {trendArrows[insight.trend]}
                {insight.trendPercentage !== undefined && (
                  <span>{Math.abs(insight.trendPercentage).toFixed(0)}%</span>
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {insight.description}
          </p>
          {insight.value !== undefined && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Current: {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
