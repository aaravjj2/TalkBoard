/**
 * AI Service — Handles communication with Claude API for symbol-to-sentence conversion.
 * Uses the Anthropic Messages API to convert symbol sequences into natural language.
 */

import { AI_CONFIG } from '@/constants';
import type { AIRequest, AIResponse, AACSymbol } from '@/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey(): string {
  const key = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!key) {
    throw new Error(
      'VITE_CLAUDE_API_KEY is not set. Please add it to your .env file.'
    );
  }
  return key;
}

function buildPrompt(symbols: AACSymbol[]): string {
  const symbolDescriptions = symbols
    .map((s, i) => `${i + 1}. "${s.label}" (${s.category})`)
    .join('\n');

  return `Convert these AAC symbols into a natural, grammatically correct sentence that a person might say. Keep it simple and conversational.

Symbols selected (in order):
${symbolDescriptions}

Rules:
- Output ONLY the sentence, nothing else
- Use simple, everyday language
- Add appropriate articles (a, the), prepositions, and verb conjugations
- Keep the meaning faithful to the symbol sequence
- If symbols don't form a clear sentence, make the best reasonable interpretation
- Maximum 1-2 sentences`;
}

export async function generateSentence(
  symbols: AACSymbol[]
): Promise<AIResponse> {
  if (symbols.length === 0) {
    return {
      sentence: '',
      confidence: 0,
      alternatives: [],
    };
  }

  // For simple 1-2 symbol cases, use local generation
  if (symbols.length <= 2) {
    return generateLocally(symbols);
  }

  const apiKey = getApiKey();
  const prompt = buildPrompt(symbols);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      system: AI_CONFIG.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `AI API error (${response.status}): ${
        (errorData as { error?: { message?: string } }).error?.message ||
        response.statusText
      }`
    );
  }

  const data = await response.json();
  const sentence =
    data.content?.[0]?.text?.trim() || fallbackSentence(symbols);

  return {
    sentence,
    confidence: 0.9,
    alternatives: [],
  };
}

export async function generateSentenceWithRetry(
  symbols: AACSymbol[],
  maxRetries: number = AI_CONFIG.retryAttempts
): Promise<AIResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateSentence(symbols);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, AI_CONFIG.retryDelay * (attempt + 1))
        );
      }
    }
  }

  // Fallback to local generation
  console.warn('AI API failed, using local fallback:', lastError?.message);
  return generateLocally(symbols);
}

function generateLocally(symbols: AACSymbol[]): AIResponse {
  const sentence = fallbackSentence(symbols);
  return {
    sentence,
    confidence: 0.6,
    alternatives: [],
  };
}

function fallbackSentence(symbols: AACSymbol[]): string {
  if (symbols.length === 0) return '';
  if (symbols.length === 1) return symbols[0].label;

  // Simple rule-based sentence construction
  const labels = symbols.map((s) => s.label.toLowerCase());

  // Person + Action patterns
  const personSymbols = symbols.filter((s) => s.category === 'people');
  const actionSymbols = symbols.filter((s) => s.category === 'actions');
  const objectSymbols = symbols.filter(
    (s) =>
      s.category === 'food' ||
      s.category === 'objects' ||
      s.category === 'places'
  );
  const feelingSymbols = symbols.filter((s) => s.category === 'feelings');
  const socialSymbols = symbols.filter((s) => s.category === 'social');
  const descriptorSymbols = symbols.filter(
    (s) => s.category === 'descriptors'
  );
  const questionSymbols = symbols.filter((s) => s.category === 'questions');

  const parts: string[] = [];

  // Handle questions
  if (questionSymbols.length > 0) {
    parts.push(questionSymbols[0].label);
    if (personSymbols.length > 0) parts.push(personSymbols[0].label);
    if (actionSymbols.length > 0) parts.push(actionSymbols[0].label);
    if (objectSymbols.length > 0) parts.push(objectSymbols[0].label);
    return parts.join(' ') + '?';
  }

  // Handle social phrases
  if (socialSymbols.length > 0 && symbols.length <= 2) {
    return socialSymbols.map((s) => s.label).join(', ');
  }

  // Build sentence from subject-verb-object pattern
  if (personSymbols.length > 0) parts.push(personSymbols[0].label);
  if (feelingSymbols.length > 0) {
    parts.push(personSymbols.length > 0 ? 'am' : '');
    parts.push(feelingSymbols[0].label);
  }
  if (actionSymbols.length > 0) parts.push(actionSymbols[0].label);
  if (descriptorSymbols.length > 0) parts.push(descriptorSymbols[0].label);
  if (objectSymbols.length > 0) parts.push(objectSymbols[0].label);

  // If no structured parts, just join labels
  if (parts.filter(Boolean).length === 0) {
    return labels.join(' ');
  }

  let sentence = parts.filter(Boolean).join(' ');
  // Capitalize first letter
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

  return sentence;
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
