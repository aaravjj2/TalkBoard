/**
 * OfflineIndicator — Shows a status bar when the app is offline.
 * Includes network status info and reconnection feedback.
 */

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function OfflineIndicator() {
  const { isOffline, isSlowConnection, status } = usePWA();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
      setWasOffline(true);
    } else {
      if (wasOffline) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
      setShow(false);
    }
  }, [isOffline, wasOffline]);

  if (!show && !showReconnected && !isSlowConnection) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50"
      role="alert"
      aria-live="assertive"
    >
      {/* Offline banner */}
      {show && isOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center flex items-center justify-center gap-2 shadow-lg animate-slide-down">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243L9.88 9.88"
            />
            <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium">
            You&apos;re offline — TalkBoard will continue to work with cached data
          </span>
          {status.lastOnlineAt && (
            <span className="text-xs opacity-80 hidden sm:inline">
              (Last online: {new Date(status.lastOnlineAt).toLocaleTimeString()})
            </span>
          )}
        </div>
      )}

      {/* Reconnected banner */}
      {showReconnected && !isOffline && (
        <div className="bg-green-500 text-white px-4 py-2 text-center flex items-center justify-center gap-2 shadow-lg animate-slide-down">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">Back online!</span>
        </div>
      )}

      {/* Slow connection warning */}
      {isSlowConnection && !isOffline && !showReconnected && (
        <div className="bg-orange-400 text-white px-4 py-1.5 text-center flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-xs font-medium">
            Slow connection detected — some features may be limited
          </span>
        </div>
      )}
    </div>
  );
}
