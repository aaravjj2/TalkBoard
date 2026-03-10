// ─── Gamification Types ─────────────────────────────────────────────────────

// ── Achievement System ──────────────────────────────────────────────────────

export type AchievementCategory =
  | 'communication'
  | 'exploration'
  | 'consistency'
  | 'mastery'
  | 'social'
  | 'creativity'
  | 'milestone';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  requirement: AchievementRequirement;
  unlockedAt: string | null;
  progress: number; // 0-1
  isHidden: boolean;
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'time' | 'unique' | 'combo';
  target: number;
  current: number;
  metric: string;
}

// ── Level & XP ──────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpTotal: number;
  icon: string;
}

export interface UserProgress {
  currentXP: number;
  totalXPEarned: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  levelProgress: number; // 0-1
  title: string;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
}

// ── Quests & Challenges ─────────────────────────────────────────────────────

export type QuestType = 'daily' | 'weekly' | 'story' | 'special';
export type QuestStatus = 'active' | 'completed' | 'expired' | 'locked';

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  expiresAt: string | null;
  completedAt: string | null;
  icon: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  isCompleted: boolean;
}

export interface QuestReward {
  type: 'xp' | 'badge' | 'theme' | 'avatar' | 'title';
  value: string | number;
  label: string;
}

// ── Rewards & Customization ─────────────────────────────────────────────────

export type RewardType = 'badge' | 'theme' | 'avatar_frame' | 'title' | 'sticker' | 'sound_effect';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  icon: string;
  rarity: AchievementRarity;
  isOwned: boolean;
  isEquipped: boolean;
  acquiredAt: string | null;
  source: string; // how it was obtained
}

// ── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streakDays: number;
  achievementCount: number;
  isCurrentUser: boolean;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';
export type LeaderboardCategory = 'xp' | 'streak' | 'achievements' | 'communication';

// ── Streaks & Daily ─────────────────────────────────────────────────────────

export interface DailyChallenge {
  id: string;
  date: string;
  challenges: Quest[];
  bonusXP: number;
  allCompleted: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakCalendar: StreakDay[];
  weeklyTarget: number;
  weeklyProgress: number;
}

export interface StreakDay {
  date: string;
  isActive: boolean;
  xpEarned: number;
}

// ── Celebrations ────────────────────────────────────────────────────────────

export type CelebrationType =
  | 'level_up'
  | 'achievement_unlocked'
  | 'quest_completed'
  | 'streak_milestone'
  | 'reward_earned';

export interface Celebration {
  id: string;
  type: CelebrationType;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  data?: Record<string, unknown>;
  dismissed: boolean;
}

// ── Gamification Settings ───────────────────────────────────────────────────

export interface GamificationSettings {
  enabled: boolean;
  showXPNotifications: boolean;
  showAchievementPopups: boolean;
  showStreakReminders: boolean;
  showLeaderboard: boolean;
  dailyChallengesEnabled: boolean;
  soundEffectsEnabled: boolean;
  celebrationAnimations: boolean;
  difficulty: 'easy' | 'normal' | 'challenging';
}

// ── Store State ─────────────────────────────────────────────────────────────

export interface GamificationState {
  userProgress: UserProgress;
  achievements: Achievement[];
  quests: Quest[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
  streakInfo: StreakInfo;
  celebrations: Celebration[];
  dailyChallenge: DailyChallenge | null;
  settings: GamificationSettings;
  isInitialized: boolean;
  error: string | null;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const LEVELS: LevelInfo[] = [
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

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export const DEFAULT_GAMIFICATION_SETTINGS: GamificationSettings = {
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
