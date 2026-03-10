// ─── Gamification Service ───────────────────────────────────────────────────

import type {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  Quest,
  QuestType,
  QuestObjective,
  QuestReward,
  Reward,
  RewardType,
  UserProgress,
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardCategory,
  StreakInfo,
  StreakDay,
  DailyChallenge,
  Celebration,
  CelebrationType,
  GamificationSettings,
  LEVELS,
  DEFAULT_GAMIFICATION_SETTINGS,
} from '../types/gamification';

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toISODate(d: Date = new Date()): string {
  return d.toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.floor(Math.abs(d2.getTime() - d1.getTime()) / 86400000);
}

// ── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  PROGRESS: 'talkboard_gamification_progress',
  ACHIEVEMENTS: 'talkboard_gamification_achievements',
  QUESTS: 'talkboard_gamification_quests',
  REWARDS: 'talkboard_gamification_rewards',
  STREAK: 'talkboard_gamification_streak',
  CELEBRATIONS: 'talkboard_gamification_celebrations',
  SETTINGS: 'talkboard_gamification_settings',
};

// ── Level System ────────────────────────────────────────────────────────────

const LEVEL_TABLE = [
  { level: 1, title: 'Beginner', xpRequired: 0, xpTotal: 0, icon: '🌱' },
  { level: 2, title: 'Learner', xpRequired: 100, xpTotal: 100, icon: '📖' },
  { level: 3, title: 'Explorer', xpRequired: 200, xpTotal: 300, icon: '🔍' },
  { level: 4, title: 'Speaker', xpRequired: 350, xpTotal: 650, icon: '🗣️' },
  { level: 5, title: 'Communicator', xpRequired: 500, xpTotal: 1150, icon: '💬' },
  { level: 6, title: 'Storyteller', xpRequired: 750, xpTotal: 1900, icon: '📚' },
  { level: 7, title: 'Conversationalist', xpRequired: 1000, xpTotal: 2900, icon: '🎭' },
  { level: 8, title: 'Wordsmith', xpRequired: 1500, xpTotal: 4400, icon: '✍️' },
  { level: 9, title: 'Eloquent', xpRequired: 2000, xpTotal: 6400, icon: '🎯' },
  { level: 10, title: 'Master', xpRequired: 3000, xpTotal: 9400, icon: '👑' },
  { level: 11, title: 'Champion', xpRequired: 4000, xpTotal: 13400, icon: '🏆' },
  { level: 12, title: 'Legend', xpRequired: 5000, xpTotal: 18400, icon: '⭐' },
];

function calculateLevel(totalXP: number): {
  level: number;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  levelProgress: number;
} {
  let lvl = LEVEL_TABLE[0];
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_TABLE[i].xpTotal) {
      lvl = LEVEL_TABLE[i];
      break;
    }
  }
  const next = LEVEL_TABLE[Math.min(lvl.level, LEVEL_TABLE.length - 1)];
  const currentLevelXP = totalXP - lvl.xpTotal;
  const nextLevelXP = next.xpRequired;
  const levelProgress = nextLevelXP > 0 ? Math.min(currentLevelXP / nextLevelXP, 1) : 1;
  return { level: lvl.level, title: lvl.title, currentLevelXP, nextLevelXP, levelProgress };
}

// ── Demo Achievements ───────────────────────────────────────────────────────

