/**
 * ActivityLogViewer — Filterable view of caregiver activity log entries.
 */
import { useState, useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import type { ActivityLogEntry, ActivityType } from '@/services/caregiverService';

const activityTypeLabels: Record<ActivityType, { label: string; icon: string; color: string }> = {
  symbol_selected: { label: 'Symbol Selected', icon: '🔤', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  sentence_generated: { label: 'Sentence Generated', icon: '💬', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  sentence_spoken: { label: 'Sentence Spoken', icon: '🔊', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  category_changed: { label: 'Category Changed', icon: '🗂️', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  page_visited: { label: 'Page Visited', icon: '📄', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  settings_changed: { label: 'Settings Changed', icon: '⚙️', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  symbol_added: { label: 'Symbol Added', icon: '➕', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  symbol_removed: { label: 'Symbol Removed', icon: '➖', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  symbol_hidden: { label: 'Symbol Hidden', icon: '👁️‍🗨️', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  symbol_shown: { label: 'Symbol Shown', icon: '👁️', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  board_modified: { label: 'Board Modified', icon: '📋', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  login_attempt: { label: 'Login Attempt', icon: '🔑', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  login_success: { label: 'Login Success', icon: '✅', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  login_failure: { label: 'Login Failed', icon: '❌', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  logout: { label: 'Logged Out', icon: '🚪', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  session_expired: { label: 'Session Expired', icon: '⏰', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  restriction_set: { label: 'Restriction Set', icon: '🛡️', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  goal_created: { label: 'Goal Created', icon: '🎯', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  goal_updated: { label: 'Goal Updated', icon: '📊', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  goal_achieved: { label: 'Goal Achieved', icon: '🏆', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  note_added: { label: 'Note Added', icon: '📝', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
};

const categoryLabels: Record<ActivityLogEntry['category'], string> = {
  communication: 'Communication',
  navigation: 'Navigation',
  settings: 'Settings',
  symbols: 'Symbols',
  session: 'Session',
};

export default function ActivityLogViewer() {
  const {
    activityLog,
    activityLogFilters,
    setActivityFilters,
    clearActivityFilters,
    clearActivityLog,
    refreshActivityLog,
  } = useCaregiverStore();

  const [showMetadata, setShowMetadata] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, ActivityLogEntry[]>();
    for (const entry of [...activityLog].reverse()) {
      const date = entry.timestamp.split('T')[0];
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(entry);
    }
    return [...groups.entries()];
  }, [activityLog]);

  const handleClear = () => {
    clearActivityLog();
    setClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Log</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activityLog.length} entries
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshActivityLog}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm
              text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
          {clearConfirm ? (
            <div className="flex gap-1">
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Confirm Clear
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setClearConfirm(true)}
              className="px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20
                rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={activityLogFilters.category || ''}
          onChange={(e) => setActivityFilters({ category: (e.target.value || null) as ActivityLogEntry['category'] | null })}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={activityLogFilters.actor || ''}
          onChange={(e) => setActivityFilters({ actor: (e.target.value || null) as 'user' | 'caregiver' | null })}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
        >
          <option value="">All Actors</option>
          <option value="user">User</option>
          <option value="caregiver">Caregiver</option>
        </select>
        <input
          type="date"
          value={activityLogFilters.startDate || ''}
          onChange={(e) => setActivityFilters({ startDate: e.target.value || null })}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
          placeholder="Start date"
        />
        <input
          type="date"
          value={activityLogFilters.endDate || ''}
          onChange={(e) => setActivityFilters({ endDate: e.target.value || null })}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
          placeholder="End date"
        />
        {(activityLogFilters.category || activityLogFilters.actor || activityLogFilters.startDate || activityLogFilters.endDate) && (
          <button
            onClick={clearActivityFilters}
            className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Log Entries */}
      {groupedEntries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400">No activity logged</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map(([date, entries]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-gray-50 dark:bg-gray-900 py-1 z-10">
                {formatDate(date)}
              </h4>
              <div className="space-y-2">
                {entries.map((entry) => {
                  const typeInfo = activityTypeLabels[entry.type] || {
                    label: entry.type,
                    icon: '📌',
                    color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                  };
                  const hasMetadata = Object.keys(entry.metadata).length > 0;

                  return (
                    <div
                      key={entry.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100
                        dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{typeInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              entry.actor === 'caregiver'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}>
                              {entry.actor}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {entry.description}
                          </p>

                          {/* Metadata */}
                          {hasMetadata && showMetadata === entry.id && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono
                              text-gray-600 dark:text-gray-400">
                              {Object.entries(entry.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-500">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {hasMetadata && (
                          <button
                            onClick={() => setShowMetadata(showMetadata === entry.id ? null : entry.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                            aria-label="Toggle metadata"
                          >
                            {showMetadata === entry.id ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
