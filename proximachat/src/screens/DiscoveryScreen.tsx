/**
 * DiscoveryScreen - Radar-style discovery of nearby peers via BLE / Wi-Fi Direct
 */
import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PeerCard} from '../components/PeerCard';
import {EmptyState} from '../components/EmptyState';
import {SvgIcon} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {NearbyService} from '../services/NearbyService';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';
import type {Peer, Friend, FriendRequest} from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('react-native-uuid');

export const DiscoveryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    profile,
    discovery,
    friends,
    setScanning,
    addPeer,
    updatePeer,
    clearPeers,
    addFriend,
    addFriendRequest,
  } = useAppStore();

  const [pulseAnim] = useState(new Animated.Value(1));

  // ── Pulse animation ────────────────────────────────────────────────────────
  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    if (discovery.isScanning) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      pulse?.stop();
    };
  }, [discovery.isScanning, pulseAnim]);

  // ── Start/stop scanning ───────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    if (!profile) {
      return;
    }
    clearPeers();
    setScanning(true);
    NearbyService.initialize(profile);
    await NearbyService.startAdvertising();
    await NearbyService.startDiscovery((peer) => {
      // Skip ourselves and already-friends
      if (peer.id === profile.id) {
        return;
      }
      if (friends.some((f) => f.id === peer.id)) {
        return;
      }
      addPeer(peer);
    });

    // Auto-stop after 30s
    setTimeout(() => {
      stopScan();
    }, 30000);
  }, [profile, clearPeers, setScanning, friends, addPeer]);

  const stopScan = useCallback(() => {
    NearbyService.stopDiscovery();
    NearbyService.stopAdvertising();
    setScanning(false);
  }, [setScanning]);

  // ── Send friend request ───────────────────────────────────────────────────
  const handleSendRequest = useCallback(
    async (peer: Peer) => {
      if (!profile) {
        return;
      }
      updatePeer(peer.id, {status: 'requesting'});

      const requestId = String(uuid.v4());

      const ok = await NearbyService.sendFriendRequest(peer.id, requestId);
      if (ok) {
        updatePeer(peer.id, {status: 'pending_approval'});

        const request: FriendRequest = {
          id: requestId,
          fromPeerId: profile.id,
          fromUsername: profile.username,
          fromDisplayName: profile.displayName,
          fromAvatarColor: profile.avatarColor,
          fromAvatarEmoji: profile.avatarEmoji,
          toPeerId: peer.id,
          status: 'pending',
          createdAt: Date.now(),
        };
        addFriendRequest(request);
        await StorageService.saveFriendRequests(
          useAppStore.getState().friendRequests,
        );

        // Simulate auto-accept in demo mode
        simulateDemoAccept(peer, profile, addFriend, updatePeer);
      } else {
        updatePeer(peer.id, {status: 'discovered'});
        Alert.alert('Error', 'Could not reach this device. Try moving closer.');
      }
    },
    [profile, updatePeer, addFriendRequest, addFriend],
  );

  const peers = discovery.peers;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Find people nearby</Text>
          </View>

          {/* Connection indicators */}
          <View style={styles.indicators}>
            <View style={styles.indicator}>
              <SvgIcon
                name="bluetooth"
                size={14}
                color={
                  discovery.isScanning ? COLORS.accent : 'rgba(255,255,255,0.5)'
                }
              />
            </View>
            <View style={styles.indicator}>
              <SvgIcon
                name="wifi"
                size={14}
                color={
                  discovery.isScanning ? COLORS.accent : 'rgba(255,255,255,0.5)'
                }
              />
            </View>
          </View>
        </View>

        {/* Scan button */}
        <TouchableOpacity
          style={[
            styles.scanButton,
            discovery.isScanning && styles.scanButtonActive,
          ]}
          onPress={discovery.isScanning ? stopScan : startScan}
          activeOpacity={0.85}>
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <SvgIcon
              name="radar"
              size={20}
              color={discovery.isScanning ? COLORS.primary : COLORS.textWhite}
            />
          </Animated.View>
          <Text
            style={[
              styles.scanButtonText,
              discovery.isScanning && styles.scanButtonTextActive,
            ]}>
            {discovery.isScanning ? 'Stop' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      {discovery.isScanning && (
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Scanning via Bluetooth &amp; Wi-Fi Direct…
          </Text>
        </View>
      )}

      {/* Peers list */}
      {!discovery.isScanning && peers.length === 0 ? (
        <EmptyState
          icon="radar"
          title="No one nearby"
          subtitle={`Tap "Scan" to discover people around you via Bluetooth and Wi-Fi.${
            Platform.OS === 'ios'
              ? '\n\nNote: iOS uses MultipeerConnectivity.'
              : ''
          }`}>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={startScan}
            activeOpacity={0.85}>
            <SvgIcon name="radar" size={18} color={COLORS.textWhite} />
            <Text style={styles.emptyButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </EmptyState>
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <PeerCard peer={item} onSendRequest={handleSendRequest} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            peers.length > 0 ? (
              <Text style={styles.listHeader}>
                {peers.length} device{peers.length !== 1 ? 's' : ''} found
              </Text>
            ) : null
          }
          ListFooterComponent={
            discovery.isScanning && peers.length === 0 ? (
              <View style={styles.scanningFooter}>
                <Text style={styles.scanningText}>
                  Looking for nearby devices…
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

// ─── Demo: simulate the discovered peer accepting the request ─────────────────
function simulateDemoAccept(
  peer: Peer,
  profile: import('../types').UserProfile,
  addFriend: (f: Friend) => void,
  updatePeer: (id: string, updates: Partial<Peer>) => void,
) {
  setTimeout(() => {
    const friend: Friend = {
      id: peer.id,
      username: peer.username,
      displayName: peer.displayName,
      avatarColor: peer.avatarColor,
      avatarEmoji: peer.avatarEmoji,
      addedAt: Date.now(),
      isOnline: true,
      connectionType: peer.connectionType,
    };
    addFriend(friend);
    updatePeer(peer.id, {status: 'friend'});

    // Also open a conversation
    const store = require('../store/useAppStore').useAppStore.getState();
    const convId = `conv_${[profile.id, peer.id].sort().join('_')}`;
    store.upsertConversation({
      id: convId,
      peerId: peer.id,
      peerUsername: peer.username,
      peerDisplayName: peer.displayName,
      peerAvatarColor: peer.avatarColor,
      peerAvatarEmoji: peer.avatarEmoji,
      unreadCount: 0,
      isPeerOnline: true,
      isPeerTyping: false,
      lastActivityAt: Date.now(),
      connectionType: peer.connectionType,
      createdAt: Date.now(),
    });
    StorageService.saveFriends(store.friends);
    StorageService.saveConversations(store.conversations);
  }, 2500);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  indicators: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  scanButtonActive: {
    backgroundColor: COLORS.textWhite,
  },
  scanButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  scanButtonTextActive: {
    color: COLORS.primary,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  list: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  listHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  scanningFooter: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scanningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
});
