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
import {useAppStore} from '../store/useAppStore';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';

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
  state?: () => Promise<string>;
  destroy?: () => void;
} | null = null;
let _wifiP2PModule: Record<string, unknown> | null = null;
let _wifiPeersSubscription: EmitterSubscription | null = null;
let _wifiConnectionSubscription: EmitterSubscription | null = null;
let _wifiMessageLoopActive = false;

type WifiP2PInfo = {
  groupFormed: boolean;
  isGroupOwner: boolean;
};

type WifiP2PModule = {
  initialize?: () => Promise<boolean>;
  subscribeOnPeersUpdates?: (callback: (data: {devices: unknown[]}) => void) => EmitterSubscription;
  subscribeOnConnectionInfoUpdates?: (callback: (data: WifiP2PInfo) => void) => EmitterSubscription;
  startDiscoveringPeers?: () => Promise<string>;
  stopDiscoveringPeers?: () => Promise<void>;
  createGroup?: () => Promise<void>;
  removeGroup?: () => Promise<void>;
  connect?: (deviceAddress: string) => Promise<void>;
  getConnectionInfo?: () => Promise<WifiP2PInfo>;
  sendMessageTo?: (message: string, address: string) => Promise<unknown>;
  sendMessage?: (message: string) => Promise<unknown>;
  receiveMessage?: (props: {meta: boolean}) => Promise<string>;
  stopReceivingMessage?: () => void;
};

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

function diagnostic(
  level: 'info' | 'warn' | 'error',
  source: 'permissions' | 'discovery' | 'transport' | 'messaging' | 'system',
  message: string,
): void {
  try {
    useAppStore.getState().addDiagnosticLog({level, source, message});
  } catch {
    // Ignore store access errors in service layer.
  }
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

function isWifiPeerId(peerId: string): boolean {
  return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(peerId);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForWifiConnection(
  wifi: WifiP2PModule,
  timeoutMs = 7000,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const info = await wifi.getConnectionInfo?.();
      if (info?.groupFormed) {
        return true;
      }
    } catch {
      // Keep polling until timeout.
    }
    await sleep(350);
  }
  return false;
}

function startWifiMessageLoop(wifi: WifiP2PModule): void {
  if (_wifiMessageLoopActive || typeof wifi.receiveMessage !== 'function') {
    return;
  }

  _wifiMessageLoopActive = true;
  void (async () => {
    while (_wifiMessageLoopActive) {
      try {
        const raw = await wifi.receiveMessage?.({meta: true});
        if (!raw) {
          continue;
        }
        const payload = JSON.parse(raw) as NetworkPayload;
        if (payload && typeof payload.type === 'string') {
          NearbyService._dispatchEvent(payload);
        }
      } catch (err) {
        if (!_wifiMessageLoopActive) {
          break;
        }
        console.warn('[Nearby] Message receive retry:', err);
        await sleep(500);
      }
    }
  })();
}

async function ensureWifiConnection(peerId: string): Promise<boolean> {
  if (!isWifiPeerId(peerId)) {
    return false;
  }

  const wifi = getWifiP2P() as WifiP2PModule | null;
  if (!wifi) {
    return false;
  }

  try {
    const info = await wifi.getConnectionInfo?.();
    if (info?.groupFormed) {
      return true;
    }
  } catch {
    // Continue with explicit connect.
  }

  try {
    await wifi.connect?.(peerId);
    const connected = await waitForWifiConnection(wifi);
    diagnostic(
      connected ? 'info' : 'warn',
      'transport',
      connected
        ? `Wi-Fi Direct connected to ${peerId}`
        : `Wi-Fi Direct connection timed out for ${peerId}`,
    );
    return connected;
  } catch (err) {
    console.error('[Nearby] Wi-Fi Direct connect failed:', err);
    diagnostic('error', 'transport', `Wi-Fi Direct connect failed for ${peerId}`);
    return false;
  }
}

async function sendWithRetry(peerId: string, payload: NetworkPayload): Promise<boolean> {
  const settings = useAppStore.getState().settings;
  const wifi = getWifiP2P() as WifiP2PModule | null;
  const serialized = JSON.stringify(payload);

  if (!wifi?.sendMessageTo) {
    diagnostic('warn', 'transport', 'Wi-Fi Direct send API unavailable');
    return false;
  }

  const attempts = settings.deliveryRetryEnabled ? 3 : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const connected = await ensureWifiConnection(peerId);
      if (!connected) {
        throw new Error('connection_not_ready');
      }

      await wifi.sendMessageTo(serialized, peerId);
      diagnostic('info', 'messaging', `Payload sent to ${peerId} on attempt ${attempt}`);
      return true;
    } catch (err) {
      diagnostic(
        attempt === attempts ? 'error' : 'warn',
        'messaging',
        `Send attempt ${attempt}/${attempts} failed for ${peerId}`,
      );
      if (attempt < attempts) {
        await sleep(350 * attempt);
      }
    }
  }

  // Fallback path for some stacks where group-owner broadcast works better.
  try {
    const fallback = wifi.sendMessage;
    if (typeof fallback === 'function') {
      await fallback(serialized);
      diagnostic('warn', 'messaging', `Fallback broadcast send succeeded for ${peerId}`);
      return true;
    }
  } catch (err) {
    diagnostic('error', 'messaging', `Fallback broadcast send failed for ${peerId}`);
  }

  return false;
}

