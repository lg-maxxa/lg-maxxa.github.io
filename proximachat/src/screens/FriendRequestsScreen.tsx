/**
 * FriendRequestsScreen - Accept or decline pending friend requests
 */
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {FriendRequestCard} from '../components/FriendRequestCard';
import {EmptyState} from '../components/EmptyState';
import {SvgIcon} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {NearbyService} from '../services/NearbyService';
import {StorageService} from '../services/StorageService';
import {ChatService} from '../services/ChatService';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {FriendRequest, Friend} from '../types';

export const FriendRequestsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    profile,
    friendRequests,
    updateFriendRequest,
    removeFriendRequest,
    addFriend,
    upsertConversation,
  } = useAppStore();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const incoming = friendRequests.filter(
    (r) =>
      r.toPeerId === profile?.id && r.status === 'pending',
  );
  const outgoing = friendRequests.filter(
    (r) =>
      r.fromPeerId === profile?.id && r.status === 'pending',
  );

  const handleAccept = useCallback(
    async (request: FriendRequest) => {
      if (!profile) {
        return;
      }
      setProcessingId(request.id);
      try {
        await NearbyService.respondToFriendRequest(
          request.fromPeerId,
          request.id,
          true,
        );

        // Update state
        updateFriendRequest(request.id, {
          status: 'accepted',
          respondedAt: Date.now(),
        });

        // Add friend
        const friend: Friend = {
          id: request.fromPeerId,
          username: request.fromUsername,
          displayName: request.fromDisplayName,
          avatarColor: request.fromAvatarColor,
          avatarEmoji: request.fromAvatarEmoji,
          identityPublicKey: request.fromIdentityPublicKey,
          addedAt: Date.now(),
          isOnline: true,
          connectionType: 'bluetooth',
        };
        addFriend(friend);

        // Open conversation
        const conv = ChatService.openConversation(profile, friend);
        upsertConversation(conv);

        // Persist
        await Promise.all([
          StorageService.saveFriends(useAppStore.getState().friends),
          StorageService.saveFriendRequests(useAppStore.getState().friendRequests),
          StorageService.saveConversations(useAppStore.getState().conversations),
        ]);
      } finally {
        setProcessingId(null);
      }
    },
    [profile, updateFriendRequest, addFriend, upsertConversation],
  );

  const handleDecline = useCallback(
    async (request: FriendRequest) => {
      setProcessingId(request.id);
      try {
        if (profile) {
          await NearbyService.respondToFriendRequest(
            request.fromPeerId,
            request.id,
            false,
          );
        }
        updateFriendRequest(request.id, {
          status: 'rejected',
          respondedAt: Date.now(),
        });
        await StorageService.saveFriendRequests(
          useAppStore.getState().friendRequests,
        );
      } finally {
        setProcessingId(null);
      }
    },
    [profile, updateFriendRequest],
  );

  const sections = [
    {title: `Received (${incoming.length})`, data: incoming, type: 'incoming'},
    ...(outgoing.length > 0
      ? [{title: `Sent (${outgoing.length})`, data: outgoing, type: 'outgoing'}]
      : []),
  ];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <SvgIcon name="arrow-back" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friend Requests</Text>
      </View>

      {incoming.length === 0 && outgoing.length === 0 ? (
        <EmptyState
          icon="add-person"
          title="No pending requests"
          subtitle="When someone nearby sends you a friend request, it will appear here."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({section}) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({item, section}) =>
            section.type === 'incoming' ? (
              <FriendRequestCard
                request={item}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isProcessing={processingId === item.id}
              />
            ) : (
              <View style={styles.outgoingCard}>
                <Text style={styles.outgoingText}>
                  Request sent to{' '}
                  <Text style={styles.outgoingName}>@{item.toPeerId}</Text>
                </Text>
                <Text style={styles.outgoingStatus}>Awaiting response…</Text>
              </View>
            )
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  list: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  outgoingCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs,
    borderRadius: 12,
    padding: SPACING.base,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.textTertiary,
  },
  outgoingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  outgoingName: {
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  outgoingStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
