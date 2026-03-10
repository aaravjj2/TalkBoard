// ─── Communication Partner Service ──────────────────────────────────────────

import type {
  CommunicationPartner,
  CommunicationSession,
  CommunicationStrategy,
  ModelingItem,
  CommunicationLogEntry,
  PartnerTip,
  PartnerSettings,
  PartnerProgress,
  PromptRecord,
  PartnerRole,
  SessionType,
  SessionStatus,
  StrategyCategory,
  CommunicationLevel,
  PromptLevel,
  LogEntryType,
} from '../types/communicationPartner';

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toISO(d: Date = new Date()): string {
  return d.toISOString();
}

// ── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  PARTNERS: 'talkboard_comm_partners',
  SESSIONS: 'talkboard_comm_sessions',
  STRATEGIES: 'talkboard_comm_strategies',
  MODELING: 'talkboard_comm_modeling',
  LOG: 'talkboard_comm_log',
  TIPS: 'talkboard_comm_tips',
  SETTINGS: 'talkboard_comm_settings',
};

// ── Demo Data ───────────────────────────────────────────────────────────────

function generateDemoPartners(): CommunicationPartner[] {
  return [
    {
      id: 'p-1', name: 'Maria Garcia', role: 'parent', email: 'maria@example.com',
      avatar: '👩', isActive: true, joinedAt: '2025-01-10T10:00:00Z',
      lastInteractionAt: '2025-02-18T14:30:00Z', totalInteractions: 45,
      preferredStyle: 'responsive', notes: 'Primary caregiver, Spanish bilingual',
    },
    {
      id: 'p-2', name: 'Dr. Sarah Chen', role: 'therapist', email: 'sarah.chen@therapy.com',
      avatar: '👩‍⚕️', isActive: true, joinedAt: '2025-01-05T09:00:00Z',
      lastInteractionAt: '2025-02-17T11:00:00Z', totalInteractions: 28,
      preferredStyle: 'facilitative', notes: 'SLP, weekly sessions on Tuesdays',
    },
    {
      id: 'p-3', name: 'Mr. James Wilson', role: 'teacher', email: 'j.wilson@school.edu',
      avatar: '👨‍🏫', isActive: true, joinedAt: '2025-01-15T08:00:00Z',
      lastInteractionAt: '2025-02-16T15:00:00Z', totalInteractions: 32,
      preferredStyle: 'directive', notes: 'Special education teacher, classroom AAC support',
    },
    {
      id: 'p-4', name: 'Emma Garcia', role: 'sibling', email: '',
      avatar: '👧', isActive: true, joinedAt: '2025-01-20T10:00:00Z',
      lastInteractionAt: '2025-02-15T16:30:00Z', totalInteractions: 18,
      preferredStyle: 'modeling', notes: 'Older sister, great at modeling during play',
    },
    {
      id: 'p-5', name: 'Lisa Park', role: 'aide', email: 'l.park@school.edu',
      avatar: '👩‍🦰', isActive: false, joinedAt: '2025-01-12T09:00:00Z',
      lastInteractionAt: '2025-02-01T12:00:00Z', totalInteractions: 12,
      preferredStyle: 'responsive', notes: 'Classroom aide, assists during lunch and recess',
    },
  ];
}

