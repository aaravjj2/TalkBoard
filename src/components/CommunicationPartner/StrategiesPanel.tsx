import React, { useState } from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import type { StrategyCategory } from '../../types/communicationPartner';

const CATEGORY_META: Record<StrategyCategory, { label: string; icon: string; color: string }> = {
  modeling: { label: 'Modeling', icon: '🎯', color: 'bg-blue-100 text-blue-700' },
  prompting: { label: 'Prompting', icon: '👆', color: 'bg-green-100 text-green-700' },
  expansion: { label: 'Expansion', icon: '📈', color: 'bg-purple-100 text-purple-700' },
  wait_time: { label: 'Wait Time', icon: '⏳', color: 'bg-orange-100 text-orange-700' },
  environment: { label: 'Environment', icon: '🏠', color: 'bg-teal-100 text-teal-700' },
  motivation: { label: 'Motivation', icon: '⭐', color: 'bg-pink-100 text-pink-700' },
};

export const StrategiesPanel: React.FC = () => {
  const { strategies, toggleBookmark } = useCommunicationPartnerStore();
  const [filter, setFilter] = useState<'all' | StrategyCategory | 'bookmarked'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? strategies
    : filter === 'bookmarked'
      ? strategies.filter(s => s.isBookmarked)
      : strategies.filter(s => s.category === filter);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Communication Strategies ({strategies.length})
      </h3>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('bookmarked')}
          className={`px-3 py-1 rounded-full text-sm ${filter === 'bookmarked' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          ⭐ Bookmarked
        </button>
        {(Object.keys(CATEGORY_META) as StrategyCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm ${filter === cat ? `${CATEGORY_META[cat].color}` : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Strategy Cards */}
      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_META[s.category].icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_META[s.category].color}`}>
                    {CATEGORY_META[s.category].label}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(s.id); }}
                    className="text-xl"
                  >
                    {s.isBookmarked ? '⭐' : '☆'}
                  </button>
                  <span className="text-gray-400">{expandedId === s.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {expandedId === s.id && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                {/* Steps */}
                {s.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Steps</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {s.steps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips */}
                {s.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">💡 Tips</h4>
                    <ul className="space-y-1">
                      {s.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1">
                          <span className="text-yellow-500">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                {s.examplePhrases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">📝 Examples</h4>
                    <div className="flex flex-wrap gap-2">
                      {s.examplePhrases.map((phrase, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg italic">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Difficulty: {s.difficultyLevel} level
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
