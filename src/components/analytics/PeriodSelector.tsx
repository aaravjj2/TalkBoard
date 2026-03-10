/**
 * PeriodSelector — Time-period selection component for analytics views.
 * Provides segmented control for switching between different report periods.
 */

import type { ReportPeriod } from '@/types/analytics';

interface PeriodSelectorProps {
  selected: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
  compact?: boolean;
  periods?: ReportPeriod[];
}

const periodLabels: Record<ReportPeriod, string> = {
  day: 'Today',
  week: 'Week',
  month: 'Month',
  quarter: 'Quarter',
  year: 'Year',
  all: 'All Time',
};

const periodShortLabels: Record<ReportPeriod, string> = {
  day: '1D',
  week: '1W',
  month: '1M',
  quarter: '3M',
  year: '1Y',
  all: 'All',
};

const DEFAULT_PERIODS: ReportPeriod[] = ['day', 'week', 'month', 'quarter', 'year', 'all'];

export default function PeriodSelector({
  selected,
  onChange,
  compact = false,
  periods = DEFAULT_PERIODS,
}: PeriodSelectorProps) {
  const labels = compact ? periodShortLabels : periodLabels;

  return (
    <div
      className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1"
      role="radiogroup"
      aria-label="Time period"
    >
      {periods.map((period) => {
        const isActive = selected === period;
        return (
          <button
            key={period}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(period)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md
              transition-all duration-200
              ${isActive
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            {labels[period]}
          </button>
        );
      })}
    </div>
  );
}
