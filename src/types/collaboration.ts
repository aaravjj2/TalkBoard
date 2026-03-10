// ─── Collaboration Types ────────────────────────────────────────────────────

export type CollaborationRole = 'owner' | 'editor' | 'viewer' | 'contributor';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type ActivityType =
  | 'symbol_added'
  | 'symbol_edited'
  | 'board_shared'
  | 'board_duplicated'
  | 'comment_added'
  | 'comment_resolved'
  | 'member_joined'
  | 'member_left'
  | 'settings_changed'
  | 'phrase_added'
  | 'phrase_edited'
  | 'feedback_given'
  | 'goal_set'
  | 'goal_completed';

export type BoardVisibility = 'private' | 'team' | 'organization' | 'public';

export type MessageType = 'text' | 'symbol_share' | 'board_share' | 'system' | 'feedback';

// ─── Users & Members ─────────────────────────────────────────────────────────

export interface CollaboratorProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: CollaborationRole;
  joinedAt: string;
  lastActiveAt: string;
  isOnline: boolean;
}

export interface TeamMember extends CollaboratorProfile {
  permissions: Permission[];
  invitedBy: string;
  inviteStatus: InviteStatus;
}

export interface Permission {
  resource: 'boards' | 'symbols' | 'phrases' | 'settings' | 'reports' | 'users';
  actions: ('read' | 'write' | 'delete' | 'share')[];
}

// ─── Shared Boards ──────────────────────────────────────────────────────────

export interface SharedBoard {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  visibility: BoardVisibility;
  members: BoardMember[];
  symbolCount: number;
  phraseCount: number;
  createdAt: string;
  updatedAt: string;
  lastEditedBy: string;
  tags: string[];
  thumbnail?: string;
  version: number;
  isStarred?: boolean;
}

export interface BoardMember {
  userId: string;
  name: string;
  role: CollaborationRole;
  addedAt: string;
  canEdit: boolean;
}

// ─── Activities ─────────────────────────────────────────────────────────────

export interface CollaborationActivity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  boardId?: string;
  boardName?: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

// ─── Comments & Feedback ────────────────────────────────────────────────────

export interface Comment {
  id: string;
  boardId: string;
  targetId?: string;
  targetType?: 'symbol' | 'phrase' | 'board';
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isResolved: boolean;
  parentId?: string;
  replies?: Comment[];
}

export interface Feedback {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  boardId?: string;
  type: 'praise' | 'suggestion' | 'concern' | 'question';
  content: string;
  rating?: number;
  createdAt: string;
  isRead: boolean;
}

// ─── Messages ───────────────────────────────────────────────────────────────

export interface CollaborationMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  type: MessageType;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'symbol' | 'board' | 'image';
  id: string;
  name: string;
  preview?: string;
}

// ─── Invitations ────────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  boardId: string;
  boardName: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  role: CollaborationRole;
  status: InviteStatus;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

// ─── Collaboration Settings ─────────────────────────────────────────────────

export interface CollaborationSettings {
  defaultVisibility: BoardVisibility;
  allowPublicSharing: boolean;
  requireApproval: boolean;
  maxTeamSize: number;
  enableComments: boolean;
  enableFeedback: boolean;
  showActivityFeed: boolean;
  notifyOnChanges: boolean;
  notifyOnComments: boolean;
  notifyOnInvites: boolean;
  autoAcceptInvites: boolean;
  syncInterval: number; // seconds
}

// ─── State ──────────────────────────────────────────────────────────────────

export interface CollaborationState {
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
}
