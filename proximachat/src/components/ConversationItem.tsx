/**
 * ConversationItem - Single row in the conversation list (WhatsApp-style)
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {UserAvatar} from './UserAvatar';
import {Badge} from './Badge';
import {SvgIcon} from './SvgIcon';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {Conversation} from '../types';
import {ChatService} from '../services/ChatService';

interface Props {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<Props> = ({
  conversation,
  onPress,
}) => {
  const {
    peerDisplayName,
    peerAvatarColor,
    peerAvatarEmoji,
    lastMessage,
    unreadCount,
    isPeerOnline,
    isPeerTyping,
    lastActivityAt,
  } = conversation;

  const lastMessageText = isPeerTyping
    ? 'typing...'
    : lastMessage?.text ?? 'Tap to start chatting';

  const timeLabel = ChatService.formatTime(lastActivityAt);
  const isMine = lastMessage?.senderId !== conversation.peerId;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Avatar */}
      <UserAvatar
        displayName={peerDisplayName}
        avatarColor={peerAvatarColor}
        avatarEmoji={peerAvatarEmoji}
        size={50}
        showOnlineBadge
        isOnline={isPeerOnline}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {peerDisplayName}
          </Text>
          <Text
            style={[
              styles.time,
              unreadCount > 0 && styles.timeUnread,
            ]}>
            {timeLabel}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          {/* Tick indicator for sent messages */}
          {isMine && lastMessage && (
            <View style={styles.tick}>
              <SvgIcon
                name="sent"
                size={15}
                color={
                  lastMessage.status === 'read'
                    ? COLORS.readTick
                    : COLORS.sentTick
                }
              />
            </View>
          )}
          <Text
            style={[
              styles.preview,
              isPeerTyping && styles.typing,
              unreadCount > 0 && styles.previewBold,
            ]}
            numberOfLines={1}>
            {lastMessageText}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Badge count={unreadCount} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  timeUnread: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tick: {
    marginRight: 2,
  },
  preview: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  previewBold: {
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  typing: {
    color: COLORS.typing,
    fontStyle: 'italic',
  },
  badge: {
    marginLeft: SPACING.sm,
  },
});
