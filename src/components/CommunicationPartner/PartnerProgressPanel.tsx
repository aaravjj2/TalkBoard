import React from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import { PROMPT_LEVEL_LABELS, PROMPT_LEVEL_COLORS } from '../../types/communicationPartner';

export const PartnerProgressPanel: React.FC = () => {
  const { partnerProgress, partners, selectedPartnerId, selectPartner } = useCommunicationPartnerStore();

  if (!selectedPartnerId) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Partner Progress</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p>Select a partner from the Partners tab to view their progress.</p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {partners.filter(p => p.isActive).map(p => (
              <button
                key={p.id}
                onClick={() => selectPartner(p.id)}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200"
              >
                {p.avatar} {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const partner = partners.find(p => p.id === selectedPartnerId);
  if (!partnerProgress || !partner) return null;

  const p = partnerProgress;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {partner.avatar} {partner.name} — Progress
        </h3>
        <button onClick={() => selectPartner(null)} className="text-sm text-purple-600 hover:underline">Change Partner</button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{p.totalSessions}</div>
          <div className="text-xs text-blue-500">Sessions</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{p.totalDuration}m</div>
          <div className="text-xs text-green-500">Total Time</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{p.totalMessages}</div>
          <div className="text-xs text-purple-500">Messages</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{Math.round(p.independenceRate * 100)}%</div>
          <div className="text-xs text-orange-500">Independence</div>
        </div>
      </div>

      {/* Weekly Sessions Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Weekly Sessions</h4>
        <div className="flex items-end gap-3 h-24">
          {p.weeklySessionCounts.map((w, i) => {
            const max = Math.max(...p.weeklySessionCounts.map(x => x.count), 1);
            const height = (w.count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className="text-xs font-semibold text-purple-600 mb-1">{w.count}</span>
                <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-t" style={{ height: `${height}%` }}>
                  <div className="w-full h-full bg-purple-500 rounded-t" />
                </div>
                <span className="text-xs text-gray-400 mt-1">{w.week}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prompt Level Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">👆 Prompt Level Distribution</h4>
        <div className="space-y-2">
          {p.promptLevelDistribution.map((item, i) => {
            const total = p.promptLevelDistribution.reduce((sum, x) => sum + x.count, 0);
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            const level = item.level as keyof typeof PROMPT_LEVEL_LABELS;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs w-28 text-gray-600 dark:text-gray-400">{PROMPT_LEVEL_LABELS[level]}</span>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: PROMPT_LEVEL_COLORS[level] }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-8 text-right">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Used Symbols */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🔤 Most Used Symbols</h4>
        <div className="flex flex-wrap gap-2">
          {p.mostUsedSymbols.map((item, i) => (
            <span key={i} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm">
              {item.symbol} <span className="text-xs opacity-70">×{item.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Communication Level History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📈 Communication Level History</h4>
        <div className="flex items-center gap-4">
          {p.communicationLevelHistory.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full capitalize">
                {entry.level}
              </span>
              {i < p.communicationLevelHistory.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
