/**
 * GoalCard — Interactive goal tracking card with progress ring & editing.
 */

import { useState } from 'react';
import type { Goal } from '@/types/analytics';

interface GoalCardProps {
  goal: Goal;
  onUpdate?: (id: string, updates: Partial<Goal>) => void;
  onRemove?: (id: string) => void;
}

function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = '#3B82F6',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

const goalTypeIcons: Record<string, string> = {
  daily_symbols: '🎯',
  daily_sentences: '💬',
  weekly_sessions: '📅',
  streak_days: '🔥',
  categories_explored: '🗺️',
  unique_symbols: '📚',
  vocabulary_growth: '🌱',
};

const goalTypeColors: Record<string, string> = {
  daily_symbols: '#3B82F6',
  daily_sentences: '#10B981',
  weekly_sessions: '#8B5CF6',
  streak_days: '#F97316',
  categories_explored: '#EC4899',
  unique_symbols: '#14B8A6',
  vocabulary_growth: '#EAB308',
};

export default function GoalCard({
  goal,
  onUpdate,
  onRemove,
}: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const progress = goal.targetValue > 0
    ? (goal.currentValue / goal.targetValue) * 100
    : 0;
  const isCompleted = goal.completedAt !== null;
  const icon = goalTypeIcons[goal.type] || '🎯';
  const color = goalTypeColors[goal.type] || '#3B82F6';

  return (
    <div
      className={`
        relative rounded-xl border p-4 transition-all duration-300
        ${isCompleted
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing progress={progress} color={isCompleted ? '#10B981' : color} />
          <span className="absolute inset-0 flex items-center justify-center text-lg">
            {isCompleted ? '✓' : icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {goal.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {goal.description}
              </p>
            </div>

            {/* Menu button */}
            {(onUpdate || onRemove) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Goal options"
                >
                  ⋯
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    {onUpdate && !isCompleted && (
                      <button
                        onClick={() => {
                          onUpdate(goal.id, {
                            completedAt: new Date().toISOString(),
                          });
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    {onUpdate && !isCompleted && (
                      <button
                        onClick={() => {
                          onUpdate(goal.id, { isActive: !goal.isActive });
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {goal.isActive ? 'Pause' : 'Resume'}
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => {
                          onRemove(goal.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress info */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {goal.currentValue} / {goal.targetValue}
              </span>
              <span
                className="font-medium"
                style={{ color: isCompleted ? '#10B981' : color }}
              >
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isCompleted ? '#10B981' : color,
                }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            <span>Started {new Date(goal.startDate).toLocaleDateString()}</span>
            {goal.endDate && (
              <span>Due {new Date(goal.endDate).toLocaleDateString()}</span>
            )}
            {isCompleted && goal.completedAt && (
              <span className="text-green-500">
                Completed {new Date(goal.completedAt).toLocaleDateString()}
              </span>
            )}
            {!goal.isActive && !isCompleted && (
              <span className="text-amber-500">Paused</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
