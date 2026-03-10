// ─── Communication Partner Types ────────────────────────────────────────────

// ── Partner Profile ─────────────────────────────────────────────────────────

export type PartnerRole = 'parent' | 'therapist' | 'teacher' | 'aide' | 'sibling' | 'peer' | 'other';
export type CommunicationLevel = 'emerging' | 'developing' | 'proficient' | 'advanced';
export type InteractionStyle = 'directive' | 'facilitative' | 'responsive' | 'modeling';

export interface CommunicationPartner {
  id: string;
  name: string;
  role: PartnerRole;
  email: string;
  avatar: string;
  isActive: boolean;
  joinedAt: string;
  lastInteractionAt: string;
  totalInteractions: number;
  preferredStyle: InteractionStyle;
  notes: string;
}

// ── Communication Session ───────────────────────────────────────────────────

export type SessionType = 'free_play' | 'structured' | 'guided' | 'assessment' | 'social';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface CommunicationSession {
  id: string;
  partnerId: string;
  partnerName: string;
  type: SessionType;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  duration: number; // minutes
  goals: SessionGoal[];
  notes: string;
  messageCount: number;
  symbolsUsed: number;
  uniqueSymbols: number;
  promptsGiven: number;
  independentMessages: number;
  rating: number; // 1-5
}

export interface SessionGoal {
  id: string;
  description: string;
  isAchieved: boolean;
  notes: string;
}

// ── Communication Strategies ────────────────────────────────────────────────

export type StrategyCategory = 'modeling' | 'prompting' | 'expansion' | 'wait_time' | 'environment' | 'motivation';

export interface CommunicationStrategy {
  id: string;
  name: string;
  description: string;
  category: StrategyCategory;
  steps: string[];
  tips: string[];
  examplePhrases: string[];
  difficultyLevel: CommunicationLevel;
  isBookmarked: boolean;
}

// ── Modeling Queue ──────────────────────────────────────────────────────────

export interface ModelingItem {
  id: string;
  targetPhrase: string;
  symbols: string[];
  category: string;
  demonstrated: boolean;
  demonstratedAt: string | null;
  userAttempted: boolean;
  attemptedAt: string | null;
  notes: string;
}

// ── Prompting Hierarchy ─────────────────────────────────────────────────────

export type PromptLevel = 'independent' | 'gestural' | 'verbal' | 'model' | 'partial_physical' | 'full_physical';

export interface PromptRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  targetBehavior: string;
  promptLevel: PromptLevel;
  wasSuccessful: boolean;
  notes: string;
}

// ── Communication Log ───────────────────────────────────────────────────────

export type LogEntryType = 'message' | 'prompt' | 'model' | 'expansion' | 'response' | 'note';

export interface CommunicationLogEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  type: LogEntryType;
  content: string;
  isUserGenerated: boolean;
  partnerName: string;
  symbols?: string[];
  promptLevel?: PromptLevel;
}

// ── Partner Progress ────────────────────────────────────────────────────────

export interface PartnerProgress {
  partnerId: string;
  totalSessions: number;
  totalDuration: number; // minutes
  avgSessionDuration: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  independenceRate: number; // 0-1
  mostUsedSymbols: { symbol: string; count: number }[];
  weeklySessionCounts: { week: string; count: number }[];
  promptLevelDistribution: { level: PromptLevel; count: number }[];
  communicationLevelHistory: { date: string; level: CommunicationLevel }[];
}

// ── Tips & Guidance ─────────────────────────────────────────────────────────

export interface PartnerTip {
  id: string;
  title: string;
  content: string;
  category: StrategyCategory;
  isRead: boolean;
  order: number;
}

// ── Settings ────────────────────────────────────────────────────────────────

export interface PartnerSettings {
  defaultSessionType: SessionType;
  defaultSessionDuration: number; // minutes
  autoLogInteractions: boolean;
  showPartnerTips: boolean;
  enableModelingQueue: boolean;
  promptHierarchyEnabled: boolean;
  sessionReminders: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  communicationLevel: CommunicationLevel;
}

// ── Store State ─────────────────────────────────────────────────────────────

export interface CommunicationPartnerState {
  partners: CommunicationPartner[];
  sessions: CommunicationSession[];
  strategies: CommunicationStrategy[];
  modelingQueue: ModelingItem[];
  communicationLog: CommunicationLogEntry[];
  partnerTips: PartnerTip[];
  settings: PartnerSettings;
  activePartnerId: string | null;
  activeTab: string;
  isInitialized: boolean;
  error: string | null;
}

// ── Constants ───────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<PartnerRole, string> = {
  parent: 'Parent/Guardian',
  therapist: 'Therapist (SLP)',
  teacher: 'Teacher',
  aide: 'Aide/Assistant',
  sibling: 'Sibling',
  peer: 'Peer/Friend',
  other: 'Other',
};

export const ROLE_ICONS: Record<PartnerRole, string> = {
  parent: '👨‍👩‍👧',
  therapist: '🩺',
  teacher: '👩‍🏫',
  aide: '🤝',
  sibling: '👫',
  peer: '🧒',
  other: '👤',
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  free_play: 'Free Play',
  structured: 'Structured',
  guided: 'Guided',
  assessment: 'Assessment',
  social: 'Social',
};

export const PROMPT_LEVEL_LABELS: Record<PromptLevel, string> = {
  independent: 'Independent',
  gestural: 'Gestural',
  verbal: 'Verbal',
  model: 'Model',
  partial_physical: 'Partial Physical',
  full_physical: 'Full Physical',
};

export const PROMPT_LEVEL_COLORS: Record<PromptLevel, string> = {
  independent: '#10B981',
  gestural: '#3B82F6',
  verbal: '#8B5CF6',
  model: '#F59E0B',
  partial_physical: '#F97316',
  full_physical: '#EF4444',
};

export const DEFAULT_PARTNER_SETTINGS: PartnerSettings = {
  defaultSessionType: 'guided',
  defaultSessionDuration: 30,
  autoLogInteractions: true,
  showPartnerTips: true,
  enableModelingQueue: true,
  promptHierarchyEnabled: true,
  sessionReminders: true,
  reminderFrequency: 'daily',
  communicationLevel: 'developing',
};
