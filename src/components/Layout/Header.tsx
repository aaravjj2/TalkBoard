import { useUIStore } from '@/stores/uiStore';
import { useSymbolStore } from '@/stores/symbolStore';
import { useTTS } from '@/hooks/useTTS';
import { APP_NAME } from '@/constants';
import { Link } from 'react-router-dom';

export default function Header() {
  const { toggleSidebar, ttsStatus } = useUIStore();
  const { selectedSymbols } = useSymbolStore();
  const { isSpeaking } = useTTS();

  return (
    <header
      className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 shadow-sm border-b border-gray-200 dark:border-gray-700 safe-area-top"
      role="banner"
    >
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="btn-icon lg:hidden"
          aria-label="Toggle navigation menu"
          data-testid="menu-toggle"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
          aria-label={`${APP_NAME} home`}
        >
          <span className="text-2xl" role="img" aria-hidden="true">
            💬
          </span>
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-display hidden sm:block">
            {APP_NAME}
          </h1>
        </Link>
      </div>

      {/* Center: Speaking indicator */}
      <div className="flex items-center gap-2">
        {isSpeaking && (
          <div
            className="flex items-center gap-1 text-sm text-primary-600 animate-pulse"
            aria-live="polite"
          >
            <span className="speaking-indicator" />
            <span className="hidden sm:inline">Speaking...</span>
          </div>
        )}
        {selectedSymbols.length > 0 && (
          <span className="badge badge-primary" aria-label={`${selectedSymbols.length} symbols selected`}>
            {selectedSymbols.length}
          </span>
        )}
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2">
        <Link
          to="/settings"
          className="btn-icon"
          aria-label="Settings"
          data-testid="settings-link"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>
        <Link
          to="/help"
          className="btn-icon hidden sm:flex"
          aria-label="Help"
          data-testid="help-link"
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
