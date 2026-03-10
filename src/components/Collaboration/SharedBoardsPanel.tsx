// ─── Shared Boards Panel ────────────────────────────────────────────────────

import { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';
import type { BoardVisibility } from '../../types/collaboration';

const visibilityIcons: Record<string, string> = {
  private: '🔒',
  team: '👥',
  public: '🌐',
  unlisted: '🔗',
};

const visibilityLabels: Record<string, string> = {
  private: 'Private',
  team: 'Team Only',
  public: 'Public',
  unlisted: 'Unlisted',
};

export default function SharedBoardsPanel() {
  const { sharedBoards, currentUser, createBoard, updateBoard, deleteBoard, toggleStarBoard } = useCollaborationStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVisibility, setNewVisibility] = useState<BoardVisibility>('team');
  const [filter, setFilter] = useState<'all' | 'starred' | 'owned'>('all');

  function handleCreate() {
    if (!newName.trim()) return;
    createBoard(newName.trim(), newDesc.trim(), newVisibility);
    setNewName('');
    setNewDesc('');
    setNewVisibility('team');
    setShowCreateForm(false);
  }

  const filtered = sharedBoards.filter(b => {
    if (filter === 'starred') return b.isStarred;
    if (filter === 'owned') return b.ownerId === currentUser?.id;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Shared Boards ({sharedBoards.length})
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 text-xs font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ New Board'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['all', 'starred', 'owned'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${filter === f
                ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {f === 'all' ? 'All' : f === 'starred' ? '⭐ Starred' : '👤 Mine'}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Board name"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <div className="flex gap-2">
            {(['private', 'team', 'public', 'unlisted'] as BoardVisibility[]).map(v => (
              <button
                key={v}
                onClick={() => setNewVisibility(v)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${newVisibility === v
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
              >
                {visibilityIcons[v]} {visibilityLabels[v]}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="w-full py-2 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Board
          </button>
        </div>
      )}

      {/* Board list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No boards found</p>
        )}
        {filtered.map(board => (
          <div
            key={board.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                    {board.name}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {visibilityIcons[board.visibility]}
                  </span>
                </div>
                {board.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{board.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => toggleStarBoard(board.id)}
                  className={`p-1 transition-colors ${board.isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                >
                  {board.isStarred ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => deleteBoard(board.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete board"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>📊 {board.symbolCount} symbols</span>
              <span>💬 {board.phraseCount} phrases</span>
              <span>👥 {board.members.length} members</span>
              <span>v{board.version}</span>
            </div>

            {/* Members */}
            <div className="flex items-center gap-1 mt-2">
              {board.members.slice(0, 5).map((m, i) => (
                <div
                  key={m.userId}
                  className="w-6 h-6 rounded-full bg-blue-400 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-800"
                  style={{ marginLeft: i > 0 ? '-4px' : '0', zIndex: 5 - i }}
                  title={m.userId}
                >
                  {m.role.charAt(0).toUpperCase()}
                </div>
              ))}
              {board.members.length > 5 && (
                <span className="text-xs text-gray-400 ml-1">+{board.members.length - 5}</span>
              )}
            </div>

            {/* Last synced */}
            <p className="text-[10px] text-gray-400 mt-2">
              Last synced: {new Date(board.lastSyncedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
