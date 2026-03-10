import React from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import { DOMAIN_LABELS, DOMAIN_ICONS } from '../../types/assessment';

export const BenchmarksPanel: React.FC = () => {
  const { benchmarks } = useAssessmentStore();

  const getPercentileColor = (p: number) =>
    p >= 75 ? 'text-green-600' : p >= 50 ? 'text-blue-600' : p >= 25 ? 'text-yellow-600' : 'text-red-600';

  const getPercentileBar = (p: number) =>
    p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-blue-500' : p >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Benchmarks & Percentiles</h3>

      <p className="text-sm text-gray-500">
        Performance compared to age-matched peers. Percentiles show where the user falls relative to others in the same age group.
      </p>

      <div className="grid gap-4">
        {benchmarks.map(b => (
          <div key={b.domain} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{DOMAIN_ICONS[b.domain]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{DOMAIN_LABELS[b.domain]}</span>
                  <span className={`text-2xl font-bold ${getPercentileColor(b.percentile)}`}>
                    {b.percentile}<span className="text-sm">th</span>
                  </span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${getPercentileBar(b.percentile)} rounded-full transition-all`} style={{ width: `${b.percentile}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Score: {b.score}/100</span>
                  <span>Age group: {b.ageGroup}</span>
                  <span>Date: {new Date(b.comparisonDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Percentile Legend */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Percentile Guide</h4>
        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          <div className="py-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="font-semibold text-red-600">0-24th</div>
            <div className="text-xs text-red-400">Significant concern</div>
          </div>
          <div className="py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="font-semibold text-yellow-600">25-49th</div>
            <div className="text-xs text-yellow-400">Below average</div>
          </div>
          <div className="py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="font-semibold text-blue-600">50-74th</div>
            <div className="text-xs text-blue-400">Average range</div>
          </div>
          <div className="py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="font-semibold text-green-600">75-100th</div>
            <div className="text-xs text-green-400">Above average</div>
          </div>
        </div>
      </div>
    </div>
  );
};
