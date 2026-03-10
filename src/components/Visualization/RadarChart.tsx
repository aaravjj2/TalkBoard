// ─── SVG Radar Chart ────────────────────────────────────────────────────────

import { useState } from 'react';
import type { ChartConfig } from '../../types/visualization';

interface RadarChartProps {
  config: ChartConfig;
  className?: string;
}

export default function RadarChart({ config, className = '' }: RadarChartProps) {
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);

  const { data, showLegend } = config;
  const series = data.series.filter(s => s.visible !== false);

  if (!series.length || !series[0].data.length) {
    return <div className={`flex items-center justify-center h-64 text-gray-400 ${className}`}>No data</div>;
  }

  const size = 300;
  const center = size / 2;
  const radius = center - 40;
  const labels = series[0].data.map(d => d.label);
  const numAxes = labels.length;

  const maxVal = Math.ceil(Math.max(...series.flatMap(s => s.data.map(d => d.value))) * 1.1) || 10;
  const levels = 5;

  function polarToCartesian(angle: number, r: number): { x: number; y: number } {
    // Start from top (-90°)
    const a = angle - Math.PI / 2;
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
    };
  }

  function getAngle(i: number): number {
    return (i / numAxes) * Math.PI * 2;
  }

  // Build grid
  const gridPolygons: string[] = [];
  for (let level = 1; level <= levels; level++) {
    const r = (level / levels) * radius;
    const points = Array.from({ length: numAxes }, (_, i) => {
      const p = polarToCartesian(getAngle(i), r);
      return `${p.x},${p.y}`;
    }).join(' ');
    gridPolygons.push(points);
  }

  // Axis lines
  const axisLines = Array.from({ length: numAxes }, (_, i) => {
    const p = polarToCartesian(getAngle(i), radius);
    return { x1: center, y1: center, x2: p.x, y2: p.y };
  });

  // Data polygons
  const dataPolygons = series.map((s) => {
    return s.data.map((d, i) => {
      const r = (d.value / maxVal) * radius;
      return polarToCartesian(getAngle(i), r);
    });
  });

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] h-auto mx-auto" role="img" aria-label={config.title}>
        {/* Grid polygons */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke="#D1D5DB" strokeWidth={1}
          />
        ))}

        {/* Level labels */}
        {Array.from({ length: levels }, (_, level) => {
          const val = Math.round((maxVal / levels) * (level + 1));
          const p = polarToCartesian(0, ((level + 1) / levels) * radius);
          return (
            <text key={level} x={p.x + 5} y={p.y} className="text-[9px] fill-gray-400" dominantBaseline="middle">
              {val}
            </text>
          );
        })}

        {/* Data polygons */}
        {dataPolygons.map((points, si) => {
          const isActive = hoveredSeries === null || hoveredSeries === si;
          const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
          return (
            <g key={si}>
              <path
                d={pathData}
                fill={series[si].color}
                fillOpacity={isActive ? 0.2 : 0.05}
                stroke={series[si].color}
                strokeWidth={isActive ? 2.5 : 1}
                strokeLinejoin="round"
                className="transition-all"
              />
              {points.map((p, di) => (
                <circle
                  key={di}
                  cx={p.x} cy={p.y} r={isActive ? 4 : 2.5}
                  fill="white"
                  stroke={series[si].color}
                  strokeWidth={2}
                  className="transition-all"
                />
              ))}
            </g>
          );
        })}

        {/* Axis labels */}
        {labels.map((label, i) => {
          const p = polarToCartesian(getAngle(i), radius + 20);
          const angle = getAngle(i);
          const textAnchor = angle > Math.PI / 4 && angle < (3 * Math.PI) / 4
            ? 'start'
            : angle > (5 * Math.PI) / 4 && angle < (7 * Math.PI) / 4
            ? 'end'
            : 'middle';

          return (
            <text
              key={i}
              x={p.x} y={p.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-[10px] fill-gray-600 font-medium"
            >
              {label.length > 12 ? label.slice(0, 11) + '…' : label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {series.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-xs cursor-pointer px-2 py-0.5 rounded transition-colors
                ${hoveredSeries === i ? 'bg-gray-100' : ''}`}
              onMouseEnter={() => setHoveredSeries(i)}
              onMouseLeave={() => setHoveredSeries(null)}
            >
              <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