function generateDemoAchievements(): Achievement[] {
  const achievements: Achievement[] = [
    // Communication
    {
      id: 'ach-first-word', name: 'First Word', description: 'Speak your first word using TalkBoard',
      icon: '🎉', category: 'communication', rarity: 'common', xpReward: 25,
      requirement: { type: 'count', target: 1, current: 1, metric: 'words_spoken' },
      unlockedAt: '2025-01-15T10:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-chatty', name: 'Chatty', description: 'Send 50 messages in a single day',
      icon: '💬', category: 'communication', rarity: 'uncommon', xpReward: 50,
      requirement: { type: 'count', target: 50, current: 37, metric: 'daily_messages' },
      unlockedAt: null, progress: 0.74, isHidden: false,
    },
    {
      id: 'ach-storyteller', name: 'Storyteller', description: 'Build a sentence with 10+ symbols',
      icon: '📖', category: 'communication', rarity: 'rare', xpReward: 100,
      requirement: { type: 'count', target: 1, current: 1, metric: 'long_sentences' },
      unlockedAt: '2025-02-01T14:30:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-polyglot', name: 'Polyglot', description: 'Use symbols from every category',
      icon: '🌍', category: 'communication', rarity: 'epic', xpReward: 200,
      requirement: { type: 'unique', target: 10, current: 7, metric: 'categories_used' },
      unlockedAt: null, progress: 0.7, isHidden: false,
    },
    // Exploration
    {
      id: 'ach-explorer', name: 'Symbol Explorer', description: 'View 100 different symbols',
      icon: '🔍', category: 'exploration', rarity: 'common', xpReward: 30,
      requirement: { type: 'count', target: 100, current: 100, metric: 'symbols_viewed' },
      unlockedAt: '2025-01-20T09:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-curator', name: 'Board Curator', description: 'Create 5 custom boards',
      icon: '🎨', category: 'exploration', rarity: 'uncommon', xpReward: 60,
      requirement: { type: 'count', target: 5, current: 3, metric: 'boards_created' },
      unlockedAt: null, progress: 0.6, isHidden: false,
    },
    {
      id: 'ach-designer', name: 'Symbol Designer', description: 'Create 10 custom symbols',
      icon: '✏️', category: 'creativity', rarity: 'rare', xpReward: 100,
      requirement: { type: 'count', target: 10, current: 4, metric: 'symbols_created' },
      unlockedAt: null, progress: 0.4, isHidden: false,
    },
    // Consistency
    {
      id: 'ach-streak-3', name: 'Getting Started', description: 'Use TalkBoard 3 days in a row',
      icon: '🔥', category: 'consistency', rarity: 'common', xpReward: 40,
      requirement: { type: 'streak', target: 3, current: 3, metric: 'daily_streak' },
      unlockedAt: '2025-01-18T08:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-streak-7', name: 'Week Warrior', description: 'Use TalkBoard 7 days in a row',
      icon: '⚡', category: 'consistency', rarity: 'uncommon', xpReward: 75,
      requirement: { type: 'streak', target: 7, current: 7, metric: 'daily_streak' },
      unlockedAt: '2025-01-22T08:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-streak-30', name: 'Monthly Master', description: 'Use TalkBoard 30 days in a row',
      icon: '🏅', category: 'consistency', rarity: 'epic', xpReward: 300,
      requirement: { type: 'streak', target: 30, current: 18, metric: 'daily_streak' },
      unlockedAt: null, progress: 0.6, isHidden: false,
    },
    // Mastery
    {
      id: 'ach-speed', name: 'Speed Communicator', description: 'Build 5 sentences in under a minute',
      icon: '⏱️', category: 'mastery', rarity: 'rare', xpReward: 120,
      requirement: { type: 'combo', target: 5, current: 2, metric: 'fast_sentences' },
      unlockedAt: null, progress: 0.4, isHidden: false,
    },
    {
      id: 'ach-vocab-100', name: 'Vocabulary Builder', description: 'Learn 100 unique words',
      icon: '📚', category: 'mastery', rarity: 'uncommon', xpReward: 80,
      requirement: { type: 'unique', target: 100, current: 78, metric: 'vocabulary_size' },
      unlockedAt: null, progress: 0.78, isHidden: false,
    },
    // Social
    {
      id: 'ach-sharer', name: 'Board Sharer', description: 'Share a board with a team member',
      icon: '🤝', category: 'social', rarity: 'common', xpReward: 25,
      requirement: { type: 'count', target: 1, current: 1, metric: 'boards_shared' },
      unlockedAt: '2025-02-05T11:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-helper', name: 'Helpful Guide', description: 'Leave feedback on 5 shared boards',
      icon: '💡', category: 'social', rarity: 'uncommon', xpReward: 60,
      requirement: { type: 'count', target: 5, current: 2, metric: 'feedback_given' },
      unlockedAt: null, progress: 0.4, isHidden: false,
    },
    // Milestones
    {
      id: 'ach-lvl5', name: 'Rising Star', description: 'Reach level 5',
      icon: '🌟', category: 'milestone', rarity: 'rare', xpReward: 150,
      requirement: { type: 'count', target: 5, current: 5, metric: 'level_reached' },
      unlockedAt: '2025-02-10T16:00:00Z', progress: 1, isHidden: false,
    },
    {
      id: 'ach-lvl10', name: 'Grand Master', description: 'Reach level 10',
      icon: '👑', category: 'milestone', rarity: 'legendary', xpReward: 500,
      requirement: { type: 'count', target: 10, current: 5, metric: 'level_reached' },
      unlockedAt: null, progress: 0.5, isHidden: false,
    },
    // Hidden
    {
      id: 'ach-secret-1', name: '???', description: 'A mysterious achievement awaits...',
      icon: '🔮', category: 'exploration', rarity: 'legendary', xpReward: 500,
      requirement: { type: 'count', target: 1, current: 0, metric: 'secret' },
      unlockedAt: null, progress: 0, isHidden: true,
    },
  ];
  return achievements;
}

