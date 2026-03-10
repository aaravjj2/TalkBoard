// ─── Comments Panel ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';

export default function CommentsPanel() {
  const { comments, sharedBoards, addComment, resolveComment, currentUser } = useCollaborationStore();
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const filtered = selectedBoard === 'all'
    ? comments
    : comments.filter(c => c.boardId === selectedBoard);

  // Only top-level comments
  const topLevel = filtered.filter(c => !c.parentId);
  const getReplies = (parentId: string) => filtered.filter(c => c.parentId === parentId);

  function handleSubmit() {
    if (!newComment.trim() || !sharedBoards.length) return;
    const boardId = selectedBoard !== 'all' ? selectedBoard : sharedBoards[0].id;
    addComment(boardId, newComment.trim(), replyTo || undefined);
    setNewComment('');
    setReplyTo(null);
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Comments ({comments.length})
        </h3>
        <select
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
        >
          <option value="all">All Boards</option>
          {sharedBoards.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* New comment */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-blue-500">
            <span>↩ Replying to comment</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {topLevel.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No comments yet</p>
        )}
        {topLevel.map(comment => (
          <div key={comment.id} className="space-y-2">
            <div className={`bg-white dark:bg-gray-800 rounded-xl border p-3 ${
              comment.isResolved
                ? 'border-green-200 dark:border-green-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-400 text-white text-xs font-bold flex items-center justify-center">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {comment.authorName}
                    </p>
                    <p className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {comment.isResolved && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Reply
                </button>
                {!comment.isResolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    className="text-xs text-green-500 hover:text-green-600"
                  >
                    Resolve
                  </button>
                )}
                {comment.isEdited && (
                  <span className="text-[10px] text-gray-400">(edited)</span>
                )}
              </div>
            </div>

            {/* Replies */}
            {getReplies(comment.id).map(reply => (
              <div
                key={reply.id}
                className="ml-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center">
                    {reply.authorName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {reply.authorName}
                  </p>
                  <p className="text-[10px] text-gray-400">{timeAgo(reply.createdAt)}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">{reply.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
