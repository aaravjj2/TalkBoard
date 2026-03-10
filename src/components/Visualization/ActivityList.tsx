// ─── Activity List ──────────────────────────────────────────────────────────

import type { ListConfig } from '../../types/visualization';

interface ActivityListProps {
  config: ListConfig;
  title?: string;
  className?: string;
}

export default function ActivityList({ config, title, className = '' }: ActivityListProps) {
  const { items, maxItems, showIndex, itemStyle = 'default' } = config;
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (!displayItems.length) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        {title && <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</h4>}
        <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {displayItems.map((item, i) => (
          <div
            key={item.id}
            className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
              ${itemStyle === 'compact' ? 'py-2' : ''}`}
          >
            {showIndex && (
              <span className="text-xs text-gray-400 w-5 text-right font-mono">{i + 1}</span>
            )}

            {item.icon && (
              <span className="text-lg flex-shrink-0 w-8 text-center">{item.icon}</span>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </div>

            {item.badge && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  backgroundColor: `${item.badge.color}15`,
                  color: item.badge.color,
                }}
              >
                {item.badge.label}
              </span>
            )}

            {item.value !== undefined && (
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 tabular-nums">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {maxItems && items.length > maxItems && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-xs text-gray-500">
            Showing {maxItems} of {items.length} activities
          </span>
        </div>
      )}
    </div>
  );
}
