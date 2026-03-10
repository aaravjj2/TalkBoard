/**
 * adaptiveLearningStore — Zustand store for adaptive learning state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  adaptiveLearningService,
  type AdaptiveLearningSettings,
  type SymbolUsageRecord,
  type FrequencyModelSerializable,
  type SequentialPattern,
  type VocabularyMetrics,
  type VocabularyHistory,
  type LearningSession,
  type Recommendation,
  type ContextualProfile,
  type SymbolPrediction,
  type PredictionContext,
  type PredictionResult,
  type LearningEvent,
  type CurrentContext,
} from '@/services/adaptiveLearningService';
import type { TimeOfDay, DayOfWeek } from '@/types/adaptiveLearning';

// ─── Store Types ─────────────────────────────────────────────────────────────

interface AdaptiveLearningState {
  // Settings
  settings: AdaptiveLearningSettings;
  isInitialized: boolean;

  // Usage data
  usageRecords: Record<string, SymbolUsageRecord>;
  topSymbols: SymbolUsageRecord[];

  // Predictions
  currentPredictions: SymbolPrediction[];
  lastPredictionResult: PredictionResult | null;
  predictionAccuracy: number;

  // Vocabulary
  vocabularyMetrics: VocabularyMetrics;
  vocabularyHistory: VocabularyHistory[];

  // Patterns
  sequentialPatterns: SequentialPattern[];

  // Sessions
  currentSession: LearningSession | null;
  sessionHistory: LearningSession[];

  // Recommendations
  recommendations: Recommendation[];

  // Context
  contextualProfile: ContextualProfile;

  // UI
  showPredictions: boolean;
  showRecommendations: boolean;
  isTraining: boolean;
  lastError: string | null;
}

interface AdaptiveLearningActions {
  // Init
  initialize: () => void;
  refresh: () => void;

  // Settings
  updateSettings: (updates: Partial<AdaptiveLearningSettings>) => void;
  resetSettings: () => void;
  toggleEnabled: () => void;

  // Event processing
  processEvent: (event: LearningEvent) => void;
  recordSymbolSelection: (
    symbolId: string,
    categoryId: string,
    position: number,
    wasPredicted: boolean
  ) => void;
  recordSentenceBuilt: (symbolIds: string[]) => void;
  recordSentenceSpoken: (symbolIds: string[], ttsUsed: boolean) => void;
  recordCategoryChange: (fromCategory: string | null, toCategory: string) => void;

  // Predictions
  generatePredictions: (context: PredictionContext) => SymbolPrediction[];
  acceptPrediction: (symbolId: string, rank: number, score: number) => void;
  clearPredictions: () => void;

  // Vocabulary
  refreshVocabulary: () => void;

  // Session management
  startSession: () => void;
  endSession: () => void;

  // Recommendations
  refreshRecommendations: () => void;
  dismissRecommendation: (id: string) => void;
  actOnRecommendation: (id: string) => void;

  // Board reordering
  getSuggestedOrder: (categoryId: string, symbolIds: string[]) => string[];
  getSymbolRelevance: (symbolId: string) => number;

  // Context
  updateContext: (updates: Partial<CurrentContext>) => void;

  // UI
  togglePredictions: () => void;
  toggleRecommendations: () => void;

  // Data management
  clearAllData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

type AdaptiveLearningStore = AdaptiveLearningState & AdaptiveLearningActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: AdaptiveLearningState = {
  settings: adaptiveLearningService.getSettings(),
  isInitialized: false,
  usageRecords: {},
  topSymbols: [],
  currentPredictions: [],
  lastPredictionResult: null,
  predictionAccuracy: 0,
  vocabularyMetrics: adaptiveLearningService.getVocabularyMetrics(),
  vocabularyHistory: [],
  sequentialPatterns: [],
  currentSession: null,
  sessionHistory: [],
  recommendations: [],
  contextualProfile: adaptiveLearningService.getContextualProfile(),
  showPredictions: true,
  showRecommendations: true,
  isTraining: false,
  lastError: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAdaptiveLearningStore = create<AdaptiveLearningStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Init ────────────────────────────────────────────────────────

      initialize: () => {
        const settings = adaptiveLearningService.getSettings();
        const usageRecords = adaptiveLearningService.getUsageRecords();
        const vocabMetrics = adaptiveLearningService.getVocabularyMetrics();
        const vocabHistory = adaptiveLearningService.getVocabularyHistory();
        const patterns = adaptiveLearningService.getSequentialPatterns();
        const recommendations = adaptiveLearningService.getRecommendations();
        const contextProfile = adaptiveLearningService.getContextualProfile();
        const sessionHistory = adaptiveLearningService.getSessionHistory();

        const topSymbols = Object.values(usageRecords)
          .sort((a, b) => b.totalUses - a.totalUses)
          .slice(0, 20);

        set({
          settings,
          isInitialized: true,
          usageRecords,
          topSymbols,
          vocabularyMetrics: vocabMetrics,
          vocabularyHistory: vocabHistory,
          sequentialPatterns: patterns,
          recommendations: recommendations.filter((r) => !r.dismissed),
          contextualProfile: contextProfile,
          sessionHistory,
        });
      },

      refresh: () => {
        get().initialize();
      },

      // ─── Settings ──────────────────────────────────────────────────

      updateSettings: (updates) => {
        const settings = adaptiveLearningService.updateSettings(updates);
        set({ settings });
      },

      resetSettings: () => {
        const settings = adaptiveLearningService.resetSettings();
        set({ settings });
      },

      toggleEnabled: () => {
        const current = get().settings;
        const settings = adaptiveLearningService.updateSettings({
          enabled: !current.enabled,
        });
        set({ settings });
      },

      // ─── Event Processing ──────────────────────────────────────────

      processEvent: (event) => {
        adaptiveLearningService.processEvent(event);
      },

      recordSymbolSelection: (symbolId, categoryId, position, wasPredicted) => {
        adaptiveLearningService.processEvent({
          type: 'symbol_selected',
          symbolId,
          categoryId,
          timestamp: new Date().toISOString(),
          position,
          wasPredicted,
          selectionTimeMs: 0,
        });

        // Update local state
        const usageRecords = adaptiveLearningService.getUsageRecords();
        const topSymbols = Object.values(usageRecords)
          .sort((a, b) => b.totalUses - a.totalUses)
          .slice(0, 20);
        set({ usageRecords, topSymbols });
      },

      recordSentenceBuilt: (symbolIds) => {
        adaptiveLearningService.processEvent({
          type: 'sentence_built',
          symbolIds,
          timestamp: new Date().toISOString(),
          buildTimeMs: 0,
        });
      },

      recordSentenceSpoken: (symbolIds, ttsUsed) => {
        adaptiveLearningService.processEvent({
          type: 'sentence_spoken',
          symbolIds,
          timestamp: new Date().toISOString(),
          ttsUsed,
        });
      },

      recordCategoryChange: (fromCategory, toCategory) => {
        adaptiveLearningService.processEvent({
          type: 'category_changed',
          fromCategory,
          toCategory,
          timestamp: new Date().toISOString(),
        });
      },

      // ─── Predictions ──────────────────────────────────────────────

      generatePredictions: (context) => {
        const result = adaptiveLearningService.generatePredictions(context);
        set({
          currentPredictions: result.predictions,
          lastPredictionResult: result,
        });
        return result.predictions;
      },

      acceptPrediction: (symbolId, rank, score) => {
        adaptiveLearningService.processEvent({
          type: 'prediction_accepted',
          symbolId,
          rank,
          score,
          timestamp: new Date().toISOString(),
        });

        // Update accuracy
        const session = adaptiveLearningService.getCurrentLearningSession();
        if (session && session.predictionsShown > 0) {
          set({
            predictionAccuracy: session.predictionsTaken / session.predictionsShown,
          });
        }
      },

      clearPredictions: () => {
        set({ currentPredictions: [], lastPredictionResult: null });
      },

      // ─── Vocabulary ────────────────────────────────────────────────

      refreshVocabulary: () => {
        set({ isTraining: true });
        const metrics = adaptiveLearningService.computeVocabularyMetrics();
        const history = adaptiveLearningService.getVocabularyHistory();
        set({
          vocabularyMetrics: metrics,
          vocabularyHistory: history,
          isTraining: false,
        });
      },

      // ─── Sessions ─────────────────────────────────────────────────

      startSession: () => {
        const session = adaptiveLearningService.startLearningSession();
        set({ currentSession: session });
      },

      endSession: () => {
        const session = adaptiveLearningService.endLearningSession();
        if (session) {
          const sessionHistory = adaptiveLearningService.getSessionHistory();
          set({
            currentSession: null,
            sessionHistory,
            sequentialPatterns: adaptiveLearningService.getSequentialPatterns(),
          });
        }
      },

      // ─── Recommendations ──────────────────────────────────────────

      refreshRecommendations: () => {
        const recommendations = adaptiveLearningService.generateRecommendations();
        set({ recommendations: recommendations.filter((r) => !r.dismissed) });
      },

      dismissRecommendation: (id) => {
        adaptiveLearningService.dismissRecommendation(id);
        set((state) => ({
          recommendations: state.recommendations.filter((r) => r.id !== id),
        }));
      },

      actOnRecommendation: (id) => {
        adaptiveLearningService.actOnRecommendation(id);
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, acted: true } : r
          ),
        }));
      },

      // ─── Board Reordering ─────────────────────────────────────────

      getSuggestedOrder: (categoryId, symbolIds) => {
        return adaptiveLearningService.getSuggestedOrder(categoryId, symbolIds);
      },

      getSymbolRelevance: (symbolId) => {
        return adaptiveLearningService.getSymbolRelevanceScore(symbolId);
      },

      // ─── Context ──────────────────────────────────────────────────

      updateContext: (updates) => {
        adaptiveLearningService.updateCurrentContext(updates);
        const profile = adaptiveLearningService.getContextualProfile();
        set({ contextualProfile: profile });
      },

      // ─── UI ────────────────────────────────────────────────────────

      togglePredictions: () => {
        set((state) => ({ showPredictions: !state.showPredictions }));
      },

      toggleRecommendations: () => {
        set((state) => ({ showRecommendations: !state.showRecommendations }));
      },

      // ─── Data Management ──────────────────────────────────────────

      clearAllData: () => {
        adaptiveLearningService.clearAllData();
        set({
          ...initialState,
          isInitialized: true,
        });
      },

      exportData: () => {
        const data = adaptiveLearningService.exportData();
        return JSON.stringify(data, null, 2);
      },

      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          adaptiveLearningService.importData(data);
          get().initialize();
          return true;
        } catch {
          set({ lastError: 'Failed to import data: invalid format' });
          return false;
        }
      },
    }),
    {
      name: 'talkboard-adaptive-learning-store',
      partialize: (state) => ({
        showPredictions: state.showPredictions,
        showRecommendations: state.showRecommendations,
      }),
    }
  )
);
