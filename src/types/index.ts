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
  icon: string;
  categoryId: SymbolCategoryId;
  keywords: string[];
  order: number;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Sentence & Phrase Types ─────────────────────────────────────────────────

export interface SelectedSymbol {
  instanceId: string;
  symbol: AACSymbol;
  addedAt: number;
}

export interface GeneratedSentence {
  id: string;
  symbolIds: string[];
  symbolLabels: string[];
  rawInput: string;
  generatedText: string;
  timestamp: string;
  spokenAt?: string;
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
  avatarEmoji: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  customSymbols: AACSymbol[];
  hiddenSymbolIds: string[];
  categoryOrder: SymbolCategoryId[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  gridColumns: number;
  showSymbolLabels: boolean;
  showCategoryIcons: boolean;
  voiceId: string;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  animationsEnabled: boolean;
  quickPhrasesCount: number;
  maxHistoryItems: number;
  caregiverModeEnabled: boolean;
  caregiverPin: string;
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
  processingTimeMs: number;
}

export type AIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
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

export type AppPage = 'home' | 'settings' | 'history' | 'caregiver' | 'help';

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
