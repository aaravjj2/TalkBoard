import { Link, useLocation } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useAccessibility';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Home', icon: '🏠', testId: 'nav-home' },
  { path: '/quick-phrases', label: 'Quick Phrases', icon: '⚡', testId: 'nav-quick-phrases' },
  { path: '/history', label: 'History', icon: '📋', testId: 'nav-history' },
  { path: '/profile', label: 'Profile', icon: '👤', testId: 'nav-profile' },
  { path: '/caregiver', label: 'Caregiver Mode', icon: '🔒', testId: 'nav-caregiver' },
  { path: '/settings', label: 'Settings', icon: '⚙️', testId: 'nav-settings' },
  { path: '/help', label: 'Help', icon: '❓', testId: 'nav-help' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useClickOutside(sidebarRef, () => {
    if (isOpen) onClose();
  });

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-56 flex-shrink-0 overflow-y-auto
        `}
        role="navigation"
        aria-label="Main navigation"
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full pt-4 pb-6">
          {/* Close button — mobile */}
          <div className="flex justify-end px-4 mb-2 lg:hidden">
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Close navigation"
              data-testid="sidebar-close"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <ul className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={item.testId}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              TalkBoard v1.0
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
