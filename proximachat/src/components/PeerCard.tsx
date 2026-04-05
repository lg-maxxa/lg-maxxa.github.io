/**
 * PeerCard - Card showing a discovered nearby peer in discovery screen
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {UserAvatar} from './UserAvatar';
import {SvgIcon} from './SvgIcon';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';
import {useAppStore} from '../store/useAppStore';
import type {Peer} from '../types';

interface Props {
  peer: Peer;
  onSendRequest: (peer: Peer) => void;
}

const CONNECTION_LABEL: Record<string, string> = {
  bluetooth: 'Bluetooth',
  wifi: 'Wi-Fi Direct',
  both: 'BT + Wi-Fi',
  unknown: 'Nearby',
};

const DISTANCE_COLOR: Record<string, string> = {
  near: '#25D366',
  medium: '#FFA726',
  far: '#EF5350',
};

export const PeerCard: React.FC<Props> = ({peer, onSendRequest}) => {
  const compact = useAppStore((s) => s.settings.compactPeerCards);
  const isSending = peer.status === 'requesting';
  const isSent = peer.status === 'pending_approval';

  const distanceLabel =
    peer.distance === 'near'
      ? '< 5m'
      : peer.distance === 'medium'
      ? '5–20m'
      : '> 20m';

  const distanceColor = DISTANCE_COLOR[peer.distance ?? 'far'];
  const connLabel = CONNECTION_LABEL[peer.connectionType] ?? 'Nearby';
  const trustLabel =
    peer.connectionType === 'both' || peer.distance === 'near'
      ? 'Strong'
      : peer.distance === 'medium'
      ? 'Moderate'
      : 'Weak';
  const trustColor =
    trustLabel === 'Strong'
      ? '#25D366'
      : trustLabel === 'Moderate'
      ? '#FFA726'
      : '#EF5350';

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Avatar */}
      <UserAvatar
        displayName={peer.displayName}
        avatarColor={peer.avatarColor}
        avatarEmoji={peer.avatarEmoji}
        size={52}
      />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{peer.displayName}</Text>
        <Text style={styles.username}>@{peer.username}</Text>
        <View style={styles.tags}>
          {/* Connection type */}
          <View style={styles.tag}>
            <SvgIcon
              name={peer.connectionType === 'bluetooth' ? 'bluetooth' : 'wifi'}
              size={10}
              color={COLORS.textSecondary}
            />
            <Text style={styles.tagText}>{connLabel}</Text>
          </View>
          {/* Distance */}
          {peer.distance && (
            <View style={[styles.tag, {backgroundColor: distanceColor + '22'}]}>
              <View
                style={[styles.distanceDot, {backgroundColor: distanceColor}]}
              />
              <Text style={[styles.tagText, {color: distanceColor}]}>
                {distanceLabel}
              </Text>
            </View>
          )}
          <View style={[styles.tag, {backgroundColor: trustColor + '1F'}]}>
            <SvgIcon name="signal" size={10} color={trustColor} />
            <Text style={[styles.tagText, {color: trustColor}]}>Trust {trustLabel}</Text>
          </View>
        </View>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[
          styles.button,
          isSent && styles.buttonSent,
          isSending && styles.buttonLoading,
        ]}
        onPress={() => onSendRequest(peer)}
        disabled={isSending || isSent}
        activeOpacity={0.8}>
        {isSending ? (
          <ActivityIndicator size="small" color={COLORS.textWhite} />
        ) : isSent ? (
          <SvgIcon name="check" size={16} color={COLORS.textWhite} />
        ) : (
          <SvgIcon name="add-person" size={16} color={COLORS.textWhite} />
        )}
        <Text style={styles.buttonText}>
          {isSent ? 'Sent' : isSending ? '...' : 'Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  cardCompact: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    gap: 3,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  distanceDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  buttonSent: {
    backgroundColor: COLORS.accent,
  },
  buttonLoading: {
    backgroundColor: COLORS.textTertiary,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
