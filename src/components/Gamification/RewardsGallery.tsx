// ─── Rewards Gallery ────────────────────────────────────────────────────────

import { useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import type { RewardType, AchievementRarity } from '../../types/gamification';

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const TYPE_LABELS: Record<RewardType, string> = {
  badge: 'Badges',
  theme: 'Themes',
  avatar_frame: 'Frames',
  title: 'Titles',
  sticker: 'Stickers',
  sound_effect: 'Sounds',
};

export default function RewardsGallery() {
  const { rewards, toggleEquipReward } = useGamificationStore();
  const [typeFilter, setTypeFilter] = useState<RewardType | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'owned' | 'locked'>('all');

  const filtered = rewards.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (ownerFilter === 'owned' && !r.isOwned) return false;
    if (ownerFilter === 'locked' && r.isOwned) return false;
    return true;
  });

  const owned = rewards.filter(r => r.isOwned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Rewards Collection
          </h3>
          <p className="text-xs text-gray-500">{owned}/{rewards.length} collected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTypeFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${typeFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          All
        </button>
        {(Object.entries(TYPE_LABELS) as [RewardType, string][]).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${typeFilter === type ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['all', 'owned', 'locked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setOwnerFilter(f)}
            className={`flex-1 px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize
              ${ownerFilter === f
                ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'
                : 'text-gray-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(reward => {
          const rarityColor = RARITY_COLORS[reward.rarity];
          return (
            <div
              key={reward.id}
              className={`rounded-xl border p-4 text-center transition-all ${
                reward.isOwned
                  ? reward.isEquipped
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
              }`}
            >
              {/* Rarity glow */}
              <div
                className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2"
                style={{ backgroundColor: `${rarityColor}15`, boxShadow: reward.isEquipped ? `0 0 12px ${rarityColor}40` : 'none' }}
              >
                {reward.icon}
              </div>

              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                {reward.name}
              </h4>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white capitalize"
                style={{ backgroundColor: rarityColor }}
              >
                {reward.rarity}
              </span>

              <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{reward.description}</p>

              {/* Action */}
              {reward.isOwned ? (
                <button
                  onClick={() => toggleEquipReward(reward.id)}
                  className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${reward.isEquipped
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                >
                  {reward.isEquipped ? '✓ Equipped' : 'Equip'}
                </button>
              ) : (
                <p className="mt-2 text-[10px] text-gray-400">🔒 {reward.source}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
