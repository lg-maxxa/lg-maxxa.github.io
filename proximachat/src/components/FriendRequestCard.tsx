/**
 * FriendRequestCard - Shows an incoming friend request with accept/decline buttons
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {UserAvatar} from './UserAvatar';
import {SvgIcon} from './SvgIcon';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';
import type {FriendRequest} from '../types';

interface Props {
  request: FriendRequest;
  onAccept: (request: FriendRequest) => void;
  onDecline: (request: FriendRequest) => void;
  isProcessing?: boolean;
}

export const FriendRequestCard: React.FC<Props> = ({
  request,
  onAccept,
  onDecline,
  isProcessing = false,
}) => {
  const timeAgo = formatTimeAgo(request.createdAt);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <UserAvatar
          displayName={request.fromDisplayName}
          avatarColor={request.fromAvatarColor}
          avatarEmoji={request.fromAvatarEmoji}
          size={54}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{request.fromDisplayName}</Text>
          <Text style={styles.username}>@{request.fromUsername}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
          {request.message ? (
            <Text style={styles.message} numberOfLines={2}>
              "{request.message}"
            </Text>
          ) : null}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={() => onDecline(request)}
          disabled={isProcessing}
          activeOpacity={0.8}>
          <SvgIcon name="close" size={16} color={COLORS.buttonDanger} />
          <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => onAccept(request)}
          disabled={isProcessing}
          activeOpacity={0.8}>
          <SvgIcon name="check" size={16} color={COLORS.textWhite} />
          <Text style={[styles.buttonText, styles.acceptText]}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs,
    padding: SPACING.base,
    ...SHADOWS.small,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  declineButton: {
    backgroundColor: COLORS.buttonDanger + '15',
    borderWidth: 1,
    borderColor: COLORS.buttonDanger + '40',
  },
  acceptButton: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  declineText: {
    color: COLORS.buttonDanger,
  },
  acceptText: {
    color: COLORS.textWhite,
  },
});