function generateDemoSessions(): CommunicationSession[] {
  return [
    {
      id: 's-1', partnerId: 'p-2', partnerName: 'Dr. Sarah Chen',
      type: 'structured', status: 'completed',
      startedAt: '2025-02-18T10:00:00Z', endedAt: '2025-02-18T10:30:00Z',
      duration: 30, goals: [
        { id: 'g-1', description: 'Use 3-word sentences', isAchieved: true, notes: 'Achieved 5 times' },
        { id: 'g-2', description: 'Initiate communication', isAchieved: true, notes: 'Initiated 3 times independently' },
      ],
      notes: 'Great progress on sentence building',
      messageCount: 15, symbolsUsed: 28, uniqueSymbols: 14,
      promptsGiven: 8, independentMessages: 7, rating: 4,
    },
    {
      id: 's-2', partnerId: 'p-1', partnerName: 'Maria Garcia',
      type: 'free_play', status: 'completed',
      startedAt: '2025-02-17T18:00:00Z', endedAt: '2025-02-17T18:45:00Z',
      duration: 45, goals: [
        { id: 'g-3', description: 'Request preferred items', isAchieved: true, notes: '' },
        { id: 'g-4', description: 'Respond to questions', isAchieved: false, notes: 'Needed verbal prompts' },
      ],
      notes: 'Enjoyed cooking activity, requested utensils independently',
      messageCount: 22, symbolsUsed: 35, uniqueSymbols: 18,
      promptsGiven: 12, independentMessages: 10, rating: 3,
    },
    {
      id: 's-3', partnerId: 'p-3', partnerName: 'Mr. James Wilson',
      type: 'guided', status: 'completed',
      startedAt: '2025-02-16T13:00:00Z', endedAt: '2025-02-16T13:20:00Z',
      duration: 20, goals: [
        { id: 'g-5', description: 'Use feelings vocabulary', isAchieved: true, notes: 'Used happy, sad, excited' },
      ],
      notes: 'Circle time activity, shared feelings with classmates',
      messageCount: 8, symbolsUsed: 12, uniqueSymbols: 8,
      promptsGiven: 5, independentMessages: 3, rating: 4,
    },
    {
      id: 's-4', partnerId: 'p-4', partnerName: 'Emma Garcia',
      type: 'social', status: 'completed',
      startedAt: '2025-02-15T16:00:00Z', endedAt: '2025-02-15T16:30:00Z',
      duration: 30, goals: [
        { id: 'g-6', description: 'Take turns in conversation', isAchieved: true, notes: '' },
      ],
      notes: 'Playing with dolls, great turn-taking',
      messageCount: 18, symbolsUsed: 24, uniqueSymbols: 12,
      promptsGiven: 3, independentMessages: 15, rating: 5,
    },
    {
      id: 's-5', partnerId: 'p-2', partnerName: 'Dr. Sarah Chen',
      type: 'assessment', status: 'planned',
      startedAt: '2025-02-25T10:00:00Z', endedAt: null,
      duration: 45, goals: [
        { id: 'g-7', description: 'Assess current vocabulary', isAchieved: false, notes: '' },
        { id: 'g-8', description: 'Evaluate sentence complexity', isAchieved: false, notes: '' },
        { id: 'g-9', description: 'Review communication partners input', isAchieved: false, notes: '' },
      ],
      notes: 'Quarterly assessment',
      messageCount: 0, symbolsUsed: 0, uniqueSymbols: 0,
      promptsGiven: 0, independentMessages: 0, rating: 0,
    },
  ];
}

