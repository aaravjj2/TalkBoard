/**
 * EditorNotification — renders editor-scoped notification toasts.
 */
import { useEffect } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';

export default function EditorNotification() {
  const { notification, dismissNotification } = useSymbolEditorStore();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(dismissNotification, 4000);
    return () => clearTimeout(timer);
  }, [notification, dismissNotification]);

  if (!notification) return null;

  const colors: Record<string, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] animate-slide-up">
      <div
        className={`${
          colors[notification.type] || colors.info
        } text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 min-w-[200px] max-w-sm`}
      >
        <span>{icons[notification.type] || icons.info}</span>
        <span className="text-sm flex-1">{notification.message}</span>
        <button
          onClick={dismissNotification}
          className="ml-1 text-white/70 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
