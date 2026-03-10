import type { AACSymbol } from '@/types';

const now = new Date().toISOString();

export const QUESTIONS_SYMBOLS: AACSymbol[] = [
  { id: 'q-what', label: 'what', icon: '❓', categoryId: 'questions', keywords: ['what', 'which'], order: 0, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-where', label: 'where', icon: '📍', categoryId: 'questions', keywords: ['where', 'location', 'place'], order: 1, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-when', label: 'when', icon: '🕐', categoryId: 'questions', keywords: ['when', 'time', 'what time'], order: 2, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-who', label: 'who', icon: '🧑', categoryId: 'questions', keywords: ['who', 'which person', 'whom'], order: 3, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-why', label: 'why', icon: '🤔', categoryId: 'questions', keywords: ['why', 'reason', 'because'], order: 4, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-how', label: 'how', icon: '🔧', categoryId: 'questions', keywords: ['how', 'in what way', 'method'], order: 5, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-how-many', label: 'how many', icon: '🔢', categoryId: 'questions', keywords: ['how many', 'count', 'number'], order: 6, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-how-much', label: 'how much', icon: '💰', categoryId: 'questions', keywords: ['how much', 'price', 'amount'], order: 7, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-can-i', label: 'can I', icon: '🙋', categoryId: 'questions', keywords: ['can I', 'may I', 'am I allowed'], order: 8, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-do-you', label: 'do you', icon: '❓', categoryId: 'questions', keywords: ['do you', 'are you', 'will you'], order: 9, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-is-it', label: 'is it', icon: '❓', categoryId: 'questions', keywords: ['is it', 'is this', 'is that'], order: 10, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-whats-this', label: "what's this", icon: '👆', categoryId: 'questions', keywords: ['whats this', 'what is this', 'identify'], order: 11, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-whats-happening', label: "what's happening", icon: '👀', categoryId: 'questions', keywords: ['whats happening', 'going on', 'tell me'], order: 12, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-where-is', label: 'where is', icon: '🔍', categoryId: 'questions', keywords: ['where is', 'find', 'looking for'], order: 13, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-when-is', label: 'when is', icon: '📅', categoryId: 'questions', keywords: ['when is', 'what time', 'schedule'], order: 14, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-can-you', label: 'can you', icon: '🙏', categoryId: 'questions', keywords: ['can you', 'could you', 'would you'], order: 15, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-are-we', label: 'are we', icon: '👥', categoryId: 'questions', keywords: ['are we', 'will we', 'do we'], order: 16, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-whose', label: 'whose', icon: '🏷️', categoryId: 'questions', keywords: ['whose', 'who owns', 'belongs to'], order: 17, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-which', label: 'which', icon: '👈', categoryId: 'questions', keywords: ['which', 'which one', 'choose'], order: 18, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'q-because', label: 'because', icon: '💡', categoryId: 'questions', keywords: ['because', 'the reason is', 'since'], order: 19, isCustom: false, createdAt: now, updatedAt: now },
];
