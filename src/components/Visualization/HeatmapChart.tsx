// ─── Heatmap Chart ──────────────────────────────────────────────────────────

import { useState } from 'react';

interface HeatmapChartProps {
  data: { day: string; hour: number; value: number }[];
  title?: string;
  className?: string;
}

export default function HeatmapChart({ data, title, className = '' }: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; value: number } | null>(null);

  if (!data.length) {
    return <div className={`flex items-center justify-center h-48 text-gray-400 ${className}`}>No data</div>;
  }

  const days = [...new Set(data.map(d => d.day))];
  const hours = [...new Set(data.map(d => d.hour))].sort((a, b) => a - b);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  function getColor(value: number): string {
    const intensity = value / maxVal;
    if (intensity === 0) return '#F3F4F6';
    if (intensity < 0.2) return '#DBEAFE';
    if (intensity < 0.4) return '#93C5FD';
    if (intensity < 0.6) return '#60A5FA';
    if (intensity < 0.8) return '#3B82F6';
    return '#1D4ED8';
  }

  const cellSize = 28;
  const labelPadW = 40;
  const labelPadH = 24;
  const width = labelPadW + hours.length * cellSize + 10;
  const height = labelPadH + days.length * cellSize + 40;

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h4>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title || 'Heatmap'}>
        {/* Hour labels */}
        {hours.map((hour, i) => (
          <text
            key={hour}
            x={labelPadW + i * cellSize + cellSize / 2}
            y={labelPadH - 6}
            textAnchor="middle"
            className="text-[9px] fill-gray-500"
          >
            {hour}:00
          </text>
        ))}

        {/* Day labels */}
        {days.map((day, di) => (
          <text
            key={day}
            x={labelPadW - 6}
            y={labelPadH + di * cellSize + cellSize / 2 + 3}
            textAnchor="end"
            className="text-[10px] fill-gray-500 font-medium"
          >
            {day}
          </text>
        ))}

        {/* Cells */}
        {data.map((cell, i) => {
          const di = days.indexOf(cell.day);
          const hi = hours.indexOf(cell.hour);
          if (di === -1 || hi === -1) return null;

          const x = labelPadW + hi * cellSize;
          const y = labelPadH + di * cellSize;
          const isHovered = hoveredCell?.day === cell.day && hoveredCell?.hour === cell.hour;

          return (
            <g key={i}>
              <rect
                x={x + 1} y={y + 1}
                width={cellSize - 2} height={cellSize - 2}
                rx={3}
                fill={getColor(cell.value)}
                stroke={isHovered ? '#1F2937' : 'transparent'}
                strokeWidth={isHovered ? 2 : 0}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
              />
              {cell.value > 0 && cellSize >= 24 && (
                <text
                  x={x + cellSize / 2} y={y + cellSize / 2 + 3}
                  textAnchor="middle"
                  className={`text-[9px] font-medium pointer-events-none ${
                    cell.value / maxVal > 0.5 ? 'fill-white' : 'fill-gray-600'
                  }`}
                >
                  {cell.value}
                </text>
              )}
            </g>
          );
        })}

        {/* Color legend */}
        {(() => {
          const legendY = labelPadH + days.length * cellSize + 12;
          const legendSteps = 6;
          const stepW = 24;
          const startX = labelPadW;
          return (
            <g>
              <text x={startX - 2} y={legendY + 10} className="text-[9px] fill-gray-400">Less</text>
              {Array.from({ length: legendSteps }, (_, i) => (
                <rect
                  key={i}
                  x={startX + 28 + i * stepW}
                  y={legendY}
                  width={stepW - 2} height={14} rx={2}
                  fill={getColor((maxVal / legendSteps) * (i + 1))}
                />
              ))}
              <text x={startX + 28 + legendSteps * stepW + 4} y={legendY + 10} className="text-[9px] fill-gray-400">More</text>
            </g>
          );
        })()}

        {/* Tooltip */}
        {hoveredCell && (() => {
          const di = days.indexOf(hoveredCell.day);
          const hi = hours.indexOf(hoveredCell.hour);
          const tx = labelPadW + hi * cellSize + cellSize / 2;
          const ty = labelPadH + di * cellSize - 8;
          const text = `${hoveredCell.day} ${hoveredCell.hour}:00 — ${hoveredCell.value} interactions`;
          return (
            <g>
              <rect x={tx - 70} y={ty - 18} width={140} height={22} rx={4} fill="#1F2937" opacity={0.95} />
              <text x={tx} y={ty - 4} textAnchor="middle" className="text-[9px] fill-white">{text}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