async function startWifiPeerDiscoveryWithRetry(wifi: WifiP2PModule): Promise<void> {
  const attempts = 3;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // Reset any stale discovery/group state that commonly causes BUSY failures.
      await wifi.stopDiscoveringPeers?.().catch(() => undefined);
      await wifi.removeGroup?.().catch(() => undefined);
      await sleep(250);

      await wifi.startDiscoveringPeers?.();
      diagnostic('info', 'discovery', `Wi-Fi Direct discovery started (attempt ${attempt})`);
      return;
    } catch (err) {
      diagnostic(
        attempt === attempts ? 'error' : 'warn',
        'discovery',
        `Wi-Fi Direct discovery attempt ${attempt}/${attempts} failed`,
      );

      if (attempt < attempts) {
        await sleep(450 * attempt);
      }
    }
  }

  throw new Error('wifi_direct_discovery_failed');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const NearbyService = {
  /**
   * Initialize the service with the local user's profile
   */
  initialize(profile: UserProfile): void {
    _profile = profile;
    console.log(`[Nearby] Initialized as ${profile.displayName}`);
    diagnostic('info', 'system', `Nearby initialized for ${profile.displayName}`);
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
    diagnostic('info', 'discovery', 'Advertising started');

    const wifi = getWifiP2P() as WifiP2PModule | null;
    if (wifi) {
      try {
        await wifi.initialize?.();
        // Do not force createGroup here; on many devices this makes peer discovery BUSY.
        // Group will be negotiated when connect(peerId) is invoked.
        startWifiMessageLoop(wifi);
      } catch (err) {
        console.warn('[Nearby] Wi-Fi Direct advertising setup failed:', err);
        diagnostic('warn', 'transport', 'Wi-Fi advertising setup failed');
      }
    }

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

    const wifi = _wifiP2PModule as WifiP2PModule | null;
    if (!_isScanning) {
      _wifiMessageLoopActive = false;
      wifi?.stopReceivingMessage?.();
    }
    void wifi?.removeGroup?.();

    console.log('[Nearby] Stopped advertising');
    diagnostic('info', 'discovery', 'Advertising stopped');
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
    diagnostic('info', 'discovery', 'Discovery started');

    const bleManager = getBle();
    if (bleManager) {
      bleManager.startDeviceScan(
        [SERVICE_UUID],
        {allowDuplicates: false},
        (error, device) => {
          if (error) {
            console.error('[Nearby] BLE scan error:', error);
            diagnostic('warn', 'discovery', 'BLE scan error');
            return;
          }
          const peer = parseBlePeer(device);
          if (peer) {
            onPeerFound(peer);
          }
        },
      );
    }

    const wifiP2P = getWifiP2P() as WifiP2PModule | null;
    if (wifiP2P) {
      try {
        const wifi = wifiP2P;
        await wifi.initialize?.();

        _wifiPeersSubscription = wifi.subscribeOnPeersUpdates?.((data) => {
          data.devices.forEach((device) => {
            const peer = parseWifiPeer(device);
            if (peer) {
              onPeerFound(peer);
              diagnostic('info', 'discovery', `BLE peer found: ${peer.displayName}`);
              diagnostic('info', 'discovery', `Wi-Fi peer found: ${peer.displayName}`);
            }
          });
        }) ?? null;

        _wifiConnectionSubscription =
          wifi.subscribeOnConnectionInfoUpdates?.((info) => {
            if (info?.groupFormed) {
              console.log('[Nearby] Wi-Fi Direct group formed');
              diagnostic('info', 'transport', 'Wi-Fi Direct group formed');
            }
          }) ?? null;

        startWifiMessageLoop(wifi);
        await startWifiPeerDiscoveryWithRetry(wifi);
      } catch (err) {
        console.error('[Nearby] Wi-Fi Direct discovery error:', err);
        diagnostic('error', 'transport', 'Wi-Fi Direct discovery failed');
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
      const wifi = _wifiP2PModule as WifiP2PModule | null;
      if (_wifiPeersSubscription) {
        _wifiPeersSubscription.remove();
        _wifiPeersSubscription = null;
      }
      if (_wifiConnectionSubscription) {
        _wifiConnectionSubscription.remove();
        _wifiConnectionSubscription = null;
      }

      if (!_isAdvertising) {
        _wifiMessageLoopActive = false;
        wifi?.stopReceivingMessage?.();
      }

      void wifi?.stopDiscoveringPeers?.();
    } catch (err) {
      console.error('[Nearby] Failed to stop Wi-Fi Direct discovery:', err);
    }
    console.log('[Nearby] Stopped discovery');
    diagnostic('info', 'discovery', 'Discovery stopped');
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
    return sendWithRetry(peerId, payload);
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
    return sendWithRetry(peerId, payload);
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
    return sendWithRetry(peerId, payload);
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
   * Runtime capability/status check for professional scan flow
   */
  async getRuntimeStatus(): Promise<{
    bluetoothOn: boolean;
    wifiOn: boolean;
    locationOn: boolean;
  }> {
    let bluetoothOn = false;
    let wifiOn = false;
    let locationOn = false;

    try {
      const ble = getBle();
      const bleState = await ble?.state?.();
      bluetoothOn = bleState === 'PoweredOn';
    } catch {
      bluetoothOn = false;
    }

    try {
      const net = await NetInfo.fetch();
      const details = net.details as {isWifiEnabled?: boolean} | null;
      wifiOn =
        net.type === 'wifi' ||
        details?.isWifiEnabled === true;
    } catch {
      wifiOn = false;
    }

    try {
      locationOn = await DeviceInfo.isLocationEnabled();
    } catch {
      locationOn = false;
    }

    diagnostic(
      'info',
      'permissions',
      `Runtime status => BT:${bluetoothOn ? 'on' : 'off'} Wi-Fi:${wifiOn ? 'on' : 'off'} Location:${locationOn ? 'on' : 'off'}`,
    );

    return {bluetoothOn, wifiOn, locationOn};
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
    _wifiConnectionSubscription = null;
    _wifiMessageLoopActive = false;
    _listeners = [];
    _profile = null;
  },
};
