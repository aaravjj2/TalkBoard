import { useSymbolStore } from '@/stores/symbolStore';
import { useTTS } from '@/hooks/useTTS';
import { useUIStore } from '@/stores/uiStore';
import type { GeneratedSentence } from '@/types';

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory, toggleFavorite } =
    useSymbolStore();
  const { speak } = useTTS();
  const { openModal, addToast } = useUIStore();

  const favorites = history.filter((h) => h.isFavorite);
  const recent = history.filter((h) => !h.isFavorite);

  const handleClearHistory = () => {
    openModal({
      title: 'Clear History',
      message:
        'Are you sure you want to clear all history? Favorites will also be removed. This cannot be undone.',
      confirmText: 'Clear All',
      variant: 'danger',
      onConfirm: () => {
        clearHistory();
        addToast('History cleared', 'success');
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="history-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          History
        </h1>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn-danger text-sm"
            data-testid="btn-clear-history"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Favorites */}
          {favorites.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <span aria-hidden="true">⭐</span> Favorites
              </h2>
              <div className="space-y-2">
                {favorites.map((entry) => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onSpeak={(text) => speak(text)}
                    onToggleFavorite={() => toggleFavorite(entry.id)}
                    onRemove={() => removeFromHistory(entry.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recent */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span aria-hidden="true">🕐</span> Recent
              <span className="text-sm font-normal text-gray-400">
                ({recent.length})
              </span>
            </h2>
            <div className="space-y-2">
              {recent.map((entry) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  onSpeak={(text) => speak(text)}
                  onToggleFavorite={() => toggleFavorite(entry.id)}
                  onRemove={() => removeFromHistory(entry.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function HistoryItem({
  entry,
  onSpeak,
  onToggleFavorite,
  onRemove,
}: {
  entry: GeneratedSentence;
  onSpeak: (text: string) => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}) {
  const timeAgo = formatTimeAgo(entry.spokenAt);

  return (
    <div
      className="card card-hover p-3 flex items-start gap-3"
      data-testid={`history-item-${entry.id}`}
    >
      {/* Symbols */}
      <div className="flex flex-wrap gap-1 flex-shrink-0">
        {entry.symbols.slice(0, 6).map((s, i) => (
          <span key={i} className="text-lg" title={s.label}>
            {s.emoji}
          </span>
        ))}
        {entry.symbols.length > 6 && (
          <span className="text-xs text-gray-400">
            +{entry.symbols.length - 6}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">
          "{entry.sentence}"
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onSpeak(entry.sentence)}
          className="btn-icon text-gray-400 hover:text-primary-500"
          aria-label={`Speak: ${entry.sentence}`}
          data-testid="history-speak"
        >
          🔊
        </button>
        <button
          onClick={onToggleFavorite}
          className={`btn-icon ${entry.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
          aria-label={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          data-testid="history-favorite"
        >
          {entry.isFavorite ? '⭐' : '☆'}
        </button>
        <button
          onClick={onRemove}
          className="btn-icon text-gray-400 hover:text-red-500"
          aria-label="Remove from history"
          data-testid="history-remove"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-5xl mb-4">📋</span>
      <h2 className="text-lg font-medium mb-1">No History Yet</h2>
      <p className="text-sm text-center">
        Sentences you speak will appear here. Go to the home page and start
        building sentences!
      </p>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