function generateDemoStrategies(): CommunicationStrategy[] {
  return [
    {
      id: 'str-1', name: 'Aided Language Stimulation',
      description: 'Point to symbols on the AAC device while speaking to model language use',
      category: 'modeling',
      steps: [
        'Identify key words in your message',
        'Point to corresponding symbols while speaking',
        'Pause after modeling to allow response',
        'Accept any communication attempt',
      ],
      tips: [
        'Model throughout the day, not just during therapy',
        'Start with 1-2 key words per utterance',
        'Use natural speech alongside symbol pointing',
      ],
      examplePhrases: ['I want + [symbol]', 'Let\'s go + [symbol]', 'I see + [symbol]'],
      difficultyLevel: 'emerging',
      isBookmarked: true,
    },
    {
      id: 'str-2', name: 'Wait Time Strategy',
      description: 'Give at least 10 seconds of wait time after asking a question or making a comment',
      category: 'wait_time',
      steps: [
        'Ask a question or make a comment',
        'Wait 10-15 seconds silently',
        'Use expectant body language (lean forward, eyebrows raised)',
        'Count silently if needed',
        'If no response, provide a model or prompt',
      ],
      tips: [
        'Resist the urge to fill silence',
        '10 seconds feels longer than you think',
        'Celebrate any response attempt',
      ],
      examplePhrases: [],
      difficultyLevel: 'emerging',
      isBookmarked: true,
    },
    {
      id: 'str-3', name: 'Expansion',
      description: 'Take the user\'s message and expand it by adding 1-2 words',
      category: 'expansion',
      steps: [
        'Listen to/observe the user\'s communication',
        'Repeat their message',
        'Add 1-2 more words to expand',
        'Model the expanded version on the AAC device',
      ],
      tips: [
        'Only expand by 1-2 words at a time',
        'Don\'t expect the user to repeat the expansion',
        'Use natural intonation',
      ],
      examplePhrases: ['User: "want" → You: "want cookie"', 'User: "go" → You: "go outside"'],
      difficultyLevel: 'developing',
      isBookmarked: false,
    },
    {
      id: 'str-4', name: 'Least-to-Most Prompting',
      description: 'Start with the least amount of help and increase as needed',
      category: 'prompting',
      steps: [
        'Give a natural opportunity to communicate',
        'Wait (independent attempt)',
        'If needed: Gesture toward the device',
        'If needed: Give a verbal hint',
        'If needed: Model the target on the device',
        'If needed: Hand-over-hand guidance',
      ],
      tips: [
        'Always start with least support',
        'Give wait time between each prompt level',
        'Fade prompts as quickly as possible',
      ],
      examplePhrases: [],
      difficultyLevel: 'developing',
      isBookmarked: true,
    },
    {
      id: 'str-5', name: 'Environmental Arrangement',
      description: 'Set up the environment to create natural communication opportunities',
      category: 'environment',
      steps: [
        'Place preferred items in sight but out of reach',
        'Give small amounts to encourage requesting more',
        'Create unexpected situations (e.g., missing items)',
        'Offer choices between items',
      ],
      tips: [
        'Make the AAC device always accessible',
        'Create multiple opportunities throughout routines',
        'Be creative with sabotage (missing spoons, etc.)',
      ],
      examplePhrases: [],
      difficultyLevel: 'emerging',
      isBookmarked: false,
    },
    {
      id: 'str-6', name: 'High-Interest Motivation',
      description: 'Use the person\'s interests and preferences to motivate communication',
      category: 'motivation',
      steps: [
        'Identify high-interest topics and activities',
        'Ensure relevant vocabulary is available on the device',
        'Embed communication opportunities within preferred activities',
        'Celebrate communication successes enthusiastically',
      ],
      tips: [
        'Update vocabulary to match current interests',
        'Follow the person\'s lead during activities',
        'Use preferred items as natural reinforcers',
      ],
      examplePhrases: [],
      difficultyLevel: 'emerging',
      isBookmarked: false,
    },
  ];
}

function generateDemoModelingQueue(): ModelingItem[] {
  return [
    { id: 'm-1', targetPhrase: 'I want more', symbols: ['I', 'want', 'more'], category: 'requesting', demonstrated: true, demonstratedAt: '2025-02-18T10:15:00Z', userAttempted: true, attemptedAt: '2025-02-18T10:18:00Z', notes: '' },
    { id: 'm-2', targetPhrase: 'Help please', symbols: ['help', 'please'], category: 'requesting', demonstrated: true, demonstratedAt: '2025-02-17T14:00:00Z', userAttempted: false, attemptedAt: null, notes: 'Need more practice' },
    { id: 'm-3', targetPhrase: 'I feel happy', symbols: ['I', 'feel', 'happy'], category: 'feelings', demonstrated: false, demonstratedAt: null, userAttempted: false, attemptedAt: null, notes: 'Target for next session' },
    { id: 'm-4', targetPhrase: 'Go outside', symbols: ['go', 'outside'], category: 'actions', demonstrated: true, demonstratedAt: '2025-02-16T13:10:00Z', userAttempted: true, attemptedAt: '2025-02-16T13:12:00Z', notes: 'Used independently!' },
    { id: 'm-5', targetPhrase: 'I don\'t want', symbols: ['I', 'not', 'want'], category: 'refusing', demonstrated: false, demonstratedAt: null, userAttempted: false, attemptedAt: null, notes: 'Important for autonomy' },
  ];
}

