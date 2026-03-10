// ─── SVG Gauge Chart ────────────────────────────────────────────────────────

import type { ChartConfig } from '../../types/visualization';

interface GaugeChartProps {
  config: ChartConfig;
  className?: string;
}

const PALETTE = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4',
];

export default function GaugeChart({ config, className = '' }: GaugeChartProps) {
  const { data } = config;
  const series = data.series[0];

  if (!series || !series.data.length) {
    return <div className={`flex items-center justify-center h-48 text-gray-400 ${className}`}>No data</div>;
  }

  const size = 200;
  const center = size / 2;
  const outerRadius = center - 15;
  const innerRadius = outerRadius - 18;
  const startAngle = -Math.PI * 0.75;
  const endAngle = Math.PI * 0.75;
  const totalAngle = endAngle - startAngle;

  function polarToXY(angle: number, r: number): { x: number; y: number } {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function arcPath(start: number, end: number, outer: number, inner: number): string {
    const p1 = polarToXY(start, outer);
    const p2 = polarToXY(end, outer);
    const p3 = polarToXY(end, inner);
    const p4 = polarToXY(start, inner);
    const large = end - start > Math.PI ? 1 : 0;
    return `M${p1.x},${p1.y} A${outer},${outer} 0 ${large} 1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${inner},${inner} 0 ${large} 0 ${p4.x},${p4.y} Z`;
  }

  // Zones: red < 33, yellow < 66, green >= 66
  const zones = [
    { end: 0.33, color: '#EF4444' },
    { end: 0.66, color: '#F59E0B' },
    { end: 1.0, color: '#22C55E' },
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {series.data.map((d, i) => {
        const percentage = Math.min(Math.max(d.value / 100, 0), 1);
        const valueAngle = startAngle + totalAngle * percentage;
        const color = d.color || zones.find(z => percentage <= z.end)?.color || '#3B82F6';

        return (
          <div key={i} className="flex flex-col items-center">
            <svg viewBox={`0 0 ${size} ${size * 0.7}`} className="w-40 h-auto">
              {/* Background track */}
              <path
                d={arcPath(startAngle, endAngle, outerRadius, innerRadius)}
                fill="#E5E7EB"
              />

              {/* Zone segments */}
              {zones.map((zone, zi) => {
                const zStart = zi === 0 ? startAngle : startAngle + totalAngle * zones[zi - 1].end;
                const zEnd = startAngle + totalAngle * zone.end;
                return (
                  <path
                    key={zi}
                    d={arcPath(zStart, zEnd, outerRadius, innerRadius)}
                    fill={zone.color}
                    opacity={0.15}
                  />
                );
              })}

              {/* Value arc */}
              {percentage > 0.01 && (
                <path
                  d={arcPath(startAngle, valueAngle, outerRadius, innerRadius)}
                  fill={color}
                  opacity={0.85}
                />
              )}

              {/* Needle */}
              {(() => {
                const needleLen = outerRadius - 8;
                const tip = polarToXY(valueAngle, needleLen);
                const baseLeft = polarToXY(valueAngle + Math.PI / 2, 3);
                const baseRight = polarToXY(valueAngle - Math.PI / 2, 3);
                return (
                  <g>
                    <polygon
                      points={`${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`}
                      fill="#374151"
                    />
                    <circle cx={center} cy={center} r={5} fill="#374151" />
                    <circle cx={center} cy={center} r={2.5} fill="white" />
                  </g>
                );
              })()}

              {/* Value text */}
              <text
                x={center} y={center + 22}
                textAnchor="middle"
                className="text-xl fill-gray-700 font-bold"
              >
                {d.value}%
              </text>

              {/* Min/Max labels */}
              <text x={polarToXY(startAngle, outerRadius + 10).x} y={polarToXY(startAngle, outerRadius + 10).y + 5} textAnchor="middle" className="text-[9px] fill-gray-400">0</text>
              <text x={polarToXY(endAngle, outerRadius + 10).x} y={polarToXY(endAngle, outerRadius + 10).y + 5} textAnchor="middle" className="text-[9px] fill-gray-400">100</text>
            </svg>
            <span className="text-xs text-gray-600 font-medium -mt-1">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
