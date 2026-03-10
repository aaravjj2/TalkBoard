import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ttsService } from '@/services/ttsService';

describe('ttsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize without error', async () => {
      await expect(ttsService.init()).resolves.not.toThrow();
    });

    it('should report as supported after init', async () => {
      await ttsService.init();
      expect(ttsService.isSupported()).toBe(true);
    });
  });

  describe('speak', () => {
    it('should call speechSynthesis.speak', async () => {
      await ttsService.init();
      ttsService.speak('Hello world');
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should cancel previous speech before speaking', async () => {
      await ttsService.init();
      ttsService.speak('Hello');
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should call speechSynthesis.cancel', () => {
      ttsService.cancel();
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should call speechSynthesis.pause when speaking', () => {
      Object.defineProperty(window.speechSynthesis, 'speaking', { value: true, writable: true });
      ttsService.pause();
      expect(window.speechSynthesis.pause).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('should call speechSynthesis.resume when paused', () => {
      Object.defineProperty(window.speechSynthesis, 'paused', { value: true, writable: true });
      ttsService.resume();
      expect(window.speechSynthesis.resume).toHaveBeenCalled();
    });
  });

  describe('getVoices', () => {
    it('should return available voices', () => {
      const voices = ttsService.getVoices();
      expect(Array.isArray(voices)).toBe(true);
    });
  });

  describe('getEnglishVoices', () => {
    it('should return only English voices', () => {
      const mockVoices = [
        { name: 'English', lang: 'en-US', voiceURI: 'en1', default: true, localService: true },
        { name: 'French', lang: 'fr-FR', voiceURI: 'fr1', default: false, localService: true },
      ];
      vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue(
        mockVoices as unknown as SpeechSynthesisVoice[]
      );
      const voices = ttsService.getEnglishVoices();
      expect(voices.every((v) => v.lang.startsWith('en'))).toBe(true);
    });
  });
});
