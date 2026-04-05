/**
 * ProximaChat - Zustand App Store
 * Central state management for the application
 */
import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import type {
  AppState,
  UserProfile,
  Peer,
  Friend,
  FriendRequest,
  Conversation,
  Message,
  DiscoveryState,
  AppSettings,
  DiagnosticsLogEntry,
} from '../types';

interface AppActions {
  // Profile
  setProfile: (profile: UserProfile) => void;
  setProfileSetup: (done: boolean) => void;

  // Discovery
  setScanning: (scanning: boolean) => void;
  addPeer: (peer: Peer) => void;
  updatePeer: (peerId: string, updates: Partial<Peer>) => void;
  removePeer: (peerId: string) => void;
  clearPeers: () => void;

  // Friends
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriendOnlineStatus: (friendId: string, isOnline: boolean) => void;

  // Friend Requests
  addFriendRequest: (request: FriendRequest) => void;
  updateFriendRequest: (requestId: string, updates: Partial<FriendRequest>) => void;
  removeFriendRequest: (requestId: string) => void;

  // Conversations
  upsertConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  markConversationRead: (conversationId: string) => void;
  setPeerTyping: (conversationId: string, isTyping: boolean) => void;

  // Messages
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;

  // System
  setActiveConversation: (id: string | null) => void;
  setBluetoothEnabled: (enabled: boolean) => void;
  setWifiEnabled: (enabled: boolean) => void;
  hydrateState: (partial: Partial<AppState>) => void;

  // Professional settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Diagnostics
  addDiagnosticLog: (entry: Omit<DiagnosticsLogEntry, 'id' | 'timestamp'> & {id?: string; timestamp?: number}) => void;
  clearDiagnosticLogs: () => void;
}

const initialDiscovery: DiscoveryState = {
  isScanning: false,
  peers: [],
};

const initialState: AppState = {
  profile: null,
  isProfileSetup: false,
  conversations: [],
  messages: {},
  friends: [],
  friendRequests: [],
  discovery: initialDiscovery,
  activeConversationId: null,
  isBluetoothEnabled: false,
  isWifiEnabled: false,
  settings: {
    themePack: 'classic',
    compactPeerCards: false,
    reducedMotion: false,
    highContrast: false,
    strictNearbyMode: false,
    deliveryRetryEnabled: true,
  },
  diagnostics: {
    logs: [],
  },
};

