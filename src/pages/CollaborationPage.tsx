// ─── Collaboration Page ─────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useCollaborationStore } from '../stores/collaborationStore';
import {
  ActivityFeed,
  TeamMembersPanel,
  SharedBoardsPanel,
  CommentsPanel,
  FeedbackPanel,
  MessagesPanel,
  CollaborationSettingsPanel,
  InvitationsPanel,
} from '../components/Collaboration';

const tabs = [
  { id: 'activity', label: '📋 Activity', icon: '📋' },
  { id: 'team', label: '👥 Team', icon: '👥' },
  { id: 'boards', label: '📊 Boards', icon: '📊' },
  { id: 'messages', label: '💬 Messages', icon: '💬' },
  { id: 'comments', label: '🗨️ Comments', icon: '🗨️' },
  { id: 'feedback', label: '⭐ Feedback', icon: '⭐' },
  { id: 'invitations', label: '✉️ Invites', icon: '✉️' },
  { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function CollaborationPage() {
  const {
    activeTab,
    setActiveTab,
    initialize,
    refresh,
    isInitialized,
    teamMembers,
    sharedBoards,
    unreadCount,
    error,
    clearError,
  } = useCollaborationStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Collaboration Hub</h1>
          <p className="text-sm text-indigo-200 mt-1">
            Work together with your team on communication boards
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-indigo-200">
            <span>👥 {teamMembers.length} members</span>
            <span>📊 {sharedBoards.length} boards</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={refresh}
              className="ml-auto px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-1 overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {tab.label}
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] inline-flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'team' && <TeamMembersPanel />}
        {activeTab === 'boards' && <SharedBoardsPanel />}
        {activeTab === 'messages' && <MessagesPanel />}
        {activeTab === 'comments' && <CommentsPanel />}
        {activeTab === 'feedback' && <FeedbackPanel />}
        {activeTab === 'invitations' && <InvitationsPanel />}
        {activeTab === 'settings' && <CollaborationSettingsPanel />}
      </div>
    </div>
  );
}
