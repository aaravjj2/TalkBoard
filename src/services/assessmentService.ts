// ─── Assessment & Reporting Service ─────────────────────────────────────────

import type {
  Assessment,
  AssessmentItem,
  AssessmentType,
  AssessmentStatus,
  GoalArea,
  GoalMilestone,
  ProgressSnapshot,
  GeneratedReport,
  ReportConfig,
  ReportSection,
  BenchmarkData,
  SkillDomain,
  ProficiencyLevel,
  ReportFormat,
} from '../types/assessment';
import { DOMAIN_LABELS, PROFICIENCY_LABELS, PROFICIENCY_ORDER } from '../types/assessment';

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toISO(d: Date = new Date()): string {
  return d.toISOString();
}

// ── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  ASSESSMENTS: 'talkboard_assessments',
  GOALS: 'talkboard_assessment_goals',
  PROGRESS: 'talkboard_assessment_progress',
  REPORTS: 'talkboard_assessment_reports',
  REPORT_CONFIGS: 'talkboard_report_configs',
  BENCHMARKS: 'talkboard_benchmarks',
};

// ── Demo Data ───────────────────────────────────────────────────────────────

function generateDemoItems(): AssessmentItem[] {
  return [
    { id: 'ai-1', skill: 'Identify common objects', domain: 'vocabulary', description: 'Can identify and select symbols for common everyday objects', proficiency: 'established', previousProficiency: 'developing', notes: 'Strong with food and toy categories', attempts: 20, successRate: 0.85, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-2', skill: 'Use 2-word combinations', domain: 'syntax', description: 'Combines two symbols to form basic phrases', proficiency: 'developing', previousProficiency: 'emerging', notes: 'Consistently using want + noun', attempts: 15, successRate: 0.6, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-3', skill: 'Respond to yes/no questions', domain: 'receptive_language', description: 'Responds appropriately to simple yes/no questions using AAC', proficiency: 'established', previousProficiency: 'established', notes: 'Reliable with familiar topics', attempts: 12, successRate: 0.92, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-4', skill: 'Initiate communication', domain: 'pragmatics', description: 'Independently initiates communication to request, comment, or greet', proficiency: 'emerging', previousProficiency: 'not_observed', notes: 'Beginning to initiate requests during preferred activities', attempts: 10, successRate: 0.3, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-5', skill: 'Navigate symbol categories', domain: 'motor', description: 'Can navigate between different symbol categories on the device', proficiency: 'developing', previousProficiency: 'emerging', notes: 'Sometimes needs gestural prompt', attempts: 18, successRate: 0.67, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-6', skill: 'Express feelings', domain: 'expressive_language', description: 'Uses symbols to express basic emotions', proficiency: 'emerging', previousProficiency: 'not_observed', notes: 'Can identify happy and sad with support', attempts: 8, successRate: 0.38, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-7', skill: 'Use core vocabulary', domain: 'vocabulary', description: 'Uses high-frequency core words across contexts', proficiency: 'developing', previousProficiency: 'emerging', notes: 'Strong with want, go, more, help', attempts: 25, successRate: 0.72, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-8', skill: 'Turn-taking in conversation', domain: 'pragmatics', description: 'Takes turns during conversational exchanges', proficiency: 'developing', previousProficiency: 'developing', notes: 'Best with familiar partners', attempts: 10, successRate: 0.5, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-9', skill: 'Follow simple directions', domain: 'cognition', description: 'Follows 1-2 step directions using AAC support', proficiency: 'established', previousProficiency: 'developing', notes: 'Improved with visual support', attempts: 14, successRate: 0.86, lastAssessed: '2025-02-18T10:00:00Z' },
    { id: 'ai-10', skill: 'Symbol discrimination', domain: 'motor', description: 'Accurately selects target symbol from a field of options', proficiency: 'mastered', previousProficiency: 'established', notes: 'Consistent in fields of 8+', attempts: 30, successRate: 0.97, lastAssessed: '2025-02-18T10:00:00Z' },
  ];
}

