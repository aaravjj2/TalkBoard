/**
 * BarChart — Pure CSS/div-based horizontal and vertical bar chart component.
 * No external charting library required — renders with Tailwind CSS.
 */

import { useState } from 'react';

interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  direction?: 'horizontal' | 'vertical';
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  maxBars?: number;
  emptyMessage?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'rainbow';
}

const colorSchemes = {
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#2563EB', '#1D4ED8', '#1E40AF'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#059669', '#047857', '#065F46'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#7C3AED', '#6D28D9', '#5B21B6'],
  rainbow: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'],
};

export default function BarChart({
  data,
  title,
  direction = 'vertical',
  height = 200,
  showValues = true,
  showLabels = true,
  animate = true,
  maxBars,
  emptyMessage = 'No data available',
  colorScheme = 'blue',
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayData = maxBars ? data.slice(0, maxBars) : data;
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);
  const colors = colorSchemes[colorScheme];

  if (displayData.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 py-8">
        {emptyMessage}
      </div>
    );
  }

  if (direction === 'horizontal') {
    return (
      <div className="space-y-1">
        {title && (
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {title}
          </h3>
        )}
        {displayData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const barColor = item.color || colors[index % colors.length];
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`${item.label}-${index}`}
              className="group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between text-xs mb-0.5">
                {showLabels && (
                  <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                    {item.label}
                  </span>
                )}
                {showValues && (
                  <span className="text-gray-500 dark:text-gray-400 font-medium ml-2">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${animate ? 'duration-1000' : 'duration-0'} ${isHovered ? 'opacity-100' : 'opacity-85'}`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              {isHovered && item.tooltip && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bar chart
  const barWidth = Math.max(16, Math.min(48, Math.floor(500 / displayData.length)));
  const gap = Math.max(4, Math.min(12, Math.floor(200 / displayData.length)));

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h3>
      )}
      <div className="flex items-end justify-center gap-1" style={{ height: `${height}px` }}>
        {displayData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const barColor = item.color || colors[index % colors.length];
          const isHovered = hoveredIndex === index;
          const barH = Math.max(2, (percentage / 100) * height);

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-col items-center"
              style={{ width: `${barWidth}px`, gap: `${gap}px` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Value label */}
              {showValues && isHovered && (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {item.value.toLocaleString()}
                </span>
              )}

              {/* Bar */}
              <div className="relative w-full flex items-end" style={{ height: `${height - 20}px` }}>
                <div
                  className={`w-full rounded-t-md transition-all ${animate ? 'duration-700' : 'duration-0'} ${isHovered ? 'opacity-100 scale-x-110' : 'opacity-80'}`}
                  style={{
                    height: `${barH}px`,
                    backgroundColor: barColor,
                  }}
                  title={item.tooltip || `${item.label}: ${item.value}`}
                />
              </div>

              {/* Label */}
              {showLabels && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
