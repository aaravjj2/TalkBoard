// ─── Progress Bar Chart ─────────────────────────────────────────────────────

import type { ProgressConfig } from '../../types/visualization';

interface ProgressChartProps {
  config: ProgressConfig;
  className?: string;
}

export default function ProgressChart({ config, className = '' }: ProgressChartProps) {
  const { value, max, label, showPercentage, color = '#3B82F6', size = 'md' } = config;
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const heightMap = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
  const barHeight = heightMap[size];

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold" style={{ color }}>{percentage}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${barHeight}`}>
        <div
          className={`${barHeight} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Multiple Progress Bars ─────────────────────────────────────────────────

interface ProgressGroupProps {
  items: ProgressConfig[];
  className?: string;
}

export function ProgressGroup({ items, className = '' }: ProgressGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <ProgressChart key={i} config={item} />
      ))}
    </div>
  );
}
