// ─── Communication Partner Store ────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { communicationPartnerService } from '../services/communicationPartnerService';
import type {
  CommunicationPartner,
  CommunicationSession,
  CommunicationStrategy,
  ModelingItem,
  CommunicationLogEntry,
  PartnerTip,
  PartnerSettings,
  PartnerProgress,
  PartnerRole,
  SessionType,
  LogEntryType,
  PromptLevel,
} from '../types/communicationPartner';

interface CommunicationPartnerStoreState {
  partners: CommunicationPartner[];
  sessions: CommunicationSession[];
  strategies: CommunicationStrategy[];
  modelingQueue: ModelingItem[];
  log: CommunicationLogEntry[];
  tips: PartnerTip[];
  settings: PartnerSettings;
  selectedPartnerId: string | null;
  partnerProgress: PartnerProgress | null;
  activeTab: string;
  isLoading: boolean;
  error: string | null;

  initialize: () => void;
  setActiveTab: (tab: string) => void;
  selectPartner: (id: string | null) => void;

  // Partners
  addPartner: (name: string, role: PartnerRole, email: string) => void;
  updatePartner: (id: string, updates: Partial<CommunicationPartner>) => void;
  removePartner: (id: string) => void;

  // Sessions
  createSession: (partnerId: string, partnerName: string, type: SessionType) => void;
  updateSession: (id: string, updates: Partial<CommunicationSession>) => void;
  completeSession: (id: string, notes: string, rating: number) => void;

  // Strategies
  toggleBookmark: (id: string) => void;

  // Modeling
  addModelingItem: (phrase: string, symbols: string[], category: string) => void;
  markDemonstrated: (id: string) => void;
  markAttempted: (id: string) => void;
  removeModelingItem: (id: string) => void;

  // Log
  addLogEntry: (sessionId: string, type: LogEntryType, content: string, isUserGenerated: boolean, partnerName: string, symbols?: string[], promptLevel?: PromptLevel) => void;

  // Tips
  markTipRead: (id: string) => void;

  // Settings
  updateSettings: (partial: Partial<PartnerSettings>) => void;

  clearError: () => void;
}

export const useCommunicationPartnerStore = create<CommunicationPartnerStoreState>()(
  persist(
    (set) => ({
      partners: [],
      sessions: [],
      strategies: [],
      modelingQueue: [],
      log: [],
      tips: [],
      settings: communicationPartnerService.getSettings(),
      selectedPartnerId: null,
      partnerProgress: null,
      activeTab: 'partners',
      isLoading: false,
      error: null,

      initialize: () => {
        set({
          partners: communicationPartnerService.getPartners(),
          sessions: communicationPartnerService.getSessions(),
          strategies: communicationPartnerService.getStrategies(),
          modelingQueue: communicationPartnerService.getModelingQueue(),
          log: communicationPartnerService.getLog(),
          tips: communicationPartnerService.getTips(),
          settings: communicationPartnerService.getSettings(),
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      selectPartner: (id) => {
        const progress = id ? communicationPartnerService.getPartnerProgress(id) : null;
        set({ selectedPartnerId: id, partnerProgress: progress });
      },

      addPartner: (name, role, email) => {
        communicationPartnerService.addPartner(name, role, email);
        set({ partners: communicationPartnerService.getPartners() });
      },

      updatePartner: (id, updates) => {
        communicationPartnerService.updatePartner(id, updates);
        set({ partners: communicationPartnerService.getPartners() });
      },

      removePartner: (id) => {
        communicationPartnerService.removePartner(id);
        set({ partners: communicationPartnerService.getPartners() });
      },

      createSession: (partnerId, partnerName, type) => {
        communicationPartnerService.createSession(partnerId, partnerName, type);
        set({ sessions: communicationPartnerService.getSessions() });
      },

      updateSession: (id, updates) => {
        communicationPartnerService.updateSession(id, updates);
        set({ sessions: communicationPartnerService.getSessions() });
      },

      completeSession: (id, notes, rating) => {
        communicationPartnerService.completeSession(id, notes, rating);
        set({ sessions: communicationPartnerService.getSessions() });
      },

      toggleBookmark: (id) => {
        communicationPartnerService.toggleBookmark(id);
        set({ strategies: communicationPartnerService.getStrategies() });
      },

      addModelingItem: (phrase, symbols, category) => {
        communicationPartnerService.addModelingItem(phrase, symbols, category);
        set({ modelingQueue: communicationPartnerService.getModelingQueue() });
      },

      markDemonstrated: (id) => {
        communicationPartnerService.markDemonstrated(id);
        set({ modelingQueue: communicationPartnerService.getModelingQueue() });
      },

      markAttempted: (id) => {
        communicationPartnerService.markAttempted(id);
        set({ modelingQueue: communicationPartnerService.getModelingQueue() });
      },

      removeModelingItem: (id) => {
        communicationPartnerService.removeModelingItem(id);
        set({ modelingQueue: communicationPartnerService.getModelingQueue() });
      },

      addLogEntry: (sessionId, type, content, isUserGenerated, partnerName, symbols, promptLevel) => {
        communicationPartnerService.addLogEntry(sessionId, type, content, isUserGenerated, partnerName, symbols, promptLevel);
        set({ log: communicationPartnerService.getLog() });
      },

      markTipRead: (id) => {
        communicationPartnerService.markTipRead(id);
        set({ tips: communicationPartnerService.getTips() });
      },

      updateSettings: (partial) => {
        const settings = communicationPartnerService.updateSettings(partial);
        set({ settings });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-communication-partner',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
