/**
 * Adaptive Learning Types — Type definitions for the adaptive learning system.
 *
 * Covers usage patterns, predictions, frequency tracking, learning models,
 * vocabulary metrics, recommendations, and contextual awareness.
 */

// ─── Core Enums ──────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type LearningAlgorithm =
  | 'frequency'
  | 'recency'
  | 'context'
  | 'sequential'
  | 'collaborative'
  | 'bayesian'
  | 'hybrid';

export type ConfidenceLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export type AdaptationSpeed = 'slow' | 'moderate' | 'fast' | 'instant';

// ─── Symbol Usage ────────────────────────────────────────────────────────────

export interface SymbolUsageRecord {
  symbolId: string;
  totalUses: number;
  recentUses: number; // last 7 days
  firstUsed: string;
  lastUsed: string;
  averagePosition: number; // avg position in sentences
  contextPairs: ContextPair[];
  timeDistribution: TimeDistribution;
  dayDistribution: DayDistribution;
  categoryId: string;
  streakDays: number;
  peakUsageHour: number;
}

export interface ContextPair {
  precedingSymbolId: string;
  followingSymbolId: string | null;
  count: number;
  lastOccurrence: string;
}

export interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface DayDistribution {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export interface SymbolPrediction {
  symbolId: string;
  score: number; // 0-1 confidence
  algorithm: LearningAlgorithm;
  reason: PredictionReason;
  rank: number;
}

export type PredictionReason =
  | 'frequently_used'
  | 'recently_used'
  | 'contextual_match'
  | 'sequential_pattern'
  | 'time_of_day_pattern'
  | 'day_of_week_pattern'
  | 'category_affinity'
  | 'sentence_length_pattern'
  | 'collaborative_filter'
  | 'bayesian_prior'
  | 'boosted_by_goal';

export interface PredictionContext {
  currentSentence: string[];
  previousSentences: string[][];
  timeOfDay: TimeOfDay;
  dayOfWeek: DayOfWeek;
  currentCategory: string | null;
  sessionDuration: number; // minutes
  sentenceCount: number;
}

export interface PredictionResult {
  predictions: SymbolPrediction[];
  context: PredictionContext;
  generatedAt: string;
  modelVersion: string;
  computeTimeMs: number;
}

// ─── Frequency Model ─────────────────────────────────────────────────────────

export interface FrequencyModel {
  symbolFrequencies: Map<string, number>;
  categoryFrequencies: Map<string, number>;
  bigramFrequencies: Map<string, Map<string, number>>; // symbolId -> following symbolId -> count
  trigramFrequencies: Map<string, Map<string, Map<string, number>>>;
  totalObservations: number;
  lastUpdated: string;
}

export interface FrequencyModelSerializable {
  symbolFrequencies: Record<string, number>;
  categoryFrequencies: Record<string, number>;
  bigramFrequencies: Record<string, Record<string, number>>;
  trigramFrequencies: Record<string, Record<string, Record<string, number>>>;
  totalObservations: number;
  lastUpdated: string;
}

// ─── Sequential Patterns ─────────────────────────────────────────────────────

export interface SequentialPattern {
  id: string;
  sequence: string[]; // ordered list of symbolIds
  frequency: number;
  confidence: number;
  support: number; // percentage of sessions containing this pattern
  lastSeen: string;
  avgTimeBetweenSymbols: number; // ms
}

export interface PatternMiningConfig {
  minSupport: number; // minimum proportion of sessions
  minConfidence: number; // minimum prediction confidence
  maxPatternLength: number;
  windowSize: number; // max time window (seconds) for pattern detection
}

// ─── Vocabulary Metrics ──────────────────────────────────────────────────────

export interface VocabularyMetrics {
  totalUniqueSymbols: number;
  activeVocabularySize: number; // used in last 7 days
  coreVocabularySize: number; // used in 80%+ of sessions
  fringeVocabularySize: number; // used < 3 times
  vocabularyGrowthRate: number; // new symbols per week
  vocabularyDiversity: number; // 0-1 Shannon entropy normalized
  categorySpread: Record<string, number>; // category -> symbol count
  newSymbolsThisWeek: string[];
  decliningSymbols: string[]; // decreasing usage trend
  emergingSymbols: string[]; // recent increase in usage
  avgSymbolsPerSentence: number;
  sentenceLengthTrend: number; // positive = increasing
}

export interface VocabularyHistory {
  date: string;
  totalSymbols: number;
  activeSymbols: number;
  newSymbols: number;
  droppedSymbols: number;
  avgSentenceLength: number;
}

// ─── Learning Session ────────────────────────────────────────────────────────

export interface LearningSession {
  id: string;
  startTime: string;
  endTime: string | null;
  symbolsUsed: string[];
  sentencesBuilt: string[][];
  predictionsShown: number;
  predictionsTaken: number;
  predictionAccuracy: number;
  newSymbolsIntroduced: string[];
  categoryTransitions: CategoryTransition[];
  interactionSpeed: number; // avg ms between selections
  pauseEvents: PauseEvent[];
}

export interface CategoryTransition {
  fromCategory: string;
  toCategory: string;
  timestamp: string;
}

export interface PauseEvent {
  startTime: string;
  duration: number; // ms
  context: string; // what was happening when pause occurred
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  symbolIds: string[];
  categoryIds: string[];
  confidence: number;
  createdAt: string;
  expiresAt: string | null;
  dismissed: boolean;
  acted: boolean;
}

export type RecommendationType =
  | 'add_to_board'
  | 'promote_symbol'
  | 'learn_new_category'
  | 'practice_symbol'
  | 'sentence_template'
  | 'vocabulary_expansion'
  | 'category_exploration'
  | 'communication_strategy'
  | 'layout_optimization'
  | 'quick_phrase_suggestion';

// ─── Contextual Awareness ────────────────────────────────────────────────────

export interface ContextualProfile {
  timePatterns: TimePattern[];
  locationProfiles: LocationProfile[];
  activityRoutines: ActivityRoutine[];
  socialContexts: SocialContext[];
  currentContext: CurrentContext;
}

export interface TimePattern {
  timeOfDay: TimeOfDay;
  dayOfWeek: DayOfWeek;
  commonCategories: string[];
  commonSymbols: string[];
  avgSessionLength: number;
  avgSentenceLength: number;
  symbolSelectionSpeed: number;
}

export interface LocationProfile {
  id: string;
  name: string;
  type: 'home' | 'school' | 'therapy' | 'community' | 'other';
  commonCategories: string[];
  commonSentences: string[][];
  visitFrequency: number;
}

export interface ActivityRoutine {
  id: string;
  name: string;
  timeRange: { start: string; end: string };
  daysOfWeek: DayOfWeek[];
  associatedSymbols: string[];
  associatedCategories: string[];
  sentenceTemplates: string[][];
}

export interface SocialContext {
  id: string;
  name: string;
  participants: string[];
  commonTopics: string[];
  communicationStyle: 'formal' | 'casual' | 'structured';
  preferredSymbols: string[];
}

export interface CurrentContext {
  timeOfDay: TimeOfDay;
  dayOfWeek: DayOfWeek;
  sessionDuration: number;
  recentCategories: string[];
  recentSymbols: string[];
  sentenceInProgress: string[];
  predictionAccuracyThisSession: number;
}

// ─── Adaptive Settings ───────────────────────────────────────────────────────

export interface AdaptiveLearningSettings {
  enabled: boolean;
  algorithm: LearningAlgorithm;
  adaptationSpeed: AdaptationSpeed;
  predictionCount: number; // how many predictions to show
  minConfidence: number; // minimum confidence to show a prediction
  learningRate: number; // 0-1
  decayFactor: number; // for time-based decay
  contextWeight: number; // 0-1 weight of contextual features
  frequencyWeight: number; // 0-1 weight of frequency
  recencyWeight: number; // 0-1 weight of recency
  enableSequentialPrediction: boolean;
  enableTimeAwareness: boolean;
  enableCategoryAffinity: boolean;
  enableVocabularyTracking: boolean;
  enableRecommendations: boolean;
  enableBoardReordering: boolean;
  reorderingThreshold: number; // min frequency difference to trigger reorder
  maxHistoryDays: number; // how far back to consider
  patternMiningConfig: PatternMiningConfig;
  privacyMode: boolean; // limit data collection
}

// ─── Model State ─────────────────────────────────────────────────────────────

export interface AdaptiveLearningState {
  isInitialized: boolean;
  settings: AdaptiveLearningSettings;
  usageRecords: Record<string, SymbolUsageRecord>;
  frequencyModel: FrequencyModelSerializable;
  sequentialPatterns: SequentialPattern[];
  vocabularyMetrics: VocabularyMetrics;
  vocabularyHistory: VocabularyHistory[];
  currentSession: LearningSession | null;
  recommendations: Recommendation[];
  contextualProfile: ContextualProfile;
  lastTrainingTime: string | null;
  modelVersion: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type LearningEvent =
  | SymbolSelectedEvent
  | SentenceBuiltEvent
  | SentenceSpokenEvent
  | PredictionShownEvent
  | PredictionAcceptedEvent
  | CategoryChangedEvent
  | SessionStartedEvent
  | SessionEndedEvent
  | SymbolSearchedEvent
  | BoardReorderedEvent;

export interface SymbolSelectedEvent {
  type: 'symbol_selected';
  symbolId: string;
  categoryId: string;
  timestamp: string;
  position: number; // position in current sentence
  wasPredicted: boolean;
  selectionTimeMs: number;
}

export interface SentenceBuiltEvent {
  type: 'sentence_built';
  symbolIds: string[];
  timestamp: string;
  buildTimeMs: number;
}

export interface SentenceSpokenEvent {
  type: 'sentence_spoken';
  symbolIds: string[];
  timestamp: string;
  ttsUsed: boolean;
}

export interface PredictionShownEvent {
  type: 'prediction_shown';
  predictions: Array<{ symbolId: string; rank: number; score: number }>;
  timestamp: string;
}

export interface PredictionAcceptedEvent {
  type: 'prediction_accepted';
  symbolId: string;
  rank: number;
  score: number;
  timestamp: string;
}

export interface CategoryChangedEvent {
  type: 'category_changed';
  fromCategory: string | null;
  toCategory: string;
  timestamp: string;
}

export interface SessionStartedEvent {
  type: 'session_started';
  timestamp: string;
  context: CurrentContext;
}

export interface SessionEndedEvent {
  type: 'session_ended';
  timestamp: string;
  duration: number;
  symbolCount: number;
  sentenceCount: number;
}

export interface SymbolSearchedEvent {
  type: 'symbol_searched';
  query: string;
  resultsCount: number;
  selectedSymbolId: string | null;
  timestamp: string;
}

export interface BoardReorderedEvent {
  type: 'board_reordered';
  categoryId: string;
  oldOrder: string[];
  newOrder: string[];
  timestamp: string;
  reason: 'manual' | 'adaptive';
}
