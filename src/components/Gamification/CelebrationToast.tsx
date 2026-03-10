// ─── Celebration Toast ──────────────────────────────────────────────────────

import { useGamificationStore } from '../../stores/gamificationStore';

export default function CelebrationToast() {
  const { celebrations, dismissCelebration } = useGamificationStore();
  const pending = celebrations.filter(c => !c.dismissed).slice(0, 3); // max 3 visible

  if (pending.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {pending.map((celebration) => (
        <div
          key={celebration.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-slide-in-right flex items-start gap-3"
        >
          <span className="text-3xl flex-shrink-0">{celebration.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {celebration.title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{celebration.description}</p>
            <p className="text-[10px] text-gray-400 mt-1 capitalize">
              {celebration.type.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={() => dismissCelebration(celebration.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