// ── Demo Quests ─────────────────────────────────────────────────────────────

function generateDemoQuests(): Quest[] {
  return [
    {
      id: 'quest-daily-1', name: 'Daily Communicator', description: 'Complete today\'s communication goals',
      type: 'daily', status: 'active', icon: '📅',
      objectives: [
        { id: 'obj-1', description: 'Send 10 messages', current: 6, target: 10, isCompleted: false },
        { id: 'obj-2', description: 'Use 3 different categories', current: 2, target: 3, isCompleted: false },
        { id: 'obj-3', description: 'Practice for 15 minutes', current: 12, target: 15, isCompleted: false },
      ],
      rewards: [
        { type: 'xp', value: 50, label: '50 XP' },
        { type: 'badge', value: 'daily-star', label: 'Daily Star Badge' },
      ],
      expiresAt: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      completedAt: null,
    },
    {
      id: 'quest-daily-2', name: 'Vocabulary Boost', description: 'Expand your word collection today',
      type: 'daily', status: 'active', icon: '📝',
      objectives: [
        { id: 'obj-4', description: 'Learn 5 new words', current: 3, target: 5, isCompleted: false },
        { id: 'obj-5', description: 'Build a 5+ word sentence', current: 1, target: 1, isCompleted: true },
      ],
      rewards: [{ type: 'xp', value: 30, label: '30 XP' }],
      expiresAt: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      completedAt: null,
    },
    {
      id: 'quest-weekly-1', name: 'Weekly Explorer', description: 'Explore all symbol categories this week',
      type: 'weekly', status: 'active', icon: '🗺️',
      objectives: [
        { id: 'obj-6', description: 'Use 8 categories', current: 5, target: 8, isCompleted: false },
        { id: 'obj-7', description: 'Favorite 10 symbols', current: 7, target: 10, isCompleted: false },
        { id: 'obj-8', description: 'Create 2 custom phrases', current: 2, target: 2, isCompleted: true },
        { id: 'obj-9', description: 'Log in 5 days', current: 4, target: 5, isCompleted: false },
      ],
      rewards: [
        { type: 'xp', value: 150, label: '150 XP' },
        { type: 'title', value: 'Explorer', label: '"Explorer" Title' },
      ],
      expiresAt: null, completedAt: null,
    },
    {
      id: 'quest-story-1', name: 'The Journey Begins', description: 'Complete your first communication milestones',
      type: 'story', status: 'completed', icon: '📜',
      objectives: [
        { id: 'obj-10', description: 'Send first message', current: 1, target: 1, isCompleted: true },
        { id: 'obj-11', description: 'Explore the symbol library', current: 1, target: 1, isCompleted: true },
        { id: 'obj-12', description: 'Customize your profile', current: 1, target: 1, isCompleted: true },
      ],
      rewards: [
        { type: 'xp', value: 100, label: '100 XP' },
        { type: 'avatar', value: 'starter-frame', label: 'Starter Avatar Frame' },
      ],
      expiresAt: null, completedAt: '2025-01-16T12:00:00Z',
    },
    {
      id: 'quest-story-2', name: 'Finding Your Voice', description: 'Master the basics of AAC communication',
      type: 'story', status: 'active', icon: '🎤',
      objectives: [
        { id: 'obj-13', description: 'Build 25 sentences', current: 18, target: 25, isCompleted: false },
        { id: 'obj-14', description: 'Use text-to-speech 10 times', current: 10, target: 10, isCompleted: true },
        { id: 'obj-15', description: 'Set up quick phrases', current: 1, target: 1, isCompleted: true },
        { id: 'obj-16', description: 'Achieve a 7-day streak', current: 1, target: 1, isCompleted: true },
      ],
      rewards: [
        { type: 'xp', value: 200, label: '200 XP' },
        { type: 'theme', value: 'voice-theme', label: '"Voice" Theme' },
        { type: 'badge', value: 'voice-found', label: 'Voice Found Badge' },
      ],
      expiresAt: null, completedAt: null,
    },
    {
      id: 'quest-special-1', name: 'Weekend Warrior', description: 'Special weekend challenge',
      type: 'special', status: 'active', icon: '🎯',
      objectives: [
        { id: 'obj-17', description: 'Send 30 messages', current: 12, target: 30, isCompleted: false },
        { id: 'obj-18', description: 'Try all input modes', current: 2, target: 4, isCompleted: false },
      ],
      rewards: [
        { type: 'xp', value: 100, label: '100 XP' },
        { type: 'sticker', value: 'warrior', label: 'Warrior Sticker' },
      ],
      expiresAt: null, completedAt: null,
    },
  ];
}

