import { create } from 'zustand';
import type { Toast, TTSStatus, AppPage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UIState {
  // Navigation
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  // TTS
  ttsStatus: TTSStatus;
  setTTSStatus: (status: TTSStatus) => void;
  currentUtterance: string;
  setCurrentUtterance: (text: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal
  isModalOpen: boolean;
  modalContent: {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
  } | null;
  openModal: (content: NonNullable<UIState['modalContent']>) => void;
  closeModal: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Loading
  isAppLoading: boolean;
  setAppLoading: (loading: boolean) => void;

  // Search overlay
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Symbol edit mode (caregiver)
  isEditMode: boolean;
  setEditMode: (editing: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Navigation
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),

  // TTS
  ttsStatus: 'idle',
  setTTSStatus: (status) => set({ ttsStatus: status }),
  currentUtterance: '',
  setCurrentUtterance: (text) => set({ currentUtterance: text }),

  // Toasts
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: uuidv4(), message, type, duration },
      ].slice(-5),
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),

  // Modal
  isModalOpen: false,
  modalContent: null,
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Loading
  isAppLoading: false,
  setAppLoading: (loading) => set({ isAppLoading: loading }),

  // Search
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  // Edit mode
  isEditMode: false,
  setEditMode: (editing) => set({ isEditMode: editing }),
}));
