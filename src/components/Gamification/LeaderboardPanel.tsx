// ─── Leaderboard Panel ──────────────────────────────────────────────────────

import { useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import type { LeaderboardPeriod, LeaderboardCategory } from '../../types/gamification';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPanel() {
  const { leaderboard, refreshLeaderboard } = useGamificationStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>('allTime');
  const [category, setCategory] = useState<LeaderboardCategory>('xp');

  function handleFilterChange(p: LeaderboardPeriod, c: LeaderboardCategory) {
    setPeriod(p);
    setCategory(c);
    refreshLeaderboard(p, c);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Leaderboard
      </h3>

      {/* Period filter */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {([
          ['daily', 'Today'],
          ['weekly', 'Week'],
          ['monthly', 'Month'],
          ['allTime', 'All Time'],
        ] as [LeaderboardPeriod, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => handleFilterChange(p, category)}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${period === p
                ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'
                : 'text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {([
          ['xp', '⭐ XP'],
          ['streak', '🔥 Streak'],
          ['achievements', '🏆 Achievements'],
          ['communication', '💬 Messages'],
        ] as [LeaderboardCategory, string][]).map(([c, label]) => (
          <button
            key={c}
            onClick={() => handleFilterChange(period, c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${category === c ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 py-4">
        {[1, 0, 2].map((idx) => {
          const entry = leaderboard[idx];
          if (!entry) return null;
          const isFirst = idx === 0;
          return (
            <div
              key={entry.userId}
              className={`text-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
            >
              <div className={`text-3xl mb-1 ${isFirst ? 'text-4xl' : ''}`}>{entry.avatar}</div>
              <div
                className={`rounded-xl p-3 ${isFirst ? 'h-24' : 'h-20'} flex flex-col items-center justify-center`}
                style={{ backgroundColor: `${MEDAL_COLORS[idx]}20`, borderColor: MEDAL_COLORS[idx], borderWidth: 2 }}
              >
                <span className="text-lg font-bold" style={{ color: MEDAL_COLORS[idx] }}>
                  #{entry.rank}
                </span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate max-w-[80px]">
                  {entry.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {category === 'xp' ? `${entry.xp} XP` :
                   category === 'streak' ? `${entry.streakDays} days` :
                   category === 'achievements' ? `${entry.achievementCount} ach.` :
                   `Lv.${entry.level}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard.map(entry => (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              entry.isCurrentUser
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center">
              {entry.rank <= 3 ? (
                <span className="text-lg font-bold" style={{ color: MEDAL_COLORS[entry.rank - 1] }}>
                  {entry.rank}
                </span>
              ) : (
                <span className="text-sm text-gray-500 font-medium">{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <span className="text-xl">{entry.avatar}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                entry.isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
              }`}>
                {entry.name}
              </p>
              <p className="text-xs text-gray-500">Level {entry.level}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {category === 'xp' ? `${entry.xp.toLocaleString()} XP` :
                 category === 'streak' ? `${entry.streakDays} days` :
                 category === 'achievements' ? `${entry.achievementCount}` :
                 `Lv.${entry.level}`}
              </p>
              <p className="text-[10px] text-gray-400">🔥 {entry.streakDays}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
