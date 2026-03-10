// ─── Assessment & Reporting Types ───────────────────────────────────────────

// ── Assessment Types ────────────────────────────────────────────────────────

export type AssessmentType =
  | 'vocabulary'
  | 'sentence_building'
  | 'comprehension'
  | 'social_communication'
  | 'motor_access'
  | 'symbol_recognition'
  | 'functional_communication'
  | 'baseline';

export type AssessmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'reviewed';

export type SkillDomain =
  | 'receptive_language'
  | 'expressive_language'
  | 'pragmatics'
  | 'vocabulary'
  | 'syntax'
  | 'motor'
  | 'cognition';

export type ProficiencyLevel = 'not_observed' | 'emerging' | 'developing' | 'established' | 'mastered';

export type ReportFormat = 'summary' | 'detailed' | 'progress_comparison' | 'iep_update';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface AssessmentItem {
  id: string;
  skill: string;
  domain: SkillDomain;
  description: string;
  proficiency: ProficiencyLevel;
  previousProficiency: ProficiencyLevel | null;
  notes: string;
  attempts: number;
  successRate: number; // 0-1
  lastAssessed: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  createdAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  items: AssessmentItem[];
  overallNotes: string;
  recommendations: string[];
  nextSteps: string[];
  assessorName: string;
  duration: number; // minutes
}

export interface GoalArea {
  id: string;
  domain: SkillDomain;
  description: string;
  targetDate: string;
  currentLevel: ProficiencyLevel;
  targetLevel: ProficiencyLevel;
  progress: number; // 0-100
  milestones: GoalMilestone[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  description: string;
  isAchieved: boolean;
  achievedAt: string | null;
  order: number;
}

export interface ProgressSnapshot {
  date: string;
  domain: SkillDomain;
  score: number; // 0-100
  itemsAssessed: number;
  masteredCount: number;
  emergingCount: number;
  notObservedCount: number;
}

export interface ReportConfig {
  id: string;
  title: string;
  format: ReportFormat;
  dateRange: { start: string; end: string };
  includeDomains: SkillDomain[];
  includeGoals: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  generatedAt: string | null;
}

export interface GeneratedReport {
  id: string;
  configId: string;
  title: string;
  format: ReportFormat;
  generatedAt: string;
  content: ReportSection[];
  summary: string;
}

export interface ReportSection {
  title: string;
  type: 'text' | 'chart' | 'table' | 'list';
  content: string;
  data?: Record<string, unknown>;
}

export interface BenchmarkData {
  domain: SkillDomain;
  ageGroup: string;
  percentile: number;
  score: number;
  comparisonDate: string;
}

// ── State ───────────────────────────────────────────────────────────────────

export interface AssessmentState {
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
}

// ── Constants ───────────────────────────────────────────────────────────────

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  vocabulary: 'Vocabulary Assessment',
  sentence_building: 'Sentence Building',
  comprehension: 'Comprehension',
  social_communication: 'Social Communication',
  motor_access: 'Motor Access',
  symbol_recognition: 'Symbol Recognition',
  functional_communication: 'Functional Communication',
  baseline: 'Baseline Assessment',
};

export const ASSESSMENT_TYPE_ICONS: Record<AssessmentType, string> = {
  vocabulary: '📚',
  sentence_building: '🔤',
  comprehension: '🧠',
  social_communication: '💬',
  motor_access: '✋',
  symbol_recognition: '👁️',
  functional_communication: '🗣️',
  baseline: '📊',
};

export const DOMAIN_LABELS: Record<SkillDomain, string> = {
  receptive_language: 'Receptive Language',
  expressive_language: 'Expressive Language',
  pragmatics: 'Pragmatics',
  vocabulary: 'Vocabulary',
  syntax: 'Syntax',
  motor: 'Motor Skills',
  cognition: 'Cognition',
};

export const DOMAIN_ICONS: Record<SkillDomain, string> = {
  receptive_language: '👂',
  expressive_language: '🗣️',
  pragmatics: '🤝',
  vocabulary: '📖',
  syntax: '📝',
  motor: '✋',
  cognition: '🧠',
};

export const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  not_observed: 'Not Observed',
  emerging: 'Emerging',
  developing: 'Developing',
  established: 'Established',
  mastered: 'Mastered',
};

export const PROFICIENCY_COLORS: Record<ProficiencyLevel, string> = {
  not_observed: '#94a3b8',
  emerging: '#f59e0b',
  developing: '#3b82f6',
  established: '#10b981',
  mastered: '#8b5cf6',
};

export const PROFICIENCY_ORDER: ProficiencyLevel[] = [
  'not_observed', 'emerging', 'developing', 'established', 'mastered',
];
