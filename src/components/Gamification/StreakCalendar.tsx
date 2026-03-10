// ─── Streak Calendar ────────────────────────────────────────────────────────

import { useGamificationStore } from '../../stores/gamificationStore';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StreakCalendar() {
  const { streakInfo } = useGamificationStore();
  if (!streakInfo) return null;

  const { currentStreak, longestStreak, streakCalendar, weeklyTarget, weeklyProgress } = streakInfo;

  // Group calendar into weeks for grid display
  const last28 = streakCalendar.slice(-28);
  const weeks: typeof last28[] = [];
  for (let i = 0; i < last28.length; i += 7) {
    weeks.push(last28.slice(i, i + 7));
  }

  const weeklyPct = Math.round((weeklyProgress / weeklyTarget) * 100);

  return (
    <div className="space-y-4">
      {/* Streak banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔥</span>
              <span className="text-4xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-sm mt-1 text-orange-100">Day Streak</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">🏅 {longestStreak}</p>
            <p className="text-xs text-orange-100">Best Streak</p>
          </div>
        </div>

        {/* Weekly target */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-orange-100 mb-1">
            <span>Weekly Goal: {weeklyProgress}/{weeklyTarget} days</span>
            <span>{weeklyPct}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Activity Calendar (Last 28 days)
        </h4>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
          ))}
        </div>

        {/* Weeks */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const intensity = day.isActive
                  ? day.xpEarned > 80 ? 4 : day.xpEarned > 50 ? 3 : day.xpEarned > 20 ? 2 : 1
                  : 0;
                const colors = [
                  'bg-gray-100 dark:bg-gray-700',
                  'bg-green-200 dark:bg-green-900',
                  'bg-green-400 dark:bg-green-700',
                  'bg-green-500 dark:bg-green-600',
                  'bg-green-600 dark:bg-green-500',
                ];
                return (
                  <div
                    key={di}
                    className={`aspect-square rounded-md ${colors[intensity]} transition-colors`}
                    title={`${day.date}: ${day.isActive ? `${day.xpEarned} XP` : 'Inactive'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-gray-400">Less</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${
                ['bg-gray-100 dark:bg-gray-700', 'bg-green-200', 'bg-green-400', 'bg-green-500', 'bg-green-600'][i]
              }`}
            />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>

      {/* XP breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recent XP Earned
        </h4>
        <div className="space-y-2">
          {streakCalendar.slice(-7).reverse().map(day => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20">
                {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(day.xpEarned / 100 * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-12 text-right ${day.isActive ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                {day.xpEarned > 0 ? `+${day.xpEarned}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
