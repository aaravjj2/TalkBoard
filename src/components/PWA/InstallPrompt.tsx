/**
 * InstallPrompt — Shows an install banner when the app can be
 * installed as a PWA. Includes dismissible UI with remember preference.
 */

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

const DISMISS_KEY = 'talkboard_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!isInstallable || isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DURATION) {
        return;
      }
      localStorage.removeItem(DISMISS_KEY);
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    setInstalling(true);
    const result = await install();
    setInstalling(false);

    if (result === 'accepted') {
      setIsVisible(false);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50
        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
        p-4 sm:p-5 animate-slide-up"
      role="dialog"
      aria-label="Install TalkBoard app"
    >
      <div className="flex items-start gap-3">
        {/* App icon */}
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🗣️</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Install TalkBoard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Add TalkBoard to your home screen for quick access and offline use
          </p>

          {/* Benefits list */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Works offline — no internet needed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Faster loading — cached on device</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Home screen icon — one tap away</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold
                flex items-center gap-2 disabled:opacity-50"
            >
              {installing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install Now
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400
                hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          aria-label="Dismiss install prompt"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
