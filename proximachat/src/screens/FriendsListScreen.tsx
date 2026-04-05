/**
 * FriendsListScreen - List of accepted friends
 */
import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserAvatar} from '../components/UserAvatar';
import {SvgIcon} from '../components/SvgIcon';
import {Badge} from '../components/Badge';
import {EmptyState} from '../components/EmptyState';
import {useAppStore} from '../store/useAppStore';
import {ChatService} from '../services/ChatService';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {Friend, FriendsStackParamList} from '../types';

type Nav = NativeStackNavigationProp<FriendsStackParamList>;

export const FriendsListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {friends, profile, friendRequests, upsertConversation, conversations} =
    useAppStore();

  const pendingCount = friendRequests.filter(
    (r) =>
      r.status === 'pending' &&
      r.toPeerId === profile?.id,
  ).length;

  const handleChat = useCallback(
    (friend: Friend) => {
      if (!profile) {
        return;
      }
      const conv = ChatService.openConversation(profile, friend);
      upsertConversation(conv);
      StorageService.saveConversations(
        useAppStore.getState().conversations,
      );
      // Navigate to chat via root chats tab
      // We use navigateToChat helper since we're in Friends tab
      const rootNav = require('../navigation/navigationRef').navigationRef.current;
      if (rootNav) {
        rootNav.navigate('Main', {
          screen: 'Chats',
          params: {
            screen: 'Chat',
            params: {
              conversationId: conv.id,
              peerId: friend.id,
              peerName: friend.displayName,
            },
          },
        });
      }
    },
    [profile, upsertConversation],
  );

  const renderFriend = useCallback(
    ({item}: {item: Friend}) => {
      const unread =
        conversations.find(
          (c) => c.peerId === item.id,
        )?.unreadCount ?? 0;

      return (
        <TouchableOpacity
          style={styles.friendRow}
          onPress={() => handleChat(item)}
          activeOpacity={0.7}>
          <UserAvatar
            displayName={item.displayName}
            avatarColor={item.avatarColor}
            avatarEmoji={item.avatarEmoji}
            size={50}
            showOnlineBadge
            isOnline={item.isOnline}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.displayName}</Text>
            <Text style={styles.friendUsername}>@{item.username}</Text>
            <View style={styles.friendMeta}>
              <SvgIcon
                name={
                  item.connectionType === 'bluetooth' ? 'bluetooth' : 'wifi'
                }
                size={11}
                color={item.isOnline ? COLORS.accent : COLORS.textTertiary}
              />
              <Text
                style={[
                  styles.onlineText,
                  item.isOnline && styles.onlineTextActive,
                ]}>
                {item.isOnline ? 'Nearby • Online' : 'Offline'}
              </Text>
            </View>
          </View>
          {unread > 0 && (
            <Badge count={unread} />
          )}
          <SvgIcon
            name="chat"
            size={20}
            color={COLORS.accent}
            style={styles.chatIcon}
          />
        </TouchableOpacity>
      );
    },
    [handleChat, conversations],
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.directAddButton}
            onPress={() => navigation.navigate('DirectAdd')}>
            <SvgIcon name="camera" size={18} color={COLORS.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.requestsButton}
            onPress={() => navigation.navigate('FriendRequests')}>
            <SvgIcon name="add-person" size={18} color={COLORS.textWhite} />
            {pendingCount > 0 && (
              <View style={styles.requestsBadge}>
                <Badge count={pendingCount} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending requests banner */}
      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => navigation.navigate('FriendRequests')}>
          <SvgIcon name="add-person" size={18} color={COLORS.primary} />
          <Text style={styles.bannerText}>
            {pendingCount} pending friend request{pendingCount !== 1 ? 's' : ''}
          </Text>
          <SvgIcon name="arrow-back" size={16} color={COLORS.primary} style={styles.bannerArrow} />
        </TouchableOpacity>
      )}

      {/* Friends list */}
      {friends.length === 0 ? (
        <EmptyState
          icon="people"
          title="No friends yet"
          subtitle="Discover people nearby and send friend requests to start chatting offline!"
        />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  requestsButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  directAddButton: {
    padding: SPACING.xs,
  },
  requestsBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent + '40',
    gap: SPACING.sm,
  },
  bannerText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  bannerArrow: {
    transform: [{rotate: '180deg'}],
  },
  list: {
    paddingTop: 4,
    paddingBottom: SPACING.xxl,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
    gap: SPACING.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  friendUsername: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  onlineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  onlineTextActive: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHTS.medium,
  },
  chatIcon: {
    marginLeft: SPACING.sm,
  },
});
