import type {NetworkPayload} from '../types';

export interface EncryptedEnvelope {
  version: 1;
  algorithm: 'nacl-box-v1';
  senderPublicKey: string;
  nonce: string;
  ciphertext: string;
}

function getNacl() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('tweetnacl');
}

function getNaclUtil() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('tweetnacl-util');
}

export const E2EEService = {
  encryptPayload(
    payload: NetworkPayload,
    recipientPublicKeyB64: string,
    senderSecretKeyB64: string,
    senderPublicKeyB64: string,
  ): EncryptedEnvelope {
    const nacl = getNacl();
    const util = getNaclUtil();

    const recipientPublicKey = util.decodeBase64(recipientPublicKeyB64);
    const senderSecretKey = util.decodeBase64(senderSecretKeyB64);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const plaintext = util.decodeUTF8(JSON.stringify(payload));

    const box = nacl.box(plaintext, nonce, recipientPublicKey, senderSecretKey);

    return {
      version: 1,
      algorithm: 'nacl-box-v1',
      senderPublicKey: senderPublicKeyB64,
      nonce: util.encodeBase64(nonce),
      ciphertext: util.encodeBase64(box),
    };
  },

  decryptPayload(
    envelope: EncryptedEnvelope,
    mySecretKeyB64: string,
  ): NetworkPayload | null {
    const nacl = getNacl();
    const util = getNaclUtil();

    try {
      const nonce = util.decodeBase64(envelope.nonce);
      const senderPublicKey = util.decodeBase64(envelope.senderPublicKey);
      const ciphertext = util.decodeBase64(envelope.ciphertext);
      const mySecretKey = util.decodeBase64(mySecretKeyB64);

      const plaintext = nacl.box.open(ciphertext, nonce, senderPublicKey, mySecretKey);
      if (!plaintext) {
        return null;
      }

      const decoded = util.encodeUTF8(plaintext);
      return JSON.parse(decoded) as NetworkPayload;
    } catch {
      return null;
    }
  },
};
