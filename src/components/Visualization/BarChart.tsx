// ─── SVG Bar Chart ──────────────────────────────────────────────────────────

import { useState } from 'react';
import type { ChartConfig } from '../../types/visualization';

interface BarChartProps {
  config: ChartConfig;
  className?: string;
}

export default function BarChart({ config, className = '' }: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{ series: number; index: number } | null>(null);

  const { data, showLegend, showGrid, showLabels, showValues, stacked, colors } = config;
  const series = data.series.filter(s => s.visible !== false);
  if (!series.length) {
    return <div className={`flex items-center justify-center h-64 text-gray-400 ${className}`}>No data</div>;
  }

  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;

  const categories = data.categories || series[0].data.map(d => d.label);
  const numCategories = categories.length;
  const numSeries = series.length;

  // Compute Y scale
  let maxVal: number;
  if (stacked) {
    maxVal = Math.max(
      ...categories.map((_, ci) =>
        series.reduce((sum, s) => sum + (s.data[ci]?.value || 0), 0)
      )
    );
  } else {
    maxVal = Math.max(...series.flatMap(s => s.data.map(d => d.value)));
  }
  maxVal = Math.ceil(maxVal * 1.1) || 10;

  const barGroupWidth = chartW / numCategories;
  const barPadding = barGroupWidth * 0.15;
  const barWidth = stacked
    ? barGroupWidth - barPadding * 2
    : (barGroupWidth - barPadding * 2) / numSeries;

  // Y axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={config.title}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {showGrid && yTicks.map((tick) => (
            <line
              key={tick}
              x1={0} x2={chartW}
              y1={chartH - (tick / maxVal) * chartH}
              y2={chartH - (tick / maxVal) * chartH}
              stroke="#E5E7EB" strokeDasharray="3,3"
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-8} y={chartH - (tick / maxVal) * chartH + 4}
              textAnchor="end" className="text-xs fill-gray-500"
            >
              {tick}
            </text>
          ))}

          {/* Bars */}
          {series.map((s, si) =>
            s.data.map((d, di) => {
              const isHovered = hoveredBar?.series === si && hoveredBar?.index === di;
              let x: number, y: number, h: number;

              if (stacked) {
                const stackBase = series.slice(0, si).reduce((sum, prev) => sum + (prev.data[di]?.value || 0), 0);
                x = di * barGroupWidth + barPadding;
                h = (d.value / maxVal) * chartH;
                y = chartH - ((stackBase + d.value) / maxVal) * chartH;
              } else {
                x = di * barGroupWidth + barPadding + si * barWidth;
                h = (d.value / maxVal) * chartH;
                y = chartH - h;
              }

              return (
                <g key={`${si}-${di}`}>
                  <rect
                    x={x} y={y}
                    width={stacked ? barWidth : barWidth - 2}
                    height={Math.max(0, h)}
                    fill={d.color || s.color || (colors || [])[si % (colors || []).length] || '#3B82F6'}
                    rx={2}
                    opacity={isHovered ? 1 : 0.85}
                    className="transition-opacity cursor-pointer"
                    onMouseEnter={() => setHoveredBar({ series: si, index: di })}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {showValues && (
                    <text
                      x={x + (stacked ? barWidth : barWidth - 2) / 2}
                      y={y - 4}
                      textAnchor="middle"
                      className="text-[10px] fill-gray-600 font-medium"
                    >
                      {d.value}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* X axis labels */}
          {showLabels && categories.map((cat, i) => (
            <text
              key={i}
              x={i * barGroupWidth + barGroupWidth / 2}
              y={chartH + 18}
              textAnchor="middle"
              className="text-[10px] fill-gray-500"
            >
              {cat.length > 10 ? cat.slice(0, 9) + '…' : cat}
            </text>
          ))}

          {/* Axes */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#9CA3AF" />
          <line x1={0} y1={0} x2={0} y2={chartH} stroke="#9CA3AF" />

          {/* Axis labels */}
          {data.xAxisLabel && (
            <text x={chartW / 2} y={chartH + 40} textAnchor="middle" className="text-xs fill-gray-500">{data.xAxisLabel}</text>
          )}
          {data.yAxisLabel && (
            <text x={-chartH / 2} y={-35} textAnchor="middle" transform="rotate(-90)" className="text-xs fill-gray-500">{data.yAxisLabel}</text>
          )}
        </g>

        {/* Tooltip */}
        {hoveredBar && (() => {
          const s = series[hoveredBar.series];
          const d = s.data[hoveredBar.index];
          const x = margin.left + hoveredBar.index * barGroupWidth + barGroupWidth / 2;
          const y = margin.top + chartH - (d.value / maxVal) * chartH - 30;
          return (
            <g>
              <rect x={x - 40} y={y - 14} width={80} height={28} rx={4} fill="#1F2937" opacity={0.95} />
              <text x={x} y={y + 4} textAnchor="middle" className="text-[11px] fill-white font-medium">
                {s.name}: {d.value}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
