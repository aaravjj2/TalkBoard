// ─── Feedback Panel ─────────────────────────────────────────────────────────

import { useCollaborationStore } from '../../stores/collaborationStore';

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  praise: { icon: '👏', color: '#10B981', label: 'Praise' },
  suggestion: { icon: '💡', color: '#F59E0B', label: 'Suggestion' },
  concern: { icon: '⚠️', color: '#EF4444', label: 'Concern' },
  question: { icon: '❓', color: '#3B82F6', label: 'Question' },
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function FeedbackPanel() {
  const { feedback, sharedBoards, markFeedbackRead } = useCollaborationStore();

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const unread = feedback.filter(f => !f.isRead).length;
  const boardName = (boardId: string) => sharedBoards.find(b => b.id === boardId)?.name ?? 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Feedback ({feedback.length})
          </h3>
          {unread > 0 && (
            <p className="text-xs text-blue-500">{unread} unread</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(typeConfig).map(([type, cfg]) => {
          const count = feedback.filter(f => f.type === type).length;
          return (
            <div
              key={type}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center"
            >
              <span className="text-lg">{cfg.icon}</span>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-1">{count}</p>
              <p className="text-[10px] text-gray-400">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {feedback.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No feedback yet</p>
        )}
        {feedback.map(fb => {
          const cfg = typeConfig[fb.type] || typeConfig.question;
          return (
            <div
              key={fb.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-opacity ${
                fb.isRead
                  ? 'border-gray-200 dark:border-gray-700 opacity-75'
                  : 'border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {!fb.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fb.authorName} · {boardName(fb.boardId)} · {timeAgo(fb.createdAt)}
                    </p>
                  </div>
                </div>
                {!fb.isRead && (
                  <button
                    onClick={() => markFeedbackRead(fb.id)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{fb.content}</p>
              {fb.rating !== undefined && (
                <div className="mt-2">
                  <StarRating rating={fb.rating} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
