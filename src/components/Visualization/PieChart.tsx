// ─── SVG Pie / Donut Chart ──────────────────────────────────────────────────

import { useState } from 'react';
import type { ChartConfig } from '../../types/visualization';

interface PieChartProps {
  config: ChartConfig;
  className?: string;
  donut?: boolean;
}

const PALETTE = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4',
];

export default function PieChart({ config, className = '', donut = false }: PieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const isDonut = donut || config.type === 'donut';
  const { data, showLegend, showValues } = config;
  const series = data.series[0];

  if (!series || !series.data.length) {
    return <div className={`flex items-center justify-center h-64 text-gray-400 ${className}`}>No data</div>;
  }

  const size = 280;
  const center = size / 2;
  const outerRadius = center - 20;
  const innerRadius = isDonut ? outerRadius * 0.55 : 0;

  const total = series.data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <div className={`flex items-center justify-center h-64 text-gray-400 ${className}`}>No data</div>;
  }

  // Build slices
  interface Slice {
    startAngle: number;
    endAngle: number;
    value: number;
    label: string;
    color: string;
    percentage: number;
  }

  const slices: Slice[] = [];
  let currentAngle = -Math.PI / 2;
  for (let i = 0; i < series.data.length; i++) {
    const d = series.data[i];
    const angle = (d.value / total) * Math.PI * 2;
    slices.push({
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      value: d.value,
      label: d.label,
      color: d.color || PALETTE[i % PALETTE.length],
      percentage: Math.round((d.value / total) * 100),
    });
    currentAngle += angle;
  }

  function arcPath(startAngle: number, endAngle: number, outer: number, inner: number): string {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const x1 = center + outer * Math.cos(startAngle);
    const y1 = center + outer * Math.sin(startAngle);
    const x2 = center + outer * Math.cos(endAngle);
    const y2 = center + outer * Math.sin(endAngle);

    if (inner > 0) {
      const x3 = center + inner * Math.cos(endAngle);
      const y3 = center + inner * Math.sin(endAngle);
      const x4 = center + inner * Math.cos(startAngle);
      const y4 = center + inner * Math.sin(startAngle);
      return `M${x1},${y1} A${outer},${outer} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${largeArc} 0 ${x4},${y4} Z`;
    }

    return `M${center},${center} L${x1},${y1} A${outer},${outer} 0 ${largeArc} 1 ${x2},${y2} Z`;
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] h-auto" role="img" aria-label={config.title}>
          {slices.map((slice, i) => {
            const isHovered = hoveredSlice === i;
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const pullOut = isHovered ? 6 : 0;
            const tx = pullOut * Math.cos(midAngle);
            const ty = pullOut * Math.sin(midAngle);

            return (
              <g key={i} transform={`translate(${tx},${ty})`}>
                <path
                  d={arcPath(slice.startAngle, slice.endAngle, outerRadius, innerRadius)}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth={2}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Value label on slice */}
                {showValues && slice.percentage >= 5 && (() => {
                  const labelRadius = inner > 0 ? (outerRadius + innerRadius) / 2 : outerRadius * 0.65;
                  const lx = center + labelRadius * Math.cos(midAngle);
                  const ly = center + labelRadius * Math.sin(midAngle);
                  return (
                    <text
                      x={lx} y={ly}
                      textAnchor="middle" dominantBaseline="middle"
                      className="text-[11px] fill-white font-bold pointer-events-none"
                    >
                      {slice.percentage}%
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Center label for donut */}
          {isDonut && (
            <g>
              <text x={center} y={center - 6} textAnchor="middle" className="text-lg fill-gray-700 dark:fill-gray-200 font-bold">
                {hoveredSlice !== null ? slices[hoveredSlice].value : total}
              </text>
              <text x={center} y={center + 14} textAnchor="middle" className="text-[11px] fill-gray-500">
                {hoveredSlice !== null ? slices[hoveredSlice].label : 'Total'}
              </text>
            </g>
          )}

          {/* Tooltip */}
          {hoveredSlice !== null && !isDonut && (() => {
            const s = slices[hoveredSlice];
            return (
              <g>
                <rect x={center - 55} y={center - 18} width={110} height={36} rx={6} fill="#1F2937" opacity={0.95} />
                <text x={center} y={center - 2} textAnchor="middle" className="text-[11px] fill-white font-medium">
                  {s.label}
                </text>
                <text x={center} y={center + 12} textAnchor="middle" className="text-[10px] fill-gray-300">
                  {s.value} ({s.percentage}%)
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-1.5">
            {slices.map((slice, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded cursor-pointer transition-colors
                  ${hoveredSlice === i ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{slice.label}</span>
                <span className="text-gray-400 ml-auto">{slice.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
