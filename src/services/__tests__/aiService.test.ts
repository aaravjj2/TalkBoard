import { describe, it, expect, vi } from 'vitest';
import { fallbackSentence } from '@/services/aiService';
import type { AACSymbol } from '@/types';

const makeSymbol = (id: string, label: string, category: string): AACSymbol => ({
  id,
  label,
  emoji: '🧪',
  category: category as AACSymbol['category'],
  keywords: [],
  order: 0,
});

describe('aiService — fallbackSentence', () => {
  it('should return a sentence from symbols', () => {
    const symbols = [
      makeSymbol('1', 'I', 'people'),
      makeSymbol('2', 'want', 'actions'),
      makeSymbol('3', 'food', 'food'),
    ];
    const sentence = fallbackSentence(symbols);
    expect(typeof sentence).toBe('string');
    expect(sentence.length).toBeGreaterThan(0);
  });

  it('should handle single symbol', () => {
    const symbols = [makeSymbol('1', 'hello', 'social')];
    const sentence = fallbackSentence(symbols);
    expect(typeof sentence).toBe('string');
    expect(sentence.length).toBeGreaterThan(0);
  });

  it('should handle empty array', () => {
    const sentence = fallbackSentence([]);
    expect(typeof sentence).toBe('string');
  });

  it('should capitalize first letter', () => {
    const symbols = [
      makeSymbol('1', 'i', 'people'),
      makeSymbol('2', 'run', 'actions'),
    ];
    const sentence = fallbackSentence(symbols);
    expect(sentence[0]).toBe(sentence[0].toUpperCase());
  });

  it('should end with ? for question symbols', () => {
    const symbols = [
      makeSymbol('1', 'where', 'questions'),
      makeSymbol('2', 'food', 'food'),
    ];
    const sentence = fallbackSentence(symbols);
    expect(sentence.endsWith('?')).toBe(true);
  });
});
