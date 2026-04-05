import {StorageService} from './StorageService';

export interface CryptoIdentity {
  publicKey: string;
  secretKey: string;
  algorithm: 'nacl-box-v1';
  createdAt: number;
}

function getNacl() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('tweetnacl');
}

function getNaclUtil() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('tweetnacl-util');
}

export const IdentityService = {
  async ensureIdentity(): Promise<CryptoIdentity> {
    const existing = await StorageService.loadIdentity();
    if (existing?.publicKey && existing?.secretKey) {
      return existing;
    }

    const nacl = getNacl();
    const util = getNaclUtil();
    const keyPair = nacl.box.keyPair();

    const identity: CryptoIdentity = {
      publicKey: util.encodeBase64(keyPair.publicKey),
      secretKey: util.encodeBase64(keyPair.secretKey),
      algorithm: 'nacl-box-v1',
      createdAt: Date.now(),
    };

    await StorageService.saveIdentity(identity);
    return identity;
  },
};
