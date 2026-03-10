// ─── Stat Card ──────────────────────────────────────────────────────────────

import type { StatConfig } from '../../types/visualization';

interface StatCardProps {
  config: StatConfig;
  className?: string;
}

export default function StatCard({ config, className = '' }: StatCardProps) {
  const { label, value, unit, change, changeLabel, trend, icon, color } = config;

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    flat: 'text-gray-600 bg-gray-50',
  };

  const trendArrows = {
    up: '↑',
    down: '↓',
    flat: '→',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: color ? `${color}15` : '#3B82F615' }}
          >
            {icon}
          </div>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend && change !== undefined && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
              {trendArrows[trend]} {Math.abs(change)}%
            </span>
          )}
          {changeLabel && (
            <span className="text-xs text-gray-500">{changeLabel}</span>
          )}
          {!changeLabel && <span className="text-xs text-gray-500">vs last period</span>}
        </div>
      )}
    </div>
  );
}

// ─── Stat Grid ──────────────────────────────────────────────────────────────

interface StatGridProps {
  stats: StatConfig[];
  columns?: number;
  className?: string;
}

export function StatGrid({ stats, columns = 4, className = '' }: StatGridProps) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <StatCard key={i} config={stat} />
      ))}
    </div>
  );
}