function generateDemoAssessments(): Assessment[] {
  return [
    {
      id: 'a-1', title: 'Q1 2025 Comprehensive Assessment', type: 'baseline',
      status: 'completed', createdAt: '2025-02-15T08:00:00Z',
      scheduledAt: '2025-02-18T10:00:00Z', completedAt: '2025-02-18T11:00:00Z',
      reviewedAt: '2025-02-19T09:00:00Z', reviewedBy: 'Dr. Sarah Chen',
      items: generateDemoItems(),
      overallNotes: 'Significant progress across all domains since baseline. Vocabulary and motor access showing strongest gains.',
      recommendations: [
        'Increase modeling of 3-word combinations',
        'Introduce feelings vocabulary in structured activities',
        'Continue environmental arrangement strategies',
        'Consider expanding symbol display to include more core words',
      ],
      nextSteps: [
        'Update vocabulary to include more action words',
        'Begin targeting 3-symbol utterances',
        'Introduce story-based activities for comprehension',
      ],
      assessorName: 'Dr. Sarah Chen', duration: 60,
    },
    {
      id: 'a-2', title: 'Vocabulary Check-in', type: 'vocabulary',
      status: 'completed', createdAt: '2025-02-01T08:00:00Z',
      scheduledAt: '2025-02-05T10:00:00Z', completedAt: '2025-02-05T10:30:00Z',
      reviewedAt: null, reviewedBy: null,
      items: generateDemoItems().filter(i => i.domain === 'vocabulary'),
      overallNotes: 'Vocabulary continues to expand. Core words are becoming more automatic.',
      recommendations: ['Add action verbs to symbol set'], nextSteps: ['Reassess in 4 weeks'],
      assessorName: 'Dr. Sarah Chen', duration: 30,
    },
    {
      id: 'a-3', title: 'Social Communication Probe', type: 'social_communication',
      status: 'scheduled', createdAt: '2025-02-20T08:00:00Z',
      scheduledAt: '2025-03-01T10:00:00Z', completedAt: null,
      reviewedAt: null, reviewedBy: null, items: [],
      overallNotes: '', recommendations: [], nextSteps: [],
      assessorName: 'Dr. Sarah Chen', duration: 45,
    },
  ];
}

function generateDemoGoals(): GoalArea[] {
  return [
    {
      id: 'g-1', domain: 'expressive_language',
      description: 'Will use 3-word combinations to make requests across 3 different settings',
      targetDate: '2025-06-01T00:00:00Z',
      currentLevel: 'developing', targetLevel: 'established', progress: 45,
      milestones: [
        { id: 'gm-1', description: 'Use 2-word combinations in 80% of opportunities', isAchieved: true, achievedAt: '2025-01-20T00:00:00Z', order: 1 },
        { id: 'gm-2', description: 'Use 3-word combinations with verbal prompt', isAchieved: true, achievedAt: '2025-02-10T00:00:00Z', order: 2 },
        { id: 'gm-3', description: 'Use 3-word combinations with gestural prompt only', isAchieved: false, achievedAt: null, order: 3 },
        { id: 'gm-4', description: 'Use 3-word combinations independently in therapy', isAchieved: false, achievedAt: null, order: 4 },
        { id: 'gm-5', description: 'Use 3-word combinations independently across settings', isAchieved: false, achievedAt: null, order: 5 },
      ],
      isActive: true, createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-02-18T00:00:00Z',
    },
    {
      id: 'g-2', domain: 'pragmatics',
      description: 'Will initiate communication at least 5 times per session without prompting',
      targetDate: '2025-09-01T00:00:00Z',
      currentLevel: 'emerging', targetLevel: 'developing', progress: 25,
      milestones: [
        { id: 'gm-6', description: 'Initiate with full physical prompt', isAchieved: true, achievedAt: '2025-01-15T00:00:00Z', order: 1 },
        { id: 'gm-7', description: 'Initiate with verbal prompt', isAchieved: false, achievedAt: null, order: 2 },
        { id: 'gm-8', description: 'Initiate independently 2 times per session', isAchieved: false, achievedAt: null, order: 3 },
        { id: 'gm-9', description: 'Initiate independently 5 times per session', isAchieved: false, achievedAt: null, order: 4 },
      ],
      isActive: true, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-02-15T00:00:00Z',
    },
    {
      id: 'g-3', domain: 'vocabulary',
      description: 'Will demonstrate understanding and use of 50 core vocabulary words',
      targetDate: '2025-05-01T00:00:00Z',
      currentLevel: 'developing', targetLevel: 'established', progress: 68,
      milestones: [
        { id: 'gm-10', description: 'Identify 20 core words receptively', isAchieved: true, achievedAt: '2025-01-25T00:00:00Z', order: 1 },
        { id: 'gm-11', description: 'Use 20 core words expressively', isAchieved: true, achievedAt: '2025-02-05T00:00:00Z', order: 2 },
        { id: 'gm-12', description: 'Identify 50 core words receptively', isAchieved: true, achievedAt: '2025-02-15T00:00:00Z', order: 3 },
        { id: 'gm-13', description: 'Use 50 core words expressively', isAchieved: false, achievedAt: null, order: 4 },
      ],
      isActive: true, createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-02-18T00:00:00Z',
    },
  ];
}

