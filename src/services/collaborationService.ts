// ─── Collaboration Service ──────────────────────────────────────────────────

import type {
  CollaboratorProfile,
  TeamMember,
  SharedBoard,
  BoardMember,
  CollaborationActivity,
  ActivityType,
  Comment,
  Feedback,
  CollaborationMessage,
  MessageType,
  Invitation,
  CollaborationSettings,
  CollaborationRole,
  BoardVisibility,
  InviteStatus,
  Permission,
} from '../types/collaboration';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  members: 'talkboard_collab_members',
  boards: 'talkboard_collab_boards',
  activities: 'talkboard_collab_activities',
  comments: 'talkboard_collab_comments',
  feedback: 'talkboard_collab_feedback',
  messages: 'talkboard_collab_messages',
  invitations: 'talkboard_collab_invitations',
  settings: 'talkboard_collab_settings',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `collab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Default Data ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: CollaborationSettings = {
  defaultVisibility: 'team',
  allowPublicSharing: false,
  requireApproval: true,
  maxTeamSize: 20,
  enableComments: true,
  enableFeedback: true,
  showActivityFeed: true,
  notifyOnChanges: true,
  notifyOnComments: true,
  notifyOnInvites: true,
  autoAcceptInvites: false,
  syncInterval: 30,
};

const CURRENT_USER: CollaboratorProfile = {
  id: 'user_self',
  name: 'You',
  email: 'user@talkboard.app',
  role: 'owner',
  joinedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  lastActiveAt: new Date().toISOString(),
  isOnline: true,
};

function generateDemoMembers(): TeamMember[] {
  const names = [
    { name: 'Sarah Johnson', email: 'sarah@school.edu', role: 'editor' as CollaborationRole },
    { name: 'Dr. Emily Chen', email: 'echen@therapy.org', role: 'editor' as CollaborationRole },
    { name: 'Mike Thompson', email: 'mike@family.com', role: 'viewer' as CollaborationRole },
    { name: 'Lisa Rodriguez', email: 'lisa@school.edu', role: 'contributor' as CollaborationRole },
    { name: 'James Wilson', email: 'jwilson@therapy.org', role: 'viewer' as CollaborationRole },
  ];

  const permMap: Record<CollaborationRole, Permission[]> = {
    owner: [
      { resource: 'boards', actions: ['read', 'write', 'delete', 'share'] },
      { resource: 'symbols', actions: ['read', 'write', 'delete', 'share'] },
      { resource: 'phrases', actions: ['read', 'write', 'delete', 'share'] },
      { resource: 'settings', actions: ['read', 'write'] },
      { resource: 'reports', actions: ['read', 'write', 'share'] },
      { resource: 'users', actions: ['read', 'write', 'delete'] },
    ],
    editor: [
      { resource: 'boards', actions: ['read', 'write', 'share'] },
      { resource: 'symbols', actions: ['read', 'write'] },
      { resource: 'phrases', actions: ['read', 'write'] },
      { resource: 'reports', actions: ['read'] },
    ],
    contributor: [
      { resource: 'boards', actions: ['read'] },
      { resource: 'symbols', actions: ['read', 'write'] },
      { resource: 'phrases', actions: ['read', 'write'] },
    ],
    viewer: [
      { resource: 'boards', actions: ['read'] },
      { resource: 'symbols', actions: ['read'] },
      { resource: 'phrases', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  };

  return names.map((n, i) => ({
    id: `member_${i + 1}`,
    name: n.name,
    email: n.email,
    role: n.role,
    permissions: permMap[n.role],
    invitedBy: 'user_self',
    inviteStatus: 'accepted' as InviteStatus,
    joinedAt: new Date(Date.now() - (60 - i * 10) * 86400000).toISOString(),
    lastActiveAt: new Date(Date.now() - i * 3600000).toISOString(),
    isOnline: i < 2,
  }));
}

function generateDemoBoards(): SharedBoard[] {
  return [
    {
      id: 'board_1',
      name: 'Daily Communication',
      description: 'Core symbols for everyday communication needs',
      ownerId: 'user_self',
      ownerName: 'You',
      visibility: 'team',
      members: [
        { userId: 'user_self', name: 'You', role: 'owner', addedAt: new Date().toISOString(), canEdit: true },
        { userId: 'member_1', name: 'Sarah Johnson', role: 'editor', addedAt: new Date().toISOString(), canEdit: true },
        { userId: 'member_2', name: 'Dr. Emily Chen', role: 'editor', addedAt: new Date().toISOString(), canEdit: true },
      ],
      symbolCount: 48,
      phraseCount: 15,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      lastEditedBy: 'Sarah Johnson',
      tags: ['core', 'daily', 'needs'],
      version: 12,
      isStarred: true,
    },
    {
      id: 'board_2',
      name: 'School Activities',
      description: 'Symbols for classroom and school participation',
      ownerId: 'member_1',
      ownerName: 'Sarah Johnson',
      visibility: 'team',
      members: [
        { userId: 'member_1', name: 'Sarah Johnson', role: 'owner', addedAt: new Date().toISOString(), canEdit: true },
        { userId: 'user_self', name: 'You', role: 'editor', addedAt: new Date().toISOString(), canEdit: true },
        { userId: 'member_4', name: 'Lisa Rodriguez', role: 'contributor', addedAt: new Date().toISOString(), canEdit: true },
      ],
      symbolCount: 36,
      phraseCount: 8,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastEditedBy: 'Lisa Rodriguez',
      tags: ['school', 'classroom', 'activities'],
      version: 7,
    },
    {
      id: 'board_3',
      name: 'Therapy Goals',
      description: 'Symbols and phrases supporting therapy objectives',
      ownerId: 'member_2',
      ownerName: 'Dr. Emily Chen',
      visibility: 'private',
      members: [
        { userId: 'member_2', name: 'Dr. Emily Chen', role: 'owner', addedAt: new Date().toISOString(), canEdit: true },
        { userId: 'user_self', name: 'You', role: 'viewer', addedAt: new Date().toISOString(), canEdit: false },
      ],
      symbolCount: 22,
      phraseCount: 12,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      lastEditedBy: 'Dr. Emily Chen',
      tags: ['therapy', 'goals', 'progress'],
      version: 4,
    },
    {
      id: 'board_4',
      name: 'Community Boards',
      description: 'Public board with community-contributed symbols',
      ownerId: 'user_self',
      ownerName: 'You',
      visibility: 'public',
      members: [
        { userId: 'user_self', name: 'You', role: 'owner', addedAt: new Date().toISOString(), canEdit: true },
      ],
      symbolCount: 64,
      phraseCount: 20,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      lastEditedBy: 'You',
      tags: ['community', 'shared', 'open'],
      version: 15,
      isStarred: true,
    },
  ];
}

function generateDemoActivities(): CollaborationActivity[] {
  const activities: { type: ActivityType; userId: string; userName: string; boardName: string; desc: string; ago: number }[] = [
    { type: 'symbol_added', userId: 'member_1', userName: 'Sarah Johnson', boardName: 'Daily Communication', desc: 'Added 3 new symbols to "Food" category', ago: 1800000 },
    { type: 'comment_added', userId: 'member_2', userName: 'Dr. Emily Chen', boardName: 'Therapy Goals', desc: 'Left a comment about progress targets', ago: 3600000 },
    { type: 'board_shared', userId: 'user_self', userName: 'You', boardName: 'School Activities', desc: 'Shared board with Lisa Rodriguez', ago: 7200000 },
    { type: 'phrase_added', userId: 'member_4', userName: 'Lisa Rodriguez', boardName: 'School Activities', desc: 'Added phrase "Can I go to recess?"', ago: 14400000 },
    { type: 'symbol_edited', userId: 'member_1', userName: 'Sarah Johnson', boardName: 'Daily Communication', desc: 'Updated symbol "bathroom" with new image', ago: 28800000 },
    { type: 'feedback_given', userId: 'member_2', userName: 'Dr. Emily Chen', boardName: 'Daily Communication', desc: 'Gave positive feedback on board organization', ago: 43200000 },
    { type: 'goal_completed', userId: 'user_self', userName: 'You', boardName: 'Therapy Goals', desc: 'Completed goal: "Use 5 new social phrases"', ago: 86400000 },
    { type: 'member_joined', userId: 'member_5', userName: 'James Wilson', boardName: 'Community Boards', desc: 'Joined as viewer', ago: 172800000 },
    { type: 'settings_changed', userId: 'user_self', userName: 'You', boardName: 'Daily Communication', desc: 'Changed board visibility to team', ago: 259200000 },
    { type: 'board_duplicated', userId: 'member_3', userName: 'Mike Thompson', boardName: 'Daily Communication', desc: 'Duplicated board for home use', ago: 345600000 },
  ];

  return activities.map((a, i) => ({
    id: `activity_${i + 1}`,
    type: a.type,
    userId: a.userId,
    userName: a.userName,
    boardId: `board_${(i % 4) + 1}`,
    boardName: a.boardName,
    description: a.desc,
    timestamp: new Date(Date.now() - a.ago).toISOString(),
  }));
}

function generateDemoComments(): Comment[] {
  return [
    {
      id: 'comment_1',
      boardId: 'board_1',
      targetType: 'symbol',
      targetId: 'sym_1',
      userId: 'member_2',
      userName: 'Dr. Emily Chen',
      content: 'Consider adding a larger symbol image for better visibility on the tablet.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isResolved: false,
    },
    {
      id: 'comment_2',
      boardId: 'board_1',
      targetType: 'board',
      userId: 'member_1',
      userName: 'Sarah Johnson',
      content: 'The new "Food" category is working really well in class!',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isResolved: false,
    },
    {
      id: 'comment_3',
      boardId: 'board_3',
      targetType: 'phrase',
      targetId: 'phrase_1',
      userId: 'member_2',
      userName: 'Dr. Emily Chen',
      content: 'Great progress with this phrase. Next session we can build on it.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      isResolved: true,
    },
  ];
}

function generateDemoFeedback(): Feedback[] {
  return [
    {
      id: 'fb_1',
      fromUserId: 'member_2',
      fromUserName: 'Dr. Emily Chen',
      toUserId: 'user_self',
      boardId: 'board_1',
      type: 'praise',
      content: 'Excellent improvement in symbol usage this week! Keep it up!',
      rating: 5,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isRead: false,
    },
    {
      id: 'fb_2',
      fromUserId: 'member_1',
      fromUserName: 'Sarah Johnson',
      toUserId: 'user_self',
      type: 'suggestion',
      content: 'Try adding more action verbs to expand sentence-building capabilities.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
    },
    {
      id: 'fb_3',
      fromUserId: 'member_3',
      fromUserName: 'Mike Thompson',
      toUserId: 'user_self',
      boardId: 'board_4',
      type: 'question',
      content: 'How do we add custom symbols to the community board?',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      isRead: true,
    },
  ];
}

function generateDemoMessages(): CollaborationMessage[] {
  return [
    {
      id: 'msg_1',
      senderId: 'member_1',
      senderName: 'Sarah Johnson',
      recipientId: 'user_self',
      type: 'text',
      content: 'Hi! I added some new symbols for the upcoming field trip.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
    },
    {
      id: 'msg_2',
      senderId: 'member_2',
      senderName: 'Dr. Emily Chen',
      recipientId: 'user_self',
      type: 'feedback',
      content: 'Great session today! I updated the therapy goals board with our new objectives.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: false,
    },
    {
      id: 'msg_3',
      senderId: 'user_self',
      senderName: 'You',
      recipientId: 'member_1',
      type: 'board_share',
      content: 'Shared "Daily Communication" board with you.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
    },
    {
      id: 'msg_4',
      senderId: 'system',
      senderName: 'System',
      recipientId: 'user_self',
      type: 'system',
      content: 'Lisa Rodriguez accepted your invitation to join "School Activities".',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      isRead: true,
    },
  ];
}

function generateDemoInvitations(): Invitation[] {
  return [
    {
      id: 'inv_1',
      boardId: 'board_1',
      boardName: 'Daily Communication',
      senderId: 'user_self',
      senderName: 'You',
      recipientEmail: 'newteacher@school.edu',
      role: 'viewer',
      status: 'pending',
      message: 'Join our team to view communication boards!',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    },
  ];
}

// ─── Service ─────────────────────────────────────────────────────────────────

class CollaborationService {
  // ─── Current User ──────────────────────────────────────────────────

  getCurrentUser(): CollaboratorProfile {
    return { ...CURRENT_USER, lastActiveAt: new Date().toISOString() };
  }

  // ─── Team Members ─────────────────────────────────────────────────

  getTeamMembers(): TeamMember[] {
    const stored = loadJSON<TeamMember[]>(STORAGE_KEYS.members, []);
    return stored.length ? stored : generateDemoMembers();
  }

  addTeamMember(name: string, email: string, role: CollaborationRole): TeamMember {
    const members = this.getTeamMembers();
    const member: TeamMember = {
      id: generateId(),
      name,
      email,
      role,
      permissions: this.getPermissionsForRole(role),
      invitedBy: 'user_self',
      inviteStatus: 'pending',
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isOnline: false,
    };
    members.push(member);
    saveJSON(STORAGE_KEYS.members, members);
    this.logActivity('member_joined', member.name, undefined, `${member.name} was invited as ${role}`);
    return member;
  }

  updateMemberRole(memberId: string, role: CollaborationRole): TeamMember | null {
    const members = this.getTeamMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;
    members[idx].role = role;
    members[idx].permissions = this.getPermissionsForRole(role);
    saveJSON(STORAGE_KEYS.members, members);
    return members[idx];
  }

  removeMember(memberId: string): boolean {
    const members = this.getTeamMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    saveJSON(STORAGE_KEYS.members, members.filter(m => m.id !== memberId));
    this.logActivity('member_left', member.name, undefined, `${member.name} was removed from the team`);
    return true;
  }

  private getPermissionsForRole(role: CollaborationRole): Permission[] {
    const permMap: Record<CollaborationRole, Permission[]> = {
      owner: [
        { resource: 'boards', actions: ['read', 'write', 'delete', 'share'] },
        { resource: 'symbols', actions: ['read', 'write', 'delete', 'share'] },
        { resource: 'settings', actions: ['read', 'write'] },
        { resource: 'users', actions: ['read', 'write', 'delete'] },
      ],
      editor: [
        { resource: 'boards', actions: ['read', 'write', 'share'] },
        { resource: 'symbols', actions: ['read', 'write'] },
      ],
      contributor: [
        { resource: 'boards', actions: ['read'] },
        { resource: 'symbols', actions: ['read', 'write'] },
      ],
      viewer: [
        { resource: 'boards', actions: ['read'] },
        { resource: 'symbols', actions: ['read'] },
      ],
    };
    return permMap[role];
  }

  // ─── Shared Boards ────────────────────────────────────────────────

  getSharedBoards(): SharedBoard[] {
    const stored = loadJSON<SharedBoard[]>(STORAGE_KEYS.boards, []);
    return stored.length ? stored : generateDemoBoards();
  }

  createSharedBoard(name: string, description: string, visibility: BoardVisibility): SharedBoard {
    const boards = this.getSharedBoards();
    const board: SharedBoard = {
      id: generateId(),
      name,
      description,
      ownerId: 'user_self',
      ownerName: 'You',
      visibility,
      members: [{ userId: 'user_self', name: 'You', role: 'owner', addedAt: new Date().toISOString(), canEdit: true }],
      symbolCount: 0,
      phraseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEditedBy: 'You',
      tags: [],
      version: 1,
    };
    boards.push(board);
    saveJSON(STORAGE_KEYS.boards, boards);
    this.logActivity('board_shared', 'You', board.name, `Created board "${name}"`);
    return board;
  }

  updateBoard(id: string, updates: Partial<SharedBoard>): SharedBoard | null {
    const boards = this.getSharedBoards();
    const idx = boards.findIndex(b => b.id === id);
    if (idx === -1) return null;
    boards[idx] = {
      ...boards[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: boards[idx].version + 1,
    };
    saveJSON(STORAGE_KEYS.boards, boards);
    return boards[idx];
  }

  deleteBoard(id: string): boolean {
    const boards = this.getSharedBoards();
    const filtered = boards.filter(b => b.id !== id);
    if (filtered.length === boards.length) return false;
    saveJSON(STORAGE_KEYS.boards, filtered);
    return true;
  }

  toggleStarBoard(id: string): boolean {
    const boards = this.getSharedBoards();
    const board = boards.find(b => b.id === id);
    if (!board) return false;
    board.isStarred = !board.isStarred;
    saveJSON(STORAGE_KEYS.boards, boards);
    return board.isStarred;
  }

  addBoardMember(boardId: string, userId: string, name: string, role: CollaborationRole): boolean {
    const boards = this.getSharedBoards();
    const board = boards.find(b => b.id === boardId);
    if (!board) return false;
    board.members.push({ userId, name, role, addedAt: new Date().toISOString(), canEdit: role !== 'viewer' });
    saveJSON(STORAGE_KEYS.boards, boards);
    return true;
  }

  // ─── Activities ───────────────────────────────────────────────────

  getActivities(): CollaborationActivity[] {
    const stored = loadJSON<CollaborationActivity[]>(STORAGE_KEYS.activities, []);
    return stored.length ? stored : generateDemoActivities();
  }

  logActivity(type: ActivityType, userName: string, boardName?: string, description: string = ''): void {
    const activities = this.getActivities();
    activities.unshift({
      id: generateId(),
      type,
      userId: 'user_self',
      userName,
      boardName,
      description,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100
    saveJSON(STORAGE_KEYS.activities, activities.slice(0, 100));
  }

  // ─── Comments ─────────────────────────────────────────────────────

  getComments(): Comment[] {
    const stored = loadJSON<Comment[]>(STORAGE_KEYS.comments, []);
    return stored.length ? stored : generateDemoComments();
  }

  addComment(boardId: string, content: string, targetType?: 'symbol' | 'phrase' | 'board', targetId?: string): Comment {
    const comments = this.getComments();
    const comment: Comment = {
      id: generateId(),
      boardId,
      targetType,
      targetId,
      userId: 'user_self',
      userName: 'You',
      content,
      createdAt: new Date().toISOString(),
      isResolved: false,
    };
    comments.unshift(comment);
    saveJSON(STORAGE_KEYS.comments, comments);
    this.logActivity('comment_added', 'You', undefined, `Added comment: "${content.slice(0, 50)}..."`);
    return comment;
  }

  resolveComment(commentId: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    comment.isResolved = true;
    saveJSON(STORAGE_KEYS.comments, comments);
    this.logActivity('comment_resolved', 'You', undefined, 'Resolved a comment');
    return true;
  }

  // ─── Feedback ─────────────────────────────────────────────────────

  getFeedback(): Feedback[] {
    const stored = loadJSON<Feedback[]>(STORAGE_KEYS.feedback, []);
    return stored.length ? stored : generateDemoFeedback();
  }

  markFeedbackRead(id: string): void {
    const feedback = this.getFeedback();
    const fb = feedback.find(f => f.id === id);
    if (fb) {
      fb.isRead = true;
      saveJSON(STORAGE_KEYS.feedback, feedback);
    }
  }

  // ─── Messages ─────────────────────────────────────────────────────

  getMessages(): CollaborationMessage[] {
    const stored = loadJSON<CollaborationMessage[]>(STORAGE_KEYS.messages, []);
    return stored.length ? stored : generateDemoMessages();
  }

  sendMessage(recipientId: string, content: string, type: MessageType = 'text'): CollaborationMessage {
    const messages = this.getMessages();
    const msg: CollaborationMessage = {
      id: generateId(),
      senderId: 'user_self',
      senderName: 'You',
      recipientId,
      type,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    messages.unshift(msg);
    saveJSON(STORAGE_KEYS.messages, messages);
    return msg;
  }

  markMessageRead(id: string): void {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === id);
    if (msg) {
      msg.isRead = true;
      saveJSON(STORAGE_KEYS.messages, messages);
    }
  }

  getUnreadCount(): number {
    const messages = this.getMessages().filter(m => !m.isRead && m.recipientId === 'user_self');
    const feedback = this.getFeedback().filter(f => !f.isRead);
    return messages.length + feedback.length;
  }

  // ─── Invitations ──────────────────────────────────────────────────

  getInvitations(): Invitation[] {
    const stored = loadJSON<Invitation[]>(STORAGE_KEYS.invitations, []);
    return stored.length ? stored : generateDemoInvitations();
  }

  createInvitation(boardId: string, boardName: string, email: string, role: CollaborationRole, message?: string): Invitation {
    const invitations = this.getInvitations();
    const inv: Invitation = {
      id: generateId(),
      boardId,
      boardName,
      senderId: 'user_self',
      senderName: 'You',
      recipientEmail: email,
      role,
      status: 'pending',
      message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    invitations.push(inv);
    saveJSON(STORAGE_KEYS.invitations, invitations);
    return inv;
  }

  cancelInvitation(id: string): boolean {
    const invitations = this.getInvitations();
    const filtered = invitations.filter(i => i.id !== id);
    if (filtered.length === invitations.length) return false;
    saveJSON(STORAGE_KEYS.invitations, filtered);
    return true;
  }

  // ─── Settings ─────────────────────────────────────────────────────

  getSettings(): CollaborationSettings {
    return loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }

  updateSettings(updates: Partial<CollaborationSettings>): CollaborationSettings {
    const settings = { ...this.getSettings(), ...updates };
    saveJSON(STORAGE_KEYS.settings, settings);
    return settings;
  }
}

export const collaborationService = new CollaborationService();
