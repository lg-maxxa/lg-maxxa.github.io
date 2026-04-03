# ProximaChat 🦇

**Offline P2P Chat for Android & iOS**

A professional WhatsApp-like chat application that works completely offline using Bluetooth and Wi-Fi Direct. Discover nearby users, send friend requests, and chat in real time — no internet required.

---

## Screenshots

| Splash | Discovery | Chat |
|--------|-----------|------|
| Bat animation branding | Radar-style peer discovery | WhatsApp-like bubbles |

---

## Features

- 🔵 **Bluetooth Low Energy (BLE)** — discover and connect to nearby devices
- 📶 **Wi-Fi Direct (Android) / MultipeerConnectivity (iOS)** — high-speed offline messaging
- 👥 **Friend Requests** — discover → request → accept/decline → friend list
- 💬 **Chat UI** — conversation list, message thread, delivery/read ticks, timestamps
- 📎 **Attachment support** — file sharing interface (UI complete)
- 🦇 **Lottie bat animation** — animated splash with icons8 assets
- 🌙 **Professional UI** — WhatsApp-inspired with dark/light color system
- 💾 **Offline persistence** — AsyncStorage-backed message history

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.73 (TypeScript) |
| Navigation | React Navigation v6 (Bottom Tabs + Native Stack) |
| State | Zustand + Immer |
| Storage | AsyncStorage |
| Bluetooth | `react-native-ble-plx` (BLE central/peripheral) |
| Wi-Fi (Android) | `react-native-wifi-p2p` (Wi-Fi Direct) |
| Icons | Custom SVG via `react-native-svg` + icons8 assets |
| Animation | `lottie-react-native` (bat.json) |
| Styling | StyleSheet API with design token system |

---

## Project Structure

```
proximachat/
├── src/
│   ├── navigation/        # RootNavigator, MainNavigator (tabs + stacks)
│   ├── screens/           # All app screens
│   │   ├── SplashScreen.tsx
│   │   ├── SetupProfileScreen.tsx
│   │   ├── ConversationListScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── DiscoveryScreen.tsx
│   │   ├── FriendsListScreen.tsx
│   │   ├── FriendRequestsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/        # Reusable UI components
│   │   ├── SvgIcon.tsx    # All inline SVG icons (including icons8 assets)
│   │   ├── AnimatedBat.tsx # Lottie bat animation
│   │   ├── ConversationItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── PeerCard.tsx
│   │   ├── FriendRequestCard.tsx
│   │   ├── UserAvatar.tsx
│   │   └── EmptyState.tsx
│   ├── services/
│   │   ├── NearbyService.ts   # BLE + Wi-Fi P2P abstraction layer
│   │   ├── ChatService.ts     # Message lifecycle
│   │   └── StorageService.ts  # AsyncStorage persistence
│   ├── store/
│   │   └── useAppStore.ts     # Zustand global state
│   ├── theme/             # Design tokens (colors, typography, spacing)
│   └── types/             # TypeScript type definitions
├── assets/icons/          # icons8 SVG + Lottie assets
├── android/               # Android native project
└── ios/                   # iOS native project
```

---

## Setup & Running

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| React Native CLI | Latest |
| Android Studio | Hedgehog+ (with API 34 SDK) |
| Xcode | 15+ (iOS 17 SDK) |
| CocoaPods | Latest |
| Java | 17 |

### 1. Clone & Install

```bash
# Clone the repo (or navigate to this directory)
cd proximachat

# Install JavaScript dependencies
npm install

# iOS only: install CocoaPods
cd ios && pod install && cd ..
```

### 2. Android Setup

```bash
# Create the native Android project boilerplate first
npx react-native init ProximaChat --template react-native-template-typescript
# Then copy src/, assets/, package.json into that project

# Run on Android device/emulator
npm run android
```

Or if you have the native android/ directory complete:
```bash
npx react-native run-android
```

**Required for Bluetooth/Wi-Fi Direct on Android:**
- Grant permissions at runtime (the app requests them)
- Enable Bluetooth and Wi-Fi on the device
- For Wi-Fi Direct: ensure both devices are on the same Wi-Fi network domain OR use standalone Wi-Fi Direct without a router

