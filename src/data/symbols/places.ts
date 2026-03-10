import type { AACSymbol } from '@/types';

const now = new Date().toISOString();

export const PLACES_SYMBOLS: AACSymbol[] = [
  { id: 'places-home', label: 'home', icon: '🏠', categoryId: 'places', keywords: ['home', 'house', 'my place'], order: 0, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-school', label: 'school', icon: '🏫', categoryId: 'places', keywords: ['school', 'class', 'classroom'], order: 1, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-park', label: 'park', icon: '🌳', categoryId: 'places', keywords: ['park', 'playground', 'outside'], order: 2, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-store', label: 'store', icon: '🏪', categoryId: 'places', keywords: ['store', 'shop', 'market'], order: 3, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-hospital', label: 'hospital', icon: '🏥', categoryId: 'places', keywords: ['hospital', 'clinic', 'medical'], order: 4, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-bathroom', label: 'bathroom', icon: '🚻', categoryId: 'places', keywords: ['bathroom', 'restroom', 'toilet'], order: 5, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-bedroom', label: 'bedroom', icon: '🛏️', categoryId: 'places', keywords: ['bedroom', 'bed', 'room'], order: 6, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-kitchen', label: 'kitchen', icon: '🍳', categoryId: 'places', keywords: ['kitchen', 'cook', 'food area'], order: 7, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-outside', label: 'outside', icon: '🌤️', categoryId: 'places', keywords: ['outside', 'outdoors', 'yard'], order: 8, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-car', label: 'car', icon: '🚗', categoryId: 'places', keywords: ['car', 'vehicle', 'ride', 'drive'], order: 9, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-bus', label: 'bus', icon: '🚌', categoryId: 'places', keywords: ['bus', 'transport', 'school bus'], order: 10, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-restaurant', label: 'restaurant', icon: '🍽️', categoryId: 'places', keywords: ['restaurant', 'eat out', 'dining'], order: 11, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-library', label: 'library', icon: '📚', categoryId: 'places', keywords: ['library', 'books', 'reading'], order: 12, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-pool', label: 'pool', icon: '🏊', categoryId: 'places', keywords: ['pool', 'swimming', 'swim'], order: 13, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-gym', label: 'gym', icon: '🏋️', categoryId: 'places', keywords: ['gym', 'exercise', 'workout'], order: 14, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-church', label: 'church', icon: '⛪', categoryId: 'places', keywords: ['church', 'temple', 'worship'], order: 15, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-mall', label: 'mall', icon: '🏬', categoryId: 'places', keywords: ['mall', 'shopping center'], order: 16, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-beach', label: 'beach', icon: '🏖️', categoryId: 'places', keywords: ['beach', 'ocean', 'sand', 'sea'], order: 17, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-here', label: 'here', icon: '📍', categoryId: 'places', keywords: ['here', 'this place', 'right here'], order: 18, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-there', label: 'there', icon: '👉', categoryId: 'places', keywords: ['there', 'that place', 'over there'], order: 19, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-inside', label: 'inside', icon: '🏠', categoryId: 'places', keywords: ['inside', 'indoors', 'in'], order: 20, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-upstairs', label: 'upstairs', icon: '⬆️', categoryId: 'places', keywords: ['upstairs', 'up', 'above'], order: 21, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-downstairs', label: 'downstairs', icon: '⬇️', categoryId: 'places', keywords: ['downstairs', 'down', 'below'], order: 22, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-living-room', label: 'living room', icon: '🛋️', categoryId: 'places', keywords: ['living room', 'lounge', 'family room'], order: 23, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'places-yard', label: 'yard', icon: '🌿', categoryId: 'places', keywords: ['yard', 'garden', 'backyard', 'front yard'], order: 24, isCustom: false, createdAt: now, updatedAt: now },
];