export const useAppStore = create<AppState & AppActions>()(
  immer((set) => ({
    ...initialState,

    // ── Profile ─────────────────────────────────────────────────────────────
    setProfile: (profile) =>
      set((state) => {
        state.profile = profile;
      }),

    setProfileSetup: (done) =>
      set((state) => {
        state.isProfileSetup = done;
      }),

    // ── Discovery ────────────────────────────────────────────────────────────
    setScanning: (scanning) =>
      set((state) => {
        state.discovery.isScanning = scanning;
        if (scanning) {
          state.discovery.lastScanAt = Date.now();
        }
      }),

    addPeer: (peer) =>
      set((state) => {
        const idx = state.discovery.peers.findIndex((p) => p.id === peer.id);
        if (idx >= 0) {
          state.discovery.peers[idx] = {...state.discovery.peers[idx], ...peer};
        } else {
          state.discovery.peers.push(peer);
        }
      }),

    updatePeer: (peerId, updates) =>
      set((state) => {
        const idx = state.discovery.peers.findIndex((p) => p.id === peerId);
        if (idx >= 0) {
          Object.assign(state.discovery.peers[idx], updates);
        }
      }),

    removePeer: (peerId) =>
      set((state) => {
        state.discovery.peers = state.discovery.peers.filter((p) => p.id !== peerId);
      }),

    clearPeers: () =>
      set((state) => {
        state.discovery.peers = [];
      }),

    // ── Friends ──────────────────────────────────────────────────────────────
    addFriend: (friend) =>
      set((state) => {
        const exists = state.friends.some((f) => f.id === friend.id);
        if (!exists) {
          state.friends.push(friend);
        }
      }),

    removeFriend: (friendId) =>
      set((state) => {
        state.friends = state.friends.filter((f) => f.id !== friendId);
      }),

    updateFriendOnlineStatus: (friendId, isOnline) =>
      set((state) => {
        const friend = state.friends.find((f) => f.id === friendId);
        if (friend) {
          friend.isOnline = isOnline;
        }
      }),

    // ── Friend Requests ──────────────────────────────────────────────────────
    addFriendRequest: (request) =>
      set((state) => {
        const exists = state.friendRequests.some((r) => r.id === request.id);
        if (!exists) {
          state.friendRequests.push(request);
        }
      }),

    updateFriendRequest: (requestId, updates) =>
      set((state) => {
        const req = state.friendRequests.find((r) => r.id === requestId);
        if (req) {
          Object.assign(req, updates);
        }
      }),

    removeFriendRequest: (requestId) =>
      set((state) => {
        state.friendRequests = state.friendRequests.filter((r) => r.id !== requestId);
      }),

    // ── Conversations ─────────────────────────────────────────────────────────
    upsertConversation: (conversation) =>
      set((state) => {
        const idx = state.conversations.findIndex((c) => c.id === conversation.id);
        if (idx >= 0) {
          state.conversations[idx] = {
            ...state.conversations[idx],
            ...conversation,
          };
        } else {
          state.conversations.push(conversation);
        }
        // Sort by last activity
        state.conversations.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
      }),

    updateConversation: (id, updates) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === id);
        if (conv) {
          Object.assign(conv, updates);
          state.conversations.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
        }
      }),

    markConversationRead: (conversationId) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.unreadCount = 0;
        }
        // Mark messages as read
        const msgs = state.messages[conversationId] ?? [];
        msgs.forEach((m) => {
          if (m.status === 'delivered') {
            m.status = 'read';
          }
        });
      }),

    setPeerTyping: (conversationId, isTyping) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.isPeerTyping = isTyping;
        }
      }),

    // ── Messages ──────────────────────────────────────────────────────────────
    addMessage: (conversationId, message) =>
      set((state) => {
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        const exists = state.messages[conversationId].some(
          (m) => m.id === message.id,
        );
        if (!exists) {
          state.messages[conversationId].push(message);
        }
        // Update conversation last message
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.lastMessage = message;
          conv.lastActivityAt = message.timestamp;
          if (message.senderId !== state.profile?.id) {
            conv.unreadCount += 1;
          }
          state.conversations.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
        }
      }),

    updateMessageStatus: (conversationId, messageId, status) =>
      set((state) => {
        const msgs = state.messages[conversationId] ?? [];
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.status = status;
        }
      }),

    setMessages: (conversationId, messages) =>
      set((state) => {
        state.messages[conversationId] = messages;
      }),

    // ── System ────────────────────────────────────────────────────────────────
    setActiveConversation: (id) =>
      set((state) => {
        state.activeConversationId = id;
      }),

    setBluetoothEnabled: (enabled) =>
      set((state) => {
        state.isBluetoothEnabled = enabled;
      }),

    setWifiEnabled: (enabled) =>
      set((state) => {
        state.isWifiEnabled = enabled;
      }),

    hydrateState: (partial) =>
      set((state) => {
        Object.assign(state, partial);
      }),

    updateSettings: (updates) =>
      set((state) => {
        state.settings = {...state.settings, ...updates};
      }),

    addDiagnosticLog: (entry) =>
      set((state) => {
        const item: DiagnosticsLogEntry = {
          id: entry.id ?? `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
          level: entry.level,
          source: entry.source,
          message: entry.message,
          timestamp: entry.timestamp ?? Date.now(),
        };

        state.diagnostics.logs.unshift(item);
        state.diagnostics.logs = state.diagnostics.logs.slice(0, 200);
      }),

    clearDiagnosticLogs: () =>
      set((state) => {
        state.diagnostics.logs = [];
      }),
  })),
);