// ── Demo Rewards ────────────────────────────────────────────────────────────

function generateDemoRewards(): Reward[] {
  return [
    { id: 'rwd-1', name: 'Daily Star', description: 'Earned by completing a daily quest', type: 'badge', icon: '⭐', rarity: 'common', isOwned: true, isEquipped: true, acquiredAt: '2025-01-20T10:00:00Z', source: 'Daily Quest' },
    { id: 'rwd-2', name: 'Communicator Badge', description: 'For prolific communicators', type: 'badge', icon: '🗣️', rarity: 'uncommon', isOwned: true, isEquipped: false, acquiredAt: '2025-01-25T14:00:00Z', source: 'Achievement: Chatty' },
    { id: 'rwd-3', name: 'Dark Mode Pro', description: 'A sleek dark theme variant', type: 'theme', icon: '🌙', rarity: 'rare', isOwned: true, isEquipped: true, acquiredAt: '2025-02-01T09:00:00Z', source: 'Weekly Quest' },
    { id: 'rwd-4', name: 'Fire Frame', description: 'An animated fire avatar frame', type: 'avatar_frame', icon: '🔥', rarity: 'epic', isOwned: true, isEquipped: false, acquiredAt: '2025-02-05T16:00:00Z', source: 'Achievement: Week Warrior' },
    { id: 'rwd-5', name: 'Legendary Title', description: '"Legend" title for your profile', type: 'title', icon: '👑', rarity: 'legendary', isOwned: false, isEquipped: false, acquiredAt: null, source: 'Reach Level 12' },
    { id: 'rwd-6', name: 'Happy Sticker', description: 'A happy smiley sticker pack', type: 'sticker', icon: '😊', rarity: 'common', isOwned: true, isEquipped: false, acquiredAt: '2025-01-18T11:00:00Z', source: 'Free gift' },
    { id: 'rwd-7', name: 'Achievement Chime', description: 'Custom sound for unlocking achievements', type: 'sound_effect', icon: '🔔', rarity: 'uncommon', isOwned: false, isEquipped: false, acquiredAt: null, source: 'Complete 10 achievements' },
    { id: 'rwd-8', name: 'Rainbow Theme', description: 'Colorful rainbow gradient theme', type: 'theme', icon: '🌈', rarity: 'rare', isOwned: false, isEquipped: false, acquiredAt: null, source: 'Achievement: Polyglot' },
    { id: 'rwd-9', name: 'Crystal Frame', description: 'Sparkling crystal avatar frame', type: 'avatar_frame', icon: '💎', rarity: 'legendary', isOwned: false, isEquipped: false, acquiredAt: null, source: 'Reach Level 10' },
    { id: 'rwd-10', name: 'Explorer Badge', description: 'For curious explorers', type: 'badge', icon: '🧭', rarity: 'common', isOwned: true, isEquipped: false, acquiredAt: '2025-01-22T13:00:00Z', source: 'Achievement: Symbol Explorer' },
  ];
}

