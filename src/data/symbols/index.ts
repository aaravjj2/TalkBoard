import type { AACSymbol, SymbolCategoryId } from '@/types';
import { PEOPLE_SYMBOLS } from './people';
import { ACTIONS_SYMBOLS } from './actions';
import { FOOD_SYMBOLS } from './food';
import { FEELINGS_SYMBOLS } from './feelings';
import { PLACES_SYMBOLS } from './places';
import { OBJECTS_SYMBOLS } from './objects';
import { SOCIAL_SYMBOLS } from './social';
import { TIME_SYMBOLS } from './time';
import { DESCRIPTORS_SYMBOLS } from './descriptors';
import { QUESTIONS_SYMBOLS } from './questions';

export const ALL_SYMBOLS: AACSymbol[] = [
  ...PEOPLE_SYMBOLS,
  ...ACTIONS_SYMBOLS,
  ...FOOD_SYMBOLS,
  ...FEELINGS_SYMBOLS,
  ...PLACES_SYMBOLS,
  ...OBJECTS_SYMBOLS,
  ...SOCIAL_SYMBOLS,
  ...TIME_SYMBOLS,
  ...DESCRIPTORS_SYMBOLS,
  ...QUESTIONS_SYMBOLS,
];

export const SYMBOLS_BY_CATEGORY: Record<SymbolCategoryId, AACSymbol[]> = {
  people: PEOPLE_SYMBOLS,
  actions: ACTIONS_SYMBOLS,
  food: FOOD_SYMBOLS,
  feelings: FEELINGS_SYMBOLS,
  places: PLACES_SYMBOLS,
  objects: OBJECTS_SYMBOLS,
  social: SOCIAL_SYMBOLS,
  time: TIME_SYMBOLS,
  descriptors: DESCRIPTORS_SYMBOLS,
  questions: QUESTIONS_SYMBOLS,
};

export const SYMBOL_MAP: Record<string, AACSymbol> = ALL_SYMBOLS.reduce(
  (map, symbol) => {
    map[symbol.id] = symbol;
    return map;
  },
  {} as Record<string, AACSymbol>
);

export function getSymbolById(id: string): AACSymbol | undefined {
  return SYMBOL_MAP[id];
}

export function getSymbolsByCategory(categoryId: SymbolCategoryId): AACSymbol[] {
  return SYMBOLS_BY_CATEGORY[categoryId] ?? [];
}

export function searchSymbols(query: string): AACSymbol[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return ALL_SYMBOLS.filter(
    (symbol) =>
      symbol.label.toLowerCase().includes(lowerQuery) ||
      symbol.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
  );
}

export {
  PEOPLE_SYMBOLS,
  ACTIONS_SYMBOLS,
  FOOD_SYMBOLS,
  FEELINGS_SYMBOLS,
  PLACES_SYMBOLS,
  OBJECTS_SYMBOLS,
  SOCIAL_SYMBOLS,
  TIME_SYMBOLS,
  DESCRIPTORS_SYMBOLS,
  QUESTIONS_SYMBOLS,
};