function generateDemoProgress(): ProgressSnapshot[] {
  const domains: SkillDomain[] = ['vocabulary', 'syntax', 'pragmatics', 'receptive_language', 'expressive_language', 'motor', 'cognition'];
  const snapshots: ProgressSnapshot[] = [];
  const dates = ['2025-01-15', '2025-02-01', '2025-02-15'];

  for (const date of dates) {
    for (const domain of domains) {
      const base = domains.indexOf(domain) * 10 + 20;
      const dateBoost = dates.indexOf(date) * 8;
      const score = Math.min(100, base + dateBoost + Math.floor(Math.random() * 15));
      snapshots.push({
        date, domain, score,
        itemsAssessed: 5 + Math.floor(Math.random() * 10),
        masteredCount: Math.floor(score / 30),
        emergingCount: Math.floor((100 - score) / 25),
        notObservedCount: Math.max(0, 3 - dates.indexOf(date)),
      });
    }
  }
  return snapshots;
}

function generateDemoBenchmarks(): BenchmarkData[] {
  return [
    { domain: 'vocabulary', ageGroup: '4-6', percentile: 42, score: 65, comparisonDate: '2025-02-18' },
    { domain: 'syntax', ageGroup: '4-6', percentile: 28, score: 48, comparisonDate: '2025-02-18' },
    { domain: 'pragmatics', ageGroup: '4-6', percentile: 35, score: 55, comparisonDate: '2025-02-18' },
    { domain: 'receptive_language', ageGroup: '4-6', percentile: 55, score: 72, comparisonDate: '2025-02-18' },
    { domain: 'expressive_language', ageGroup: '4-6', percentile: 30, score: 50, comparisonDate: '2025-02-18' },
    { domain: 'motor', ageGroup: '4-6', percentile: 62, score: 78, comparisonDate: '2025-02-18' },
    { domain: 'cognition', ageGroup: '4-6', percentile: 50, score: 68, comparisonDate: '2025-02-18' },
  ];
}

// ── Service ─────────────────────────────────────────────────────────────────

class AssessmentService {
  // ── Assessments ─────────────────────────────────────────────────────────

  getAssessments(): Assessment[] {
    const saved = localStorage.getItem(KEYS.ASSESSMENTS);
    return saved ? JSON.parse(saved) : generateDemoAssessments();
  }

  saveAssessments(assessments: Assessment[]): void {
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }

  createAssessment(title: string, type: AssessmentType, assessorName: string, scheduledAt: string | null): Assessment {
    const assessments = this.getAssessments();
    const assessment: Assessment = {
      id: generateId(), title, type,
      status: scheduledAt ? 'scheduled' : 'in_progress',
      createdAt: toISO(), scheduledAt, completedAt: null,
      reviewedAt: null, reviewedBy: null, items: [],
      overallNotes: '', recommendations: [], nextSteps: [],
      assessorName, duration: 0,
    };
    assessments.unshift(assessment);
    this.saveAssessments(assessments);
    return assessment;
  }

  updateAssessment(id: string, updates: Partial<Assessment>): Assessment | null {
    const assessments = this.getAssessments();
    const idx = assessments.findIndex(a => a.id === id);
    if (idx < 0) return null;
    assessments[idx] = { ...assessments[idx], ...updates };
    this.saveAssessments(assessments);
    return assessments[idx];
  }

  completeAssessment(id: string, notes: string, recommendations: string[], nextSteps: string[]): Assessment | null {
    return this.updateAssessment(id, {
      status: 'completed',
      completedAt: toISO(),
      overallNotes: notes,
      recommendations,
      nextSteps,
    });
  }

  updateItem(assessmentId: string, itemId: string, updates: Partial<AssessmentItem>): void {
    const assessments = this.getAssessments();
    const idx = assessments.findIndex(a => a.id === assessmentId);
    if (idx < 0) return;
    const itemIdx = assessments[idx].items.findIndex(i => i.id === itemId);
    if (itemIdx >= 0) {
      assessments[idx].items[itemIdx] = { ...assessments[idx].items[itemIdx], ...updates };
    }
    this.saveAssessments(assessments);
  }

