// ─── Assessment & Reporting Store ───────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assessmentService } from '../services/assessmentService';
import type {
  Assessment,
  AssessmentItem,
  AssessmentType,
  GoalArea,
  GeneratedReport,
  ReportConfig,
  ProgressSnapshot,
  BenchmarkData,
  SkillDomain,
  ProficiencyLevel,
} from '../types/assessment';

interface AssessmentStoreState {
  assessments: Assessment[];
  goals: GoalArea[];
  progressHistory: ProgressSnapshot[];
  reports: GeneratedReport[];
  reportConfigs: ReportConfig[];
  benchmarks: BenchmarkData[];
  selectedAssessmentId: string | null;
  activeTab: string;
  isLoading: boolean;
  error: string | null;

  initialize: () => void;
  setActiveTab: (tab: string) => void;
  selectAssessment: (id: string | null) => void;

  // Assessments
  createAssessment: (title: string, type: AssessmentType, assessorName: string, scheduledAt: string | null) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  completeAssessment: (id: string, notes: string, recommendations: string[], nextSteps: string[]) => void;
  updateItem: (assessmentId: string, itemId: string, updates: Partial<AssessmentItem>) => void;
  addItem: (assessmentId: string, skill: string, domain: SkillDomain, description: string) => void;

  // Goals
  addGoal: (domain: SkillDomain, description: string, targetDate: string, targetLevel: ProficiencyLevel) => void;
  updateGoal: (id: string, updates: Partial<GoalArea>) => void;
  addMilestone: (goalId: string, description: string) => void;
  achieveMilestone: (goalId: string, milestoneId: string) => void;

  // Reports
  generateReport: (configId: string) => void;

  clearError: () => void;
}

export const useAssessmentStore = create<AssessmentStoreState>()(
  persist(
    (set, get) => ({
      assessments: [],
      goals: [],
      progressHistory: [],
      reports: [],
      reportConfigs: [],
      benchmarks: [],
      selectedAssessmentId: null,
      activeTab: 'overview',
      isLoading: false,
      error: null,

      initialize: () => {
        set({
          assessments: assessmentService.getAssessments(),
          goals: assessmentService.getGoals(),
          progressHistory: assessmentService.getProgressHistory(),
          reports: assessmentService.getReports(),
          reportConfigs: assessmentService.getReportConfigs(),
          benchmarks: assessmentService.getBenchmarks(),
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      selectAssessment: (id) => set({ selectedAssessmentId: id }),

      createAssessment: (title, type, assessorName, scheduledAt) => {
        assessmentService.createAssessment(title, type, assessorName, scheduledAt);
        set({ assessments: assessmentService.getAssessments() });
      },

      updateAssessment: (id, updates) => {
        assessmentService.updateAssessment(id, updates);
        set({ assessments: assessmentService.getAssessments() });
      },

      completeAssessment: (id, notes, recommendations, nextSteps) => {
        assessmentService.completeAssessment(id, notes, recommendations, nextSteps);
        set({ assessments: assessmentService.getAssessments() });
      },

      updateItem: (assessmentId, itemId, updates) => {
        assessmentService.updateItem(assessmentId, itemId, updates);
        set({ assessments: assessmentService.getAssessments() });
      },

      addItem: (assessmentId, skill, domain, description) => {
        assessmentService.addItem(assessmentId, skill, domain, description);
        set({ assessments: assessmentService.getAssessments() });
      },

      addGoal: (domain, description, targetDate, targetLevel) => {
        assessmentService.addGoal(domain, description, targetDate, targetLevel);
        set({ goals: assessmentService.getGoals() });
      },

      updateGoal: (id, updates) => {
        assessmentService.updateGoal(id, updates);
        set({ goals: assessmentService.getGoals() });
      },

      addMilestone: (goalId, description) => {
        assessmentService.addMilestone(goalId, description);
        set({ goals: assessmentService.getGoals() });
      },

      achieveMilestone: (goalId, milestoneId) => {
        assessmentService.achieveMilestone(goalId, milestoneId);
        set({ goals: assessmentService.getGoals() });
      },

      generateReport: (configId) => {
        const config = get().reportConfigs.find(c => c.id === configId);
        if (!config) return;
        assessmentService.generateReport(config);
        set({
          reports: assessmentService.getReports(),
          reportConfigs: assessmentService.getReportConfigs(),
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-assessment',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