function generateDemoLog(): CommunicationLogEntry[] {
  return [
    { id: 'l-1', sessionId: 's-1', timestamp: '2025-02-18T10:05:00Z', type: 'model', content: 'Modeled "I want ball"', isUserGenerated: false, partnerName: 'Dr. Sarah Chen', symbols: ['I', 'want', 'ball'] },
    { id: 'l-2', sessionId: 's-1', timestamp: '2025-02-18T10:06:00Z', type: 'response', content: 'Selected "want ball"', isUserGenerated: true, partnerName: 'Dr. Sarah Chen', symbols: ['want', 'ball'] },
    { id: 'l-3', sessionId: 's-1', timestamp: '2025-02-18T10:08:00Z', type: 'expansion', content: 'Expanded to "I want the red ball"', isUserGenerated: false, partnerName: 'Dr. Sarah Chen' },
    { id: 'l-4', sessionId: 's-1', timestamp: '2025-02-18T10:10:00Z', type: 'message', content: 'more please', isUserGenerated: true, partnerName: 'Dr. Sarah Chen', symbols: ['more', 'please'] },
    { id: 'l-5', sessionId: 's-1', timestamp: '2025-02-18T10:12:00Z', type: 'prompt', content: 'Gestural prompt toward feelings category', isUserGenerated: false, partnerName: 'Dr. Sarah Chen', promptLevel: 'gestural' },
    { id: 'l-6', sessionId: 's-1', timestamp: '2025-02-18T10:14:00Z', type: 'message', content: 'I happy', isUserGenerated: true, partnerName: 'Dr. Sarah Chen', symbols: ['I', 'happy'] },
    { id: 'l-7', sessionId: 's-2', timestamp: '2025-02-17T18:10:00Z', type: 'message', content: 'want cookie', isUserGenerated: true, partnerName: 'Maria Garcia', symbols: ['want', 'cookie'] },
    { id: 'l-8', sessionId: 's-2', timestamp: '2025-02-17T18:15:00Z', type: 'note', content: 'Started using 2-word combinations independently during snack', isUserGenerated: false, partnerName: 'Maria Garcia' },
  ];
}

function generateDemoTips(): PartnerTip[] {
  return [
    { id: 't-1', title: 'Model, Model, Model!', content: 'The most effective way to teach AAC is through modeling. Point to symbols on the device while you speak naturally. Aim for at least 80 models per day.', category: 'modeling', isRead: true, order: 1 },
    { id: 't-2', title: 'Give Wait Time', content: 'After asking a question or making a comment, wait at least 10 seconds before prompting. Many communicators need extra processing time.', category: 'wait_time', isRead: true, order: 2 },
    { id: 't-3', title: 'Presume Competence', content: 'Always assume the communicator can understand more than they can express. Use age-appropriate language and topics.', category: 'environment', isRead: false, order: 3 },
    { id: 't-4', title: 'Expand, Don\'t Correct', content: 'When the communicator says something, repeat it and add 1-2 words. Never say "no, say it this way."', category: 'expansion', isRead: false, order: 4 },
    { id: 't-5', title: 'Create Communication Temptations', content: 'Set up situations where the communicator NEEDS to communicate: put favorite toys in clear containers, give small portions, "forget" to give necessary items.', category: 'motivation', isRead: false, order: 5 },
  ];
}

// ── Service ─────────────────────────────────────────────────────────────────

class CommunicationPartnerService {
  // ── Partners ────────────────────────────────────────────────────────────

  getPartners(): CommunicationPartner[] {
    const saved = localStorage.getItem(KEYS.PARTNERS);
    return saved ? JSON.parse(saved) : generateDemoPartners();
  }

  savePartners(partners: CommunicationPartner[]): void {
    localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
  }

  addPartner(name: string, role: PartnerRole, email: string): CommunicationPartner {
    const partners = this.getPartners();
    const partner: CommunicationPartner = {
      id: generateId(),
      name,
      role,
      email,
      avatar: '👤',
      isActive: true,
      joinedAt: toISO(),
      lastInteractionAt: toISO(),
      totalInteractions: 0,
      preferredStyle: 'responsive',
      notes: '',
    };
    partners.push(partner);
    this.savePartners(partners);
    return partner;
  }

