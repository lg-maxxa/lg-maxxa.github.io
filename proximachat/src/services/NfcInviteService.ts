import type {InvitePayload} from '../types';
import {InviteService} from './InviteService';

type NfcModule = {
  default?: {
    start: () => Promise<void>;
    isSupported: () => Promise<boolean>;
    requestTechnology: (tech: string | string[]) => Promise<string | null>;
    cancelTechnologyRequest: () => Promise<void>;
    getTag: () => Promise<{ndefMessage?: Array<{payload?: number[]}>} | null>;
    ndefHandler: {
      writeNdefMessage: (bytes: number[]) => Promise<void>;
    };
  };
  NfcTech?: {Ndef: string};
  Ndef?: {
    encodeMessage: (records: unknown[]) => number[] | null;
    textRecord: (text: string) => unknown;
    text: {
      decodePayload: (payload: number[]) => string;
    };
  };
};

function getNfc(): NfcModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-nfc-manager') as NfcModule;
  } catch {
    return null;
  }
}

export const NfcInviteService = {
  async isAvailable(): Promise<boolean> {
    const mod = getNfc();
    const manager = mod?.default;
    if (!manager) {
      return false;
    }

    await manager.start();
    return manager.isSupported();
  },

  async writeInviteToTag(payload: InvitePayload): Promise<boolean> {
    const mod = getNfc();
    const manager = mod?.default;
    const tech = mod?.NfcTech?.Ndef;
    const ndef = mod?.Ndef;

    if (!manager || !tech || !ndef) {
      return false;
    }

    const encoded = InviteService.encodeInvite(payload);
    const message = ndef.encodeMessage([ndef.textRecord(encoded)]);
    if (!message) {
      return false;
    }

    await manager.start();
    await manager.requestTechnology(tech);
    try {
      await manager.ndefHandler.writeNdefMessage(message);
      return true;
    } finally {
      await manager.cancelTechnologyRequest().catch(() => undefined);
    }
  },

  async readInviteFromTag(): Promise<string | null> {
    const mod = getNfc();
    const manager = mod?.default;
    const tech = mod?.NfcTech?.Ndef;
    const ndef = mod?.Ndef;

    if (!manager || !tech || !ndef) {
      return null;
    }

    await manager.start();
    await manager.requestTechnology(tech);
    try {
      const tag = await manager.getTag();
      const payload = tag?.ndefMessage?.[0]?.payload;
      if (!payload) {
        return null;
      }
      return ndef.text.decodePayload(payload);
    } finally {
      await manager.cancelTechnologyRequest().catch(() => undefined);
    }
  },
};