// ── Demo Leaderboard ────────────────────────────────────────────────────────

function generateDemoLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, userId: 'u-1', name: 'Alex M.', avatar: '👦', level: 8, xp: 4850, streakDays: 25, achievementCount: 14, isCurrentUser: false },
    { rank: 2, userId: 'u-2', name: 'Sarah K.', avatar: '👧', level: 7, xp: 3200, streakDays: 18, achievementCount: 11, isCurrentUser: false },
    { rank: 3, userId: 'u-3', name: 'Jamie L.', avatar: '🧒', level: 6, xp: 2400, streakDays: 12, achievementCount: 9, isCurrentUser: false },
    { rank: 4, userId: 'current', name: 'You', avatar: '🙂', level: 5, xp: 1680, streakDays: 18, achievementCount: 7, isCurrentUser: true },
    { rank: 5, userId: 'u-4', name: 'Chris P.', avatar: '👨', level: 5, xp: 1520, streakDays: 10, achievementCount: 6, isCurrentUser: false },
    { rank: 6, userId: 'u-5', name: 'Pat R.', avatar: '👩', level: 4, xp: 980, streakDays: 8, achievementCount: 5, isCurrentUser: false },
    { rank: 7, userId: 'u-6', name: 'Taylor S.', avatar: '🧑', level: 3, xp: 520, streakDays: 4, achievementCount: 3, isCurrentUser: false },
    { rank: 8, userId: 'u-7', name: 'Jordan W.', avatar: '👶', level: 2, xp: 210, streakDays: 2, achievementCount: 2, isCurrentUser: false },
  ];
}

// ── Demo Streak ─────────────────────────────────────────────────────────────

function generateDemoStreak(): StreakInfo {
  const calendar: StreakDay[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const isActive = i <= 17 || (i > 20 && i <= 23); // simulate gaps
    calendar.push({
      date: d.toISOString().split('T')[0],
      isActive,
      xpEarned: isActive ? Math.floor(Math.random() * 80) + 20 : 0,
    });
  }
  return {
    currentStreak: 18,
    longestStreak: 18,
    lastActiveDate: todayStr(),
    streakCalendar: calendar,
    weeklyTarget: 5,
    weeklyProgress: 4,
  };
}

// ── Demo User Progress ──────────────────────────────────────────────────────

function generateDemoProgress(): UserProgress {
  const totalXP = 1680;
  const calc = calculateLevel(totalXP);
  return {
    currentXP: totalXP,
    totalXPEarned: totalXP,
    level: calc.level,
    currentLevelXP: calc.currentLevelXP,
    nextLevelXP: calc.nextLevelXP,
    levelProgress: calc.levelProgress,
    title: calc.title,
    streakDays: 18,
    longestStreak: 18,
    lastActiveDate: todayStr(),
  };
}

// ── Gamification Service ────────────────────────────────────────────────────

class GamificationService {
  // ── User Progress ───────────────────────────────────────────────────────

  getUserProgress(): UserProgress {
    const saved = localStorage.getItem(KEYS.PROGRESS);
    return saved ? JSON.parse(saved) : generateDemoProgress();
  }

  saveUserProgress(progress: UserProgress): void {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  }

  addXP(amount: number): { progress: UserProgress; leveledUp: boolean; newLevel: number } {
    const progress = this.getUserProgress();
    const oldLevel = progress.level;
    progress.currentXP += amount;
    progress.totalXPEarned += amount;

    const calc = calculateLevel(progress.totalXPEarned);
    progress.level = calc.level;
    progress.title = calc.title;
    progress.currentLevelXP = calc.currentLevelXP;
    progress.nextLevelXP = calc.nextLevelXP;
    progress.levelProgress = calc.levelProgress;

    this.saveUserProgress(progress);
    return { progress, leveledUp: calc.level > oldLevel, newLevel: calc.level };
  }

