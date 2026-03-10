import React, { useState } from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import { DOMAIN_LABELS, DOMAIN_ICONS, type SkillDomain } from '../../types/assessment';

const DOMAINS: SkillDomain[] = ['vocabulary', 'syntax', 'pragmatics', 'receptive_language', 'expressive_language', 'motor', 'cognition'];

export const ProgressTrackingPanel: React.FC = () => {
  const { progressHistory } = useAssessmentStore();
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain | 'all'>('all');

  const dates = [...new Set(progressHistory.map(p => p.date))].sort();
  const filtered = selectedDomain === 'all'
    ? progressHistory
    : progressHistory.filter(p => p.domain === selectedDomain);

  // Group by date
  const byDate = dates.map(date => {
    const entries = filtered.filter(p => p.date === date);
    const avgScore = entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length) : 0;
    return { date, entries, avgScore };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Progress Tracking</h3>

      {/* Domain filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3 py-1 rounded-full text-sm ${selectedDomain === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          All Domains
        </button>
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1 rounded-full text-sm ${selectedDomain === d ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {DOMAIN_ICONS[d]} {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {byDate.map(({ date, entries, avgScore }) => (
        <div key={date} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-0.5 rounded-full">
              Avg: {avgScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entries.map(entry => (
              <div key={`${entry.date}-${entry.domain}`} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                <span className="text-xl">{DOMAIN_ICONS[entry.domain]}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{DOMAIN_LABELS[entry.domain]}</div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${entry.score}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">{entry.score}%</div>
                  <div className="text-xs text-gray-400">{entry.masteredCount} mastered</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
