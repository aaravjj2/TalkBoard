/**
 * adaptiveLearningService — Core adaptive learning engine for TalkBoard.
 *
 * Handles:
 * - Symbol usage tracking and frequency analysis
 * - Bigram/trigram language model for sequential prediction
 * - Time-of-day and day-of-week contextual awareness
 * - Vocabulary metrics and growth tracking
 * - Pattern mining for communication sequences
 * - Board reordering based on usage patterns
 * - Recommendation generation
 * - Learning session management
 */

import type {
  SymbolUsageRecord,
  ContextPair,
  TimeDistribution,
  DayDistribution,
  TimeOfDay,
  DayOfWeek,
  SymbolPrediction,
  PredictionContext,
  PredictionResult,
  PredictionReason,
  FrequencyModelSerializable,
  SequentialPattern,
  VocabularyMetrics,
  VocabularyHistory,
  LearningSession,
  CategoryTransition,
  Recommendation,
  RecommendationType,
  ContextualProfile,
  TimePattern,
  CurrentContext,
  AdaptiveLearningSettings,
  AdaptiveLearningState,
  LearningEvent,
  LearningAlgorithm,
  ConfidenceLevel,
  PatternMiningConfig,
} from '@/types/adaptiveLearning';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  USAGE_RECORDS: 'talkboard_adaptive_usage',
  FREQUENCY_MODEL: 'talkboard_adaptive_frequency',
  SEQUENTIAL_PATTERNS: 'talkboard_adaptive_patterns',
  VOCABULARY_METRICS: 'talkboard_adaptive_vocab',
  VOCABULARY_HISTORY: 'talkboard_adaptive_vocab_history',
  RECOMMENDATIONS: 'talkboard_adaptive_recommendations',
  CONTEXTUAL_PROFILE: 'talkboard_adaptive_context',
  SETTINGS: 'talkboard_adaptive_settings',
  SESSION_HISTORY: 'talkboard_adaptive_sessions',
  MODEL_VERSION: 'talkboard_adaptive_version',
} as const;

const MODEL_VERSION = '1.0.0';

const MAX_USAGE_RECORDS = 2000;
const MAX_CONTEXT_PAIRS = 50;
const MAX_PATTERNS = 200;
const MAX_RECOMMENDATIONS = 50;
const MAX_VOCABULARY_HISTORY = 365;
const MAX_SESSION_HISTORY = 100;
const BIGRAM_DECAY_FACTOR = 0.95;
const NEWNESS_BOOST_DAYS = 14;

// ─── Default Settings ────────────────────────────────────────────────────────

const defaultSettings: AdaptiveLearningSettings = {
  enabled: true,
  algorithm: 'hybrid',
  adaptationSpeed: 'moderate',
  predictionCount: 8,
  minConfidence: 0.1,
  learningRate: 0.3,
  decayFactor: 0.95,
  contextWeight: 0.35,
  frequencyWeight: 0.4,
  recencyWeight: 0.25,
  enableSequentialPrediction: true,
  enableTimeAwareness: true,
  enableCategoryAffinity: true,
  enableVocabularyTracking: true,
  enableRecommendations: true,
  enableBoardReordering: false,
  reorderingThreshold: 0.3,
  maxHistoryDays: 90,
  patternMiningConfig: {
    minSupport: 0.05,
    minConfidence: 0.3,
    maxPatternLength: 5,
    windowSize: 300,
  },
  privacyMode: false,
};

// ─── Default Contextual Profile ──────────────────────────────────────────────

const defaultContextualProfile: ContextualProfile = {
  timePatterns: [],
  locationProfiles: [],
  activityRoutines: [],
  socialContexts: [],
  currentContext: {
    timeOfDay: 'morning',
    dayOfWeek: 'monday',
    sessionDuration: 0,
    recentCategories: [],
    recentSymbols: [],
    sentenceInProgress: [],
    predictionAccuracyThisSession: 0,
  },
};

// ─── Default Vocabulary Metrics ──────────────────────────────────────────────

const defaultVocabularyMetrics: VocabularyMetrics = {
  totalUniqueSymbols: 0,
  activeVocabularySize: 0,
  coreVocabularySize: 0,
  fringeVocabularySize: 0,
  vocabularyGrowthRate: 0,
  vocabularyDiversity: 0,
  categorySpread: {},
  newSymbolsThisWeek: [],
  decliningSymbols: [],
  emergingSymbols: [],
  avgSymbolsPerSentence: 0,
  sentenceLengthTrend: 0,
};

// ─── Default Frequency Model ─────────────────────────────────────────────────

const defaultFrequencyModel: FrequencyModelSerializable = {
  symbolFrequencies: {},
  categoryFrequencies: {},
  bigramFrequencies: {},
  trigramFrequencies: {},
  totalObservations: 0,
  lastUpdated: new Date().toISOString(),
};

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function loadData<T>(key: string, fallback: T): T {
  try {
    const json = localStorage.getItem(key);
    if (!json) return fallback;
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota exceeded — trim older data
    console.warn(`[AdaptiveLearning] Storage write failed for ${key}`);
  }
}

// ─── Time Helpers ────────────────────────────────────────────────────────────

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  ];
  return days[new Date().getDay()];
}

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (24 * 60 * 60 * 1000);
}

// ─── ID Generator ────────────────────────────────────────────────────────────

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSettings(): AdaptiveLearningSettings {
  return loadData(STORAGE_KEYS.SETTINGS, { ...defaultSettings });
}

