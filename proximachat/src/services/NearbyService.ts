/**
 * NearbyService - Cross-platform offline P2P discovery and messaging
 *
 * Android: Uses react-native-wifi-p2p (Wi-Fi Direct) + react-native-ble-plx (BLE)
 * iOS: Uses MultipeerConnectivity via react-native-ble-plx peripheral/central mode
 *
 * Architecture:
 * - BLE advertising: device broadcasts its presence as a BLE peripheral
 * - BLE scanning: device discovers nearby BLE peripherals
 * - On connection: negotiates TCP socket over Wi-Fi Direct (Android) or BLE
 * - Messages sent as JSON payloads over the socket/BLE channel
 */
import {Platform, NativeEventEmitter, NativeModules} from 'react-native';
import type {NetworkPayload, Peer, UserProfile} from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const SERVICE_NAME = 'ProximaChat';

type EventCallback = (payload: NetworkPayload) => void;

let _profile: UserProfile | null = null;
let _listeners: EventCallback[] = [];
let _isAdvertising = false;
let _isScanning = false;

// Lazy-import native modules to avoid crash if unlinked
function getBle() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {BleManager} = require('react-native-ble-plx');
    return new BleManager();
  } catch {
    return null;
  }
}

function getWifiP2P() {
  if (Platform.OS !== 'android') {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-wifi-p2p');
  } catch {
    return null;
  }
}

