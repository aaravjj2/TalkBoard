import type { UserSettings } from '@/types';

// ─── App Constants ───────────────────────────────────────────────────────────

export const APP_NAME = 'TalkBoard';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION =
  'AI-Powered AAC Communication Platform for non-verbal individuals';
export const APP_TAGLINE = 'Every person deserves a voice.';

// ─── Storage Keys ────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  USER_PROFILE: 'talkboard_user_profile',
  SETTINGS: 'talkboard_settings',
  HISTORY: 'talkboard_history',
  QUICK_PHRASES: 'talkboard_quick_phrases',
  CUSTOM_SYMBOLS: 'talkboard_custom_symbols',
  HIDDEN_SYMBOLS: 'talkboard_hidden_symbols',
  CATEGORY_ORDER: 'talkboard_category_order',
  USAGE_STATS: 'talkboard_usage_stats',
  THEME: 'talkboard_theme',
  CAREGIVER_PIN: 'talkboard_caregiver_pin',
  ONBOARDING_COMPLETE: 'talkboard_onboarding_complete',
} as const;

// ─── Default Settings ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  highContrast: false,
  fontSize: 'medium',
  gridSize: 'medium',
  showSymbolLabels: true,
  selectedVoiceURI: null,
  voiceRate: 1.0,
  voicePitch: 1.0,
  voiceVolume: 1.0,
  autoSpeak: false,
  autoSaveQuickPhrases: true,
  soundEffects: true,
  hapticFeedback: true,
  animationsEnabled: true,
  caregiverPin: null,
  language: 'en',
};

// ─── Grid Configuration ─────────────────────────────────────────────────────

export const GRID_COLUMNS = {
  mobile: 3,
  tablet: 4,
  desktop: 6,
  large: 8,
} as const;

export const FONT_SIZE_SCALE = {
  small: 0.85,
  medium: 1,
  large: 1.2,
  'extra-large': 1.4,
} as const;

// ─── AI Configuration ───────────────────────────────────────────────────────

export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 150,
  temperature: 0.3,
  systemPrompt: `You are an AAC communication assistant. Convert the following symbol sequence into a single, natural, grammatically correct sentence. Keep it concise. Output only the sentence — no explanation, no quotes, no punctuation marks around it. Make it sound natural and human-like. If the symbols suggest a question, form it as a question.`,
  retryAttempts: 3,
  retryDelayMs: 1000,
  timeoutMs: 10000,
} as const;

// ─── TTS Configuration ──────────────────────────────────────────────────────

export const TTS_CONFIG = {
  defaultRate: 1.0,
  defaultPitch: 1.0,
  defaultVolume: 1.0,
  minRate: 0.5,
  maxRate: 2.0,
  minPitch: 0.5,
  maxPitch: 2.0,
} as const;

// ─── Quick Phrases ───────────────────────────────────────────────────────────

export const MAX_QUICK_PHRASES = 20;
export const QUICK_PHRASE_AUTO_THRESHOLD = 3; // Auto-add after N uses

// ─── History ─────────────────────────────────────────────────────────────────

export const MAX_HISTORY_ITEMS = 500;

// ─── Accessibility ───────────────────────────────────────────────────────────

export const A11Y = {
  minTouchTarget: 44,
  minContrastRatio: 4.5,
  focusRingWidth: 2,
  focusRingOffset: 2,
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  highContrastQuery: '(prefers-contrast: more)',
} as const;

// ─── Animation Durations ─────────────────────────────────────────────────────

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
