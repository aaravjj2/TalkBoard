/**
 * PredictionBar — Shows adaptive symbol predictions above the symbol grid.
 */
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';
import type { SymbolPrediction } from '@/types/adaptiveLearning';

interface PredictionBarProps {
  onSelectSymbol: (symbolId: string) => void;
  symbolLabels: Record<string, string>;
  symbolEmojis: Record<string, string>;
}

export default function PredictionBar({
  onSelectSymbol,
  symbolLabels,
  symbolEmojis,
}: PredictionBarProps) {
  const {
    currentPredictions,
    showPredictions,
    settings,
    acceptPrediction,
    togglePredictions,
  } = useAdaptiveLearningStore();

  if (!settings.enabled || currentPredictions.length === 0) return null;

  const handleSelect = (prediction: SymbolPrediction) => {
    acceptPrediction(prediction.symbolId, prediction.rank, prediction.score);
    onSelectSymbol(prediction.symbolId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
      dark:border-gray-700 p-3" data-testid="prediction-bar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            ✨ Suggested
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ({currentPredictions.length})
          </span>
        </div>
        <button
          onClick={togglePredictions}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={showPredictions ? 'Hide predictions' : 'Show predictions'}
        >
          {showPredictions ? '▼' : '▶'}
        </button>
      </div>

      {showPredictions && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {currentPredictions.map((prediction) => {
            const label = symbolLabels[prediction.symbolId] || prediction.symbolId;
            const emoji = symbolEmojis[prediction.symbolId] || '❓';
            const confidence = Math.round(prediction.score * 100);

            return (
              <button
                key={prediction.symbolId}
                onClick={() => handleSelect(prediction)}
                className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg
                  bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                  hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors
                  min-w-[64px] relative"
                title={`${label} (${confidence}% confidence)`}
                data-testid={`prediction-${prediction.symbolId}`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60px]">
                  {label}
                </span>
                {/* Confidence indicator */}
                <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: confidence >= 70 ? '#22c55e' :
                      confidence >= 40 ? '#f59e0b' : '#94a3b8',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
