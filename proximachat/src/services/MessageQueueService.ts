import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Message} from '../types';
import {NearbyService} from './NearbyService';

const KEY = '@proximachat/message_queue';

interface QueuedMessage {
  peerId: string;
  message: Message;
  attempts: number;
  queuedAt: number;
}

export const MessageQueueService = {
  async enqueue(peerId: string, message: Message): Promise<void> {
    const existing = await MessageQueueService.loadQueue();
    const next: QueuedMessage[] = [
      ...existing,
      {
        peerId,
        message,
        attempts: 0,
        queuedAt: Date.now(),
      },
    ];
    await AsyncStorage.setItem(KEY, JSON.stringify(next.slice(-200)));
  },

  async loadQueue(): Promise<QueuedMessage[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedMessage[]) : [];
  },

  async processQueue(): Promise<void> {
    const queue = await MessageQueueService.loadQueue();
    if (queue.length === 0) {
      return;
    }

    const pending: QueuedMessage[] = [];

    for (const item of queue) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await NearbyService.sendMessage(item.peerId, {
        ...item.message,
        status: 'sending',
      });

      if (!ok && item.attempts < 5) {
        pending.push({...item, attempts: item.attempts + 1});
      }
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(pending));
  },
};
