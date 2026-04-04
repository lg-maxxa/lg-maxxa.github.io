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
import {Platform} from 'react-native';
import type {EmitterSubscription} from 'react-native';
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
let _bleManager: {
  startDeviceScan: (
    uuids: string[] | null,
    options: {allowDuplicates?: boolean},
    listener: (error: unknown, device: unknown) => void,
  ) => void;
  stopDeviceScan: () => void;
  destroy?: () => void;
} | null = null;
let _wifiP2PModule: Record<string, unknown> | null = null;
let _wifiPeersSubscription: EmitterSubscription | null = null;

// Lazy-import native modules to avoid crash if unlinked
function getBle() {
  if (_bleManager) {
    return _bleManager;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {BleManager} = require('react-native-ble-plx');
    _bleManager = new BleManager();
    return _bleManager;
  } catch {
    return null;
  }
}

function getWifiP2P() {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (_wifiP2PModule) {
    return _wifiP2PModule;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _wifiP2PModule = require('react-native-wifi-p2p');
    return _wifiP2PModule;
  } catch {
    return null;
  }
}

function sanitizeUsername(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return cleaned.length >= 3 ? cleaned : `user_${Date.now().toString().slice(-5)}`;
}

function inferDistance(rssi?: number): Peer['distance'] | undefined {
  if (typeof rssi !== 'number') {
    return undefined;
  }
  if (rssi >= -67) {
    return 'near';
  }
  if (rssi >= -80) {
    return 'medium';
  }
  return 'far';
}

function parseBlePeer(device: unknown): Peer | null {
  if (!device || typeof device !== 'object') {
    return null;
  }
  const d = device as {
    id?: unknown;
    name?: unknown;
    localName?: unknown;
    rssi?: unknown;
  };
  if (typeof d.id !== 'string' || !d.id.trim()) {
    return null;
  }

  const displayName =
    (typeof d.name === 'string' && d.name.trim()) ||
    (typeof d.localName === 'string' && d.localName.trim()) ||
    'Nearby Device';
  const rssi = typeof d.rssi === 'number' ? d.rssi : undefined;

  return {
    id: d.id,
    username: sanitizeUsername(displayName),
    displayName,
    avatarColor: '#42A5F5',
    status: 'discovered',
    connectionType: 'bluetooth',
    rssi,
    distance: inferDistance(rssi),
    lastSeen: Date.now(),
    isOnline: true,
  };
}

function parseWifiPeer(device: unknown): Peer | null {
  if (!device || typeof device !== 'object') {
    return null;
  }
  const d = device as {
    deviceAddress?: unknown;
    deviceName?: unknown;
  };
  if (typeof d.deviceAddress !== 'string' || !d.deviceAddress.trim()) {
    return null;
  }
  const displayName =
    (typeof d.deviceName === 'string' && d.deviceName.trim()) ||
    'Wi-Fi Device';

  return {
    id: d.deviceAddress,
    username: sanitizeUsername(displayName),
    displayName,
    avatarColor: '#26A69A',
    status: 'discovered',
    connectionType: 'wifi',
    lastSeen: Date.now(),
    isOnline: true,
  };
}

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

    const bleManager = getBle();
    if (bleManager) {
      bleManager.startDeviceScan(
        [SERVICE_UUID],
        {allowDuplicates: false},
        (error, device) => {
          if (error) {
            console.error('[Nearby] BLE scan error:', error);
            return;
          }
          const peer = parseBlePeer(device);
          if (peer) {
            onPeerFound(peer);
          }
        },
      );
    }

    const wifiP2P = getWifiP2P();
    if (wifiP2P) {
      try {
        const wifi = wifiP2P as {
          initialize?: () => Promise<boolean>;
          subscribeOnPeersUpdates?: (callback: (data: {devices: unknown[]}) => void) => EmitterSubscription;
          startDiscoveringPeers?: () => Promise<string>;
          stopDiscoveringPeers?: () => Promise<void>;
        };
        await wifi.initialize?.();

        _wifiPeersSubscription = wifi.subscribeOnPeersUpdates?.((data) => {
          data.devices.forEach((device) => {
            const peer = parseWifiPeer(device);
            if (peer) {
              onPeerFound(peer);
            }
          });
        }) ?? null;

        if (typeof wifi.startDiscoveringPeers === 'function') {
          await wifi.startDiscoveringPeers();
        }
      } catch (err) {
        console.error('[Nearby] Wi-Fi Direct discovery error:', err);
      }
    }
  },

  /**
   * Stop scanning
   */
  stopDiscovery(): void {
    _isScanning = false;
    try {
      _bleManager?.stopDeviceScan();
    } catch (err) {
      console.error('[Nearby] Failed to stop BLE scan:', err);
    }
    try {
      const wifi = _wifiP2PModule as {
        stopDiscoveringPeers?: () => Promise<void>;
      } | null;
      if (_wifiPeersSubscription) {
        _wifiPeersSubscription.remove();
        _wifiPeersSubscription = null;
      }
      void wifi?.stopDiscoveringPeers?.();
    } catch (err) {
      console.error('[Nearby] Failed to stop Wi-Fi Direct discovery:', err);
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
    const wifi = getWifiP2P() as {
      sendMessageTo?: (message: string, address: string) => Promise<unknown>;
    } | null;
    if (wifi?.sendMessageTo) {
      try {
        await wifi.sendMessageTo(JSON.stringify(payload), peerId);
        return true;
      } catch (err) {
        console.error('[Nearby] Failed to send friend request:', err);
      }
    }
    return false;
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
    const wifi = getWifiP2P() as {
      sendMessageTo?: (message: string, address: string) => Promise<unknown>;
    } | null;
    if (wifi?.sendMessageTo) {
      try {
        await wifi.sendMessageTo(JSON.stringify(payload), peerId);
        return true;
      } catch (err) {
        console.error('[Nearby] Failed to respond to friend request:', err);
      }
    }
    return false;
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
    const wifi = getWifiP2P() as {
      sendMessageTo?: (message: string, address: string) => Promise<unknown>;
    } | null;
    if (wifi?.sendMessageTo) {
      try {
        await wifi.sendMessageTo(JSON.stringify(payload), peerId);
        return true;
      } catch (err) {
        console.error('[Nearby] Failed to send message:', err);
      }
    }
    return false;
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
    try {
      _bleManager?.destroy?.();
    } catch {
      // Ignore cleanup errors.
    }
    _bleManager = null;
    _wifiP2PModule = null;
    _wifiPeersSubscription = null;
    _listeners = [];
    _profile = null;
  },
};
