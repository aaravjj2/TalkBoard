/**
 * UpdateNotification — Shows a notification when a service worker
 * update is available with an option to reload.
 */

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function UpdateNotification() {
  const { isUpdateAvailable, update } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white rounded-xl shadow-2xl p-4 max-w-sm
        animate-slide-up"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-sm">Update Available</h4>
          <p className="text-xs text-white/80 mt-0.5">
            A new version of TalkBoard is ready. Reload to update.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={update}
              className="bg-white text-primary-600 px-3 py-1.5 rounded-lg text-xs font-semibold
                hover:bg-white/90 transition-colors"
            >
              Reload & Update
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white text-xs transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
