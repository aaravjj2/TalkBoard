// ─── Level Progress Card ────────────────────────────────────────────────────

import { useGamificationStore } from '../../stores/gamificationStore';

const LEVEL_TABLE = [
  { level: 1, title: 'Beginner', icon: '🌱' },
  { level: 2, title: 'Learner', icon: '📖' },
  { level: 3, title: 'Explorer', icon: '🔍' },
  { level: 4, title: 'Speaker', icon: '🗣️' },
  { level: 5, title: 'Communicator', icon: '💬' },
  { level: 6, title: 'Storyteller', icon: '📚' },
  { level: 7, title: 'Conversationalist', icon: '🎭' },
  { level: 8, title: 'Wordsmith', icon: '✍️' },
  { level: 9, title: 'Eloquent', icon: '🎯' },
  { level: 10, title: 'Master', icon: '👑' },
  { level: 11, title: 'Champion', icon: '🏆' },
  { level: 12, title: 'Legend', icon: '⭐' },
];

export default function LevelProgressCard() {
  const { userProgress } = useGamificationStore();
  if (!userProgress) return null;

  const { level, title, currentLevelXP, nextLevelXP, levelProgress, totalXPEarned, streakDays } = userProgress;
  const lvlInfo = LEVEL_TABLE.find(l => l.level === level) || LEVEL_TABLE[0];
  const nextLvl = LEVEL_TABLE.find(l => l.level === level + 1);
  const pct = Math.round(levelProgress * 100);

  // SVG circular progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - levelProgress);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-6">
        {/* Level circle */}
        <div className="relative">
          <svg width="120" height="120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius}
              fill="none" stroke="white" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">{lvlInfo.icon}</span>
            <span className="text-lg font-bold">Lv.{level}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-indigo-200 text-sm mt-1">{totalXPEarned.toLocaleString()} total XP</p>

          {/* XP bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>{currentLevelXP} / {nextLevelXP} XP</span>
              <span>{pct}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            {nextLvl && (
              <p className="text-xs text-indigo-200 mt-1">
                {nextLevelXP - currentLevelXP} XP to {nextLvl.icon} {nextLvl.title}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold">🔥 {streakDays}</p>
              <p className="text-xs text-indigo-200">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">⭐ {totalXPEarned}</p>
              <p className="text-xs text-indigo-200">Total XP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
