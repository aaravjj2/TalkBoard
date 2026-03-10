// ─── SVG Line / Area Chart ──────────────────────────────────────────────────

import { useState } from 'react';
import type { ChartConfig } from '../../types/visualization';

interface LineChartProps {
  config: ChartConfig;
  className?: string;
  area?: boolean;
}

export default function LineChart({ config, className = '', area = false }: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ series: number; index: number } | null>(null);

  const { data, showLegend, showGrid, showLabels, showValues } = config;
  const isArea = area || config.type === 'area';
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
  const maxVal = Math.ceil(Math.max(...series.flatMap(s => s.data.map(d => d.value))) * 1.1) || 10;
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  function getPoint(dataIndex: number, value: number): { x: number; y: number } {
    const x = categories.length > 1
      ? (dataIndex / (categories.length - 1)) * chartW
      : chartW / 2;
    const y = chartH - (value / maxVal) * chartH;
    return { x, y };
  }

  function buildPath(dataPoints: { label: string; value: number }[]): string {
    return dataPoints
      .map((d, i) => {
        const { x, y } = getPoint(i, d.value);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }

  function buildAreaPath(dataPoints: { label: string; value: number }[]): string {
    const linePath = buildPath(dataPoints);
    const lastX = getPoint(dataPoints.length - 1, dataPoints[dataPoints.length - 1].value).x;
    const firstX = getPoint(0, dataPoints[0].value).x;
    return `${linePath} L${lastX},${chartH} L${firstX},${chartH} Z`;
  }

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={config.title}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`area-grad-${si}-${config.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid */}
          {showGrid && yTicks.map(tick => (
            <line
              key={tick} x1={0} x2={chartW}
              y1={chartH - (tick / maxVal) * chartH}
              y2={chartH - (tick / maxVal) * chartH}
              stroke="#E5E7EB" strokeDasharray="3,3"
            />
          ))}

          {/* Y labels */}
          {yTicks.map(tick => (
            <text
              key={tick} x={-8} y={chartH - (tick / maxVal) * chartH + 4}
              textAnchor="end" className="text-xs fill-gray-500"
            >
              {tick}
            </text>
          ))}

          {/* Area fills */}
          {isArea && series.map((s, si) => (
            <path
              key={`area-${si}`}
              d={buildAreaPath(s.data)}
              fill={`url(#area-grad-${si}-${config.id})`}
            />
          ))}

          {/* Lines */}
          {series.map((s, si) => (
            <path
              key={`line-${si}`}
              d={buildPath(s.data)}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {series.map((s, si) =>
            s.data.map((d, di) => {
              const { x, y } = getPoint(di, d.value);
              const isHovered = hoveredPoint?.series === si && hoveredPoint?.index === di;
              return (
                <g key={`pt-${si}-${di}`}>
                  <circle
                    cx={x} cy={y} r={isHovered ? 5 : 3}
                    fill="white" stroke={s.color} strokeWidth={2}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint({ series: si, index: di })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {showValues && (
                    <text x={x} y={y - 10} textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">
                      {d.value}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* X labels */}
          {showLabels && categories.map((cat, i) => {
            // Show every Nth label if too many
            const step = Math.ceil(categories.length / 12);
            if (i % step !== 0 && i !== categories.length - 1) return null;
            const { x } = getPoint(i, 0);
            return (
              <text
                key={i} x={x} y={chartH + 18}
                textAnchor="middle" className="text-[10px] fill-gray-500"
              >
                {cat.length > 8 ? cat.slice(0, 7) + '…' : cat}
              </text>
            );
          })}

          {/* Axes */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#9CA3AF" />
          <line x1={0} y1={0} x2={0} y2={chartH} stroke="#9CA3AF" />

          {data.xAxisLabel && (
            <text x={chartW / 2} y={chartH + 40} textAnchor="middle" className="text-xs fill-gray-500">
              {data.xAxisLabel}
            </text>
          )}
          {data.yAxisLabel && (
            <text x={-chartH / 2} y={-35} textAnchor="middle" transform="rotate(-90)" className="text-xs fill-gray-500">
              {data.yAxisLabel}
            </text>
          )}
        </g>

        {/* Tooltip */}
        {hoveredPoint && (() => {
          const s = series[hoveredPoint.series];
          const d = s.data[hoveredPoint.index];
          const { x, y } = getPoint(hoveredPoint.index, d.value);
          const tx = margin.left + x;
          const ty = margin.top + y - 35;
          return (
            <g>
              <rect x={tx - 45} y={ty - 14} width={90} height={28} rx={4} fill="#1F2937" opacity={0.95} />
              <text x={tx} y={ty + 4} textAnchor="middle" className="text-[11px] fill-white font-medium">
                {s.name}: {d.value}
              </text>
            </g>
          );
        })()}
      </svg>

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
