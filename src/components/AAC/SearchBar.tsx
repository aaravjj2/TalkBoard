import { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useAccessibility';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search symbols...',
}: SearchBarProps) {
  return (
    <div
      className="relative flex items-center"
      role="search"
      data-testid="search-bar"
    >
      <svg
        className="absolute left-3 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-8 py-2 text-sm w-full"
        aria-label="Search symbols"
        data-testid="search-input"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Clear search"
          data-testid="search-clear"
        >
          <svg
            className="w-4 h-4 text-gray-400"
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
      )}
    </div>
  );
}
