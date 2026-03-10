import { useEffect, useCallback, useRef } from 'react';
import { ttsService, type TTSOptions } from '@/services/ttsService';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';

export function useTTS() {
  const { ttsStatus, setTTSStatus, setCurrentUtterance, addToast } =
    useUIStore();
  const { settings } = useUserStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      ttsService.init().catch(console.warn);
      initializedRef.current = true;
    }
  }, []);

  const speak = useCallback(
    (text: string, overrides?: Partial<TTSOptions>) => {
      if (!text.trim()) return;
      if (!ttsService.isSupported()) {
        addToast('Text-to-speech is not supported in this browser', 'warning');
        return;
      }

      setTTSStatus('speaking');
      setCurrentUtterance(text);

      ttsService.speak(text, {
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
          addToast('Speech failed', 'error');
        },
        ...overrides,
      });
    },
    [settings, setTTSStatus, setCurrentUtterance, addToast]
  );

  const stop = useCallback(() => {
    ttsService.cancel();
    setTTSStatus('idle');
    setCurrentUtterance('');
  }, [setTTSStatus, setCurrentUtterance]);

  const pause = useCallback(() => {
    ttsService.pause();
    setTTSStatus('paused');
  }, [setTTSStatus]);

  const resume = useCallback(() => {
    ttsService.resume();
    setTTSStatus('speaking');
  }, [setTTSStatus]);

  const getVoices = useCallback(() => ttsService.getVoices(), []);
  const getEnglishVoices = useCallback(() => ttsService.getEnglishVoices(), []);

  return {
    ttsStatus,
    isSpeaking: ttsStatus === 'speaking',
    isPaused: ttsStatus === 'paused',
    isSupported: ttsService.isSupported(),
    speak,
    stop,
    pause,
    resume,
    getVoices,
    getEnglishVoices,
  };
}
