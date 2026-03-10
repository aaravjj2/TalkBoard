import { useUserStore } from '@/stores/userStore';
import { useTTS } from '@/hooks/useTTS';
import { useUIStore } from '@/stores/uiStore';

export default function QuickPhrasesPage() {
  const { quickPhrases, removeQuickPhrase, pinQuickPhrase, unpinQuickPhrase } =
    useUserStore();
  const { speak } = useTTS();
  const { addToast, openModal } = useUIStore();

  const pinnedPhrases = quickPhrases
    .filter((qp) => qp.isPinned)
    .sort((a, b) => b.usageCount - a.usageCount);
  const otherPhrases = quickPhrases
    .filter((qp) => !qp.isPinned)
    .sort((a, b) => b.usageCount - a.usageCount);

  const handleDelete = (id: string, text: string) => {
    openModal({
      title: 'Remove Quick Phrase',
      message: `Remove "${text}" from quick phrases?`,
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        removeQuickPhrase(id);
        addToast('Phrase removed', 'success');
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="quick-phrases-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Quick Phrases
        </h1>
        <span className="text-sm text-gray-400">
          {quickPhrases.length}/20 phrases
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Frequently used phrases for quick access. Tap to speak, pin your favorites to the top.
      </p>

      {quickPhrases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <span className="text-5xl mb-4">⚡</span>
          <h2 className="text-lg font-medium mb-1">No Quick Phrases</h2>
          <p className="text-sm text-center">
            Phrases are automatically saved when you speak sentences. Enable
            auto-save in Settings, or they'll appear here as you use the app.
          </p>
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinnedPhrases.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                📌 Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pinnedPhrases.map((qp) => (
                  <PhraseCard
                    key={qp.id}
                    text={qp.text}
                    usageCount={qp.usageCount}
                    isPinned={qp.isPinned}
                    onSpeak={() => speak(qp.text)}
                    onTogglePin={() => unpinQuickPhrase(qp.id)}
                    onDelete={() => handleDelete(qp.id, qp.text)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All */}
          {otherPhrases.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                All Phrases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherPhrases.map((qp) => (
                  <PhraseCard
                    key={qp.id}
                    text={qp.text}
                    usageCount={qp.usageCount}
                    isPinned={qp.isPinned}
                    onSpeak={() => speak(qp.text)}
                    onTogglePin={() => pinQuickPhrase(qp.id)}
                    onDelete={() => handleDelete(qp.id, qp.text)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PhraseCard({
  text,
  usageCount,
  isPinned,
  onSpeak,
  onTogglePin,
  onDelete,
}: {
  text: string;
  usageCount: number;
  isPinned: boolean;
  onSpeak: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card card-hover p-3 flex items-center gap-3" data-testid="phrase-card">
      <button
        onClick={onSpeak}
        className="flex-1 text-left hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        aria-label={`Speak: ${text}`}
      >
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          "{text}"
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Used {usageCount} time{usageCount !== 1 ? 's' : ''}
        </p>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={onSpeak}
          className="btn-icon text-gray-400 hover:text-primary-500"
          aria-label="Speak"
        >
          🔊
        </button>
        <button
          onClick={onTogglePin}
          className={`btn-icon ${isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
          aria-label={isPinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
        <button
          onClick={onDelete}
          className="btn-icon text-gray-400 hover:text-red-500"
          aria-label="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