  updatePartner(id: string, updates: Partial<CommunicationPartner>): CommunicationPartner | null {
    const partners = this.getPartners();
    const idx = partners.findIndex(p => p.id === id);
    if (idx < 0) return null;
    partners[idx] = { ...partners[idx], ...updates };
    this.savePartners(partners);
    return partners[idx];
  }

  removePartner(id: string): void {
    const partners = this.getPartners().filter(p => p.id !== id);
    this.savePartners(partners);
  }

  // ── Sessions ────────────────────────────────────────────────────────────

  getSessions(): CommunicationSession[] {
    const saved = localStorage.getItem(KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : generateDemoSessions();
  }

  saveSessions(sessions: CommunicationSession[]): void {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  }

  createSession(partnerId: string, partnerName: string, type: SessionType): CommunicationSession {
    const sessions = this.getSessions();
    const session: CommunicationSession = {
      id: generateId(),
      partnerId,
      partnerName,
      type,
      status: 'planned',
      startedAt: toISO(),
      endedAt: null,
      duration: 0,
      goals: [],
      notes: '',
      messageCount: 0,
      symbolsUsed: 0,
      uniqueSymbols: 0,
      promptsGiven: 0,
      independentMessages: 0,
      rating: 0,
    };
    sessions.unshift(session);
    this.saveSessions(sessions);
    return session;
  }

  updateSession(id: string, updates: Partial<CommunicationSession>): CommunicationSession | null {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx < 0) return null;
    sessions[idx] = { ...sessions[idx], ...updates };
    this.saveSessions(sessions);
    return sessions[idx];
  }

  completeSession(id: string, notes: string, rating: number): CommunicationSession | null {
    return this.updateSession(id, {
      status: 'completed',
      endedAt: toISO(),
      notes,
      rating,
    });
  }

  // ── Strategies ──────────────────────────────────────────────────────────

  getStrategies(): CommunicationStrategy[] {
    const saved = localStorage.getItem(KEYS.STRATEGIES);
    return saved ? JSON.parse(saved) : generateDemoStrategies();
  }

  saveStrategies(strategies: CommunicationStrategy[]): void {
    localStorage.setItem(KEYS.STRATEGIES, JSON.stringify(strategies));
  }

  toggleBookmark(strategyId: string): void {
    const strategies = this.getStrategies();
    const idx = strategies.findIndex(s => s.id === strategyId);
    if (idx >= 0) {
      strategies[idx].isBookmarked = !strategies[idx].isBookmarked;
      this.saveStrategies(strategies);
    }
  }

  // ── Modeling Queue ──────────────────────────────────────────────────────

  getModelingQueue(): ModelingItem[] {
    const saved = localStorage.getItem(KEYS.MODELING);
    return saved ? JSON.parse(saved) : generateDemoModelingQueue();
  }

  saveModelingQueue(queue: ModelingItem[]): void {
    localStorage.setItem(KEYS.MODELING, JSON.stringify(queue));
  }

  addModelingItem(targetPhrase: string, symbols: string[], category: string): ModelingItem {
    const queue = this.getModelingQueue();
    const item: ModelingItem = {
      id: generateId(),
      targetPhrase,
      symbols,
      category,
      demonstrated: false,
      demonstratedAt: null,
      userAttempted: false,
      attemptedAt: null,
      notes: '',
    };
    queue.push(item);
    this.saveModelingQueue(queue);
    return item;
  }

  markDemonstrated(id: string): void {
    const queue = this.getModelingQueue();
    const idx = queue.findIndex(q => q.id === id);
    if (idx >= 0) {
      queue[idx].demonstrated = true;
      queue[idx].demonstratedAt = toISO();
      this.saveModelingQueue(queue);
    }
  }

  markAttempted(id: string): void {
    const queue = this.getModelingQueue();
    const idx = queue.findIndex(q => q.id === id);
    if (idx >= 0) {
      queue[idx].userAttempted = true;
      queue[idx].attemptedAt = toISO();
      this.saveModelingQueue(queue);
    }
  }

