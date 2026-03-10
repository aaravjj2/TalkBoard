/**
 * StreakDisplay — Shows current and longest communication streak.
 */

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  size = 'md',
}: StreakDisplayProps) {
  const isActive = currentStreak > 0;

  const sizeClasses = {
    sm: {
      container: 'p-2 gap-2',
      icon: 'text-xl',
      value: 'text-lg',
      label: 'text-[10px]',
    },
    md: {
      container: 'p-4 gap-3',
      icon: 'text-3xl',
      value: 'text-2xl',
      label: 'text-xs',
    },
    lg: {
      container: 'p-6 gap-4',
      icon: 'text-5xl',
      value: 'text-4xl',
      label: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`
        rounded-xl border ${classes.container} flex items-center
        transition-all duration-300
        ${isActive
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {/* Fire icon with animation */}
      <div className="flex-shrink-0">
        <span
          className={`${classes.icon} ${isActive ? 'animate-pulse' : 'grayscale opacity-40'}`}
          role="img"
          aria-label="Streak"
        >
          🔥
        </span>
      </div>

      {/* Current streak */}
      <div className="flex-1 min-w-0">
        <p className={`${classes.value} font-bold ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {currentStreak}
          <span className={`${classes.label} font-normal ml-1 text-gray-500 dark:text-gray-400`}>
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        </p>
        <p className={`${classes.label} text-gray-500 dark:text-gray-400`}>
          {isActive ? 'Current streak' : 'No active streak'}
        </p>
      </div>

      {/* Longest streak */}
      {longestStreak > 0 && (
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {longestStreak}
          </p>
          <p className={`${classes.label} text-gray-400 dark:text-gray-500`}>
            Best
          </p>
        </div>
      )}

      {/* Motivational message */}
      {isActive && currentStreak >= 3 && (
        <div className="flex-shrink-0">
          <span className="text-sm" role="img" aria-label="Trophy">
            {currentStreak >= 30 ? '👑' : currentStreak >= 7 ? '⭐' : '💪'}
          </span>
        </div>
      )}
    </div>
  );
}