export function updateSettings(
  updates: Partial<AdaptiveLearningSettings>
): AdaptiveLearningSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export function resetSettings(): AdaptiveLearningSettings {
  saveData(STORAGE_KEYS.SETTINGS, { ...defaultSettings });
  return { ...defaultSettings };
}

// ─── Usage Records ───────────────────────────────────────────────────────────

export function getUsageRecords(): Record<string, SymbolUsageRecord> {
  return loadData(STORAGE_KEYS.USAGE_RECORDS, {});
}

export function getUsageRecord(symbolId: string): SymbolUsageRecord | null {
  const records = getUsageRecords();
  return records[symbolId] || null;
}

function saveUsageRecords(records: Record<string, SymbolUsageRecord>): void {
  // Trim if over limit
  const entries = Object.entries(records);
  if (entries.length > MAX_USAGE_RECORDS) {
    entries.sort((a, b) => new Date(b[1].lastUsed).getTime() - new Date(a[1].lastUsed).getTime());
    const trimmed = Object.fromEntries(entries.slice(0, MAX_USAGE_RECORDS));
    saveData(STORAGE_KEYS.USAGE_RECORDS, trimmed);
  } else {
    saveData(STORAGE_KEYS.USAGE_RECORDS, records);
  }
}

export function recordSymbolUsage(
  symbolId: string,
  categoryId: string,
  precedingSymbolId: string | null,
  position: number
): SymbolUsageRecord {
  const records = getUsageRecords();
  const now = new Date().toISOString();
  const timeOfDay = getTimeOfDay();
  const dayOfWeek = getDayOfWeek();

  let record = records[symbolId];
  if (!record) {
    record = {
      symbolId,
      totalUses: 0,
      recentUses: 0,
      firstUsed: now,
      lastUsed: now,
      averagePosition: position,
      contextPairs: [],
      timeDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      dayDistribution: {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0,
      },
      categoryId,
      streakDays: 1,
      peakUsageHour: new Date().getHours(),
    };
  }

  // Update counts
  record.totalUses++;
  record.recentUses = calculateRecentUses(record, now);
  record.lastUsed = now;

  // Update average position
  record.averagePosition =
    (record.averagePosition * (record.totalUses - 1) + position) / record.totalUses;

  // Update time distribution
  record.timeDistribution[timeOfDay]++;

  // Update day distribution
  record.dayDistribution[dayOfWeek]++;

  // Update peak usage hour
  record.peakUsageHour = findPeakHour(record.timeDistribution);

  // Update streak
  if (record.lastUsed) {
    const daysSinceLastUse = daysBetween(record.lastUsed, now);
    if (daysSinceLastUse <= 1.5) {
      record.streakDays++;
    } else {
      record.streakDays = 1;
    }
  }

  // Update context pairs
  if (precedingSymbolId) {
    updateContextPairs(record, precedingSymbolId, null, now);
  }

  records[symbolId] = record;
  saveUsageRecords(records);

  return record;
}

function calculateRecentUses(record: SymbolUsageRecord, now: string): number {
  // Approximate: use decay from last update
  const daysSinceLastUse = daysBetween(record.lastUsed, now);
  if (daysSinceLastUse > 7) {
    return 1; // reset to 1 (this use)
  }
  return record.recentUses + 1;
}

function findPeakHour(dist: TimeDistribution): number {
  const maxTime = Object.entries(dist).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ['morning', 0] as [string, number]
  );
  const hourMap: Record<string, number> = {
    morning: 9,
    afternoon: 14,
    evening: 19,
    night: 22,
  };
  return hourMap[maxTime[0]] || 12;
}

function updateContextPairs(
  record: SymbolUsageRecord,
  precedingId: string,
  followingId: string | null,
  timestamp: string
): void {
  const existing = record.contextPairs.find(
    (cp) => cp.precedingSymbolId === precedingId && cp.followingSymbolId === followingId
  );

  if (existing) {
    existing.count++;
    existing.lastOccurrence = timestamp;
  } else {
    record.contextPairs.push({
      precedingSymbolId: precedingId,
      followingSymbolId: followingId,
      count: 1,
      lastOccurrence: timestamp,
    });
  }

  // Trim context pairs if over limit
  if (record.contextPairs.length > MAX_CONTEXT_PAIRS) {
    record.contextPairs.sort((a, b) => b.count - a.count);
    record.contextPairs = record.contextPairs.slice(0, MAX_CONTEXT_PAIRS);
  }
}

// ─── Frequency Model ─────────────────────────────────────────────────────────

export function getFrequencyModel(): FrequencyModelSerializable {
  return loadData(STORAGE_KEYS.FREQUENCY_MODEL, { ...defaultFrequencyModel });
}

export function updateFrequencyModel(sentence: string[]): FrequencyModelSerializable {
  const model = getFrequencyModel();

  // Unigram frequencies
  for (const symbolId of sentence) {
    model.symbolFrequencies[symbolId] = (model.symbolFrequencies[symbolId] || 0) + 1;
  }

  // Bigram frequencies
  for (let i = 0; i < sentence.length - 1; i++) {
    const current = sentence[i];
    const next = sentence[i + 1];
    if (!model.bigramFrequencies[current]) {
      model.bigramFrequencies[current] = {};
    }
    model.bigramFrequencies[current][next] = (model.bigramFrequencies[current][next] || 0) + 1;
  }

  // Trigram frequencies
  for (let i = 0; i < sentence.length - 2; i++) {
    const a = sentence[i];
    const b = sentence[i + 1];
    const c = sentence[i + 2];
    if (!model.trigramFrequencies[a]) model.trigramFrequencies[a] = {};
    if (!model.trigramFrequencies[a][b]) model.trigramFrequencies[a][b] = {};
    model.trigramFrequencies[a][b][c] = (model.trigramFrequencies[a][b][c] || 0) + 1;
  }

  model.totalObservations++;
  model.lastUpdated = new Date().toISOString();

  saveData(STORAGE_KEYS.FREQUENCY_MODEL, model);
  return model;
}

