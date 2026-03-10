/**
 * TTS Service — Wraps the Web Speech API for text-to-speech functionality.
 * Provides voice selection, rate/pitch/volume control, and speaking queue.
 */

import { TTS_CONFIG } from '@/constants';

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onPause?: () => void;
  onResume?: () => void;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private voiceLoadPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized || !this.synth) return;
    this.voices = await this.loadVoices();
    this.isInitialized = true;
  }

  private loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (this.voiceLoadPromise) return this.voiceLoadPromise;

    this.voiceLoadPromise = new Promise((resolve) => {
      if (!this.synth) {
        resolve([]);
        return;
      }

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      const handler = () => {
        const v = this.synth!.getVoices();
        resolve(v);
        this.synth!.removeEventListener('voiceschanged', handler);
      };
      this.synth.addEventListener('voiceschanged', handler);

      // Timeout fallback
      setTimeout(() => {
        if (this.synth) {
          resolve(this.synth.getVoices());
        } else {
          resolve([]);
        }
      }, 2000);
    });

    return this.voiceLoadPromise;
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith('en'));
  }

  getVoiceByURI(uri: string): SpeechSynthesisVoice | undefined {
    return this.voices.find((v) => v.voiceURI === uri);
  }

  getDefaultVoice(): SpeechSynthesisVoice | undefined {
    const english = this.getEnglishVoices();
    return (
      english.find((v) => v.default) ||
      english.find((v) => v.lang === 'en-US') ||
      english[0] ||
      this.voices[0]
    );
  }

  speak(text: string, options: TTSOptions = {}): void {
    if (!this.synth || !text.trim()) return;

    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    if (options.voiceURI) {
      const voice = this.getVoiceByURI(options.voiceURI);
      if (voice) utterance.voice = voice;
    } else {
      const defaultVoice = this.getDefaultVoice();
      if (defaultVoice) utterance.voice = defaultVoice;
    }

    // Set properties with bounds checking
    utterance.rate = Math.max(
      TTS_CONFIG.minRate,
      Math.min(TTS_CONFIG.maxRate, options.rate ?? TTS_CONFIG.defaultRate)
    );
    utterance.pitch = Math.max(
      TTS_CONFIG.minPitch,
      Math.min(TTS_CONFIG.maxPitch, options.pitch ?? TTS_CONFIG.defaultPitch)
    );
    utterance.volume = Math.max(
      0,
      Math.min(1, options.volume ?? TTS_CONFIG.defaultVolume)
    );
    utterance.lang = options.lang || 'en-US';

    // Event handlers
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;
    if (options.onBoundary) utterance.onboundary = options.onBoundary;
    if (options.onPause) utterance.onpause = options.onPause;
    if (options.onResume) utterance.onresume = options.onResume;

    this.synth.speak(utterance);
  }

  cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  isPaused(): boolean {
    return this.synth?.paused ?? false;
  }
}

// Singleton
export const ttsService = new TTSService();
