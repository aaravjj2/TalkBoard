/**
 * HeatMap — 7×N grid heat map for visualizing daily activity over time.
 * Shows a GitHub-style contribution calendar for communication activity.
 */

import { useState, useMemo } from 'react';

interface HeatMapDataPoint {
  date: string; // ISO date
  value: number;
}

interface HeatMapProps {
  data: HeatMapDataPoint[];
  title?: string;
  weeks?: number;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
  showLabels?: boolean;
  showLegend?: boolean;
  emptyMessage?: string;
  cellSize?: number;
  cellGap?: number;
  valueLabel?: string;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const colorSchemes = {
  blue: {
    empty: 'bg-gray-100 dark:bg-gray-800',
    levels: [
      'bg-blue-100 dark:bg-blue-900/40',
      'bg-blue-200 dark:bg-blue-800/60',
      'bg-blue-300 dark:bg-blue-700/80',
      'bg-blue-400 dark:bg-blue-600',
      'bg-blue-500 dark:bg-blue-500',
    ],
    legendColors: ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB'],
  },
  green: {
    empty: 'bg-gray-100 dark:bg-gray-800',
    levels: [
      'bg-green-100 dark:bg-green-900/40',
      'bg-green-200 dark:bg-green-800/60',
      'bg-green-300 dark:bg-green-700/80',
      'bg-green-400 dark:bg-green-600',
      'bg-green-500 dark:bg-green-500',
    ],
    legendColors: ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#059669'],
  },
  purple: {
    empty: 'bg-gray-100 dark:bg-gray-800',
    levels: [
      'bg-purple-100 dark:bg-purple-900/40',
      'bg-purple-200 dark:bg-purple-800/60',
      'bg-purple-300 dark:bg-purple-700/80',
      'bg-purple-400 dark:bg-purple-600',
      'bg-purple-500 dark:bg-purple-500',
    ],
    legendColors: ['#EDE9FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED'],
  },
  orange: {
    empty: 'bg-gray-100 dark:bg-gray-800',
    levels: [
      'bg-orange-100 dark:bg-orange-900/40',
      'bg-orange-200 dark:bg-orange-800/60',
      'bg-orange-300 dark:bg-orange-700/80',
      'bg-orange-400 dark:bg-orange-600',
      'bg-orange-500 dark:bg-orange-500',
    ],
    legendColors: ['#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C'],
  },
};

export default function HeatMap({
  data,
  title,
  weeks = 12,
  colorScheme = 'green',
  showLabels = true,
  showLegend = true,
  emptyMessage = 'No activity data',
  cellSize = 14,
  cellGap = 3,
  valueLabel = 'interactions',
}: HeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; value: number; x: number; y: number } | null>(null);

  const scheme = colorSchemes[colorScheme];

  const grid = useMemo(() => {
    const dataMap = new Map<string, number>();
    data.forEach((d) => dataMap.set(d.date, d.value));

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Adjust to start on Monday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - ((dayOfWeek + 6) % 7));

    const cells: { date: string; value: number; weekIndex: number; dayIndex: number }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const weekIndex = Math.floor(
        (current.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      const dayIndex = (current.getDay() + 6) % 7; // Monday = 0

      cells.push({
        date: dateStr,
        value: dataMap.get(dateStr) || 0,
        weekIndex,
        dayIndex,
      });

      current.setDate(current.getDate() + 1);
    }

    return cells;
  }, [data, weeks]);

  const maxValue = useMemo(() => Math.max(...grid.map((c) => c.value), 1), [grid]);
  const totalWeeks = useMemo(() => Math.max(...grid.map((c) => c.weekIndex), 0) + 1, [grid]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    grid.forEach((cell) => {
      const date = new Date(cell.date);
      const month = date.getMonth();
      if (month !== lastMonth && cell.dayIndex === 0) {
        labels.push({
          label: monthNames[month],
          weekIndex: cell.weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [grid]);

  function getColorClass(value: number): string {
    if (value === 0) return scheme.empty;
    const ratio = value / maxValue;
    if (ratio <= 0.2) return scheme.levels[0];
    if (ratio <= 0.4) return scheme.levels[1];
    if (ratio <= 0.6) return scheme.levels[2];
    if (ratio <= 0.8) return scheme.levels[3];
    return scheme.levels[4];
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-4">
        {emptyMessage}
      </div>
    );
  }

  const gridWidth = totalWeeks * (cellSize + cellGap) + (showLabels ? 30 : 0);

  return (
    <div className="relative">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${gridWidth}px` }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: showLabels ? 30 : 0 }}>
            {monthLabels.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                className="text-[10px] text-gray-400 dark:text-gray-500"
                style={{
                  position: 'relative',
                  left: `${m.weekIndex * (cellSize + cellGap)}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            {showLabels && (
              <div className="flex flex-col mr-1" style={{ gap: `${cellGap}px` }}>
                {dayLabels.map((day, i) => (
                  <span
                    key={day}
                    className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-end"
                    style={{ height: `${cellSize}px`, width: 26 }}
                  >
                    {i % 2 === 0 ? day : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Heat map cells */}
            <div className="flex" style={{ gap: `${cellGap}px` }}>
              {Array.from({ length: totalWeeks }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const cell = grid.find(
                      (c) => c.weekIndex === weekIndex && c.dayIndex === dayIndex
                    );

                    if (!cell) {
                      return (
                        <div
                          key={dayIndex}
                          style={{ width: cellSize, height: cellSize }}
                        />
                      );
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`rounded-sm ${getColorClass(cell.value)} transition-all duration-150 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 cursor-pointer`}
                        style={{ width: cellSize, height: cellSize }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: cell.date,
                            value: cell.value,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${cell.date}: ${cell.value} ${valueLabel}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="fixed bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-50 whitespace-nowrap"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-medium">{hoveredCell.value} {valueLabel}</span>
          <span className="text-gray-300 ml-1">on {hoveredCell.date}</span>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
          <span>Less</span>
          <div className={`w-3 h-3 rounded-sm ${scheme.empty}`} />
          {scheme.legendColors.map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}
