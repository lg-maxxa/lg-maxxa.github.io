/**
 * ProximaChat Color Palette
 * WhatsApp-inspired professional color system with dark/light support
 */

export const COLORS = {
  // Brand colors
  primary: '#075E54',       // WhatsApp dark green
  primaryLight: '#128C7E',  // Medium green
  accent: '#25D366',        // WhatsApp bright green
  accentLight: '#DCF8C6',   // Received message background (light)

  // Background
  background: '#F0F2F5',    // Light grey background
  surface: '#FFFFFF',       // Card/surface white
  surfaceVariant: '#F7F8FA',

  // Chat bubbles
  sentBubble: '#DCF8C6',    // Sent message bubble
  receivedBubble: '#FFFFFF', // Received message bubble
  sentBubbleDark: '#005C4B', // Dark mode sent

  // Header
  headerBg: '#075E54',
  headerText: '#FFFFFF',

  // Text
  textPrimary: '#111B21',
  textSecondary: '#667781',
  textTertiary: '#8696A0',
  textWhite: '#FFFFFF',
  textLink: '#027EB5',

  // Status
  online: '#25D366',
  offline: '#8696A0',
  typing: '#53BDEB',

  // UI Elements
  border: '#E9EDEF',
  divider: '#E9EDEF',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D7DB',
  searchBg: '#F0F2F5',

  // Icons
  iconActive: '#075E54',
  iconInactive: '#8696A0',
  iconWhite: '#FFFFFF',

  // Messages
  readTick: '#53BDEB',
  sentTick: '#8696A0',
  timestamp: '#667781',

  // Buttons
  buttonPrimary: '#25D366',
  buttonDanger: '#F15C6D',
  buttonDisabled: '#C4C4C4',

  // Discovery
  discoveryPulse: 'rgba(37, 211, 102, 0.2)',
  peerCard: '#FFFFFF',

  // Notifications
  badge: '#25D366',
  badgeText: '#FFFFFF',

  // Overlays
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E8E8E8',
  shimmerHighlight: '#F5F5F5',

  // Dark mode variants
  dark: {
    background: '#111B21',
    surface: '#1F2C34',
    surfaceVariant: '#182229',
    headerBg: '#1F2C34',
    textPrimary: '#E9EDEF',
    textSecondary: '#8696A0',
    border: '#2A3942',
    inputBg: '#2A3942',
    sentBubble: '#005C4B',
    receivedBubble: '#1F2C34',
    searchBg: '#2A3942',
  },
};

export type ColorKey = keyof typeof COLORS;
