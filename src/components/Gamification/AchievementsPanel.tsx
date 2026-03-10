// ─── Achievements Panel ─────────────────────────────────────────────────────

import { useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import type { AchievementCategory, AchievementRarity } from '../../types/gamification';

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  communication: '💬',
  exploration: '🔍',
  consistency: '🔥',
  mastery: '🎯',
  social: '🤝',
  creativity: '🎨',
  milestone: '🏆',
};

export default function AchievementsPanel() {
  const { achievements } = useGamificationStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');

  const filtered = achievements.filter(a => {
    if (filter === 'unlocked' && !a.unlockedAt) return false;
    if (filter === 'locked' && a.unlockedAt) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  const unlocked = achievements.filter(a => a.unlockedAt).length;
  const visible = achievements.filter(a => !a.isHidden).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Achievements
          </h3>
          <p className="text-xs text-gray-500">{unlocked}/{visible} unlocked</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize
                ${filter === f
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'
                  : 'text-gray-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${categoryFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          All
        </button>
        {(Object.entries(CATEGORY_ICONS) as [AchievementCategory, string][]).map(([cat, icon]) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
              ${categoryFilter === cat ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {icon} {cat}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(ach => {
          const isUnlocked = !!ach.unlockedAt;
          const rarityColor = RARITY_COLORS[ach.rarity];
          const pct = Math.round(ach.progress * 100);

          return (
            <div
              key={ach.id}
              className={`rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                    isUnlocked ? '' : 'grayscale'
                  }`}
                  style={{ backgroundColor: `${rarityColor}20` }}
                >
                  {ach.isHidden && !isUnlocked ? '❓' : ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                      {ach.isHidden && !isUnlocked ? '???' : ach.name}
                    </h4>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white capitalize"
                      style={{ backgroundColor: rarityColor }}
                    >
                      {ach.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ach.isHidden && !isUnlocked ? 'A mysterious achievement...' : ach.description}
                  </p>
                  {/* Progress */}
                  {!isUnlocked && !ach.isHidden && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>{ach.requirement.current}/{ach.requirement.target}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: rarityColor }}
                        />
                      </div>
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-green-500 font-medium">✓ Unlocked</span>
                      <span className="text-[10px] text-gray-400">+{ach.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
