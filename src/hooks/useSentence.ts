import { useCallback, useRef } from 'react';
import { useSymbolStore } from '@/stores/symbolStore';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { generateSentenceWithRetry } from '@/services/aiService';
import { ttsService } from '@/services/ttsService';
import type { AACSymbol } from '@/types';

export function useSentence() {
  const {
    selectedSymbols,
    generatedSentence,
    aiStatus,
    aiError,
    setGeneratedSentence,
    setAIStatus,
    setAIError,
    addToHistory,
    clearSymbols,
  } = useSymbolStore();

  const { settings, addQuickPhrase } = useUserStore();
  const { setTTSStatus, setCurrentUtterance, addToast } = useUIStore();
  const abortRef = useRef<AbortController | null>(null);

  const generateSentenceFromSymbols = useCallback(async () => {
    if (selectedSymbols.length === 0) return;

    setAIStatus('loading');
    setAIError(null);

    try {
      const symbols: AACSymbol[] = selectedSymbols.map(
        ({ instanceId, selectedAt, ...symbol }) => symbol
      );
      const response = await generateSentenceWithRetry(symbols);
      setGeneratedSentence(response.sentence);
      setAIStatus('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate sentence';
      setAIError({ message, code: 'GENERATION_FAILED' });
      setAIStatus('error');
      addToast(message, 'error');
    }
  }, [
    selectedSymbols,
    setAIStatus,
    setAIError,
    setGeneratedSentence,
    addToast,
  ]);

  const speakSentence = useCallback(
    (text?: string) => {
      const sentence = text || generatedSentence;
      if (!sentence) return;

      setTTSStatus('speaking');
      setCurrentUtterance(sentence);

      ttsService.speak(sentence, {
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        volume: settings.voiceVolume,
        voiceURI: settings.selectedVoiceURI || undefined,
        onEnd: () => {
          setTTSStatus('idle');
          setCurrentUtterance('');
        },
        onError: () => {
          setTTSStatus('error');
          setCurrentUtterance('');
          addToast('Speech synthesis failed', 'error');
        },
      });
    },
    [generatedSentence, settings, setTTSStatus, setCurrentUtterance, addToast]
  );

  const speakAndSave = useCallback(async () => {
    if (selectedSymbols.length === 0) return;

    // Generate if not already generated
    if (!generatedSentence) {
      await generateSentenceFromSymbols();
    }

    const sentence =
      generatedSentence ||
      selectedSymbols.map((s) => s.label).join(' ');

    // Speak
    speakSentence(sentence);

    // Save to history
    addToHistory({
      symbols: selectedSymbols.map((s) => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
      })),
      sentence,
      spokenAt: new Date().toISOString(),
      isFavorite: false,
    });

    // Auto-save as quick phrase if settings allow
    if (settings.autoSaveQuickPhrases) {
      addQuickPhrase(
        sentence,
        selectedSymbols.map((s) => s.id)
      );
    }
  }, [
    selectedSymbols,
    generatedSentence,
    generateSentenceFromSymbols,
    speakSentence,
    addToHistory,
    addQuickPhrase,
    settings.autoSaveQuickPhrases,
  ]);

  const stopSpeaking = useCallback(() => {
    ttsService.cancel();
    setTTSStatus('idle');
    setCurrentUtterance('');
  }, [setTTSStatus, setCurrentUtterance]);

  const clearAndReset = useCallback(() => {
    stopSpeaking();
    clearSymbols();
  }, [stopSpeaking, clearSymbols]);

  return {
    // State
    selectedSymbols,
    generatedSentence,
    aiStatus,
    aiError,

    // Actions
    generateSentenceFromSymbols,
    speakSentence,
    speakAndSave,
    stopSpeaking,
    clearAndReset,
    setGeneratedSentence,
  };
}
