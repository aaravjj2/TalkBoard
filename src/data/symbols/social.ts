import type { AACSymbol } from '@/types';

const now = new Date().toISOString();

export const SOCIAL_SYMBOLS: AACSymbol[] = [
  { id: 'social-hello', label: 'hello', icon: '👋', categoryId: 'social', keywords: ['hello', 'hi', 'hey', 'greetings'], order: 0, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-goodbye', label: 'goodbye', icon: '🫡', categoryId: 'social', keywords: ['goodbye', 'bye', 'see you', 'farewell'], order: 1, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-please', label: 'please', icon: '🙏', categoryId: 'social', keywords: ['please', 'kindly'], order: 2, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-thank-you', label: 'thank you', icon: '🤝', categoryId: 'social', keywords: ['thank you', 'thanks', 'grateful'], order: 3, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-sorry', label: 'sorry', icon: '😔', categoryId: 'social', keywords: ['sorry', 'apologize', 'my bad'], order: 4, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-yes', label: 'yes', icon: '✅', categoryId: 'social', keywords: ['yes', 'yeah', 'yep', 'okay', 'affirmative'], order: 5, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-no', label: 'no', icon: '❌', categoryId: 'social', keywords: ['no', 'nope', 'nah', 'negative'], order: 6, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-maybe', label: 'maybe', icon: '🤷', categoryId: 'social', keywords: ['maybe', 'perhaps', 'possibly'], order: 7, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-i-love-you', label: 'I love you', icon: '❤️', categoryId: 'social', keywords: ['love', 'I love you', 'affection'], order: 8, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-excuse-me', label: 'excuse me', icon: '🙋', categoryId: 'social', keywords: ['excuse me', 'pardon', 'attention'], order: 9, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-good-morning', label: 'good morning', icon: '🌅', categoryId: 'social', keywords: ['good morning', 'morning', 'sunrise'], order: 10, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-good-night', label: 'good night', icon: '🌙', categoryId: 'social', keywords: ['good night', 'night', 'bedtime'], order: 11, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-how-are-you', label: 'how are you', icon: '👋', categoryId: 'social', keywords: ['how are you', 'how do you do'], order: 12, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-i-m-fine', label: "I'm fine", icon: '👌', categoryId: 'social', keywords: ['fine', 'good', 'okay', 'alright'], order: 13, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-nice-to-meet-you', label: 'nice to meet you', icon: '🤝', categoryId: 'social', keywords: ['nice to meet', 'pleasure'], order: 14, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-youre-welcome', label: "you're welcome", icon: '😊', categoryId: 'social', keywords: ['welcome', 'no problem', 'my pleasure'], order: 15, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-great-job', label: 'great job', icon: '⭐', categoryId: 'social', keywords: ['great job', 'well done', 'awesome', 'good work'], order: 16, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-i-agree', label: 'I agree', icon: '👍', categoryId: 'social', keywords: ['agree', 'same', 'right', 'correct'], order: 17, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-i-disagree', label: 'I disagree', icon: '👎', categoryId: 'social', keywords: ['disagree', 'wrong', 'different opinion'], order: 18, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-my-turn', label: 'my turn', icon: '☝️', categoryId: 'social', keywords: ['my turn', 'me next'], order: 19, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-your-turn', label: 'your turn', icon: '👉', categoryId: 'social', keywords: ['your turn', 'you next', 'go ahead'], order: 20, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-whats-your-name', label: "what's your name", icon: '🏷️', categoryId: 'social', keywords: ['name', 'who are you', 'introduce'], order: 21, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-my-name-is', label: 'my name is', icon: '🏷️', categoryId: 'social', keywords: ['my name', 'I am', 'called'], order: 22, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-lets-play', label: "let's play", icon: '🎮', categoryId: 'social', keywords: ['play', 'game', 'fun', 'join'], order: 23, isCustom: false, createdAt: now, updatedAt: now },
  { id: 'social-can-i-join', label: 'can I join', icon: '🙋', categoryId: 'social', keywords: ['join', 'participate', 'include me'], order: 24, isCustom: false, createdAt: now, updatedAt: now },
];
