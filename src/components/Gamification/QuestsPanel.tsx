// ─── Quests Panel ───────────────────────────────────────────────────────────

import { useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import type { QuestType } from '../../types/gamification';

const TYPE_CONFIG: Record<QuestType, { color: string; bg: string; label: string }> = {
  daily: { color: '#F59E0B', bg: '#FEF3C7', label: 'Daily' },
  weekly: { color: '#3B82F6', bg: '#DBEAFE', label: 'Weekly' },
  story: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Story' },
  special: { color: '#EF4444', bg: '#FEE2E2', label: 'Special' },
};

export default function QuestsPanel() {
  const { quests, dailyChallenge } = useGamificationStore();
  const [typeFilter, setTypeFilter] = useState<QuestType | 'all'>('all');

  const filtered = typeFilter === 'all'
    ? quests
    : quests.filter(q => q.type === typeFilter);

  const active = quests.filter(q => q.status === 'active').length;
  const completed = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Daily challenge banner */}
      {dailyChallenge && (
        <div className={`rounded-xl p-4 ${
          dailyChallenge.allCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-amber-500 to-orange-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">
                {dailyChallenge.allCompleted ? '🎉 Daily Challenges Complete!' : '📅 Daily Challenges'}
              </h3>
              <p className="text-xs mt-0.5 opacity-80">
                {dailyChallenge.challenges.filter(c => c.status === 'completed').length}/{dailyChallenge.challenges.length} completed
                {dailyChallenge.allCompleted && ` · +${dailyChallenge.bonusXP} bonus XP!`}
              </p>
            </div>
            {!dailyChallenge.allCompleted && (
              <p className="text-xs opacity-80">
                Expires at midnight
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Quests
          </h3>
          <p className="text-xs text-gray-500">{active} active · {completed} completed</p>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTypeFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${typeFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          All ({quests.length})
        </button>
        {(Object.entries(TYPE_CONFIG) as [QuestType, (typeof TYPE_CONFIG)[QuestType]][]).map(([type, cfg]) => {
          const count = quests.filter(q => q.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${typeFilter === type ? 'text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              style={typeFilter === type ? { backgroundColor: cfg.color } : undefined}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        {filtered.map(quest => {
          const cfg = TYPE_CONFIG[quest.type];
          const totalObjectives = quest.objectives.length;
          const completedObj = quest.objectives.filter(o => o.isCompleted).length;
          const overallProgress = totalObjectives > 0 ? completedObj / totalObjectives : 0;
          const isCompleted = quest.status === 'completed';

          return (
            <div
              key={quest.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${
                isCompleted
                  ? 'border-green-200 dark:border-green-800 opacity-80'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{quest.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {quest.name}
                    </h4>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-green-500 font-medium">✓ Done</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
                </div>
              </div>

              {/* Objectives */}
              <div className="mt-3 space-y-2">
                {quest.objectives.map(obj => {
                  const objPct = Math.min(obj.current / obj.target, 1);
                  return (
                    <div key={obj.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${obj.isCompleted ? 'text-green-500 line-through' : 'text-gray-600 dark:text-gray-300'}`}>
                          {obj.isCompleted ? '✓ ' : '○ '}{obj.description}
                        </span>
                        <span className="text-gray-400">{obj.current}/{obj.target}</span>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full transition-all ${obj.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${objPct * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Rewards:</span>
                {quest.rewards.map((r, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] text-gray-600 dark:text-gray-300 font-medium"
                  >
                    {r.label}
                  </span>
                ))}
              </div>

              {/* Overall progress */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${overallProgress * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {completedObj}/{totalObjectives}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
