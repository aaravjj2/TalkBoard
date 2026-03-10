// ─── Team Members Panel ─────────────────────────────────────────────────────

import { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';
import type { CollaborationRole } from '../../types/collaboration';

const roleColors: Record<string, string> = {
  owner: '#EF4444',
  editor: '#3B82F6',
  contributor: '#10B981',
  viewer: '#6B7280',
};

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  editor: 'Editor',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

export default function TeamMembersPanel() {
  const { teamMembers, currentUser, addMember, updateMemberRole, removeMember } = useCollaborationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<CollaborationRole>('viewer');

  function handleAdd() {
    if (!newName.trim() || !newEmail.trim()) return;
    addMember(newName.trim(), newEmail.trim(), newRole);
    setNewName('');
    setNewEmail('');
    setNewRole('viewer');
    setShowAddForm(false);
  }

  const allMembers = [
    ...(currentUser ? [{
      ...currentUser,
      permissions: [],
      invitedBy: '',
      inviteStatus: 'accepted' as const,
      isSelf: true,
    }] : []),
    ...teamMembers.map(m => ({ ...m, isSelf: false })),
  ];

  const onlineCount = allMembers.filter(m => m.isOnline).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Team Members ({allMembers.length})
          </h3>
          <p className="text-xs text-gray-500">{onlineCount} online</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Add member form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            {(['viewer', 'contributor', 'editor'] as CollaborationRole[]).map(role => (
              <button
                key={role}
                onClick={() => setNewRole(role)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${newRole === role
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                style={newRole === role ? { backgroundColor: roleColors[role] } : undefined}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newEmail.trim()}
            className="w-full py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send Invitation
          </button>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {allMembers.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: roleColors[member.role] }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              {member.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {member.name}
                  {'isSelf' in member && member.isSelf && <span className="text-gray-400 ml-1">(you)</span>}
                </p>
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: roleColors[member.role] }}
                >
                  {roleLabels[member.role]}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>

            {/* Actions */}
            {'isSelf' in member && !member.isSelf && (
              <div className="flex items-center gap-1">
                <select
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value as CollaborationRole)}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                >
                  <option value="viewer">Viewer</option>
                  <option value="contributor">Contributor</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove member"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