  // ── Achievements ────────────────────────────────────────────────────────

  getAchievements(): Achievement[] {
    const saved = localStorage.getItem(KEYS.ACHIEVEMENTS);
    return saved ? JSON.parse(saved) : generateDemoAchievements();
  }

  saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  unlockAchievement(achievementId: string): Achievement | null {
    const achievements = this.getAchievements();
    const idx = achievements.findIndex(a => a.id === achievementId);
    if (idx < 0 || achievements[idx].unlockedAt) return null;

    achievements[idx].unlockedAt = toISODate();
    achievements[idx].progress = 1;
    achievements[idx].requirement.current = achievements[idx].requirement.target;
    this.saveAchievements(achievements);

    // Award XP
    this.addXP(achievements[idx].xpReward);

    return achievements[idx];
  }

  updateAchievementProgress(achievementId: string, current: number): Achievement | null {
    const achievements = this.getAchievements();
    const idx = achievements.findIndex(a => a.id === achievementId);
    if (idx < 0 || achievements[idx].unlockedAt) return null;

    const ach = achievements[idx];
    ach.requirement.current = current;
    ach.progress = Math.min(current / ach.requirement.target, 1);

    if (ach.progress >= 1) {
      ach.unlockedAt = toISODate();
      this.addXP(ach.xpReward);
    }

    this.saveAchievements(achievements);
    return ach;
  }

  getAchievementStats() {
    const achievements = this.getAchievements();
    const unlocked = achievements.filter(a => a.unlockedAt);
    const total = achievements.filter(a => !a.isHidden).length;
    const xpEarned = unlocked.reduce((s, a) => s + a.xpReward, 0);
    const byCategory: Record<string, { total: number; unlocked: number }> = {};
    achievements.forEach(a => {
      if (!byCategory[a.category]) byCategory[a.category] = { total: 0, unlocked: 0 };
      byCategory[a.category].total++;
      if (a.unlockedAt) byCategory[a.category].unlocked++;
    });
    return { total, unlocked: unlocked.length, xpEarned, byCategory };
  }

  // ── Quests ──────────────────────────────────────────────────────────────

  getQuests(): Quest[] {
    const saved = localStorage.getItem(KEYS.QUESTS);
    return saved ? JSON.parse(saved) : generateDemoQuests();
  }

  saveQuests(quests: Quest[]): void {
    localStorage.setItem(KEYS.QUESTS, JSON.stringify(quests));
  }

  updateQuestObjective(questId: string, objectiveId: string, current: number): Quest | null {
    const quests = this.getQuests();
    const qIdx = quests.findIndex(q => q.id === questId);
    if (qIdx < 0) return null;

    const quest = quests[qIdx];
    const oIdx = quest.objectives.findIndex(o => o.id === objectiveId);
    if (oIdx < 0) return null;

    quest.objectives[oIdx].current = current;
    quest.objectives[oIdx].isCompleted = current >= quest.objectives[oIdx].target;

    // Check if all completed
    if (quest.objectives.every(o => o.isCompleted)) {
      quest.status = 'completed';
      quest.completedAt = toISODate();
      // Award rewards
      quest.rewards.forEach(r => {
        if (r.type === 'xp') this.addXP(r.value as number);
      });
    }

    this.saveQuests(quests);
    return quest;
  }

  getDailyChallenge(): DailyChallenge {
    const quests = this.getQuests();
    const daily = quests.filter(q => q.type === 'daily');
    const bonusXP = daily.every(q => q.status === 'completed') ? 50 : 0;
    return {
      id: `dc-${todayStr()}`,
      date: todayStr(),
      challenges: daily,
      bonusXP,
      allCompleted: daily.every(q => q.status === 'completed'),
    };
  }

  // ── Rewards ─────────────────────────────────────────────────────────────

