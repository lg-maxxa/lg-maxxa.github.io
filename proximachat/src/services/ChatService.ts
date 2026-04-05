/**
 * ChatService - Handles message lifecycle: create, send, persist, deliver
 */
import 'react-native-uuid';
import type {Message, Conversation, UserProfile, Friend} from '../types';
import {StorageService} from './StorageService';
import {NearbyService} from './NearbyService';
import {MessageQueueService} from './MessageQueueService';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('react-native-uuid');

export const ChatService = {
  /**
   * Generate a stable conversation ID from two peer IDs
   */
  conversationId(myId: string, peerId: string): string {
    // Alphabetical sort ensures same ID regardless of who initiates
    const sorted = [myId, peerId].sort();
    return `conv_${sorted[0]}_${sorted[1]}`;
  },

  /**
   * Create or open a conversation with a friend
   */
  openConversation(me: UserProfile, friend: Friend): Conversation {
    const convId = ChatService.conversationId(me.id, friend.id);
    return {
      id: convId,
      peerId: friend.id,
      peerUsername: friend.username,
      peerDisplayName: friend.displayName,
      peerAvatarColor: friend.avatarColor,
      peerAvatarEmoji: friend.avatarEmoji,
      unreadCount: 0,
      isPeerOnline: friend.isOnline,
      isPeerTyping: false,
      lastActivityAt: friend.lastMessageAt ?? friend.addedAt,
      connectionType: friend.connectionType,
      createdAt: Date.now(),
    };
  },

  /**
   * Create a new outgoing message
   */
  createMessage(
    params: {
      conversationId: string;
      senderId: string;
      receiverId: string;
      text?: string;
      fileUri?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    },
  ): Message {
    return {
      id: String(uuid.v4()),
      conversationId: params.conversationId,
      senderId: params.senderId,
      receiverId: params.receiverId,
      type: params.fileUri ? 'file' : 'text',
      text: params.text,
      fileUri: params.fileUri,
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      status: 'sending',
      timestamp: Date.now(),
    };
  },

  /**
   * Send a message to a peer
   */
  async sendMessage(
    peerId: string,
    message: Message,
    onStatus: (status: Message['status']) => void,
  ): Promise<void> {
    onStatus('sending');
    const ok = await NearbyService.sendMessage(peerId, message);
    if (ok) {
      onStatus('sent');
      await MessageQueueService.processQueue();
    } else {
      onStatus('failed');
      await MessageQueueService.enqueue(peerId, {...message, status: 'failed'});
    }
  },

  /**
   * Load messages for a conversation from storage
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    return StorageService.loadMessages(conversationId);
  },

  /**
   * Persist messages to storage
   */
  async persistMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    await StorageService.saveMessages(conversationId, messages);
  },

  /**
   * Format message timestamp for display
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  },
};
