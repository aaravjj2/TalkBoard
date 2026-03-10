import React from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import { assessmentService } from '../../services/assessmentService';
import { DOMAIN_ICONS, DOMAIN_LABELS, PROFICIENCY_COLORS, PROFICIENCY_LABELS } from '../../types/assessment';

export const AssessmentOverview: React.FC = () => {
  const { assessments, goals, benchmarks } = useAssessmentStore();
  const domainSummary = assessmentService.getDomainSummary();
  const distribution = assessmentService.getProficiencyDistribution();

  const completedCount = assessments.filter(a => a.status === 'completed').length;
  const activeGoals = goals.filter(g => g.isActive).length;
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  const trendIcon = (trend: string) => trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{assessments.length}</div>
          <div className="text-sm text-blue-500">Assessments</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-green-500">Completed</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{activeGoals}</div>
          <div className="text-sm text-purple-500">Active Goals</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{avgProgress}%</div>
          <div className="text-sm text-orange-500">Avg Goal Progress</div>
        </div>
      </div>

      {/* Domain Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Skill Domain Scores</h3>
        <div className="space-y-3">
          {domainSummary.map(d => (
            <div key={d.domain} className="flex items-center gap-3">
              <span className="text-xl w-8">{DOMAIN_ICONS[d.domain]}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 w-36">{d.label}</span>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
                  style={{ width: `${d.latestScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">{d.latestScore}%</span>
              <span className="w-6">{trendIcon(d.trend)}</span>
              <span className="text-xs text-gray-400 w-16 text-right">{d.percentile}th %ile</span>
            </div>
          ))}
        </div>
      </div>

      {/* Proficiency Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Proficiency Distribution</h3>
        <div className="flex gap-3">
          {distribution.map(d => (
            <div key={d.level} className="flex-1 text-center">
              <div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-1"
                style={{ backgroundColor: PROFICIENCY_COLORS[d.level] }}
              >
                {d.count}
              </div>
              <div className="text-xs text-gray-500">{PROFICIENCY_LABELS[d.level]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmarks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Benchmark Comparison</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {benchmarks.slice(0, 4).map(b => (
            <div key={b.domain} className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 text-center">
              <div className="text-xl">{DOMAIN_ICONS[b.domain]}</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{DOMAIN_LABELS[b.domain]}</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{b.percentile}<span className="text-sm">th</span></div>
              <div className="text-xs text-gray-400">Age group: {b.ageGroup}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
