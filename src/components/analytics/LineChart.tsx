/**
 * LineChart — Pure CSS/SVG-based line chart component for time-series data.
 * Renders with SVG paths and Tailwind CSS — no external charting library.
 */

import { useState, useMemo, useRef } from 'react';

interface LineChartDataset {
  label: string;
  data: number[];
  color: string;
  fill?: boolean;
  dashed?: boolean;
}

interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  title?: string;
  height?: number;
  width?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  emptyMessage?: string;
  animate?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  values: { dataset: string; value: number; color: string }[];
}

function generateSVGPath(
  points: { x: number; y: number }[],
  smooth: boolean = true
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  if (!smooth) {
    return points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');
  }

  // Catmull-Rom to cubic bezier
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function generateFillPath(
  points: { x: number; y: number }[],
  chartHeight: number,
  smooth: boolean = true
): string {
  if (points.length === 0) return '';

  const linePath = generateSVGPath(points, smooth);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;
}

export default function LineChart({
  labels,
  datasets,
  title,
  height = 250,
  width,
  showGrid = true,
  showDots = true,
  showLegend = true,
  showTooltip = true,
  yAxisLabel,
  xAxisLabel,
  emptyMessage = 'No data available',
  animate = true,
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = (width || 600) - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = datasets.flatMap((d) => d.data);
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  // Generate Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(minValue + (valueRange * i) / tickCount);
    }
    return ticks;
  }, [minValue, valueRange]);

  // Generate points for each dataset
  const datasetPoints = useMemo(() => {
    return datasets.map((dataset) => ({
      ...dataset,
      points: dataset.data.map((value, i) => ({
        x: labels.length > 1 ? (i / (labels.length - 1)) * chartWidth : chartWidth / 2,
        y: chartHeight - ((value - minValue) / valueRange) * chartHeight,
      })),
    }));
  }, [datasets, labels.length, chartWidth, chartHeight, minValue, valueRange]);

  if (datasets.length === 0 || labels.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 py-8" style={{ height }}>
        {emptyMessage}
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltip || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    const dataIndex = Math.round((x / chartWidth) * (labels.length - 1));

    if (dataIndex >= 0 && dataIndex < labels.length) {
      const values = datasets.map((ds) => ({
        dataset: ds.label,
        value: ds.data[dataIndex] || 0,
        color: ds.color,
      }));

      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label: labels[dataIndex],
        values,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h3>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${height}`}
        className="w-full"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {showGrid && yTicks.map((tick) => {
            const y = chartHeight - ((tick - minValue) / valueRange) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={-8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-gray-400 dark:fill-gray-500"
                >
                  {Math.round(tick)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, i) => {
            const x = labels.length > 1 ? (i / (labels.length - 1)) * chartWidth : chartWidth / 2;
            // Show every nth label to prevent overlap
            const showLabel = labels.length <= 10 || i % Math.ceil(labels.length / 10) === 0;
            if (!showLabel) return null;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-[10px] fill-gray-400 dark:fill-gray-500"
              >
                {label}
              </text>
            );
          })}

          {/* Dataset lines */}
          {datasetPoints.map((ds, di) => (
            <g key={ds.label}>
              {/* Fill area */}
              {ds.fill && (
                <path
                  d={generateFillPath(ds.points, chartHeight)}
                  fill={ds.color}
                  fillOpacity={0.08}
                  className={animate ? 'animate-fade-in' : ''}
                />
              )}

              {/* Line */}
              <path
                d={generateSVGPath(ds.points)}
                fill="none"
                stroke={ds.color}
                strokeWidth={2}
                strokeDasharray={ds.dashed ? '6 4' : undefined}
                className={animate ? 'animate-fade-in' : ''}
                style={animate ? { animationDelay: `${di * 150}ms` } : undefined}
              />

              {/* Dots */}
              {showDots && ds.points.map((point, pi) => (
                <circle
                  key={pi}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={ds.color}
                  stroke="white"
                  strokeWidth={1.5}
                  className="opacity-0 hover:opacity-100 transition-opacity"
                />
              ))}
            </g>
          ))}

          {/* Axis lines */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="currentColor" strokeOpacity={0.2} />
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" strokeOpacity={0.2} />

          {/* Y-axis label */}
          {yAxisLabel && (
            <text
              x={-chartHeight / 2}
              y={-35}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-[10px] fill-gray-400 dark:fill-gray-500"
            >
              {yAxisLabel}
            </text>
          )}

          {/* X-axis label */}
          {xAxisLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight + 35}
              textAnchor="middle"
              className="text-[10px] fill-gray-400 dark:fill-gray-500"
            >
              {xAxisLabel}
            </text>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 pointer-events-none z-10"
          style={{
            left: Math.min(tooltip.x + 10, (width || 600) - 150),
            top: tooltip.y - 10,
          }}
        >
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {tooltip.label}
          </p>
          {tooltip.values.map((v) => (
            <div key={v.dataset} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              <span className="text-gray-500 dark:text-gray-400">{v.dataset}:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {v.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {showLegend && datasets.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          {datasets.map((ds) => (
            <div key={ds.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3 h-1 rounded-full"
                style={{ backgroundColor: ds.color }}
              />
              <span className="text-gray-500 dark:text-gray-400">{ds.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
