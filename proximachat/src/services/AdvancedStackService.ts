import {NativeModules} from 'react-native';

type Capability = {
  available: boolean;
  details: string;
};

export const AdvancedStackService = {
  inspectCapabilities(): {
    nfc: Capability;
    webrtc: Capability;
    sqlite: Capability;
    realm: Capability;
  } {
    const nfcAvailable =
      Boolean((NativeModules as Record<string, unknown>).NfcManager) ||
      Boolean((NativeModules as Record<string, unknown>).NfcManagerModule);
    const webrtcAvailable =
      Boolean((NativeModules as Record<string, unknown>).WebRTCModule) ||
      Boolean((NativeModules as Record<string, unknown>).RTCPeerConnectionModule);
    const sqliteAvailable =
      Boolean((NativeModules as Record<string, unknown>).QuickSQLite) ||
      Boolean((NativeModules as Record<string, unknown>).SQLite) ||
      Boolean((NativeModules as Record<string, unknown>).SQLiteModule);
    const realmAvailable =
      Boolean((NativeModules as Record<string, unknown>).Realm) ||
      Boolean((NativeModules as Record<string, unknown>).RealmReact);

    return {
      nfc: {
        available: nfcAvailable,
        details: nfcAvailable
          ? 'NFC module detected'
          : 'Install react-native-nfc-manager and configure native permissions',
      },
      webrtc: {
        available: webrtcAvailable,
        details: webrtcAvailable
          ? 'WebRTC module detected'
          : 'Install react-native-webrtc for real-time media/data channels',
      },
      sqlite: {
        available: sqliteAvailable,
        details: sqliteAvailable
          ? 'SQLite module detected'
          : 'Install react-native-quick-sqlite or react-native-sqlite-storage',
      },
      realm: {
        available: realmAvailable,
        details: realmAvailable
          ? 'Realm module detected'
          : 'Install realm if you prefer object-store persistence',
      },
    };
  },
};
