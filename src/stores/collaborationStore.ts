// ─── Collaboration Store ────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CollaboratorProfile,
  TeamMember,
  SharedBoard,
  CollaborationActivity,
  Comment,
  Feedback,
  CollaborationMessage,
  Invitation,
  CollaborationSettings,
  CollaborationRole,
  BoardVisibility,
  MessageType,
} from '../types/collaboration';
import { collaborationService } from '../services/collaborationService';

interface CollaborationState {
  currentUser: CollaboratorProfile | null;
  teamMembers: TeamMember[];
  sharedBoards: SharedBoard[];
  activities: CollaborationActivity[];
  comments: Comment[];
  feedback: Feedback[];
  messages: CollaborationMessage[];
  invitations: Invitation[];
  settings: CollaborationSettings;
  unreadCount: number;
  activeTab: string;
  isInitialized: boolean;
  error: string | null;
}

interface CollaborationActions {
  initialize: () => void;
  refresh: () => void;

  // Members
  addMember: (name: string, email: string, role: CollaborationRole) => void;
  updateMemberRole: (id: string, role: CollaborationRole) => void;
  removeMember: (id: string) => void;

  // Boards
  createBoard: (name: string, description: string, visibility: BoardVisibility) => void;
  updateBoard: (id: string, updates: Partial<SharedBoard>) => void;
  deleteBoard: (id: string) => void;
  toggleStarBoard: (id: string) => void;

  // Comments
  addComment: (boardId: string, content: string, targetType?: 'symbol' | 'phrase' | 'board', targetId?: string) => void;
  resolveComment: (id: string) => void;

  // Messages
  sendMessage: (recipientId: string, content: string, type?: MessageType) => void;
  markMessageRead: (id: string) => void;

  // Feedback
  markFeedbackRead: (id: string) => void;

  // Invitations
  createInvitation: (boardId: string, boardName: string, email: string, role: CollaborationRole, message?: string) => void;
  cancelInvitation: (id: string) => void;

  // Settings
  updateSettings: (updates: Partial<CollaborationSettings>) => void;

  // UI
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

export const useCollaborationStore = create<CollaborationState & CollaborationActions>()(
  persist(
    (set, get) => ({
      currentUser: null,
      teamMembers: [],
      sharedBoards: [],
      activities: [],
      comments: [],
      feedback: [],
      messages: [],
      invitations: [],
      settings: collaborationService.getSettings(),
      unreadCount: 0,
      activeTab: 'activity',
      isInitialized: false,
      error: null,

      initialize: () => {
        try {
          set({
            currentUser: collaborationService.getCurrentUser(),
            teamMembers: collaborationService.getTeamMembers(),
            sharedBoards: collaborationService.getSharedBoards(),
            activities: collaborationService.getActivities(),
            comments: collaborationService.getComments(),
            feedback: collaborationService.getFeedback(),
            messages: collaborationService.getMessages(),
            invitations: collaborationService.getInvitations(),
            settings: collaborationService.getSettings(),
            unreadCount: collaborationService.getUnreadCount(),
            isInitialized: true,
            error: null,
          });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Failed to initialize collaboration' });
        }
      },

      refresh: () => get().initialize(),

      addMember: (name, email, role) => {
        const member = collaborationService.addTeamMember(name, email, role);
        set({
          teamMembers: [...get().teamMembers, member],
          activities: collaborationService.getActivities(),
        });
      },

      updateMemberRole: (id, role) => {
        const updated = collaborationService.updateMemberRole(id, role);
        if (updated) {
          set({ teamMembers: get().teamMembers.map(m => m.id === id ? updated : m) });
        }
      },

      removeMember: (id) => {
        if (collaborationService.removeMember(id)) {
          set({
            teamMembers: get().teamMembers.filter(m => m.id !== id),
            activities: collaborationService.getActivities(),
          });
        }
      },

      createBoard: (name, description, visibility) => {
        const board = collaborationService.createSharedBoard(name, description, visibility);
        set({
          sharedBoards: [...get().sharedBoards, board],
          activities: collaborationService.getActivities(),
        });
      },

      updateBoard: (id, updates) => {
        const updated = collaborationService.updateBoard(id, updates);
        if (updated) {
          set({ sharedBoards: get().sharedBoards.map(b => b.id === id ? updated : b) });
        }
      },

      deleteBoard: (id) => {
        if (collaborationService.deleteBoard(id)) {
          set({ sharedBoards: get().sharedBoards.filter(b => b.id !== id) });
        }
      },

      toggleStarBoard: (id) => {
        collaborationService.toggleStarBoard(id);
        set({
          sharedBoards: get().sharedBoards.map(b =>
            b.id === id ? { ...b, isStarred: !b.isStarred } : b
          ),
        });
      },

      addComment: (boardId, content, targetType, targetId) => {
        const comment = collaborationService.addComment(boardId, content, targetType, targetId);
        set({
          comments: [comment, ...get().comments],
          activities: collaborationService.getActivities(),
        });
      },

      resolveComment: (id) => {
        if (collaborationService.resolveComment(id)) {
          set({ comments: get().comments.map(c => c.id === id ? { ...c, isResolved: true } : c) });
        }
      },

      sendMessage: (recipientId, content, type) => {
        const msg = collaborationService.sendMessage(recipientId, content, type);
        set({ messages: [msg, ...get().messages] });
      },

      markMessageRead: (id) => {
        collaborationService.markMessageRead(id);
        set({
          messages: get().messages.map(m => m.id === id ? { ...m, isRead: true } : m),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });
      },

      markFeedbackRead: (id) => {
        collaborationService.markFeedbackRead(id);
        set({
          feedback: get().feedback.map(f => f.id === id ? { ...f, isRead: true } : f),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });
      },

      createInvitation: (boardId, boardName, email, role, message) => {
        const inv = collaborationService.createInvitation(boardId, boardName, email, role, message);
        set({ invitations: [...get().invitations, inv] });
      },

      cancelInvitation: (id) => {
        if (collaborationService.cancelInvitation(id)) {
          set({ invitations: get().invitations.filter(i => i.id !== id) });
        }
      },

      updateSettings: (updates) => {
        const settings = collaborationService.updateSettings(updates);
        set({ settings });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'talkboard-collaboration',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
