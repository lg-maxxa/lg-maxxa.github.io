/**
 * ConversationListScreen - WhatsApp-style chat list (home screen)
 */
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ConversationItem} from '../components/ConversationItem';
import {EmptyState} from '../components/EmptyState';
import {SvgIcon} from '../components/SvgIcon';
import {UserAvatar} from '../components/UserAvatar';
import {useAppStore} from '../store/useAppStore';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {ChatsStackParamList, Conversation} from '../types';

type Nav = NativeStackNavigationProp<ChatsStackParamList>;

export const ConversationListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {conversations, profile} = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? conversations.filter(
        (c) =>
          c.peerDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.peerUsername.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  const handleOpen = useCallback(
    (conv: Conversation) => {
      navigation.navigate('Chat', {
        conversationId: conv.id,
        peerId: conv.peerId,
        peerName: conv.peerDisplayName,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Conversation}) => (
      <ConversationItem conversation={item} onPress={() => handleOpen(item)} />
    ),
    [handleOpen],
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>ProximaChat</Text>
          <View style={styles.headerActions}>
            {profile && (
              <UserAvatar
                displayName={profile.displayName}
                avatarColor={profile.avatarColor}
                avatarEmoji={profile.avatarEmoji}
                size={34}
              />
            )}
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <SvgIcon name="search" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <SvgIcon name="close" size={16} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="chat-bubble"
          title={searchQuery ? 'No results' : 'No conversations yet'}
          subtitle={
            searchQuery
              ? `No chats match "${searchQuery}"`
              : 'Discover nearby friends and start chatting offline!'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textWhite,
    paddingVertical: 0,
  },
  list: {
    paddingTop: 2,
  },
});
