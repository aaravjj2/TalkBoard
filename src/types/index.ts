// ─── Symbol & Category Types ─────────────────────────────────────────────────

export type SymbolCategoryId =
  | 'people'
  | 'actions'
  | 'food'
  | 'feelings'
  | 'places'
  | 'objects'
  | 'social'
  | 'time'
  | 'descriptors'
  | 'questions';

export interface SymbolCategory {
  id: SymbolCategoryId;
  label: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

export interface AACSymbol {
  id: string;
  label: string;
  emoji: string;
  category: SymbolCategoryId;
  keywords: string[];
  order: number;
  isCustom?: boolean;
}

// ─── Sentence & Phrase Types ─────────────────────────────────────────────────

export interface SelectedSymbol extends AACSymbol {
  instanceId: string;
  selectedAt: string;
}

export interface GeneratedSentence {
  id: string;
  symbols: { id: string; label: string; emoji: string }[];
  sentence: string;
  spokenAt: string;
  isFavorite: boolean;
}

export interface QuickPhrase {
  id: string;
  text: string;
  symbolIds: string[];
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
  isPinned: boolean;
  order: number;
}

// ─── User Profile Types ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  gridSize: 'small' | 'medium' | 'large';
  showSymbolLabels: boolean;
  selectedVoiceURI: string | null;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  autoSaveQuickPhrases: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  animationsEnabled: boolean;
  caregiverPin: string | null;
  language: string;
}

// ─── AI Types ────────────────────────────────────────────────────────────────

export interface AIRequest {
  symbols: string[];
  context?: string;
  previousSentence?: string;
}

export interface AIResponse {
  sentence: string;
  confidence: number;
  alternatives: string[];
}

export type AIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIError {
  code: string;
  message: string;
}

// ─── TTS Types ───────────────────────────────────────────────────────────────

export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  localService: boolean;
}

export type TTSStatus = 'idle' | 'speaking' | 'paused' | 'error';

// ─── UI State Types ──────────────────────────────────────────────────────────

export type ViewMode = 'grid' | 'list';

export type AppPage =
  | 'home'
  | 'settings'
  | 'history'
  | 'quick-phrases'
  | 'caregiver'
  | 'help'
  | 'profile';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'confirm' | 'prompt' | 'custom' | null;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface UsageStats {
  totalSentencesGenerated: number;
  totalWordsSpoken: number;
  averageSymbolsPerSentence: number;
  mostUsedSymbols: { id: string; count: number }[];
  mostUsedCategories: { id: SymbolCategoryId; count: number }[];
  sessionsCount: number;
  lastSessionAt: string;
  streakDays: number;
}

// ─── Caregiver Types ─────────────────────────────────────────────────────────

export interface CaregiverSession {
  isActive: boolean;
  authenticatedAt?: string;
  expiresAt?: string;
}

export interface SymbolEditAction {
  type: 'add' | 'remove' | 'edit' | 'reorder' | 'hide' | 'show';
  symbolId?: string;
  data?: Partial<AACSymbol>;
  timestamp: string;
}