  getRewards(): Reward[] {
    const saved = localStorage.getItem(KEYS.REWARDS);
    return saved ? JSON.parse(saved) : generateDemoRewards();
  }

  saveRewards(rewards: Reward[]): void {
    localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  }

  toggleEquipReward(rewardId: string): Reward | null {
    const rewards = this.getRewards();
    const idx = rewards.findIndex(r => r.id === rewardId);
    if (idx < 0 || !rewards[idx].isOwned) return null;

    // Unequip same-type rewards first
    const type = rewards[idx].type;
    rewards.forEach(r => {
      if (r.type === type && r.id !== rewardId) r.isEquipped = false;
    });
    rewards[idx].isEquipped = !rewards[idx].isEquipped;

    this.saveRewards(rewards);
    return rewards[idx];
  }

  // ── Leaderboard ─────────────────────────────────────────────────────────

  getLeaderboard(_period: LeaderboardPeriod = 'allTime', _category: LeaderboardCategory = 'xp'): LeaderboardEntry[] {
    return generateDemoLeaderboard();
  }

  // ── Streak ──────────────────────────────────────────────────────────────

  getStreakInfo(): StreakInfo {
    const saved = localStorage.getItem(KEYS.STREAK);
    return saved ? JSON.parse(saved) : generateDemoStreak();
  }

  saveStreakInfo(info: StreakInfo): void {
    localStorage.setItem(KEYS.STREAK, JSON.stringify(info));
  }

  recordDailyActivity(): StreakInfo {
    const info = this.getStreakInfo();
    const today = todayStr();

    if (info.lastActiveDate === today) return info; // Already recorded

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (info.lastActiveDate === yesterdayStr) {
      info.currentStreak++;
    } else {
      info.currentStreak = 1; // Reset streak
    }

    info.longestStreak = Math.max(info.longestStreak, info.currentStreak);
    info.lastActiveDate = today;
    info.weeklyProgress = Math.min(info.weeklyProgress + 1, info.weeklyTarget);

    // Update calendar
    const existing = info.streakCalendar.find(d => d.date === today);
    if (existing) {
      existing.isActive = true;
    } else {
      info.streakCalendar.push({ date: today, isActive: true, xpEarned: 0 });
      if (info.streakCalendar.length > 90) info.streakCalendar.shift();
    }

    this.saveStreakInfo(info);
    return info;
  }

  // ── Celebrations ────────────────────────────────────────────────────────

  getCelebrations(): Celebration[] {
    const saved = localStorage.getItem(KEYS.CELEBRATIONS);
    return saved ? JSON.parse(saved) : [];
  }

  addCelebration(type: CelebrationType, title: string, description: string, icon: string): Celebration {
    const celebrations = this.getCelebrations();
    const celebration: Celebration = {
      id: generateId(),
      type,
      title,
      description,
      icon,
      timestamp: toISODate(),
      dismissed: false,
    };
    celebrations.unshift(celebration);
    if (celebrations.length > 50) celebrations.pop();
    localStorage.setItem(KEYS.CELEBRATIONS, JSON.stringify(celebrations));
    return celebration;
  }

  dismissCelebration(id: string): void {
    const celebrations = this.getCelebrations();
    const idx = celebrations.findIndex(c => c.id === id);
    if (idx >= 0) {
      celebrations[idx].dismissed = true;
      localStorage.setItem(KEYS.CELEBRATIONS, JSON.stringify(celebrations));
    }
  }

  getPendingCelebrations(): Celebration[] {
    return this.getCelebrations().filter(c => !c.dismissed);
  }

  // ── Settings ────────────────────────────────────────────────────────────

  getSettings(): GamificationSettings {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    const defaults: GamificationSettings = {
      enabled: true,
      showXPNotifications: true,
      showAchievementPopups: true,
      showStreakReminders: true,
      showLeaderboard: true,
      dailyChallengesEnabled: true,
      soundEffectsEnabled: true,
      celebrationAnimations: true,
      difficulty: 'normal',
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  updateSettings(partial: Partial<GamificationSettings>): GamificationSettings {
    const settings = { ...this.getSettings(), ...partial };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
}

export const gamificationService = new GamificationService();
