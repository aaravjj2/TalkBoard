import type { AACSymbol } from '@/types';

const now = new Date().toISOString();

export const TIME_SYMBOLS: AACSymbol[] = [
  { id: 'time-now', label: 'now', icon: '⏰', categoryId: 'time', keywords: ['now', 'right now', 'immediately', 'currently'], order: 0, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-later', label: 'later', icon: '🕐', categoryId: 'time', keywords: ['later', 'after', 'soon', 'in a while'], order: 1, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-today', label: 'today', icon: '📅', categoryId: 'time', keywords: ['today', 'this day'], order: 2, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-tomorrow', label: 'tomorrow', icon: '📅', categoryId: 'time', keywords: ['tomorrow', 'next day'], order: 3, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-yesterday', label: 'yesterday', icon: '📅', categoryId: 'time', keywords: ['yesterday', 'last day', 'before today'], order: 4, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-morning', label: 'morning', icon: '🌅', categoryId: 'time', keywords: ['morning', 'early', 'sunrise'], order: 5, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-afternoon', label: 'afternoon', icon: '☀️', categoryId: 'time', keywords: ['afternoon', 'midday', 'daytime'], order: 6, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-evening', label: 'evening', icon: '🌆', categoryId: 'time', keywords: ['evening', 'night', 'sunset'], order: 7, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-night', label: 'night', icon: '🌙', categoryId: 'time', keywords: ['night', 'dark', 'bedtime'], order: 8, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-before', label: 'before', icon: '⏪', categoryId: 'time', keywords: ['before', 'earlier', 'prior'], order: 9, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-after', label: 'after', icon: '⏩', categoryId: 'time', keywords: ['after', 'following', 'next'], order: 10, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-soon', label: 'soon', icon: '⏳', categoryId: 'time', keywords: ['soon', 'shortly', 'in a minute'], order: 11, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-always', label: 'always', icon: '♾️', categoryId: 'time', keywords: ['always', 'every time', 'forever'], order: 12, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-never', label: 'never', icon: '🚫', categoryId: 'time', keywords: ['never', 'not ever', 'no way'], order: 13, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-sometimes', label: 'sometimes', icon: '🔄', categoryId: 'time', keywords: ['sometimes', 'occasionally', 'once in a while'], order: 14, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-again', label: 'again', icon: '🔁', categoryId: 'time', keywords: ['again', 'repeat', 'one more time'], order: 15, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-first', label: 'first', icon: '1️⃣', categoryId: 'time', keywords: ['first', 'beginning', 'start'], order: 16, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-then', label: 'then', icon: '2️⃣', categoryId: 'time', keywords: ['then', 'next', 'afterward'], order: 17, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-last', label: 'last', icon: '🔚', categoryId: 'time', keywords: ['last', 'final', 'end'], order: 18, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-wait', label: 'wait', icon: '✋', categoryId: 'time', keywords: ['wait', 'hold on', 'moment'], order: 19, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-hurry', label: 'hurry', icon: '⚡', categoryId: 'time', keywords: ['hurry', 'quick', 'fast', 'rush'], order: 20, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-slowly', label: 'slowly', icon: '🐌', categoryId: 'time', keywords: ['slowly', 'slow', 'take your time'], order: 21, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-already', label: 'already', icon: '✓', categoryId: 'time', keywords: ['already', 'done', 'finished'], order: 22, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-not-yet', label: 'not yet', icon: '⏸️', categoryId: 'time', keywords: ['not yet', 'still waiting', 'pending'], order: 23, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'time-weekend', label: 'weekend', icon: '🎉', categoryId: 'time', keywords: ['weekend', 'saturday', 'sunday'], order: 24, isCustom: false, createdAt: now, updatedAt: now },
];
