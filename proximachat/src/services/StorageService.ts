/**
 * StorageService - AsyncStorage wrapper for data persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile,
  Friend,
  FriendRequest,
  Conversation,
  Peer,
  Message,
  AppSettings,
} from '../types';

const KEYS = {
  PROFILE: '@proximachat/profile',
  FRIENDS: '@proximachat/friends',
  FRIEND_REQUESTS: '@proximachat/friend_requests',
  CONVERSATIONS: '@proximachat/conversations',
  DISCOVERED_PEERS: '@proximachat/discovered_peers',
  MESSAGES_PREFIX: '@proximachat/messages/',
  SETTINGS: '@proximachat/settings',
};

export const StorageService = {
  async init(): Promise<void> {
    // Initialization placeholder (migration logic, cleanup, etc.)
    console.log('[Storage] Initialized');
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  async loadProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  },

  async clearProfile(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.PROFILE);
  },

  // ── Friends ───────────────────────────────────────────────────────────────
  async saveFriends(friends: Friend[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIENDS, JSON.stringify(friends));
  },

  async loadFriends(): Promise<Friend[]> {
    const raw = await AsyncStorage.getItem(KEYS.FRIENDS);
    return raw ? JSON.parse(raw) : [];
  },

  // ── Friend Requests ───────────────────────────────────────────────────────
  async saveFriendRequests(requests: FriendRequest[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  },

  async loadFriendRequests(): Promise<FriendRequest[]> {
    const raw = await AsyncStorage.getItem(KEYS.FRIEND_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  },

  // ── Conversations ─────────────────────────────────────────────────────────
  async saveConversations(conversations: Conversation[]): Promise<void> {
    await AsyncStorage.setItem(
      KEYS.CONVERSATIONS,
      JSON.stringify(conversations),
    );
  },

  async loadConversations(): Promise<Conversation[]> {
    const raw = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  // ── Discovery peers ───────────────────────────────────────────────────────
  async saveDiscoveredPeers(peers: Peer[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.DISCOVERED_PEERS, JSON.stringify(peers));
  },

  async loadDiscoveredPeers(): Promise<Peer[]> {
    const raw = await AsyncStorage.getItem(KEYS.DISCOVERED_PEERS);
    return raw ? JSON.parse(raw) : [];
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  async saveMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    // Keep only last 200 messages per conversation to avoid storage bloat
    const trimmed = messages.slice(-200);
    await AsyncStorage.setItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
      JSON.stringify(trimmed),
    );
  },

  async loadMessages(conversationId: string): Promise<Message[]> {
    const raw = await AsyncStorage.getItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
    );
    return raw ? JSON.parse(raw) : [];
  },

  async clearMessages(conversationId: string): Promise<void> {
    await AsyncStorage.removeItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
    );
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async loadSettings(): Promise<Partial<AppSettings> | null> {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  },

  // ── Full hydration ────────────────────────────────────────────────────────
  async loadAll(): Promise<{
    profile: UserProfile | null;
    friends: Friend[];
    friendRequests: FriendRequest[];
    conversations: Conversation[];
    settings: Partial<AppSettings> | null;
  }> {
    const [profile, friends, friendRequests, conversations, settings] = await Promise.all([
      StorageService.loadProfile(),
      StorageService.loadFriends(),
      StorageService.loadFriendRequests(),
      StorageService.loadConversations(),
      StorageService.loadSettings(),
    ]);
    return {profile, friends, friendRequests, conversations, settings};
  },

  // ── Clear all ─────────────────────────────────────────────────────────────
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const proximaKeys = keys.filter((k) => k.startsWith('@proximachat/'));
    await AsyncStorage.multiRemove(proximaKeys);
  },
};
