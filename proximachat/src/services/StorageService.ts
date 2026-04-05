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
import type {CryptoIdentity} from './IdentityService';

const KEYS = {
  PROFILE: '@proximachat/profile',
  FRIENDS: '@proximachat/friends',
  FRIEND_REQUESTS: '@proximachat/friend_requests',
  CONVERSATIONS: '@proximachat/conversations',
  DISCOVERED_PEERS: '@proximachat/discovered_peers',
  MESSAGES_PREFIX: '@proximachat/messages/',
  SETTINGS: '@proximachat/settings',
  IDENTITY: '@proximachat/identity',
  SQLITE_MIGRATED: '@proximachat/sqlite_migrated_v1',
};

let _sqliteDb: {
  executeSql: (sql: string, params?: unknown[]) => Promise<Array<{rows: {length: number; item: (idx: number) => {payload: string}}}>>;
} | null = null;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function ensureSqlite(): Promise<typeof _sqliteDb> {
  if (_sqliteDb) {
    return _sqliteDb;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sqlite = require('react-native-sqlite-storage');
    sqlite.enablePromise(true);
    const db = await sqlite.openDatabase({
      name: 'proximachat.db',
      location: 'default',
    });
    _sqliteDb = db;
    const readyDb = db;

    await readyDb.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        payload TEXT NOT NULL
      );`,
    );

    await readyDb.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(conversation_id, timestamp);',
    );

    return readyDb;
  } catch {
    _sqliteDb = null;
    return null;
  }
}

async function migrateMessagesToSqliteIfNeeded(): Promise<void> {
  try {
    const migrated = await AsyncStorage.getItem(KEYS.SQLITE_MIGRATED);
    if (migrated === '1') {
      return;
    }

    const db = await ensureSqlite();
    if (!db) {
      return;
    }

    const keys = await AsyncStorage.getAllKeys();
    const messageKeys = keys.filter((k) => k.startsWith(KEYS.MESSAGES_PREFIX));

    for (const key of messageKeys) {
      // eslint-disable-next-line no-await-in-loop
      const raw = await AsyncStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const conversationId = key.replace(KEYS.MESSAGES_PREFIX, '');
      let parsed: Message[] = [];
      try {
        parsed = JSON.parse(raw) as Message[];
      } catch {
        parsed = [];
      }

      for (const msg of parsed) {
        // eslint-disable-next-line no-await-in-loop
        await db.executeSql(
          'INSERT OR REPLACE INTO messages (id, conversation_id, timestamp, payload) VALUES (?, ?, ?, ?);',
          [msg.id, conversationId, msg.timestamp, JSON.stringify(msg)],
        );
      }
    }

    await AsyncStorage.setItem(KEYS.SQLITE_MIGRATED, '1');
  } catch (err) {
    console.warn('[Storage] SQLite migration skipped due to error:', err);
  }
}

export const StorageService = {
  async init(): Promise<void> {
    try {
      await ensureSqlite();
      await migrateMessagesToSqliteIfNeeded();
      console.log('[Storage] Initialized');
    } catch (err) {
      console.warn('[Storage] Initialization fallback to AsyncStorage only:', err);
    }
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  async loadProfile(): Promise<UserProfile | null> {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return safeParse<UserProfile | null>(raw, null);
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
    return safeParse<Friend[]>(raw, []);
  },

  // ── Friend Requests ───────────────────────────────────────────────────────
  async saveFriendRequests(requests: FriendRequest[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  },

  async loadFriendRequests(): Promise<FriendRequest[]> {
    const raw = await AsyncStorage.getItem(KEYS.FRIEND_REQUESTS);
    return safeParse<FriendRequest[]>(raw, []);
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
    return safeParse<Conversation[]>(raw, []);
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

    const db = await ensureSqlite();
    if (db) {
      for (const msg of trimmed) {
        // eslint-disable-next-line no-await-in-loop
        await db.executeSql(
          'INSERT OR REPLACE INTO messages (id, conversation_id, timestamp, payload) VALUES (?, ?, ?, ?);',
          [msg.id, conversationId, msg.timestamp, JSON.stringify(msg)],
        );
      }
      return;
    }

    await AsyncStorage.setItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
      JSON.stringify(trimmed),
    );
  },

  async loadMessages(conversationId: string): Promise<Message[]> {
    const db = await ensureSqlite();
    if (db) {
      const rows = await db.executeSql(
        'SELECT payload FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC;',
        [conversationId],
      );
      const first = rows[0];
      const out: Message[] = [];
      for (let i = 0; i < first.rows.length; i += 1) {
        try {
          out.push(JSON.parse(first.rows.item(i).payload) as Message);
        } catch {
          // Ignore malformed rows.
        }
      }
      return out;
    }

    const raw = await AsyncStorage.getItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
    );
    return safeParse<Message[]>(raw, []);
  },

  async clearMessages(conversationId: string): Promise<void> {
    const db = await ensureSqlite();
    if (db) {
      await db.executeSql('DELETE FROM messages WHERE conversation_id = ?;', [conversationId]);
      return;
    }

    await AsyncStorage.removeItem(
      `${KEYS.MESSAGES_PREFIX}${conversationId}`,
    );
  },

  // ── Cryptographic identity ───────────────────────────────────────────────
  async saveIdentity(identity: CryptoIdentity): Promise<void> {
    await AsyncStorage.setItem(KEYS.IDENTITY, JSON.stringify(identity));
  },

  async loadIdentity(): Promise<CryptoIdentity | null> {
    const raw = await AsyncStorage.getItem(KEYS.IDENTITY);
    return safeParse<CryptoIdentity | null>(raw, null);
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async loadSettings(): Promise<Partial<AppSettings> | null> {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return safeParse<Partial<AppSettings> | null>(raw, null);
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
