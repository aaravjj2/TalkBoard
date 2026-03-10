import React, { useState } from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import type { LogEntryType } from '../../types/communicationPartner';

const TYPE_META: Record<LogEntryType, { icon: string; label: string; color: string }> = {
  message: { icon: '💬', label: 'Message', color: 'bg-blue-100 text-blue-700' },
  model: { icon: '🎯', label: 'Model', color: 'bg-green-100 text-green-700' },
  prompt: { icon: '👆', label: 'Prompt', color: 'bg-orange-100 text-orange-700' },
  response: { icon: '✅', label: 'Response', color: 'bg-purple-100 text-purple-700' },
  expansion: { icon: '📈', label: 'Expansion', color: 'bg-teal-100 text-teal-700' },
  note: { icon: '📝', label: 'Note', color: 'bg-gray-100 text-gray-600' },
};

export const CommunicationLogPanel: React.FC = () => {
  const { log, sessions } = useCommunicationPartnerStore();
  const [filterType, setFilterType] = useState<'all' | LogEntryType>('all');
  const [filterSession, setFilterSession] = useState<string>('all');

  const filtered = log
    .filter(e => filterType === 'all' || e.type === filterType)
    .filter(e => filterSession === 'all' || e.sessionId === filterSession);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
    const dateKey = formatDate(entry.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Communication Log ({log.length} entries)
      </h3>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-sm ${filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            All Types
          </button>
          {(Object.keys(TYPE_META) as LogEntryType[]).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-sm ${filterType === type ? TYPE_META[type].color : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              {TYPE_META[type].icon} {TYPE_META[type].label}
            </button>
          ))}
        </div>

        <select
          value={filterSession}
          onChange={e => setFilterSession(e.target.value)}
          className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="all">All Sessions</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.partnerName} - {new Date(s.startedAt).toLocaleDateString()}</option>
          ))}
        </select>
      </div>

      {/* Log Entries grouped by date */}
      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date}>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 mt-4">{date}</div>
          <div className="space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border-l-4 ${
                  entry.isUserGenerated
                    ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-400'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_META[entry.type].color}`}>
                      {TYPE_META[entry.type].icon} {TYPE_META[entry.type].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entry.isUserGenerated ? '👤 User' : `🤝 ${entry.partnerName}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">{entry.content}</div>
                {entry.symbols && entry.symbols.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {entry.symbols.map((sym, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded">
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
                {entry.promptLevel && (
                  <span className="text-xs text-orange-600 mt-1 inline-block">Prompt: {entry.promptLevel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-8">No log entries match the current filters.</div>
      )}
    </div>
  );
};
