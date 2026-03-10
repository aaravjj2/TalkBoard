/**
 * StatCard — Reusable animated statistics card for analytics dashboards.
 * Shows a metric with label, optional trend, icon, and color-coded styling.
 */

import { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo';
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label?: string;
  };
  format?: 'number' | 'decimal' | 'percentage' | 'duration' | 'text';
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300',
    text: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300',
    text: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300',
    text: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300',
    text: 'text-red-600 dark:text-red-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-300',
    text: 'text-pink-600 dark:text-pink-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  stable: 'text-gray-500 dark:text-gray-400',
};

function formatValue(value: number | string, format: StatCardProps['format']): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'decimal':
      return value.toFixed(1);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration': {
      const minutes = Math.floor(value / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      return `${minutes}m`;
    }
    case 'number':
    default:
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
  }
}

function useAnimatedValue(target: number, animate: boolean, duration: number = 1000): number {
  const [current, setCurrent] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setCurrent(target);
      return;
    }

    const startTime = performance.now();
    const startValue = current;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = startValue + (target - startValue) * eased;
      setCurrent(next);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animate]);

  return current;
}

export default function StatCard({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
  trend,
  format = 'number',
  animate = true,
  size = 'md',
  onClick,
}: StatCardProps) {
  const colors = colorMap[color];
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useAnimatedValue(numericValue, animate && typeof value === 'number');

  const displayValue = typeof value === 'number'
    ? formatValue(Math.round(animatedValue * 10) / 10, format)
    : value;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div
      className={`
        rounded-xl border ${colors.bg} ${colors.border} ${sizeClasses[size]}
        transition-all duration-300 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className={`${valueSizeClasses[size]} font-bold text-gray-900 dark:text-white mt-1`}>
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColors[trend.direction]}`}>
              <span>{trendIcons[trend.direction]}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
              {trend.label && (
                <span className="text-gray-400 dark:text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className={`rounded-xl ${colors.icon} ${iconSizeClasses[size]} flex items-center justify-center flex-shrink-0 ml-3`}>
          <span role="img" aria-label={title}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
