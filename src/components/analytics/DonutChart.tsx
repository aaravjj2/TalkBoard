/**
 * DonutChart — Pure SVG donut/pie chart component with interactive segments.
 * Lightweight implementation using SVG arcs — no external charting library.
 */

import { useState, useMemo } from 'react';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  title?: string;
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  showCenter?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  emptyMessage?: string;
  animate?: boolean;
  maxSegments?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const rad = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export default function DonutChart({
  segments,
  title,
  size = 200,
  thickness = 30,
  showLegend = true,
  showCenter = true,
  centerLabel,
  centerValue,
  emptyMessage = 'No data available',
  animate = true,
  maxSegments = 8,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const processedSegments = useMemo(() => {
    if (segments.length === 0) return [];

    // Sort by value descending and limit
    const sorted = [...segments].sort((a, b) => b.value - a.value);
    let display = sorted.slice(0, maxSegments);

    // Group remaining as "Other"
    if (sorted.length > maxSegments) {
      const otherValue = sorted.slice(maxSegments).reduce((sum, s) => sum + s.value, 0);
      display.push({
        label: 'Other',
        value: otherValue,
        color: '#9CA3AF',
      });
    }

    const total = display.reduce((sum, s) => sum + s.value, 0);

    return display.map((seg) => ({
      ...seg,
      percentage: total > 0 ? (seg.value / total) * 100 : 0,
    }));
  }, [segments, maxSegments]);

  const total = processedSegments.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - thickness) / 2;

  if (processedSegments.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center">
        {title && (
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {title}
          </h3>
        )}
        <div
          className="flex items-center justify-center text-gray-400 dark:text-gray-500"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={thickness}
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{emptyMessage}</p>
      </div>
    );
  }

  // Build arcs
  let currentAngle = 0;
  const arcs = processedSegments.map((seg, index) => {
    const angle = (seg.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + Math.max(angle - 1, 0.5); // Small gap between segments
    currentAngle += angle;

    return {
      ...seg,
      startAngle,
      endAngle,
      path: describeArc(cx, cy, radius, startAngle, endAngle),
      index,
    };
  });

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h3>
      )}

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className={animate ? 'animate-spin-slow' : ''}
          style={animate ? { animation: 'none' } : undefined}
        >
          {arcs.map((arc) => {
            const isHovered = hoveredIndex === arc.index;
            const scale = isHovered ? 1.05 : 1;

            return (
              <path
                key={arc.label}
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHovered ? thickness + 4 : thickness}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIndex(arc.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  transform: isHovered ? `scale(${scale})` : undefined,
                  transformOrigin: `${cx}px ${cy}px`,
                  opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        {showCenter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hoveredIndex !== null ? (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {processedSegments[hoveredIndex].percentage?.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[80px] text-center truncate">
                  {processedSegments[hoveredIndex].label}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {processedSegments[hoveredIndex].value.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {centerValue ?? total.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {centerLabel ?? 'Total'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full max-w-xs">
          {processedSegments.map((seg, index) => (
            <div
              key={seg.label}
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${
                hoveredIndex !== null && hoveredIndex !== index ? 'opacity-50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {seg.label}
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-auto">
                {seg.percentage?.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
