import type { SelectedSymbol } from '@/types';
import { getCategoryColor } from '@/data/categories';

interface SentenceBarProps {
  symbols: SelectedSymbol[];
  generatedSentence: string;
  isGenerating: boolean;
  onRemoveSymbol: (instanceId: string) => void;
  onRemoveLast: () => void;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
}

export default function SentenceBar({
  symbols,
  generatedSentence,
  isGenerating,
  onRemoveSymbol,
  onRemoveLast,
  onClear,
  onSpeak,
  isSpeaking,
}: SentenceBarProps) {
  return (
    <div
      className="sentence-bar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3"
      role="region"
      aria-label="Selected symbols and generated sentence"
      data-testid="sentence-bar"
    >
      {/* Symbol strip */}
      <div className="flex items-center gap-2 mb-2 min-h-[3rem]">
        <div
          className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1"
          role="list"
          aria-label="Selected symbols"
          data-testid="symbol-strip"
        >
          {symbols.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic pl-2">
              Tap symbols below to build a sentence...
            </p>
          ) : (
            symbols.map((sym) => {
              const catColor = getCategoryColor(sym.category);
              return (
                <button
                  key={sym.instanceId}
                  onClick={() => onRemoveSymbol(sym.instanceId)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border text-sm
                    hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300
                    transition-colors duration-150 flex-shrink-0 group"
                  style={{ borderColor: `${catColor}50` }}
                  aria-label={`Remove ${sym.label}`}
                  title={`Click to remove "${sym.label}"`}
                  data-testid={`selected-symbol-${sym.instanceId}`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {sym.emoji}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {sym.label}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600 group-hover:text-red-400 text-xs ml-0.5">
                    ×
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        {symbols.length > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onRemoveLast}
              className="btn-icon text-gray-500 hover:text-orange-500"
              aria-label="Remove last symbol"
              title="Backspace"
              data-testid="backspace-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z"
                />
              </svg>
            </button>
            <button
              onClick={onClear}
              className="btn-icon text-gray-500 hover:text-red-500"
              aria-label="Clear all symbols"
              title="Clear"
              data-testid="clear-btn"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Generated sentence + speak */}
      {symbols.length > 0 && (
        <div className="flex items-center gap-2">
          <div
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[2.5rem] flex items-center"
            aria-live="polite"
            data-testid="generated-sentence"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Generating sentence...</span>
              </div>
            ) : generatedSentence ? (
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                {generatedSentence}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                Tap speak to generate and hear the sentence
              </p>
            )}
          </div>

          <button
            onClick={onSpeak}
            disabled={symbols.length === 0}
            className={`
              btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl
              font-semibold text-base shadow-lg
              ${isSpeaking ? 'animate-pulse bg-orange-500 hover:bg-orange-600' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={isSpeaking ? 'Stop speaking' : 'Speak sentence'}
            data-testid="speak-btn"
          >
            <span className="text-xl" aria-hidden="true">
              {isSpeaking ? '⏹️' : '🔊'}
            </span>
            <span className="hidden sm:inline">
              {isSpeaking ? 'Stop' : 'Speak'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
