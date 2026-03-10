// ─── Gamification Store ─────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gamificationService } from '../services/gamificationService';
import type {
  Achievement,
  Quest,
  Reward,
  UserProgress,
  LeaderboardEntry,
  StreakInfo,
  DailyChallenge,
  Celebration,
  GamificationSettings,
  LeaderboardPeriod,
  LeaderboardCategory,
} from '../types/gamification';

interface GamificationStore {
  // State
  userProgress: UserProgress | null;
  achievements: Achievement[];
  quests: Quest[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
  streakInfo: StreakInfo | null;
  dailyChallenge: DailyChallenge | null;
  celebrations: Celebration[];
  settings: GamificationSettings;
  activeTab: string;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  refresh: () => void;
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  updateAchievementProgress: (id: string, current: number) => void;
  updateQuestObjective: (questId: string, objectiveId: string, current: number) => void;
  toggleEquipReward: (id: string) => void;
  refreshLeaderboard: (period?: LeaderboardPeriod, category?: LeaderboardCategory) => void;
  recordDailyActivity: () => void;
  dismissCelebration: (id: string) => void;
  updateSettings: (partial: Partial<GamificationSettings>) => void;
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      userProgress: null,
      achievements: [],
      quests: [],
      rewards: [],
      leaderboard: [],
      streakInfo: null,
      dailyChallenge: null,
      celebrations: [],
      settings: gamificationService.getSettings(),
      activeTab: 'overview',
      isInitialized: false,
      error: null,

      initialize: () => {
        try {
          const userProgress = gamificationService.getUserProgress();
          const achievements = gamificationService.getAchievements();
          const quests = gamificationService.getQuests();
          const rewards = gamificationService.getRewards();
          const leaderboard = gamificationService.getLeaderboard();
          const streakInfo = gamificationService.getStreakInfo();
          const dailyChallenge = gamificationService.getDailyChallenge();
          const celebrations = gamificationService.getPendingCelebrations();
          const settings = gamificationService.getSettings();

          set({
            userProgress, achievements, quests, rewards,
            leaderboard, streakInfo, dailyChallenge, celebrations,
            settings, isInitialized: true, error: null,
          });
        } catch (e) {
          set({ error: `Init failed: ${e}`, isInitialized: true });
        }
      },

      refresh: () => {
        const store = get();
        if (!store.isInitialized) return store.initialize();
        try {
          set({
            userProgress: gamificationService.getUserProgress(),
            achievements: gamificationService.getAchievements(),
            quests: gamificationService.getQuests(),
            rewards: gamificationService.getRewards(),
            streakInfo: gamificationService.getStreakInfo(),
            dailyChallenge: gamificationService.getDailyChallenge(),
            celebrations: gamificationService.getPendingCelebrations(),
          });
        } catch (e) {
          set({ error: `Refresh failed: ${e}` });
        }
      },

      addXP: (amount) => {
        try {
          const result = gamificationService.addXP(amount);
          set({ userProgress: result.progress });
          if (result.leveledUp) {
            gamificationService.addCelebration(
              'level_up',
              `Level ${result.newLevel}!`,
              `You reached level ${result.newLevel}!`,
              '🎉'
            );
            set({ celebrations: gamificationService.getPendingCelebrations() });
          }
        } catch (e) {
          set({ error: `XP add failed: ${e}` });
        }
      },

      unlockAchievement: (id) => {
        try {
          const ach = gamificationService.unlockAchievement(id);
          if (ach) {
            gamificationService.addCelebration(
              'achievement_unlocked',
              ach.name,
              ach.description,
              ach.icon
            );
            set({
              achievements: gamificationService.getAchievements(),
              userProgress: gamificationService.getUserProgress(),
              celebrations: gamificationService.getPendingCelebrations(),
            });
          }
        } catch (e) {
          set({ error: `Unlock failed: ${e}` });
        }
      },

      updateAchievementProgress: (id, current) => {
        try {
          const ach = gamificationService.updateAchievementProgress(id, current);
          if (ach && ach.unlockedAt) {
            gamificationService.addCelebration('achievement_unlocked', ach.name, ach.description, ach.icon);
          }
          set({
            achievements: gamificationService.getAchievements(),
            userProgress: gamificationService.getUserProgress(),
            celebrations: gamificationService.getPendingCelebrations(),
          });
        } catch (e) {
          set({ error: `Progress update failed: ${e}` });
        }
      },

      updateQuestObjective: (questId, objectiveId, current) => {
        try {
          const quest = gamificationService.updateQuestObjective(questId, objectiveId, current);
          if (quest && quest.status === 'completed') {
            gamificationService.addCelebration('quest_completed', quest.name, quest.description, quest.icon);
          }
          set({
            quests: gamificationService.getQuests(),
            dailyChallenge: gamificationService.getDailyChallenge(),
            userProgress: gamificationService.getUserProgress(),
            celebrations: gamificationService.getPendingCelebrations(),
          });
        } catch (e) {
          set({ error: `Quest update failed: ${e}` });
        }
      },

      toggleEquipReward: (id) => {
        try {
          gamificationService.toggleEquipReward(id);
          set({ rewards: gamificationService.getRewards() });
        } catch (e) {
          set({ error: `Equip failed: ${e}` });
        }
      },

      refreshLeaderboard: (period, category) => {
        try {
          set({ leaderboard: gamificationService.getLeaderboard(period, category) });
        } catch (e) {
          set({ error: `Leaderboard failed: ${e}` });
        }
      },

      recordDailyActivity: () => {
        try {
          const streakInfo = gamificationService.recordDailyActivity();
          set({ streakInfo });
          // Check streak milestones
          if ([3, 7, 14, 30, 60, 90].includes(streakInfo.currentStreak)) {
            gamificationService.addCelebration(
              'streak_milestone',
              `${streakInfo.currentStreak}-Day Streak!`,
              `You've been active for ${streakInfo.currentStreak} days in a row!`,
              '🔥'
            );
            set({ celebrations: gamificationService.getPendingCelebrations() });
          }
        } catch (e) {
          set({ error: `Activity record failed: ${e}` });
        }
      },

      dismissCelebration: (id) => {
        gamificationService.dismissCelebration(id);
        set({ celebrations: gamificationService.getPendingCelebrations() });
      },

      updateSettings: (partial) => {
        try {
          const settings = gamificationService.updateSettings(partial);
          set({ settings });
        } catch (e) {
          set({ error: `Settings update failed: ${e}` });
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-gamification-store',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
