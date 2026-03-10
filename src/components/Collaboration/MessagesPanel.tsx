// ─── Messages Panel ─────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { useCollaborationStore } from '../../stores/collaborationStore';

export default function MessagesPanel() {
  const { messages, teamMembers, currentUser, sendMessage, markMessageRead, unreadCount } = useCollaborationStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark unread messages as read
  useEffect(() => {
    messages
      .filter(m => !m.isRead && m.senderId !== currentUser?.id)
      .forEach(m => markMessageRead(m.id));
  }, [messages, currentUser?.id, markMessageRead]);

  function handleSend() {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage('');
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(date: string) {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Group messages by date
  const grouped: { date: string; messages: typeof messages }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  });

  const getInitial = (id: string) => {
    if (id === currentUser?.id) return currentUser.name.charAt(0).toUpperCase();
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name.charAt(0).toUpperCase() : '?';
  };

  const getSenderName = (id: string) => {
    if (id === currentUser?.id) return 'You';
    const member = teamMembers.find(m => m.id === id);
    return member?.name ?? 'Unknown';
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Team Chat
          </h3>
          <p className="text-xs text-gray-500">
            {teamMembers.filter(m => m.isOnline).length} members online
            {unreadCount > 0 && <span className="text-blue-500 ml-2">· {unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
        {grouped.map(group => (
          <div key={group.date}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-[10px] text-gray-400 font-medium">{group.date}</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              {group.messages.map(msg => {
                const isSelf = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0
                        ${isSelf ? 'bg-blue-500' : 'bg-gray-400'}`}
                    >
                      {getInitial(msg.senderId)}
                    </div>
                    <div className={`max-w-[70%] ${isSelf ? 'items-end' : 'items-start'}`}>
                      {!isSelf && (
                        <p className="text-[10px] text-gray-400 mb-0.5 ml-1">
                          {getSenderName(msg.senderId)}
                        </p>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm
                          ${isSelf
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-0.5 ${isSelf ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.createdAt)}
                        {isSelf && msg.isRead && <span className="ml-1 text-blue-400">✓✓</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="px-4 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
