// ─── Activity Feed ──────────────────────────────────────────────────────────

import { useCollaborationStore } from '../../stores/collaborationStore';

const activityIcons: Record<string, string> = {
  symbol_added: '➕',
  symbol_edited: '✏️',
  board_shared: '🔗',
  board_duplicated: '📋',
  comment_added: '💬',
  comment_resolved: '✅',
  member_joined: '👋',
  member_left: '👤',
  settings_changed: '⚙️',
  phrase_added: '💭',
  phrase_edited: '📝',
  feedback_given: '⭐',
  goal_set: '🎯',
  goal_completed: '🏆',
};

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ActivityFeed() {
  const { activities } = useCollaborationStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Activity</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {activityIcons[activity.type] || '📌'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">{activity.userName}</span>
                  {' '}
                  <span className="text-gray-500">{activity.description}</span>
                </p>
                {activity.boardName && (
                  <p className="text-xs text-blue-500 mt-0.5">📋 {activity.boardName}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
