/**
 * ChatScreen - Real-time offline message thread
 */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MessageBubble} from '../components/MessageBubble';
import {UserAvatar} from '../components/UserAvatar';
import {SvgIcon} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {ChatService} from '../services/ChatService';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS} from '../theme';
import type {ChatsStackParamList, Message} from '../types';

type Nav = NativeStackNavigationProp<ChatsStackParamList, 'Chat'>;
type Route = RouteProp<ChatsStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {conversationId, peerId, peerName} = route.params;

  const {
    profile,
    messages,
    conversations,
    addMessage,
    updateMessageStatus,
    setMessages,
    markConversationRead,
    setActiveConversation,
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId] ?? [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setActiveConversation(conversationId);
    markConversationRead(conversationId);

    // Load persisted messages
    (async () => {
      const stored = await StorageService.loadMessages(conversationId);
      if (stored.length > 0) {
        setMessages(conversationId, stored);
      }
    })();

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, markConversationRead, setActiveConversation, setMessages]);

  // Persist messages when they change
  useEffect(() => {
    if (conversationMessages.length > 0) {
      StorageService.saveMessages(conversationId, conversationMessages);
    }
  }, [conversationId, conversationMessages]);

  // ── Send Message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !profile) {
      return;
    }

    const text = inputText.trim();
    setInputText('');

    const message = ChatService.createMessage({
      conversationId,
      senderId: profile.id,
      receiverId: peerId,
      text,
    });

    addMessage(conversationId, message);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 50);

    // Send via NearbyService
    await ChatService.sendMessage(peerId, message, (status) => {
      updateMessageStatus(conversationId, message.id, status);
    });

    // Simulate incoming reply in demo mode (remove in production)
    simulateDemoReply(conversationId, peerId, profile.id);
  }, [
    inputText,
    profile,
    conversationId,
    peerId,
    addMessage,
    updateMessageStatus,
  ]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (!isTyping) {
        setIsTyping(true);
        // NearbyService.sendTyping(peerId, true);
      }
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        // NearbyService.sendTyping(peerId, false);
      }, 2000);
    },
    [isTyping],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({item, index}: {item: Message; index: number}) => {
      const isMine = item.senderId === profile?.id;
      const prev = conversationMessages[index - 1];
      const showAvatar = !isMine && item.senderId !== prev?.senderId;
      return (
        <View style={styles.messageRow}>
          {!isMine && (
            <View style={styles.peerAvatar}>
              {showAvatar && conversation ? (
                <UserAvatar
                  displayName={conversation.peerDisplayName}
                  avatarColor={conversation.peerAvatarColor}
                  avatarEmoji={conversation.peerAvatarEmoji}
                  size={28}
                />
              ) : (
                <View style={{width: 32}} />
              )}
            </View>
          )}
          <MessageBubble message={item} isMine={isMine} />
        </View>
      );
    },
    [profile, conversationMessages, conversation],
  );

  const isPeerOnline = conversation?.isPeerOnline ?? false;
  const isPeerTyping = conversation?.isPeerTyping ?? false;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <SvgIcon name="arrow-back" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>

        {conversation && (
          <UserAvatar
            displayName={conversation.peerDisplayName}
            avatarColor={conversation.peerAvatarColor}
            avatarEmoji={conversation.peerAvatarEmoji}
            size={38}
            showOnlineBadge
            isOnline={isPeerOnline}
          />
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{peerName}</Text>
          <Text style={styles.headerStatus}>
            {isPeerTyping ? 'typing...' : isPeerOnline ? 'online' : 'nearby • offline'}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <SvgIcon name="more-vert" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Background pattern */}
      <View style={styles.chatBg}>
        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}>
          <FlatList
            ref={flatListRef}
            data={conversationMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              {paddingBottom: SPACING.sm},
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: false})
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>
                  Start chatting with {peerName}! 👋{'\n'}
                  Messages are sent directly over Bluetooth & Wi-Fi.
                </Text>
              </View>
            }
          />

          {/* Input bar */}
          <View
            style={[
              styles.inputBar,
              {paddingBottom: Math.max(insets.bottom, SPACING.sm)},
            ]}>
            {/* Emoji button */}
            <TouchableOpacity style={styles.inputAction}>
              <SvgIcon name="emoji" size={24} color={COLORS.textTertiary} />
            </TouchableOpacity>

            {/* Text input */}
            <TextInput
              style={styles.textInput}
              placeholder="Message"
              placeholderTextColor={COLORS.textTertiary}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={2000}
              returnKeyType="default"
            />

            {/* Attach button */}
            <TouchableOpacity
              style={styles.inputAction}
              onPress={() => Alert.alert('Attach', 'File sharing coming soon!')}>
              <SvgIcon name="attach" size={24} color={COLORS.textTertiary} />
            </TouchableOpacity>

            {/* Camera button */}
            <TouchableOpacity style={styles.inputAction}>
              <SvgIcon name="camera" size={22} color={COLORS.textTertiary} />
            </TouchableOpacity>

            {/* Send / Mic button */}
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.85}>
                <SvgIcon name="send" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.sendButton}>
                <SvgIcon name="mic" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

// ─── Demo simulation (remove in production) ───────────────────────────────────
const DEMO_REPLIES = [
  'Hey! 👋',
  'Got your message!',
  'This is so cool — offline P2P chat! 🚀',
  'Amazing, no internet needed!',
  '😄 ProximaChat is great!',
];

let _replyIdx = 0;

function simulateDemoReply(
  conversationId: string,
  peerId: string,
  myId: string,
) {
  const store = require('../store/useAppStore').useAppStore.getState();
  const conv = store.conversations.find(
    (c: {id: string}) => c.id === conversationId,
  );
  if (!conv) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uuid = require('react-native-uuid');
  setTimeout(() => {
    const reply: Message = {
      id: String(uuid.v4()),
      conversationId,
      senderId: peerId,
      receiverId: myId,
      type: 'text',
      text: DEMO_REPLIES[_replyIdx % DEMO_REPLIES.length],
      status: 'delivered',
      timestamp: Date.now(),
    };
    _replyIdx++;
    store.addMessage(conversationId, reply);
  }, 1200 + Math.random() * 800);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  headerStatus: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.75)',
  },
  headerAction: {
    padding: SPACING.xs,
  },
  chatBg: {
    flex: 1,
    backgroundColor: '#E5DDD5',
  },
  messageList: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 1,
  },
  peerAvatar: {
    marginRight: 4,
    marginLeft: 4,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyChatText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    gap: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  inputAction: {
    padding: SPACING.xs,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
});