export function getUnigramProbability(symbolId: string): number {
  const model = getFrequencyModel();
  const freq = model.symbolFrequencies[symbolId] || 0;
  const total = Object.values(model.symbolFrequencies).reduce((sum, f) => sum + f, 0);
  return total > 0 ? freq / total : 0;
}

export function getBigramProbability(precedingId: string, symbolId: string): number {
  const model = getFrequencyModel();
  const bgram = model.bigramFrequencies[precedingId];
  if (!bgram) return 0;
  const freq = bgram[symbolId] || 0;
  const total = Object.values(bgram).reduce((sum, f) => sum + f, 0);
  return total > 0 ? freq / total : 0;
}

export function getTrigramProbability(
  first: string,
  second: string,
  symbolId: string
): number {
  const model = getFrequencyModel();
  const tgram = model.trigramFrequencies[first]?.[second];
  if (!tgram) return 0;
  const freq = tgram[symbolId] || 0;
  const total = Object.values(tgram).reduce((sum, f) => sum + f, 0);
  return total > 0 ? freq / total : 0;
}

// ─── Prediction Engine ───────────────────────────────────────────────────────

export function generatePredictions(context: PredictionContext): PredictionResult {
  const startTime = performance.now();
  const settings = getSettings();

  if (!settings.enabled) {
    return {
      predictions: [],
      context,
      generatedAt: new Date().toISOString(),
      modelVersion: MODEL_VERSION,
      computeTimeMs: 0,
    };
  }

  const scores: Map<string, { score: number; reason: PredictionReason; algorithms: LearningAlgorithm[] }> =
    new Map();

  // Frequency-based predictions
  if (['frequency', 'hybrid'].includes(settings.algorithm)) {
    const freqPredictions = getFrequencyPredictions(context);
    mergePredictions(scores, freqPredictions, settings.frequencyWeight);
  }

  // Recency-based predictions
  if (['recency', 'hybrid'].includes(settings.algorithm)) {
    const recencyPredictions = getRecencyPredictions(context);
    mergePredictions(scores, recencyPredictions, settings.recencyWeight);
  }

  // Context-based predictions
  if (['context', 'hybrid'].includes(settings.algorithm)) {
    const contextPredictions = getContextPredictions(context);
    mergePredictions(scores, contextPredictions, settings.contextWeight);
  }

  // Sequential predictions (bigram/trigram)
  if (settings.enableSequentialPrediction && context.currentSentence.length > 0) {
    const seqPredictions = getSequentialPredictions(context);
    mergePredictions(scores, seqPredictions, 0.5);
  }

  // Time-of-day adjustments
  if (settings.enableTimeAwareness) {
    applyTimeBoost(scores, context.timeOfDay);
  }

  // Convert to array and sort
  const predictions: SymbolPrediction[] = Array.from(scores.entries())
    .filter(([, data]) => data.score >= settings.minConfidence)
    .map(([symbolId, data], index) => ({
      symbolId,
      score: Math.min(data.score, 1),
      algorithm: data.algorithms.length > 1 ? 'hybrid' as LearningAlgorithm : data.algorithms[0],
      reason: data.reason,
      rank: index + 1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, settings.predictionCount)
    .map((pred, idx) => ({ ...pred, rank: idx + 1 }));

  const computeTimeMs = performance.now() - startTime;

  return {
    predictions,
    context,
    generatedAt: new Date().toISOString(),
    modelVersion: MODEL_VERSION,
    computeTimeMs,
  };
}

function getFrequencyPredictions(
  context: PredictionContext
): Array<{ symbolId: string; score: number; reason: PredictionReason; algorithm: LearningAlgorithm }> {
  const model = getFrequencyModel();
  const totalFreq = Object.values(model.symbolFrequencies).reduce((sum, f) => sum + f, 0);
  if (totalFreq === 0) return [];

  return Object.entries(model.symbolFrequencies)
    .filter(([symbolId]) => !context.currentSentence.includes(symbolId))
    .map(([symbolId, freq]) => ({
      symbolId,
      score: freq / totalFreq,
      reason: 'frequently_used' as PredictionReason,
      algorithm: 'frequency' as LearningAlgorithm,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function getRecencyPredictions(
  context: PredictionContext
): Array<{ symbolId: string; score: number; reason: PredictionReason; algorithm: LearningAlgorithm }> {
  const records = getUsageRecords();
  const now = Date.now();
  const settings = getSettings();

  return Object.values(records)
    .filter((r) => !context.currentSentence.includes(r.symbolId))
    .map((record) => {
      const hoursSinceUse = (now - new Date(record.lastUsed).getTime()) / (1000 * 60 * 60);
      const decay = Math.pow(settings.decayFactor, hoursSinceUse / 24);
      return {
        symbolId: record.symbolId,
        score: decay * Math.min(record.recentUses / 10, 1),
        reason: 'recently_used' as PredictionReason,
        algorithm: 'recency' as LearningAlgorithm,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function getContextPredictions(
  context: PredictionContext
): Array<{ symbolId: string; score: number; reason: PredictionReason; algorithm: LearningAlgorithm }> {
  const records = getUsageRecords();
  const timeOfDay = context.timeOfDay;
  const dayOfWeek = context.dayOfWeek;

  return Object.values(records)
    .filter((r) => !context.currentSentence.includes(r.symbolId))
    .map((record) => {
      // Compute time-of-day affinity
      const totalTime = Object.values(record.timeDistribution).reduce((s, v) => s + v, 0);
      const timeAffinity = totalTime > 0 ? record.timeDistribution[timeOfDay] / totalTime : 0;

      // Compute day-of-week affinity
      const totalDay = Object.values(record.dayDistribution).reduce((s, v) => s + v, 0);
      const dayAffinity = totalDay > 0 ? record.dayDistribution[dayOfWeek] / totalDay : 0;

      // Category affinity
      const categoryMatch = context.currentCategory === record.categoryId ? 0.3 : 0;

      const score = (timeAffinity * 0.35 + dayAffinity * 0.25 + categoryMatch + 0.1) *
        Math.min(record.totalUses / 5, 1);

      return {
        symbolId: record.symbolId,
        score,
        reason: (timeAffinity > dayAffinity
          ? 'time_of_day_pattern'
          : 'day_of_week_pattern') as PredictionReason,
        algorithm: 'context' as LearningAlgorithm,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

function getSequentialPredictions(
  context: PredictionContext
): Array<{ symbolId: string; score: number; reason: PredictionReason; algorithm: LearningAlgorithm }> {
  const sentences = context.currentSentence;
  const model = getFrequencyModel();
  const results: Array<{
    symbolId: string;
    score: number;
    reason: PredictionReason;
    algorithm: LearningAlgorithm;
  }> = [];

  // Trigram predictions (highest weight)
  if (sentences.length >= 2) {
    const prev1 = sentences[sentences.length - 2];
    const prev2 = sentences[sentences.length - 1];
    const tgrams = model.trigramFrequencies[prev1]?.[prev2];
    if (tgrams) {
      const total = Object.values(tgrams).reduce((s, v) => s + v, 0);
      for (const [symbolId, freq] of Object.entries(tgrams)) {
        results.push({
          symbolId,
          score: (freq / total) * 1.2, // trigram bonus
          reason: 'sequential_pattern',
          algorithm: 'sequential',
        });
      }
    }
  }

  // Bigram predictions
  if (sentences.length >= 1) {
    const prev = sentences[sentences.length - 1];
    const bgrams = model.bigramFrequencies[prev];
    if (bgrams) {
      const total = Object.values(bgrams).reduce((s, v) => s + v, 0);
      for (const [symbolId, freq] of Object.entries(bgrams)) {
        if (!results.find((r) => r.symbolId === symbolId)) {
          results.push({
            symbolId,
            score: freq / total,
            reason: 'sequential_pattern',
            algorithm: 'sequential',
          });
        }
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 15);
}

function mergePredictions(
  scores: Map<string, { score: number; reason: PredictionReason; algorithms: LearningAlgorithm[] }>,
  predictions: Array<{
    symbolId: string;
    score: number;
    reason: PredictionReason;
    algorithm: LearningAlgorithm;
  }>,
  weight: number
): void {
  for (const pred of predictions) {
    const existing = scores.get(pred.symbolId);
    if (existing) {
      existing.score += pred.score * weight;
      if (!existing.algorithms.includes(pred.algorithm)) {
        existing.algorithms.push(pred.algorithm);
      }
      // Keep highest-scoring reason
      if (pred.score * weight > existing.score / 2) {
        existing.reason = pred.reason;
      }
    } else {
      scores.set(pred.symbolId, {
        score: pred.score * weight,
        reason: pred.reason,
        algorithms: [pred.algorithm],
      });
    }
  }
}

function applyTimeBoost(
  scores: Map<string, { score: number; reason: PredictionReason; algorithms: LearningAlgorithm[] }>,
  timeOfDay: TimeOfDay
): void {
  const records = getUsageRecords();
  for (const [symbolId, data] of scores) {
    const record = records[symbolId];
    if (!record) continue;

    const totalTime = Object.values(record.timeDistribution).reduce((s, v) => s + v, 0);
    if (totalTime === 0) continue;

    const timeRatio = record.timeDistribution[timeOfDay] / totalTime;
    if (timeRatio > 0.4) {
      data.score *= 1 + (timeRatio - 0.25) * 0.5;
    }
  }
}

// ─── Pattern Mining ──────────────────────────────────────────────────────────

export function getSequentialPatterns(): SequentialPattern[] {
  return loadData(STORAGE_KEYS.SEQUENTIAL_PATTERNS, []);
}

export function minePatterns(sessionHistory: LearningSession[]): SequentialPattern[] {
  const config = getSettings().patternMiningConfig;
  const patternCounts: Map<string, { count: number; sessions: Set<number>; lastSeen: string }> =
    new Map();
  const totalSessions = sessionHistory.length;

  for (let sessionIdx = 0; sessionIdx < sessionHistory.length; sessionIdx++) {
    const session = sessionHistory[sessionIdx];
    for (const sentence of session.sentencesBuilt) {
      // Extract subsequences
      for (let len = 2; len <= Math.min(sentence.length, config.maxPatternLength); len++) {
        for (let start = 0; start <= sentence.length - len; start++) {
          const subseq = sentence.slice(start, start + len);
          const key = subseq.join('→');
          const existing = patternCounts.get(key);
          if (existing) {
            existing.count++;
            existing.sessions.add(sessionIdx);
            existing.lastSeen = session.endTime || session.startTime;
          } else {
            patternCounts.set(key, {
              count: 1,
              sessions: new Set([sessionIdx]),
              lastSeen: session.endTime || session.startTime,
            });
          }
        }
      }
    }
  }

  // Filter by support and build pattern objects
  const patterns: SequentialPattern[] = [];
  for (const [key, data] of patternCounts) {
    const support = totalSessions > 0 ? data.sessions.size / totalSessions : 0;
    if (support >= config.minSupport && data.count >= 3) {
      const sequence = key.split('→');
      patterns.push({
        id: generateId('pat'),
        sequence,
        frequency: data.count,
        confidence: Math.min(data.count / 10, 1),
        support,
        lastSeen: data.lastSeen,
        avgTimeBetweenSymbols: 0,
      });
    }
  }

  // Sort by frequency and trim
  patterns.sort((a, b) => b.frequency - a.frequency);
  const trimmed = patterns.slice(0, MAX_PATTERNS);

  saveData(STORAGE_KEYS.SEQUENTIAL_PATTERNS, trimmed);
  return trimmed;
}

// ─── Vocabulary Metrics ──────────────────────────────────────────────────────

export function getVocabularyMetrics(): VocabularyMetrics {
  return loadData(STORAGE_KEYS.VOCABULARY_METRICS, { ...defaultVocabularyMetrics });
}

export function getVocabularyHistory(): VocabularyHistory[] {
  return loadData(STORAGE_KEYS.VOCABULARY_HISTORY, []);
}

export function computeVocabularyMetrics(): VocabularyMetrics {
  const records = getUsageRecords();
  const allRecords = Object.values(records);
  const now = new Date().toISOString();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Total unique symbols
  const totalUniqueSymbols = allRecords.length;

  // Active vocabulary (used in last 7 days)
  const activeSymbols = allRecords.filter(
    (r) => new Date(r.lastUsed).getTime() >= sevenDaysAgo
  );
  const activeVocabularySize = activeSymbols.length;

  // Core vocabulary (used 80%+ of days they've been tracked)
  const coreSymbols = allRecords.filter((r) => {
    const totalDays = Math.max(daysBetween(r.firstUsed, now), 1);
    return r.totalUses / totalDays >= 0.8;
  });
  const coreVocabularySize = coreSymbols.length;

  // Fringe vocabulary (used < 3 times)
  const fringeVocabularySize = allRecords.filter((r) => r.totalUses < 3).length;

  // New symbols this week
  const newSymbolsThisWeek = allRecords
    .filter((r) => new Date(r.firstUsed).getTime() >= sevenDaysAgo)
    .map((r) => r.symbolId);

  // Category spread
  const categorySpread: Record<string, number> = {};
  for (const record of allRecords) {
    categorySpread[record.categoryId] = (categorySpread[record.categoryId] || 0) + 1;
  }

  // Vocabulary diversity (Shannon entropy)
  const totalUses = allRecords.reduce((sum, r) => sum + r.totalUses, 0);
  let entropy = 0;
  if (totalUses > 0) {
    for (const record of allRecords) {
      const p = record.totalUses / totalUses;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    // Normalize by max entropy
    const maxEntropy = totalUniqueSymbols > 0 ? Math.log2(totalUniqueSymbols) : 1;
    entropy = maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  // Declining symbols (used in past but not recently)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const decliningSymbols = allRecords
    .filter(
      (r) =>
        r.totalUses >= 5 &&
        new Date(r.lastUsed).getTime() < sevenDaysAgo &&
        new Date(r.lastUsed).getTime() >= thirtyDaysAgo
    )
    .map((r) => r.symbolId);

  // Emerging symbols (recently started / increasing usage)
  const emergingSymbols = allRecords
    .filter((r) => {
      const daysActive = Math.max(daysBetween(r.firstUsed, now), 1);
      return daysActive <= NEWNESS_BOOST_DAYS && r.recentUses >= 3;
    })
    .map((r) => r.symbolId);

  // Average sentence length — computed from frequency model
  const model = getFrequencyModel();
  const avgSymbolsPerSentence = model.totalObservations > 0
    ? Object.values(model.symbolFrequencies).reduce((s, v) => s + v, 0) / model.totalObservations
    : 0;

  const metrics: VocabularyMetrics = {
    totalUniqueSymbols,
    activeVocabularySize,
    coreVocabularySize,
    fringeVocabularySize,
    vocabularyGrowthRate: newSymbolsThisWeek.length,
    vocabularyDiversity: entropy,
    categorySpread,
    newSymbolsThisWeek,
    decliningSymbols,
    emergingSymbols,
    avgSymbolsPerSentence,
    sentenceLengthTrend: 0, // computed from history
  };

  saveData(STORAGE_KEYS.VOCABULARY_METRICS, metrics);

  // Update history
  recordVocabularySnapshot(metrics);

  return metrics;
}

function recordVocabularySnapshot(metrics: VocabularyMetrics): void {
  const history = getVocabularyHistory();
  const today = new Date().toISOString().split('T')[0];

  // Don't duplicate today
  if (history.length > 0 && history[history.length - 1].date === today) {
    history[history.length - 1] = {
      date: today,
      totalSymbols: metrics.totalUniqueSymbols,
      activeSymbols: metrics.activeVocabularySize,
      newSymbols: metrics.newSymbolsThisWeek.length,
      droppedSymbols: metrics.decliningSymbols.length,
      avgSentenceLength: metrics.avgSymbolsPerSentence,
    };
  } else {
    history.push({
      date: today,
      totalSymbols: metrics.totalUniqueSymbols,
      activeSymbols: metrics.activeVocabularySize,
      newSymbols: metrics.newSymbolsThisWeek.length,
      droppedSymbols: metrics.decliningSymbols.length,
      avgSentenceLength: metrics.avgSymbolsPerSentence,
    });
  }

  // Trim history
  if (history.length > MAX_VOCABULARY_HISTORY) {
    history.splice(0, history.length - MAX_VOCABULARY_HISTORY);
  }

  saveData(STORAGE_KEYS.VOCABULARY_HISTORY, history);
}

// ─── Learning Sessions ───────────────────────────────────────────────────────

let currentLearningSession: LearningSession | null = null;

export function startLearningSession(): LearningSession {
  currentLearningSession = {
    id: generateId('ls'),
    startTime: new Date().toISOString(),
    endTime: null,
    symbolsUsed: [],
    sentencesBuilt: [],
    predictionsShown: 0,
    predictionsTaken: 0,
    predictionAccuracy: 0,
    newSymbolsIntroduced: [],
    categoryTransitions: [],
    interactionSpeed: 0,
    pauseEvents: [],
  };
  return currentLearningSession;
}

export function getCurrentLearningSession(): LearningSession | null {
  return currentLearningSession;
}

export function endLearningSession(): LearningSession | null {
  if (!currentLearningSession) return null;

  currentLearningSession.endTime = new Date().toISOString();

  // Calculate prediction accuracy
  if (currentLearningSession.predictionsShown > 0) {
    currentLearningSession.predictionAccuracy =
      currentLearningSession.predictionsTaken / currentLearningSession.predictionsShown;
  }

  // Save to history
  const history = loadData<LearningSession[]>(STORAGE_KEYS.SESSION_HISTORY, []);
  history.push(currentLearningSession);
  if (history.length > MAX_SESSION_HISTORY) {
    history.splice(0, history.length - MAX_SESSION_HISTORY);
  }
  saveData(STORAGE_KEYS.SESSION_HISTORY, history);

  const session = currentLearningSession;
  currentLearningSession = null;

  // Mine patterns from updated history
  minePatterns(history);

  return session;
}

export function getSessionHistory(): LearningSession[] {
  return loadData(STORAGE_KEYS.SESSION_HISTORY, []);
}

// ─── Event Processing ────────────────────────────────────────────────────────

export function processEvent(event: LearningEvent): void {
  const settings = getSettings();
  if (!settings.enabled || settings.privacyMode) return;

  switch (event.type) {
    case 'symbol_selected':
      handleSymbolSelected(event);
      break;
    case 'sentence_built':
      handleSentenceBuilt(event);
      break;
    case 'sentence_spoken':
      // Already covered by sentence_built
      break;
    case 'prediction_shown':
      handlePredictionShown(event);
      break;
    case 'prediction_accepted':
      handlePredictionAccepted(event);
      break;
    case 'category_changed':
      handleCategoryChanged(event);
      break;
    case 'session_started':
      startLearningSession();
      break;
    case 'session_ended':
      endLearningSession();
      break;
    default:
      break;
  }
}

function handleSymbolSelected(event: {
  symbolId: string;
  categoryId: string;
  position: number;
  wasPredicted: boolean;
}): void {
  const precedingId =
    currentLearningSession?.symbolsUsed[currentLearningSession.symbolsUsed.length - 1] || null;

  // Track usage
  recordSymbolUsage(event.symbolId, event.categoryId, precedingId, event.position);

  // Update learning session
  if (currentLearningSession) {
    currentLearningSession.symbolsUsed.push(event.symbolId);

    // Check if this is a new symbol
    const records = getUsageRecords();
    const record = records[event.symbolId];
    if (record && record.totalUses === 1) {
      currentLearningSession.newSymbolsIntroduced.push(event.symbolId);
    }
  }
}

function handleSentenceBuilt(event: { symbolIds: string[] }): void {
  updateFrequencyModel(event.symbolIds);

  if (currentLearningSession) {
    currentLearningSession.sentencesBuilt.push(event.symbolIds);
  }
}

function handlePredictionShown(event: {
  predictions: Array<{ symbolId: string; rank: number; score: number }>;
}): void {
  if (currentLearningSession) {
    currentLearningSession.predictionsShown += event.predictions.length;
  }
}

function handlePredictionAccepted(event: {
  symbolId: string;
  rank: number;
}): void {
  if (currentLearningSession) {
    currentLearningSession.predictionsTaken++;
  }
}

function handleCategoryChanged(event: {
  fromCategory: string | null;
  toCategory: string;
  timestamp: string;
}): void {
  if (currentLearningSession && event.fromCategory) {
    currentLearningSession.categoryTransitions.push({
      fromCategory: event.fromCategory,
      toCategory: event.toCategory,
      timestamp: event.timestamp,
    });
  }

  // Update contextual profile
  const profile = getContextualProfile();
  if (!profile.currentContext.recentCategories.includes(event.toCategory)) {
    profile.currentContext.recentCategories.push(event.toCategory);
    if (profile.currentContext.recentCategories.length > 10) {
      profile.currentContext.recentCategories.shift();
    }
  }
  saveData(STORAGE_KEYS.CONTEXTUAL_PROFILE, profile);
}

// ─── Contextual Profile ─────────────────────────────────────────────────────

export function getContextualProfile(): ContextualProfile {
  return loadData(STORAGE_KEYS.CONTEXTUAL_PROFILE, { ...defaultContextualProfile });
}

export function updateCurrentContext(updates: Partial<CurrentContext>): void {
  const profile = getContextualProfile();
  profile.currentContext = { ...profile.currentContext, ...updates };
  saveData(STORAGE_KEYS.CONTEXTUAL_PROFILE, profile);
}

export function computeTimePatterns(): TimePattern[] {
  const records = getUsageRecords();
  const allRecords = Object.values(records);
  const timeSlots: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
  const daySlots: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ];

  const patterns: TimePattern[] = [];

  for (const time of timeSlots) {
    for (const day of daySlots) {
      // Find symbols commonly used at this time+day
      const relevantRecords = allRecords.filter((r) => {
        const timeUses = r.timeDistribution[time];
        const dayUses = r.dayDistribution[day];
        return timeUses > 0 && dayUses > 0;
      });

      if (relevantRecords.length === 0) continue;

      // Sort by usage at this time
      const sorted = relevantRecords.sort(
        (a, b) => b.timeDistribution[time] - a.timeDistribution[time]
      );

      const commonSymbols = sorted.slice(0, 10).map((r) => r.symbolId);
      const commonCategories = [
        ...new Set(sorted.slice(0, 10).map((r) => r.categoryId)),
      ];

      patterns.push({
        timeOfDay: time,
        dayOfWeek: day,
        commonCategories,
        commonSymbols,
        avgSessionLength: 0,
        avgSentenceLength: 0,
        symbolSelectionSpeed: 0,
      });
    }
  }

  // Save to contextual profile
  const profile = getContextualProfile();
  profile.timePatterns = patterns;
  saveData(STORAGE_KEYS.CONTEXTUAL_PROFILE, profile);

  return patterns;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function getRecommendations(): Recommendation[] {
  return loadData(STORAGE_KEYS.RECOMMENDATIONS, []);
}

export function generateRecommendations(): Recommendation[] {
  const settings = getSettings();
  if (!settings.enableRecommendations) return [];

  const records = getUsageRecords();
  const metrics = computeVocabularyMetrics();
  const recommendations: Recommendation[] = [];
  const now = new Date().toISOString();

  // 1. Recommend vocabulary expansion if small active vocab
  if (metrics.activeVocabularySize < 20) {
    recommendations.push({
      id: generateId('rec'),
      type: 'vocabulary_expansion',
      title: 'Expand Your Vocabulary',
      description: `You're currently using ${metrics.activeVocabularySize} symbols actively. Try exploring new categories to find more useful symbols.`,
      priority: 'high',
      symbolIds: [],
      categoryIds: Object.keys(metrics.categorySpread)
        .filter((cat) => (metrics.categorySpread[cat] || 0) < 3),
      confidence: 0.8,
      createdAt: now,
      expiresAt: null,
      dismissed: false,
      acted: false,
    });
  }

  // 2. Suggest re-engaging with declining symbols
  if (metrics.decliningSymbols.length > 0) {
    recommendations.push({
      id: generateId('rec'),
      type: 'practice_symbol',
      title: 'Revisit Unused Symbols',
      description: `You haven't used ${metrics.decliningSymbols.length} symbols recently that you used to use frequently.`,
      priority: 'medium',
      symbolIds: metrics.decliningSymbols.slice(0, 5),
      categoryIds: [],
      confidence: 0.6,
      createdAt: now,
      expiresAt: null,
      dismissed: false,
      acted: false,
    });
  }

  // 3. Promote frequently used symbols
  const topSymbols = Object.values(records)
    .sort((a, b) => b.recentUses - a.recentUses)
    .slice(0, 5);

  if (topSymbols.length >= 3) {
    recommendations.push({
      id: generateId('rec'),
      type: 'promote_symbol',
      title: 'Most Used Symbols',
      description: `Consider adding your top ${topSymbols.length} symbols to your home board for quick access.`,
      priority: 'low',
      symbolIds: topSymbols.map((r) => r.symbolId),
      categoryIds: [],
      confidence: 0.7,
      createdAt: now,
      expiresAt: null,
      dismissed: false,
      acted: false,
    });
  }

  // 4. Category exploration
  const usedCategories = new Set(Object.keys(metrics.categorySpread));
  const allCategories = [
    'people', 'actions', 'feelings', 'food', 'places',
    'things', 'descriptions', 'questions', 'social', 'time',
  ];
  const unexplored = allCategories.filter((c) => !usedCategories.has(c));
  if (unexplored.length > 0) {
    recommendations.push({
      id: generateId('rec'),
      type: 'category_exploration',
      title: 'Explore New Categories',
      description: `You haven't explored ${unexplored.length} categories yet. Try browsing them for new symbols!`,
      priority: 'medium',
      symbolIds: [],
      categoryIds: unexplored,
      confidence: 0.5,
      createdAt: now,
      expiresAt: null,
      dismissed: false,
      acted: false,
    });
  }

  // 5. Sentence templates from patterns
  const patterns = getSequentialPatterns();
  if (patterns.length > 0) {
    const topPatterns = patterns.slice(0, 3);
    recommendations.push({
      id: generateId('rec'),
      type: 'sentence_template',
      title: 'Common Sentence Patterns',
      description: `You frequently use these symbol sequences. They might make good quick phrases!`,
      priority: 'low',
      symbolIds: topPatterns.flatMap((p) => p.sequence),
      categoryIds: [],
      confidence: 0.65,
      createdAt: now,
      expiresAt: null,
      dismissed: false,
      acted: false,
    });
  }

  // Trim and save
  const trimmed = recommendations.slice(0, MAX_RECOMMENDATIONS);
  saveData(STORAGE_KEYS.RECOMMENDATIONS, trimmed);
  return trimmed;
}

export function dismissRecommendation(id: string): void {
  const recommendations = getRecommendations();
  const rec = recommendations.find((r) => r.id === id);
  if (rec) {
    rec.dismissed = true;
    saveData(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
  }
}

export function actOnRecommendation(id: string): void {
  const recommendations = getRecommendations();
  const rec = recommendations.find((r) => r.id === id);
  if (rec) {
    rec.acted = true;
    saveData(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
  }
}

// ─── Board Reordering ────────────────────────────────────────────────────────

export function getSuggestedOrder(
  categoryId: string,
  currentSymbolIds: string[]
): string[] {
  const settings = getSettings();
  if (!settings.enableBoardReordering) return currentSymbolIds;

  const records = getUsageRecords();
  const symbolScores: Map<string, number> = new Map();

  for (const symbolId of currentSymbolIds) {
    const record = records[symbolId];
    if (!record) {
      symbolScores.set(symbolId, 0);
      continue;
    }

    // Score based on frequency and recency
    const freqScore = Math.log2(record.totalUses + 1);
    const daysSinceUse = daysBetween(record.lastUsed, new Date().toISOString());
    const recencyScore = Math.pow(settings.decayFactor, daysSinceUse);

    symbolScores.set(symbolId, freqScore * 0.6 + recencyScore * 10 * 0.4);
  }

  // Sort by score descending
  return [...currentSymbolIds].sort(
    (a, b) => (symbolScores.get(b) || 0) - (symbolScores.get(a) || 0)
  );
}

export function getSymbolRelevanceScore(symbolId: string): number {
  const records = getUsageRecords();
  const record = records[symbolId];
  if (!record) return 0;

  const settings = getSettings();
  const daysSinceUse = daysBetween(record.lastUsed, new Date().toISOString());
  const recency = Math.pow(settings.decayFactor, daysSinceUse);
  const frequency = Math.min(record.totalUses / 50, 1);
  const streak = Math.min(record.streakDays / 7, 1);

  return (
    frequency * settings.frequencyWeight +
    recency * settings.recencyWeight +
    streak * 0.1
  );
}

// ─── Confidence Helpers ──────────────────────────────────────────────────────

export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'very_high';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.2) return 'low';
  return 'very_low';
}

// ─── Data Management ─────────────────────────────────────────────────────────

export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
  currentLearningSession = null;
}

export function exportData(): AdaptiveLearningState {
  return {
    isInitialized: true,
    settings: getSettings(),
    usageRecords: getUsageRecords(),
    frequencyModel: getFrequencyModel(),
    sequentialPatterns: getSequentialPatterns(),
    vocabularyMetrics: getVocabularyMetrics(),
    vocabularyHistory: getVocabularyHistory(),
    currentSession: currentLearningSession,
    recommendations: getRecommendations(),
    contextualProfile: getContextualProfile(),
    lastTrainingTime: new Date().toISOString(),
    modelVersion: MODEL_VERSION,
  };
}

export function importData(data: AdaptiveLearningState): void {
  if (data.settings) saveData(STORAGE_KEYS.SETTINGS, data.settings);
  if (data.usageRecords) saveData(STORAGE_KEYS.USAGE_RECORDS, data.usageRecords);
  if (data.frequencyModel) saveData(STORAGE_KEYS.FREQUENCY_MODEL, data.frequencyModel);
  if (data.sequentialPatterns) saveData(STORAGE_KEYS.SEQUENTIAL_PATTERNS, data.sequentialPatterns);
  if (data.vocabularyMetrics) saveData(STORAGE_KEYS.VOCABULARY_METRICS, data.vocabularyMetrics);
  if (data.vocabularyHistory) saveData(STORAGE_KEYS.VOCABULARY_HISTORY, data.vocabularyHistory);
  if (data.recommendations) saveData(STORAGE_KEYS.RECOMMENDATIONS, data.recommendations);
  if (data.contextualProfile) saveData(STORAGE_KEYS.CONTEXTUAL_PROFILE, data.contextualProfile);
}

// ─── Export Service Object ───────────────────────────────────────────────────

export const adaptiveLearningService = {
  // Settings
  getSettings,
  updateSettings,
  resetSettings,

  // Usage
  getUsageRecords,
  getUsageRecord,
  recordSymbolUsage,

  // Frequency model
  getFrequencyModel,
  updateFrequencyModel,
  getUnigramProbability,
  getBigramProbability,
  getTrigramProbability,

  // Predictions
  generatePredictions,

  // Patterns
  getSequentialPatterns,
  minePatterns,

  // Vocabulary
  getVocabularyMetrics,
  getVocabularyHistory,
  computeVocabularyMetrics,

  // Sessions
  startLearningSession,
  getCurrentLearningSession,
  endLearningSession,
  getSessionHistory,

  // Events
  processEvent,

  // Context
  getContextualProfile,
  updateCurrentContext,
  computeTimePatterns,

  // Recommendations
  getRecommendations,
  generateRecommendations,
  dismissRecommendation,
  actOnRecommendation,

  // Board reordering
  getSuggestedOrder,
  getSymbolRelevanceScore,

  // Helpers
  getConfidenceLevel,

  // Data management
  clearAllData,
  exportData,
  importData,
};
