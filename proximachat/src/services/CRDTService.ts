import type {Message} from '../types';

export const CRDTService = {
  // LWW-element-set style merge for messages using timestamp + id tie-breaker
  mergeMessages(existing: Message[], incoming: Message[]): Message[] {
    const map = new Map<string, Message>();

    const apply = (msg: Message) => {
      const prev = map.get(msg.id);
      if (!prev) {
        map.set(msg.id, msg);
        return;
      }

      if (msg.timestamp > prev.timestamp) {
        map.set(msg.id, msg);
        return;
      }

      if (msg.timestamp === prev.timestamp && msg.id > prev.id) {
        map.set(msg.id, msg);
      }
    };

    existing.forEach(apply);
    incoming.forEach(apply);

    return [...map.values()].sort((a, b) => a.timestamp - b.timestamp);
  },
};
