import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';
import { act } from '@testing-library/react';

describe('uiStore', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({
        currentPage: 'home',
        ttsStatus: 'idle',
        toasts: [],
        isModalOpen: false,
        modalContent: null,
        isSidebarOpen: false,
        isAppLoading: false,
        isSearchOpen: false,
        isEditMode: false,
      });
    });
  });

  describe('currentPage', () => {
    it('should default to home', () => {
      expect(useUIStore.getState().currentPage).toBe('home');
    });

    it('should update current page', () => {
      act(() => {
        useUIStore.getState().setCurrentPage('settings');
      });
      expect(useUIStore.getState().currentPage).toBe('settings');
    });
  });

  describe('sidebar', () => {
    it('should start closed', () => {
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should toggle sidebar', () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
      });
      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      act(() => {
        useUIStore.getState().toggleSidebar();
      });
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should close sidebar', () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
      });
      act(() => {
        useUIStore.getState().setSidebarOpen(false);
      });
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('toasts', () => {
    it('should start with empty toasts', () => {
      expect(useUIStore.getState().toasts).toEqual([]);
    });

    it('should add a toast', () => {
      act(() => {
        useUIStore.getState().addToast('Test message', 'success');
      });
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('success');
    });

    it('should cap toasts at 5', () => {
      act(() => {
        for (let i = 0; i < 8; i++) {
          useUIStore.getState().addToast(`Toast ${i}`, 'info');
        }
      });
      expect(useUIStore.getState().toasts.length).toBeLessThanOrEqual(5);
    });

    it('should remove a toast', () => {
      act(() => {
        useUIStore.getState().addToast('Test', 'success');
      });
      const id = useUIStore.getState().toasts[0].id;
      act(() => {
        useUIStore.getState().removeToast(id);
      });
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('modal', () => {
    it('should start closed', () => {
      expect(useUIStore.getState().isModalOpen).toBe(false);
      expect(useUIStore.getState().modalContent).toBeNull();
    });

    it('should open modal with content', () => {
      const content = {
        title: 'Test Modal',
        message: 'Are you sure?',
        onConfirm: vi.fn(),
      };
      act(() => {
        useUIStore.getState().openModal(content);
      });
      expect(useUIStore.getState().isModalOpen).toBe(true);
      expect(useUIStore.getState().modalContent?.title).toBe('Test Modal');
    });

    it('should close modal', () => {
      act(() => {
        useUIStore.getState().openModal({
          title: 'Test',
          message: 'Test',
          onConfirm: vi.fn(),
        });
      });
      act(() => {
        useUIStore.getState().closeModal();
      });
      expect(useUIStore.getState().isModalOpen).toBe(false);
    });
  });

  describe('TTS status', () => {
    it('should start idle', () => {
      expect(useUIStore.getState().ttsStatus).toBe('idle');
    });

    it('should update TTS status', () => {
      act(() => {
        useUIStore.getState().setTTSStatus('speaking');
      });
      expect(useUIStore.getState().ttsStatus).toBe('speaking');
    });
  });

  describe('loading', () => {
    it('should start not loading', () => {
      expect(useUIStore.getState().isAppLoading).toBe(false);
    });

    it('should toggle loading', () => {
      act(() => {
        useUIStore.getState().setAppLoading(true);
      });
      expect(useUIStore.getState().isAppLoading).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('should start disabled', () => {
      expect(useUIStore.getState().isEditMode).toBe(false);
    });

    it('should toggle edit mode', () => {
      act(() => {
        useUIStore.getState().setEditMode(true);
      });
      expect(useUIStore.getState().isEditMode).toBe(true);
    });
  });
});
