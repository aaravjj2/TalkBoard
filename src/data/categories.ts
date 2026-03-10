import type { SymbolCategory, SymbolCategoryId } from '@/types';

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    id: 'people',
    label: 'People',
    icon: '👤',
    color: '#FF6B6B',
    description: 'Pronouns, names, and people references',
    order: 0,
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: '🏃',
    color: '#4ECDC4',
    description: 'Verbs and action words',
    order: 1,
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: '🍎',
    color: '#FFE66D',
    description: 'Food, drinks, and mealtime words',
    order: 2,
  },
  {
    id: 'feelings',
    label: 'Feelings',
    icon: '😊',
    color: '#A78BFA',
    description: 'Emotions and states of being',
    order: 3,
  },
  {
    id: 'places',
    label: 'Places',
    icon: '🏠',
    color: '#F97316',
    description: 'Locations and destinations',
    order: 4,
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '📦',
    color: '#06B6D4',
    description: 'Common everyday objects',
    order: 5,
  },
  {
    id: 'social',
    label: 'Social',
    icon: '💬',
    color: '#EC4899',
    description: 'Greetings, manners, and social phrases',
    order: 6,
  },
  {
    id: 'time',
    label: 'Time',
    icon: '⏰',
    color: '#8B5CF6',
    description: 'Time references and temporal words',
    order: 7,
  },
  {
    id: 'descriptors',
    label: 'Descriptors',
    icon: '🎨',
    color: '#10B981',
    description: 'Adjectives, colors, sizes, and quantities',
    order: 8,
  },
  {
    id: 'questions',
    label: 'Questions',
    icon: '❓',
    color: '#F43F5E',
    description: 'Question words and interrogatives',
    order: 9,
  },
];

export const CATEGORY_MAP: Record<SymbolCategoryId, SymbolCategory> =
  SYMBOL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    },
    {} as Record<SymbolCategoryId, SymbolCategory>
  );

export function getCategoryColor(categoryId: SymbolCategoryId): string {
  return CATEGORY_MAP[categoryId]?.color ?? '#6B7280';
}

export function getCategoryLabel(categoryId: SymbolCategoryId): string {
  return CATEGORY_MAP[categoryId]?.label ?? 'Unknown';
}

export function getCategoryIcon(categoryId: SymbolCategoryId): string {
  return CATEGORY_MAP[categoryId]?.icon ?? '❓';
}
