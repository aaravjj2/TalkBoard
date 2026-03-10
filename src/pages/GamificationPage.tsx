// ─── Gamification Page ──────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import {
  LevelProgressCard,
  AchievementsPanel,
  QuestsPanel,
  RewardsGallery,
  LeaderboardPanel,
  StreakCalendar,
  GamificationSettingsPanel,
  CelebrationToast,
} from '../components/Gamification';

const tabs = [
  { id: 'overview', label: '🏠 Overview' },
  { id: 'achievements', label: '🏆 Achievements' },
  { id: 'quests', label: '📋 Quests' },
  { id: 'rewards', label: '🎁 Rewards' },
  { id: 'leaderboard', label: '🥇 Leaderboard' },
  { id: 'streak', label: '🔥 Streak' },
  { id: 'settings', label: '⚙️ Settings' },
] as const;

export default function GamificationPage() {
  const {
    activeTab,
    setActiveTab,
    initialize,
    isInitialized,
    userProgress,
    achievements,
    quests,
    error,
    clearError,
  } = useGamificationStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const activeQuests = quests.filter(q => q.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Gamification</h1>
          <p className="text-sm text-purple-200 mt-1">
            Level up your communication skills through fun challenges
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-purple-200">
            {userProgress && (
              <>
                <span>⭐ Level {userProgress.level} · {userProgress.title}</span>
                <span>🔥 {userProgress.streakDays} day streak</span>
              </>
            )}
            <span>🏆 {unlockedCount} achievements</span>
            <span>📋 {activeQuests} active quests</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-1 overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <LevelProgressCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Active Quests
                </h3>
                <QuestsPanel />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Recent Achievements
                </h3>
                <AchievementsPanel />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'achievements' && <AchievementsPanel />}
        {activeTab === 'quests' && <QuestsPanel />}
        {activeTab === 'rewards' && <RewardsGallery />}
        {activeTab === 'leaderboard' && <LeaderboardPanel />}
        {activeTab === 'streak' && <StreakCalendar />}
        {activeTab === 'settings' && <GamificationSettingsPanel />}
      </div>

      {/* Celebration toasts */}
      <CelebrationToast />
    </div>
  );
}
