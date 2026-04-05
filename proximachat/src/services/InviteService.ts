import type {InvitePayload, UserProfile} from '../types';

const PREFIX = 'proximachat://invite?d=';

export const InviteService = {
  createInvitePayload(profile: UserProfile): InvitePayload {
    return {
      version: 1,
      profileId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarColor: profile.avatarColor,
      avatarEmoji: profile.avatarEmoji,
      identityPublicKey: profile.identityPublicKey,
      createdAt: Date.now(),
    };
  },

  encodeInvite(payload: InvitePayload): string {
    const raw = JSON.stringify(payload);
    const encoded = encodeURIComponent(raw);
    return `${PREFIX}${encoded}`;
  },

  decodeInvite(text: string): InvitePayload | null {
    const normalized = text.trim();
    const encoded = normalized.startsWith(PREFIX)
      ? normalized.slice(PREFIX.length)
      : normalized;

    try {
      const json = decodeURIComponent(encoded);
      const parsed = JSON.parse(json) as Partial<InvitePayload>;
      if (
        parsed.version !== 1 ||
        typeof parsed.profileId !== 'string' ||
        typeof parsed.username !== 'string' ||
        typeof parsed.displayName !== 'string' ||
        typeof parsed.avatarColor !== 'string' ||
        typeof parsed.createdAt !== 'number'
      ) {
        return null;
      }

      return {
        version: 1,
        profileId: parsed.profileId,
        username: parsed.username,
        displayName: parsed.displayName,
        avatarColor: parsed.avatarColor,
        avatarEmoji: parsed.avatarEmoji,
        identityPublicKey: parsed.identityPublicKey,
        createdAt: parsed.createdAt,
      };
    } catch {
      return null;
    }
  },
};