  removeModelingItem(id: string): void {
    const queue = this.getModelingQueue().filter(q => q.id !== id);
    this.saveModelingQueue(queue);
  }

  // ── Communication Log ─────────────────────────────────────────────────

  getLog(): CommunicationLogEntry[] {
    const saved = localStorage.getItem(KEYS.LOG);
    return saved ? JSON.parse(saved) : generateDemoLog();
  }

  saveLog(log: CommunicationLogEntry[]): void {
    localStorage.setItem(KEYS.LOG, JSON.stringify(log));
  }

  addLogEntry(sessionId: string, type: LogEntryType, content: string, isUserGenerated: boolean, partnerName: string, symbols?: string[], promptLevel?: PromptLevel): CommunicationLogEntry {
    const log = this.getLog();
    const entry: CommunicationLogEntry = {
      id: generateId(),
      sessionId,
      timestamp: toISO(),
      type,
      content,
      isUserGenerated,
      partnerName,
      symbols,
      promptLevel,
    };
    log.push(entry);
    if (log.length > 500) log.shift();
    this.saveLog(log);
    return entry;
  }

  // ── Tips ──────────────────────────────────────────────────────────────

  getTips(): PartnerTip[] {
    const saved = localStorage.getItem(KEYS.TIPS);
    return saved ? JSON.parse(saved) : generateDemoTips();
  }

  saveTips(tips: PartnerTip[]): void {
    localStorage.setItem(KEYS.TIPS, JSON.stringify(tips));
  }

  markTipRead(id: string): void {
    const tips = this.getTips();
    const idx = tips.findIndex(t => t.id === id);
    if (idx >= 0) {
      tips[idx].isRead = true;
      this.saveTips(tips);
    }
  }

  // ── Partner Progress ──────────────────────────────────────────────────

  getPartnerProgress(partnerId: string): PartnerProgress {
    const sessions = this.getSessions().filter(s => s.partnerId === partnerId && s.status === 'completed');
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
    const totalIndependent = sessions.reduce((sum, s) => sum + s.independentMessages, 0);

    return {
      partnerId,
      totalSessions,
      totalDuration,
      avgSessionDuration: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
      totalMessages,
      avgMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
      independenceRate: totalMessages > 0 ? totalIndependent / totalMessages : 0,
      mostUsedSymbols: [
        { symbol: 'want', count: 25 },
        { symbol: 'I', count: 22 },
        { symbol: 'more', count: 18 },
        { symbol: 'help', count: 15 },
        { symbol: 'go', count: 12 },
      ],
      weeklySessionCounts: [
        { week: 'Week 1', count: 3 },
        { week: 'Week 2', count: 4 },
        { week: 'Week 3', count: 2 },
        { week: 'Week 4', count: 5 },
      ],
      promptLevelDistribution: [
        { level: 'independent', count: 15 },
        { level: 'gestural', count: 8 },
        { level: 'verbal', count: 12 },
        { level: 'model', count: 6 },
        { level: 'partial_physical', count: 3 },
        { level: 'full_physical', count: 1 },
      ],
      communicationLevelHistory: [
        { date: '2025-01-15', level: 'emerging' },
        { date: '2025-02-01', level: 'developing' },
        { date: '2025-02-15', level: 'developing' },
      ],
    };
  }

  // ── Settings ──────────────────────────────────────────────────────────

  getSettings(): PartnerSettings {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    const defaults: PartnerSettings = {
      defaultSessionType: 'guided',
      defaultSessionDuration: 30,
      autoLogInteractions: true,
      showPartnerTips: true,
      enableModelingQueue: true,
      promptHierarchyEnabled: true,
      sessionReminders: true,
      reminderFrequency: 'daily',
      communicationLevel: 'developing',
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  }

  updateSettings(partial: Partial<PartnerSettings>): PartnerSettings {
    const settings = { ...this.getSettings(), ...partial };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
}

export const communicationPartnerService = new CommunicationPartnerService();