// ─── Mock / Simulation Layer (for development/testing without hardware) ───────
let _mockInterval: ReturnType<typeof setInterval> | null = null;
const MOCK_PEERS: Peer[] = [
  {
    id: 'mock-peer-1',
    username: 'alex_nearby',
    displayName: 'Alex',
    avatarColor: '#FF6B6B',
    avatarEmoji: '🦊',
    status: 'discovered',
    connectionType: 'bluetooth',
    rssi: -65,
    distance: 'near',
    lastSeen: Date.now(),
    isOnline: true,
  },
  {
    id: 'mock-peer-2',
    username: 'sam_2024',
    displayName: 'Sam',
    avatarColor: '#4ECDC4',
    avatarEmoji: '🐬',
    status: 'discovered',
    connectionType: 'wifi',
    rssi: -78,
    distance: 'medium',
    lastSeen: Date.now(),
    isOnline: true,
  },
  {
    id: 'mock-peer-3',
    username: 'jordan_p2p',
    displayName: 'Jordan',
    avatarColor: '#A8E6CF',
    avatarEmoji: '🌿',
    status: 'discovered',
    connectionType: 'both',
    rssi: -85,
    distance: 'far',
    lastSeen: Date.now(),
    isOnline: true,
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export const NearbyService = {
  /**
   * Initialize the service with the local user's profile
   */
  initialize(profile: UserProfile): void {
    _profile = profile;
    console.log(`[Nearby] Initialized as ${profile.displayName}`);
  },

  /**
   * Start advertising presence to nearby devices
   */
  async startAdvertising(): Promise<void> {
    if (_isAdvertising) {
      return;
    }
    _isAdvertising = true;
    console.log('[Nearby] Started advertising');

    // Real BLE advertising would be done here
    // For Android Wi-Fi Direct:
    // const wifiP2P = getWifiP2P();
    // if (wifiP2P) {
    //   await wifiP2P.initialize();
    //   await wifiP2P.createGroup();
    // }
  },

  /**
   * Stop advertising
   */
  stopAdvertising(): void {
    _isAdvertising = false;
    console.log('[Nearby] Stopped advertising');
  },

  /**
   * Start scanning for nearby peers
   */
  async startDiscovery(onPeerFound: (peer: Peer) => void): Promise<void> {
    if (_isScanning) {
      return;
    }
    _isScanning = true;
    console.log('[Nearby] Started discovery');

    // ── Real BLE scanning would go here ──────────────────────────────────
    // const bleManager = getBle();
    // if (bleManager) {
    //   bleManager.startDeviceScan(
    //     [SERVICE_UUID],
    //     {allowDuplicates: false},
    //     (error, device) => {
    //       if (error || !device) return;
    //       const peer = parseBleDevice(device);
    //       onPeerFound(peer);
    //     }
    //   );
    // }

    // ── Simulation: emit mock peers progressively ─────────────────────────
    let peerIdx = 0;
    _mockInterval = setInterval(() => {
      if (peerIdx < MOCK_PEERS.length) {
        const peer = {
          ...MOCK_PEERS[peerIdx],
          lastSeen: Date.now(),
        };
        onPeerFound(peer);
        peerIdx++;
      }
    }, 1500);
  },

  /**
   * Stop scanning
   */
  stopDiscovery(): void {
    _isScanning = false;
    if (_mockInterval) {
      clearInterval(_mockInterval);
      _mockInterval = null;
    }
    console.log('[Nearby] Stopped discovery');
  },

  /**
   * Send a friend request to a peer
   */
  async sendFriendRequest(
    peerId: string,
    requestId: string,
  ): Promise<boolean> {
    if (!_profile) {
      return false;
    }
    const payload: NetworkPayload = {
      type: 'friend_request_received',
      senderId: _profile.id,
      senderProfile: {
        id: _profile.id,
        username: _profile.username,
        displayName: _profile.displayName,
        avatarColor: _profile.avatarColor,
        avatarEmoji: _profile.avatarEmoji,
      },
      friendRequest: {
        id: requestId,
        fromPeerId: _profile.id,
        fromUsername: _profile.username,
        fromDisplayName: _profile.displayName,
        fromAvatarColor: _profile.avatarColor,
        fromAvatarEmoji: _profile.avatarEmoji,
        toPeerId: peerId,
        status: 'pending',
        createdAt: Date.now(),
      },
      timestamp: Date.now(),
    };
    console.log(`[Nearby] Sending friend request to ${peerId}`);
    // In real impl: send over BLE/socket channel
    // _sendPayload(peerId, payload);
    return true;
  },

  /**
   * Respond to a friend request
   */
  async respondToFriendRequest(
    peerId: string,
    requestId: string,
    accepted: boolean,
  ): Promise<boolean> {
    if (!_profile) {
      return false;
    }
    const payload: NetworkPayload = {
      type: accepted ? 'friend_request_accepted' : 'friend_request_rejected',
      senderId: _profile.id,
      senderProfile: {
        id: _profile.id,
        username: _profile.username,
        displayName: _profile.displayName,
        avatarColor: _profile.avatarColor,
      },
      friendRequest: {
        id: requestId,
        fromPeerId: peerId,
        fromUsername: '',
        fromDisplayName: '',
        fromAvatarColor: '',
        toPeerId: _profile.id,
        status: accepted ? 'accepted' : 'rejected',
        createdAt: Date.now(),
        respondedAt: Date.now(),
      },
      timestamp: Date.now(),
    };
    console.log(
      `[Nearby] ${accepted ? 'Accepted' : 'Rejected'} friend request from ${peerId}`,
    );
    // _sendPayload(peerId, payload);
    return true;
  },

  /**
   * Send a chat message to a peer
   */
  async sendMessage(
    peerId: string,
    message: import('../types').Message,
  ): Promise<boolean> {
    if (!_profile) {
      return false;
    }
    const payload: NetworkPayload = {
      type: 'message_received',
      senderId: _profile.id,
      message,
      timestamp: Date.now(),
    };
    console.log(`[Nearby] Sending message to ${peerId}: ${message.text}`);
    // _sendPayload(peerId, payload);
    // Simulate delivery receipt after 500ms
    setTimeout(() => {
      _listeners.forEach((cb) =>
        cb({
          type: 'delivery_receipt',
          senderId: peerId,
          messageId: message.id,
          timestamp: Date.now(),
        }),
      );
    }, 500);
    return true;
  },

  /**
   * Send typing indicator
   */
  sendTyping(peerId: string, isTyping: boolean): void {
    if (!_profile) {
      return;
    }
    const payload: NetworkPayload = {
      type: isTyping ? 'typing_start' : 'typing_stop',
      senderId: _profile.id,
      timestamp: Date.now(),
    };
    // _sendPayload(peerId, payload);
  },

  /**
   * Subscribe to network events
   */
  addEventListener(callback: EventCallback): () => void {
    _listeners.push(callback);
    return () => {
      _listeners = _listeners.filter((cb) => cb !== callback);
    };
  },

  /**
   * Dispatch an event (for simulation / incoming messages)
   */
  _dispatchEvent(payload: NetworkPayload): void {
    _listeners.forEach((cb) => cb(payload));
  },

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return _isAdvertising || _isScanning;
  },

  /**
   * Cleanup
   */
  destroy(): void {
    NearbyService.stopAdvertising();
    NearbyService.stopDiscovery();
    _listeners = [];
    _profile = null;
  },
};
