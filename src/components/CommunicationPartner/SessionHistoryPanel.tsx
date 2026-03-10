import React, { useState } from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import { SESSION_TYPE_LABELS, type SessionType, type SessionStatus } from '../../types/communicationPartner';

const STATUS_COLORS: Record<SessionStatus, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const TYPE_ICONS: Record<SessionType, string> = {
  structured: '📋', guided: '🧭', free_play: '🎮', social: '👥', assessment: '📊',
};

export const SessionHistoryPanel: React.FC = () => {
  const { sessions, partners, createSession, completeSession } = useCommunicationPartnerStore();
  const [filter, setFilter] = useState<'all' | SessionStatus>('all');
  const [showNew, setShowNew] = useState(false);
  const [newPartnerId, setNewPartnerId] = useState('');
  const [newType, setNewType] = useState<SessionType>('guided');

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

  const handleCreate = () => {
    const partner = partners.find(p => p.id === newPartnerId);
    if (!partner) return;
    createSession(partner.id, partner.name, newType);
    setShowNew(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Sessions ({sessions.length})
        </h3>
        <button onClick={() => setShowNew(!showNew)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
          {showNew ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {showNew && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-3">
          <select value={newPartnerId} onChange={e => setNewPartnerId(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option value="">Select partner...</option>
            {partners.filter(p => p.isActive).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={newType} onChange={e => setNewType(e.target.value as SessionType)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            {(Object.keys(SESSION_TYPE_LABELS) as SessionType[]).map(t => (
              <option key={t} value={t}>{SESSION_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <button onClick={handleCreate} disabled={!newPartnerId} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            Create Session
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'planned', 'active', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? sessions.length : sessions.filter(s => s.status === status).length})
          </button>
        ))}
      </div>

      {/* Session Cards */}
      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{TYPE_ICONS[s.type]}</span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{SESSION_TYPE_LABELS[s.type]}</span>
                  <span className="text-sm text-gray-500 ml-2">with {s.partnerName}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                {s.status}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-2">{formatDate(s.startedAt)} · {s.duration} min</div>

            {/* Goals */}
            {s.goals.length > 0 && (
              <div className="mb-2">
                {s.goals.map(g => (
                  <div key={g.id} className="flex items-center gap-2 text-sm">
                    <span>{g.isAchieved ? '✅' : '⬜'}</span>
                    <span className={g.isAchieved ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>{g.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {s.status === 'completed' && (
              <div className="flex gap-4 text-xs text-gray-500">
                <span>💬 {s.messageCount} messages</span>
                <span>🔤 {s.uniqueSymbols} unique symbols</span>
                <span>🎯 {s.independentMessages}/{s.messageCount} independent</span>
                <span>⭐ {s.rating}/5</span>
              </div>
            )}

            {s.notes && <div className="text-xs text-gray-400 mt-2 italic">{s.notes}</div>}

            {s.status === 'active' && (
              <button
                onClick={() => completeSession(s.id, '', 3)}
                className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
              >
                Complete Session
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
