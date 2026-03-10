// ─── Invitations Panel ──────────────────────────────────────────────────────

import { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';
import type { CollaborationRole } from '../../types/collaboration';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
  accepted: { color: '#10B981', bg: '#D1FAE5', label: 'Accepted' },
  declined: { color: '#EF4444', bg: '#FEE2E2', label: 'Declined' },
  expired: { color: '#6B7280', bg: '#F3F4F6', label: 'Expired' },
};

export default function InvitationsPanel() {
  const { invitations, sharedBoards, createInvitation, cancelInvitation } = useCollaborationStore();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaborationRole>('viewer');
  const [boardId, setBoardId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  function handleInvite() {
    if (!email.trim() || !boardId) return;
    createInvitation(email.trim(), boardId, role, inviteMessage.trim() || undefined);
    setEmail('');
    setRole('viewer');
    setBoardId('');
    setInviteMessage('');
    setShowInviteForm(false);
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const pending = invitations.filter(i => i.status === 'pending');
  const others = invitations.filter(i => i.status !== 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Invitations ({invitations.length})
          </h3>
          {pending.length > 0 && (
            <p className="text-xs text-yellow-500">{pending.length} pending</p>
          )}
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {showInviteForm ? 'Cancel' : '+ Invite'}
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          >
            <option value="">Select a board...</option>
            {sharedBoards.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {(['viewer', 'contributor', 'editor'] as CollaborationRole[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
                  ${role === r
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            placeholder="Personal message (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
          <button
            onClick={handleInvite}
            disabled={!email.trim() || !boardId}
            className="w-full py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send Invitation
          </button>
        </div>
      )}

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Pending
          </h4>
          <div className="space-y-2">
            {pending.map(inv => (
              <div
                key={inv.id}
                className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {inv.inviteeEmail}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      as <span className="capitalize font-medium">{inv.role}</span> · {timeAgo(inv.createdAt)}
                    </p>
                    {inv.message && (
                      <p className="text-xs text-gray-500 mt-1 italic">"{inv.message}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => cancelInvitation(inv.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other invitations */}
      {others.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            History
          </h4>
          <div className="space-y-2">
            {others.map(inv => {
              const cfg = statusConfig[inv.status] || statusConfig.expired;
              return (
                <div
                  key={inv.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{inv.inviteeEmail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        as <span className="capitalize">{inv.role}</span> · {timeAgo(inv.createdAt)}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
