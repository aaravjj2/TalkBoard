// ─── Chart Renderer ─────────────────────────────────────────────────────────
// Universal chart component that renders the right chart type based on config.

import type { ChartConfig } from '../../types/visualization';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import RadarChart from './RadarChart';
import GaugeChart from './GaugeChart';

interface ChartRendererProps {
  config: ChartConfig;
  className?: string;
}

export default function ChartRenderer({ config, className = '' }: ChartRendererProps) {
  switch (config.type) {
    case 'bar':
      return <BarChart config={config} className={className} />;
    case 'line':
      return <LineChart config={config} className={className} />;
    case 'area':
      return <LineChart config={config} className={className} area />;
    case 'pie':
      return <PieChart config={config} className={className} />;
    case 'donut':
      return <PieChart config={config} className={className} donut />;
    case 'radar':
      return <RadarChart config={config} className={className} />;
    case 'gauge':
      return <GaugeChart config={config} className={className} />;
    case 'sparkline':
      return <LineChart config={{ ...config, showGrid: false, showLabels: false, showLegend: false }} className={className} />;
    default:
      return <BarChart config={config} className={className} />;
  }
}
