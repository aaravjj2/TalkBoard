/**
 * MilestoneCard — Displays achievement milestone with progress indicator.
 * Shows achieved/unachieved state with animation on unlock.
 */

import type { Milestone } from '@/types/analytics';

interface MilestoneCardProps {
  milestone: Milestone;
  compact?: boolean;
  showProgress?: boolean;
  currentValue?: number;
}

export default function MilestoneCard({
  milestone,
  compact = false,
  showProgress = false,
  currentValue,
}: MilestoneCardProps) {
  const isAchieved = milestone.achievedAt !== null;
  const progress = currentValue !== undefined
    ? Math.min((currentValue / milestone.requirement.threshold) * 100, 100)
    : isAchieved ? 100 : 0;

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-2 p-2 rounded-lg border transition-all duration-300
          ${isAchieved
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
          }
        `}
      >
        <span className={`text-xl ${isAchieved ? '' : 'grayscale'}`}>
          {milestone.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${isAchieved ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {milestone.title}
          </p>
          {!isAchieved && showProgress && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div
                className="bg-yellow-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        {isAchieved && (
          <span className="text-[10px] text-yellow-600 dark:text-yellow-400">✓</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4 transition-all duration-300
        ${isAchieved
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700 shadow-sm'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {/* Achievement glow effect */}
      {isAchieved && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 dark:bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${isAchieved
              ? 'bg-yellow-100 dark:bg-yellow-800/40'
              : 'bg-gray-100 dark:bg-gray-700 grayscale'
            }
          `}
        >
          {milestone.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold ${
              isAchieved ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {milestone.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {milestone.description}
          </p>

          {/* Progress bar for unachieved */}
          {!isAchieved && showProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                <span>{currentValue ?? 0} / {milestone.requirement.threshold}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Achievement date */}
          {isAchieved && milestone.achievedAt && (
            <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1">
              Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
