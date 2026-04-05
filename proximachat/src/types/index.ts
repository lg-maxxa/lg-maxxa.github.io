/**
 * ProximaChat - Core Type Definitions
 */

// ─── User & Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarEmoji?: string;
  status: string;
  createdAt: number;
}

// ─── Peer / Nearby Device ────────────────────────────────────────────────────

export type PeerStatus =
  | 'discovered'
  | 'requesting'
  | 'pending_approval' // they sent us a request
  | 'friend'
  | 'rejected'
  | 'connected'
  | 'disconnected';

export type ConnectionType = 'bluetooth' | 'wifi' | 'both' | 'unknown';

export interface Peer {
  id: string;               // Unique peer ID (device ID or generated)
  username: string;
  displayName: string;
  avatarColor: string;
  avatarEmoji?: string;
  status: PeerStatus;
  connectionType: ConnectionType;
  rssi?: number;            // Signal strength
  distance?: 'near' | 'medium' | 'far';
  lastSeen: number;
  isOnline: boolean;
}

// ─── Friend Request ───────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface FriendRequest {
  id: string;
  fromPeerId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatarColor: string;
  fromAvatarEmoji?: string;
  toPeerId: string;
  status: RequestStatus;
  message?: string;
  createdAt: number;
  respondedAt?: number;
}

// ─── Friend ───────────────────────────────────────────────────────────────────

export interface Friend {
  id: string;               // Same as Peer.id
  username: string;
  displayName: string;
  avatarColor: string;
  avatarEmoji?: string;
  addedAt: number;
  lastMessageAt?: number;
  isOnline: boolean;
  connectionType: ConnectionType;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  text?: string;
  fileUri?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: MessageStatus;
  timestamp: number;
  editedAt?: number;
  replyToId?: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;               // Derived from peer pair IDs
  peerId: string;
  peerUsername: string;
  peerDisplayName: string;
  peerAvatarColor: string;
  peerAvatarEmoji?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPeerOnline: boolean;
  isPeerTyping: boolean;
  lastActivityAt: number;
  connectionType: ConnectionType;
  createdAt: number;
}

// ─── Network / Transport ─────────────────────────────────────────────────────

export type NetworkEvent =
  | 'peer_found'
  | 'peer_lost'
  | 'connected'
  | 'disconnected'
  | 'message_received'
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'friend_request_rejected'
  | 'typing_start'
  | 'typing_stop'
  | 'read_receipt'
  | 'delivery_receipt';

export interface NetworkPayload {
  type: NetworkEvent;
  senderId: string;
  senderProfile?: Partial<UserProfile>;
  messageId?: string;
  message?: Message;
  friendRequest?: FriendRequest;
  timestamp: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export type AppTab = 'chats' | 'discovery' | 'friends' | 'settings';

export interface DiscoveryState {
  isScanning: boolean;
  peers: Peer[];
  error?: string;
  lastScanAt?: number;
}

export interface AppState {
  profile: UserProfile | null;
  isProfileSetup: boolean;
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  friends: Friend[];
  friendRequests: FriendRequest[];
  discovery: DiscoveryState;
  activeConversationId: string | null;
  isBluetoothEnabled: boolean;
  isWifiEnabled: boolean;
  settings: AppSettings;
  diagnostics: DiagnosticsState;
}

export interface InvitePayload {
  version: 1;
  profileId: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarEmoji?: string;
  createdAt: number;
}

export interface AppSettings {
  themePack: 'classic' | 'midnight' | 'graphite';
  compactPeerCards: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  strictNearbyMode: boolean;
  deliveryRetryEnabled: boolean;
}

export interface DiagnosticsLogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  source: 'permissions' | 'discovery' | 'transport' | 'messaging' | 'system';
  message: string;
  timestamp: number;
}

export interface DiagnosticsState {
  lastPermissionCheckAt?: number;
  lastConnectionCheckAt?: number;
  logs: DiagnosticsLogEntry[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Setup: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Chats: undefined;
  Discovery: undefined;
  Friends: undefined;
  Settings: undefined;
};

export type ChatsStackParamList = {
  ConversationList: undefined;
  Chat: {conversationId: string; peerId: string; peerName: string};
};

export type FriendsStackParamList = {
  FriendsList: undefined;
  FriendRequests: undefined;
  DirectAdd: undefined;
};