### 3. iOS Setup

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

**Required for iOS:**
- Xcode project file (`.xcodeproj`) must be generated via `react-native init`
- Enable Bluetooth permission in system settings
- MultipeerConnectivity works over Bluetooth + local Wi-Fi (infrastructure mode)
- Background BLE mode enabled in Info.plist (already configured)

### 4. One-Command Quick Start

```bash
# Generate native project, copy source, and run
npx react-native init ProximaChat --template react-native-template-typescript && \
  cp -r src assets package.json babel.config.js metro.config.js ProximaChat/ && \
  cd ProximaChat && \
  npm install && \
  npx react-native run-android  # or run-ios
```

---

## Platform-Specific P2P Behavior

### Android

| Method | Technology | Range | Notes |
|--------|-----------|-------|-------|
| Discovery | BLE Advertising/Scanning | 30–100m | Low power, always-on |
| Connection | Wi-Fi Direct (P2P) | 50–200m | High throughput |
| Fallback | BLE data transfer | 10–30m | For small messages |

**Plugin**: `react-native-wifi-p2p` + `react-native-ble-plx`

### iOS

| Method | Technology | Range | Notes |
|--------|-----------|-------|-------|
| Discovery | MultipeerConnectivity | 30–100m | BT + Wi-Fi |
| Messaging | MultipeerConnectivity | 30–100m | Native Apple framework |
| BLE | `react-native-ble-plx` | 10–30m | BLE central role |

**Plugin**: `react-native-ble-plx` + iOS MultipeerConnectivity (native bridge)

### Caveats

1. **iOS restrictions**: iOS BLE cannot advertise as a peripheral in the background for more than a few seconds. Use MultipeerConnectivity for foreground-only sessions.
2. **Android BLE scan**: Requires `ACCESS_FINE_LOCATION` on Android < 12 (already in manifest).
3. **Wi-Fi Direct (Android)**: Both devices must have Wi-Fi enabled; no internet access needed.
4. **iOS <> Android**: MultipeerConnectivity is Apple-only. Cross-platform discovery uses BLE peripheral/central mode with a custom service UUID.

---

## Icons8 Assets Used

| Asset | Usage | Location |
|-------|-------|----------|
| `icons8-bat.json` | Lottie splash animation | `AnimatedBat.tsx` |
| `icons8-sent.svg` | Message delivery ticks | `SvgIcon.tsx` → `sent` |
| `icons8-attach.svg` | Attachment button | `SvgIcon.tsx` → `attach`, `ChatScreen` |
| `icons8-chat-bubble.svg` | Empty state icon | `SvgIcon.tsx` → `chat-bubble` |
| `icons8-chat.svg` | Tab bar chat icon | `SvgIcon.tsx` → `chat` |

---

## Architecture Notes

### State Flow

```
NearbyService (hardware abstraction)
    ↓ events
useAppStore (Zustand)
    ↓ reactive updates
React Navigation screens
    ↑ user actions
ChatService / StorageService
```

### Message Lifecycle

```
User types → ChatScreen → ChatService.createMessage()
    → NearbyService.sendMessage() → peer device
    → onStatus('sent'|'delivered'|'read')
    → updateMessageStatus() → store → UI re-render
    → StorageService.saveMessages() → AsyncStorage
```

### P2P Service Layer

`NearbyService.ts` is a platform-agnostic abstraction. Production integration:

```typescript
// Android
import WifiP2p from 'react-native-wifi-p2p';
await WifiP2p.initialize();
await WifiP2p.createGroup();

// iOS - MultipeerConnectivity via native module
import MCPeerID from './ios/MCNearbyModule'; // custom native bridge

// Both - BLE
import {BleManager} from 'react-native-ble-plx';
const manager = new BleManager();
manager.startDeviceScan([SERVICE_UUID], null, (error, device) => { ... });
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Run linter: `npm run lint`
4. Run tests: `npm test`
5. Open a PR

---

## License

MIT © ProximaChat 2024
