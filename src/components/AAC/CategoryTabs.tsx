import { CATEGORIES } from '@/data/categories';
import type { SymbolCategoryId } from '@/types';

interface CategoryTabsProps {
  activeCategory: SymbolCategoryId;
  onCategoryChange: (id: SymbolCategoryId) => void;
}

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div
      className="flex overflow-x-auto gap-1 px-2 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 scrollbar-hide"
      role="tablist"
      aria-label="Symbol categories"
      data-testid="category-tabs"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`symbols-${cat.id}`}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              category-tab flex-shrink-0
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-150 whitespace-nowrap
              ${
                isActive
                  ? 'category-tab-active shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            style={
              isActive
                ? {
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                    borderColor: cat.color,
                  }
                : undefined
            }
            data-testid={`category-tab-${cat.id}`}
          >
            <span className="text-base" aria-hidden="true">
              {cat.icon}
            </span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
