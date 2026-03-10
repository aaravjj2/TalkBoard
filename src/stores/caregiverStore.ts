/**
 * caregiverStore — Zustand store for caregiver mode state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  caregiverService,
  type CaregiverProfile,
  type CaregiverSession,
  type CaregiverSettings,
  type ActivityLogEntry,
  type CommunicationRestriction,
  type CommunicationGoal,
  type CaregiverNote,
  type UsageReport,
  type ActivityType,
  type RestrictionConfig,
} from '@/services/caregiverService';

// ─── Store State ─────────────────────────────────────────────────────────────

interface CaregiverState {
  // Auth state
  isPinSet: boolean;
  isAuthenticated: boolean;
  isLockedOut: boolean;
  lockoutRemainingMs: number;
  currentSession: CaregiverSession | null;

  // Profiles
  profiles: CaregiverProfile[];
  activeProfile: CaregiverProfile | null;

  // Settings
  settings: CaregiverSettings;

  // Activity log
  activityLog: ActivityLogEntry[];
  activityLogFilters: {
    type: ActivityType | null;
    actor: 'user' | 'caregiver' | null;
    category: ActivityLogEntry['category'] | null;
    startDate: string | null;
    endDate: string | null;
  };

  // Restrictions
  restrictions: CommunicationRestriction[];
  isInQuietHours: boolean;

  // Goals
  goals: CommunicationGoal[];

  // Notes
  notes: CaregiverNote[];
  showArchivedNotes: boolean;

  // Reports
  currentReport: UsageReport | null;
  reportPeriod: { start: string; end: string };

  // UI state
  caregiverMode: boolean;
  dashboardTab: string;
  showPinDialog: boolean;
  showSetupWizard: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CaregiverActions {
  // Initialization
  initialize: () => void;
  refresh: () => void;

  // PIN management
  setupPin: (pin: string) => boolean;
  changePin: (currentPin: string, newPin: string) => boolean;
  verifyAndLogin: (pin: string) => boolean;
  removePin: () => void;

  // Session
  logout: () => void;
  extendSession: (minutes?: number) => void;
  checkSession: () => void;

  // Profile management
  createProfile: (data: {
    name: string;
    role: CaregiverProfile['role'];
    email?: string;
    phone?: string;
  }) => CaregiverProfile;
  updateProfile: (
    id: string,
    updates: Partial<Omit<CaregiverProfile, 'id' | 'createdAt'>>
  ) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;

  // Settings
  updateSettings: (updates: Partial<CaregiverSettings>) => void;
  resetSettings: () => void;

  // Activity log
  setActivityFilters: (filters: Partial<CaregiverState['activityLogFilters']>) => void;
  clearActivityFilters: () => void;
  refreshActivityLog: () => void;
  clearActivityLog: () => void;

  // Restrictions
  createRestriction: (data: {
    type: CommunicationRestriction['type'];
    name: string;
    description: string;
    config: RestrictionConfig;
    isActive?: boolean;
  }) => CommunicationRestriction;
  updateRestriction: (
    id: string,
    updates: Partial<Omit<CommunicationRestriction, 'id' | 'createdAt' | 'createdBy'>>
  ) => void;
  deleteRestriction: (id: string) => void;
  toggleRestriction: (id: string) => void;
  checkQuietHours: () => void;

  // Goals
  createGoal: (data: {
    title: string;
    description: string;
    type: CommunicationGoal['type'];
    target: number;
    unit: string;
    endDate?: string;
    milestones?: { value: number; label: string }[];
  }) => CommunicationGoal;
  updateGoalProgress: (id: string, progress: number) => void;
  updateGoal: (
    id: string,
    updates: Partial<Omit<CommunicationGoal, 'id' | 'createdAt' | 'createdBy'>>
  ) => void;
  deleteGoal: (id: string) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;

  // Notes
  createNote: (data: {
    title: string;
    content: string;
    category: CaregiverNote['category'];
    priority?: CaregiverNote['priority'];
    tags?: string[];
  }) => CaregiverNote;
  updateNote: (
    id: string,
    updates: Partial<Omit<CaregiverNote, 'id' | 'createdAt' | 'createdBy'>>
  ) => void;
  deleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  toggleShowArchivedNotes: () => void;

  // Reports
  generateReport: (startDate: string, endDate: string) => void;
  setReportPeriod: (start: string, end: string) => void;

  // UI
  setDashboardTab: (tab: string) => void;
  toggleCaregiverMode: () => void;
  setShowPinDialog: (show: boolean) => void;
  setShowSetupWizard: (show: boolean) => void;
  clearError: () => void;
}

type CaregiverStore = CaregiverState & CaregiverActions;

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: CaregiverState = {
  isPinSet: false,
  isAuthenticated: false,
  isLockedOut: false,
  lockoutRemainingMs: 0,
  currentSession: null,
  profiles: [],
  activeProfile: null,
  settings: caregiverService.getSettings(),
  activityLog: [],
  activityLogFilters: {
    type: null,
    actor: null,
    category: null,
    startDate: null,
    endDate: null,
  },
  restrictions: [],
  isInQuietHours: false,
  goals: [],
  notes: [],
  showArchivedNotes: false,
  currentReport: null,
  reportPeriod: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  caregiverMode: false,
  dashboardTab: 'overview',
  showPinDialog: false,
  showSetupWizard: false,
  isLoading: false,
  error: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCaregiverStore = create<CaregiverStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─── Initialization ──────────────────────────────────────────────

      initialize: () => {
        const isPinSet = caregiverService.isPinSet();
        const session = caregiverService.getActiveSession();
        const isLockedOut = caregiverService.isLockedOut();

        set({
          isPinSet,
          isAuthenticated: session !== null,
          currentSession: session,
          isLockedOut,
          lockoutRemainingMs: caregiverService.getLockoutRemainingMs(),
          profiles: caregiverService.getProfiles(),
          settings: caregiverService.getSettings(),
          restrictions: caregiverService.getRestrictions(),
          goals: caregiverService.getGoals(),
          notes: caregiverService.getNotes(),
          isInQuietHours: caregiverService.isInQuietHours(),
        });

        if (session) {
          get().refreshActivityLog();
        }
      },

      refresh: () => {
        get().initialize();
      },

      // ─── PIN Management ──────────────────────────────────────────────

      setupPin: (pin: string) => {
        const success = caregiverService.setPin(pin);
        if (success) {
          set({ isPinSet: true });

          // Auto-login after setup
          const session = caregiverService.createSession();
          set({
            isAuthenticated: true,
            currentSession: session,
            caregiverMode: true,
          });
        }
        return success;
      },

      changePin: (currentPin: string, newPin: string) => {
        if (!caregiverService.verifyPin(currentPin)) {
          set({ error: 'Current PIN is incorrect' });
          return false;
        }
        const success = caregiverService.setPin(newPin);
        if (success) {
          set({ error: null });
        }
        return success;
      },

      verifyAndLogin: (pin: string) => {
        if (get().isLockedOut) {
          set({ error: 'Account is locked. Please try again later.' });
          return false;
        }

        const isValid = caregiverService.verifyPin(pin);
        if (isValid) {
          const profileId = get().activeProfile?.id;
          const session = caregiverService.createSession(profileId);
          set({
            isAuthenticated: true,
            currentSession: session,
            caregiverMode: true,
            showPinDialog: false,
            error: null,
          });
          get().refreshActivityLog();
          return true;
        }

        set({
          isLockedOut: caregiverService.isLockedOut(),
          lockoutRemainingMs: caregiverService.getLockoutRemainingMs(),
          error: 'Invalid PIN',
        });
        return false;
      },

      removePin: () => {
        caregiverService.removePin();
        set({
          isPinSet: false,
          isAuthenticated: false,
          currentSession: null,
          caregiverMode: false,
        });
      },

      // ─── Session ──────────────────────────────────────────────────────

      logout: () => {
        caregiverService.endSession();
        set({
          isAuthenticated: false,
          currentSession: null,
          caregiverMode: false,
        });
      },

      extendSession: (minutes?: number) => {
        const session = caregiverService.extendSession(minutes);
        if (session) {
          set({ currentSession: session });
        }
      },

      checkSession: () => {
        const session = caregiverService.getActiveSession();
        if (!session && get().isAuthenticated) {
          set({
            isAuthenticated: false,
            currentSession: null,
            caregiverMode: false,
          });
        }
      },

      // ─── Profile Management ───────────────────────────────────────────

      createProfile: (data) => {
        const profile = caregiverService.createProfile(data);
        set({ profiles: caregiverService.getProfiles() });
        return profile;
      },

      updateProfile: (id, updates) => {
        caregiverService.updateProfile(id, updates);
        const profiles = caregiverService.getProfiles();
        set({
          profiles,
          activeProfile:
            get().activeProfile?.id === id
              ? profiles.find((p) => p.id === id) || null
              : get().activeProfile,
        });
      },

      deleteProfile: (id) => {
        caregiverService.deleteProfile(id);
        set({
          profiles: caregiverService.getProfiles(),
          activeProfile:
            get().activeProfile?.id === id ? null : get().activeProfile,
        });
      },

      setActiveProfile: (id) => {
        if (!id) {
          set({ activeProfile: null });
          return;
        }
        const profile = caregiverService.getProfile(id);
        set({ activeProfile: profile || null });
      },

      // ─── Settings ─────────────────────────────────────────────────────

      updateSettings: (updates) => {
        const settings = caregiverService.updateSettings(updates);
        set({ settings });
      },

      resetSettings: () => {
        const settings = caregiverService.resetSettings();
        set({ settings });
      },

      // ─── Activity Log ─────────────────────────────────────────────────

      setActivityFilters: (filters) => {
        set((state) => ({
          activityLogFilters: {
            ...state.activityLogFilters,
            ...filters,
          },
        }));
        get().refreshActivityLog();
      },

      clearActivityFilters: () => {
        set({
          activityLogFilters: {
            type: null,
            actor: null,
            category: null,
            startDate: null,
            endDate: null,
          },
        });
        get().refreshActivityLog();
      },

      refreshActivityLog: () => {
        const filters = get().activityLogFilters;
        const log = caregiverService.getActivityLog({
          type: filters.type || undefined,
          actor: filters.actor || undefined,
          category: filters.category || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: 200,
        });
        set({ activityLog: log });
      },

      clearActivityLog: () => {
        caregiverService.clearActivityLog();
        set({ activityLog: [] });
      },

      // ─── Restrictions ─────────────────────────────────────────────────

      createRestriction: (data) => {
        const restriction = caregiverService.createRestriction(data);
        set({ restrictions: caregiverService.getRestrictions() });
        return restriction;
      },

      updateRestriction: (id, updates) => {
        caregiverService.updateRestriction(id, updates);
        set({ restrictions: caregiverService.getRestrictions() });
      },

      deleteRestriction: (id) => {
        caregiverService.deleteRestriction(id);
        set({ restrictions: caregiverService.getRestrictions() });
      },

      toggleRestriction: (id) => {
        const restriction = caregiverService.getRestriction(id);
        if (restriction) {
          caregiverService.updateRestriction(id, {
            isActive: !restriction.isActive,
          });
          set({ restrictions: caregiverService.getRestrictions() });
        }
      },

      checkQuietHours: () => {
        set({ isInQuietHours: caregiverService.isInQuietHours() });
      },

      // ─── Goals ─────────────────────────────────────────────────────────

      createGoal: (data) => {
        const goal = caregiverService.createGoal(data);
        set({ goals: caregiverService.getGoals() });
        return goal;
      },

      updateGoalProgress: (id, progress) => {
        caregiverService.updateGoalProgress(id, progress);
        set({ goals: caregiverService.getGoals() });
      },

      updateGoal: (id, updates) => {
        caregiverService.updateGoal(id, updates);
        set({ goals: caregiverService.getGoals() });
      },

      deleteGoal: (id) => {
        caregiverService.deleteGoal(id);
        set({ goals: caregiverService.getGoals() });
      },

      pauseGoal: (id) => {
        caregiverService.updateGoal(id, { status: 'paused' });
        set({ goals: caregiverService.getGoals() });
      },

      resumeGoal: (id) => {
        caregiverService.updateGoal(id, { status: 'active' });
        set({ goals: caregiverService.getGoals() });
      },

      // ─── Notes ─────────────────────────────────────────────────────────

      createNote: (data) => {
        const note = caregiverService.createNote(data);
        set({ notes: caregiverService.getNotes(get().showArchivedNotes) });
        return note;
      },

      updateNote: (id, updates) => {
        caregiverService.updateNote(id, updates);
        set({ notes: caregiverService.getNotes(get().showArchivedNotes) });
      },

      deleteNote: (id) => {
        caregiverService.deleteNote(id);
        set({ notes: caregiverService.getNotes(get().showArchivedNotes) });
      },

      archiveNote: (id) => {
        caregiverService.archiveNote(id);
        set({ notes: caregiverService.getNotes(get().showArchivedNotes) });
      },

      unarchiveNote: (id) => {
        caregiverService.unarchiveNote(id);
        set({ notes: caregiverService.getNotes(get().showArchivedNotes) });
      },

      toggleShowArchivedNotes: () => {
        const next = !get().showArchivedNotes;
        set({
          showArchivedNotes: next,
          notes: caregiverService.getNotes(next),
        });
      },

      // ─── Reports ──────────────────────────────────────────────────────

      generateReport: (startDate, endDate) => {
        set({ isLoading: true });
        try {
          const report = caregiverService.generateUsageReport(startDate, endDate);
          set({ currentReport: report, isLoading: false });
        } catch {
          set({ error: 'Failed to generate report', isLoading: false });
        }
      },

      setReportPeriod: (start, end) => {
        set({ reportPeriod: { start, end } });
      },

      // ─── UI ────────────────────────────────────────────────────────────

      setDashboardTab: (tab) => set({ dashboardTab: tab }),

      toggleCaregiverMode: () => {
        const { isAuthenticated, isPinSet, caregiverMode } = get();
        if (caregiverMode) {
          // Exiting caregiver mode
          get().logout();
        } else if (isAuthenticated) {
          set({ caregiverMode: true });
        } else if (isPinSet) {
          set({ showPinDialog: true });
        } else {
          set({ showSetupWizard: true });
        }
      },

      setShowPinDialog: (show) => set({ showPinDialog: show }),
      setShowSetupWizard: (show) => set({ showSetupWizard: show }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-caregiver-store',
      partialize: (state) => ({
        caregiverMode: state.caregiverMode,
        dashboardTab: state.dashboardTab,
        activeProfile: state.activeProfile,
        reportPeriod: state.reportPeriod,
        showArchivedNotes: state.showArchivedNotes,
      }),
    }
  )
);

export default useCaregiverStore;