  addItem(assessmentId: string, skill: string, domain: SkillDomain, description: string): void {
    const assessments = this.getAssessments();
    const idx = assessments.findIndex(a => a.id === assessmentId);
    if (idx < 0) return;
    assessments[idx].items.push({
      id: generateId(), skill, domain, description,
      proficiency: 'not_observed', previousProficiency: null,
      notes: '', attempts: 0, successRate: 0, lastAssessed: toISO(),
    });
    this.saveAssessments(assessments);
  }

  // ── Goals ───────────────────────────────────────────────────────────────

  getGoals(): GoalArea[] {
    const saved = localStorage.getItem(KEYS.GOALS);
    return saved ? JSON.parse(saved) : generateDemoGoals();
  }

  saveGoals(goals: GoalArea[]): void {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  }

  addGoal(domain: SkillDomain, description: string, targetDate: string, targetLevel: ProficiencyLevel): GoalArea {
    const goals = this.getGoals();
    const goal: GoalArea = {
      id: generateId(), domain, description, targetDate,
      currentLevel: 'not_observed', targetLevel, progress: 0,
      milestones: [], isActive: true,
      createdAt: toISO(), updatedAt: toISO(),
    };
    goals.push(goal);
    this.saveGoals(goals);
    return goal;
  }

  updateGoal(id: string, updates: Partial<GoalArea>): GoalArea | null {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx < 0) return null;
    goals[idx] = { ...goals[idx], ...updates, updatedAt: toISO() };
    this.saveGoals(goals);
    return goals[idx];
  }

  addMilestone(goalId: string, description: string): void {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx < 0) return;
    const order = goals[idx].milestones.length + 1;
    goals[idx].milestones.push({
      id: generateId(), description, isAchieved: false, achievedAt: null, order,
    });
    this.saveGoals(goals);
  }

  achieveMilestone(goalId: string, milestoneId: string): void {
    const goals = this.getGoals();
    const gIdx = goals.findIndex(g => g.id === goalId);
    if (gIdx < 0) return;
    const mIdx = goals[gIdx].milestones.findIndex(m => m.id === milestoneId);
    if (mIdx >= 0) {
      goals[gIdx].milestones[mIdx].isAchieved = true;
      goals[gIdx].milestones[mIdx].achievedAt = toISO();
      // Recalculate progress
      const total = goals[gIdx].milestones.length;
      const achieved = goals[gIdx].milestones.filter(m => m.isAchieved).length;
      goals[gIdx].progress = total > 0 ? Math.round((achieved / total) * 100) : 0;
      goals[gIdx].updatedAt = toISO();
    }
    this.saveGoals(goals);
  }

  // ── Progress ──────────────────────────────────────────────────────────

  getProgressHistory(): ProgressSnapshot[] {
    const saved = localStorage.getItem(KEYS.PROGRESS);
    return saved ? JSON.parse(saved) : generateDemoProgress();
  }

  saveProgressHistory(progress: ProgressSnapshot[]): void {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  }

  addProgressSnapshot(domain: SkillDomain, score: number, itemsAssessed: number, masteredCount: number, emergingCount: number): void {
    const progress = this.getProgressHistory();
    progress.push({
      date: new Date().toISOString().split('T')[0],
      domain, score, itemsAssessed, masteredCount, emergingCount,
      notObservedCount: Math.max(0, itemsAssessed - masteredCount - emergingCount),
    });
    this.saveProgressHistory(progress);
  }

  // ── Benchmarks ────────────────────────────────────────────────────────

  getBenchmarks(): BenchmarkData[] {
    const saved = localStorage.getItem(KEYS.BENCHMARKS);
    return saved ? JSON.parse(saved) : generateDemoBenchmarks();
  }

  // ── Reports ───────────────────────────────────────────────────────────

  getReports(): GeneratedReport[] {
    const saved = localStorage.getItem(KEYS.REPORTS);
    return saved ? JSON.parse(saved) : [];
  }

  saveReports(reports: GeneratedReport[]): void {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
  }

  getReportConfigs(): ReportConfig[] {
    const saved = localStorage.getItem(KEYS.REPORT_CONFIGS);
    if (saved) return JSON.parse(saved);
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return [
      {
        id: 'rc-1', title: 'Quarterly Progress Report', format: 'detailed',
        dateRange: { start: threeMonthsAgo.toISOString(), end: now.toISOString() },
        includeDomains: ['vocabulary', 'syntax', 'pragmatics', 'expressive_language', 'receptive_language', 'motor', 'cognition'],
        includeGoals: true, includeRecommendations: true, includeCharts: true,
        generatedAt: null,
      },
    ];
  }

  saveReportConfigs(configs: ReportConfig[]): void {
    localStorage.setItem(KEYS.REPORT_CONFIGS, JSON.stringify(configs));
  }

  generateReport(config: ReportConfig): GeneratedReport {
    const assessments = this.getAssessments().filter(a => a.status === 'completed');
    const goals = this.getGoals().filter(g => g.isActive);
    const progress = this.getProgressHistory();
    const benchmarks = this.getBenchmarks();

    const sections: ReportSection[] = [];

    // Summary section
    sections.push({
      title: 'Assessment Summary',
      type: 'text',
      content: `This report covers ${assessments.length} completed assessment(s). ${goals.length} active goal(s) are being tracked across ${config.includeDomains.length} skill domain(s).`,
    });

    // Domain scores
    for (const domain of config.includeDomains) {
      const domainProgress = progress.filter(p => p.domain === domain);
      const latest = domainProgress[domainProgress.length - 1];
      const benchmark = benchmarks.find(b => b.domain === domain);
      sections.push({
        title: DOMAIN_LABELS[domain],
        type: 'text',
        content: latest
          ? `Current score: ${latest.score}/100. ${latest.masteredCount} skills mastered, ${latest.emergingCount} emerging.${benchmark ? ` Percentile: ${benchmark.percentile}th (age group ${benchmark.ageGroup}).` : ''}`
          : 'No data available for this domain.',
      });
    }

    // Goals section
    if (config.includeGoals) {
      const goalItems = goals.map(g => {
        const achieved = g.milestones.filter(m => m.isAchieved).length;
        return `${DOMAIN_LABELS[g.domain]}: ${g.description} (${g.progress}% complete, ${achieved}/${g.milestones.length} milestones)`;
      });
      sections.push({
        title: 'Active Goals',
        type: 'list',
        content: goalItems.join('\n'),
      });
    }

    // Recommendations
    if (config.includeRecommendations) {
      const allRecs = assessments.flatMap(a => a.recommendations);
      sections.push({
        title: 'Recommendations',
        type: 'list',
        content: allRecs.length > 0 ? allRecs.join('\n') : 'No recommendations at this time.',
      });
    }

    const report: GeneratedReport = {
      id: generateId(),
      configId: config.id,
      title: config.title,
      format: config.format,
      generatedAt: toISO(),
      content: sections,
      summary: `Report generated with ${sections.length} sections covering ${config.includeDomains.length} domains.`,
    };

    const reports = this.getReports();
    reports.unshift(report);
    this.saveReports(reports);

    // Update config
    const configs = this.getReportConfigs();
    const cIdx = configs.findIndex(c => c.id === config.id);
    if (cIdx >= 0) {
      configs[cIdx].generatedAt = toISO();
      this.saveReportConfigs(configs);
    }

    return report;
  }

  // ── Analytics Helpers ─────────────────────────────────────────────────

  getDomainSummary(): { domain: SkillDomain; label: string; latestScore: number; trend: 'up' | 'down' | 'stable'; percentile: number }[] {
    const progress = this.getProgressHistory();
    const benchmarks = this.getBenchmarks();
    const domains: SkillDomain[] = ['vocabulary', 'syntax', 'pragmatics', 'receptive_language', 'expressive_language', 'motor', 'cognition'];

    return domains.map(domain => {
      const domainSnapshots = progress.filter(p => p.domain === domain).sort((a, b) => a.date.localeCompare(b.date));
      const latest = domainSnapshots[domainSnapshots.length - 1];
      const previous = domainSnapshots.length > 1 ? domainSnapshots[domainSnapshots.length - 2] : null;
      const benchmark = benchmarks.find(b => b.domain === domain);
      const trend: 'up' | 'down' | 'stable' = previous
        ? latest.score > previous.score ? 'up' : latest.score < previous.score ? 'down' : 'stable'
        : 'stable';

      return {
        domain,
        label: DOMAIN_LABELS[domain],
        latestScore: latest?.score ?? 0,
        trend,
        percentile: benchmark?.percentile ?? 0,
      };
    });
  }

  getProficiencyDistribution(assessmentId?: string): { level: ProficiencyLevel; count: number }[] {
    const assessments = this.getAssessments();
    const target = assessmentId
      ? assessments.find(a => a.id === assessmentId)
      : assessments.find(a => a.status === 'completed');

    if (!target) return PROFICIENCY_ORDER.map(level => ({ level, count: 0 }));

    return PROFICIENCY_ORDER.map(level => ({
      level,
      count: target.items.filter(i => i.proficiency === level).length,
    }));
  }
}

export const assessmentService = new AssessmentService();
