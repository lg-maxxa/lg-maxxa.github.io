/**
 * SvgIcon - Renders inline SVG icons using react-native-svg
 * Supports the custom icons8 assets and built-in icon set
 */
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Rect,
  Polyline,
  Line,
  Polygon,
} from 'react-native-svg';

export type IconName =
  | 'chat'
  | 'chat-bubble'
  | 'sent'
  | 'attach'
  | 'radar'
  | 'people'
  | 'settings'
  | 'person'
  | 'add-person'
  | 'check'
  | 'close'
  | 'arrow-back'
  | 'more-vert'
  | 'search'
  | 'camera'
  | 'mic'
  | 'emoji'
  | 'send'
  | 'wifi'
  | 'bluetooth'
  | 'signal'
  | 'heart'
  | 'bell'
  | 'lock'
  | 'info'
  | 'circle';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const SvgIcon: React.FC<Props> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const icon = ICONS[name] ?? ICONS['circle'];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {icon(color)}
    </Svg>
  );
};

// ─── Icon definitions ─────────────────────────────────────────────────────────

const ICONS: Record<IconName, (color: string) => React.ReactElement> = {
  chat: (c) => (
    <>
      <Path
        d="M21 15c0 .53-.21 1.04-.59 1.41A2 2 0 0119 17H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  'chat-bubble': (c) => (
    <>
      <Path
        d="M12 2C6.48 2 2 6.15 2 11.24c0 2.78 1.34 5.27 3.5 6.95V22l3.83-2.01a10.5 10.5 0 002.67.34C17.52 20.33 22 16.19 22 11.09 22 5.99 17.52 2 12 2z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M8 11h8M8 7.5h5" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  sent: (c) => (
    <>
      <Path d="M9 12l2 2 4-4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M13 12l2 2 4-4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5} />
    </>
  ),
  attach: (c) => (
    <Path
      d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
      stroke={c}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  radar: (c) => (
    <>
      <Circle cx={12} cy={12} r={2} fill={c} />
      <Path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke={c} strokeWidth={1.8} fill="none" strokeDasharray="4 2" />
      <Path d="M12 6a6 6 0 100 12A6 6 0 0012 6z" stroke={c} strokeWidth={1.8} fill="none" strokeDasharray="3 2" />
    </>
  ),
  people: (c) => (
    <>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={9} cy={7} r={4} stroke={c} strokeWidth={1.8} fill="none" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  settings: (c) => (
    <>
      <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={1.8} fill="none" />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  person: (c) => (
    <>
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={12} cy={7} r={4} stroke={c} strokeWidth={1.8} fill="none" />
    </>
  ),
  'add-person': (c) => (
    <>
      <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={9} cy={7} r={4} stroke={c} strokeWidth={1.8} fill="none" />
      <Line x1={19} y1={8} x2={19} y2={14} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={22} y1={11} x2={16} y2={11} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  check: (c) => (
    <Polyline points="20 6 9 17 4 12" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  close: (c) => (
    <>
      <Line x1={18} y1={6} x2={6} y2={18} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={6} y1={6} x2={18} y2={18} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  'arrow-back': (c) => (
    <>
      <Path d="M19 12H5" stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 5l-7 7 7 7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  'more-vert': (c) => (
    <>
      <Circle cx={12} cy={5} r={1.5} fill={c} />
      <Circle cx={12} cy={12} r={1.5} fill={c} />
      <Circle cx={12} cy={19} r={1.5} fill={c} />
    </>
  ),
  search: (c) => (
    <>
      <Circle cx={11} cy={11} r={8} stroke={c} strokeWidth={1.8} fill="none" />
      <Path d="M21 21l-4.35-4.35" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  camera: (c) => (
    <>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={12} cy={13} r={4} stroke={c} strokeWidth={1.8} fill="none" />
    </>
  ),
  mic: (c) => (
    <>
      <Rect x={9} y={2} width={6} height={11} rx={3} stroke={c} strokeWidth={1.8} fill="none" />
      <Path d="M19 10v2a7 7 0 01-14 0v-2" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Line x1={12} y1={19} x2={12} y2={23} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={23} x2={16} y2={23} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  emoji: (c) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={c} strokeWidth={1.8} fill="none" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Line x1={9} y1={9} x2={9.01} y2={9} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={15} y1={9} x2={15.01} y2={9} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  send: (c) => (
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={c}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  wifi: (c) => (
    <>
      <Path d="M5 12.55a11 11 0 0114.08 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M1.42 9a16 16 0 0121.16 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M8.53 16.11a6 6 0 016.95 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Line x1={12} y1={20} x2={12.01} y2={20} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  bluetooth: (c) => (
    <Path
      d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"
      stroke={c}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  signal: (c) => (
    <>
      <Path d="M1 6c0 0 3-4 11-4s11 4 11 4" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M5 10s1.5-2 7-2 7 2 7 2" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M8.5 14s1-1 3.5-1 3.5 1 3.5 1" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={12} cy={17} r={1} fill={c} />
    </>
  ),
  heart: (c) => (
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={c}
      strokeWidth={1.8}
      strokeLinecap="round"
      fill="none"
    />
  ),
  bell: (c) => (
    <>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  lock: (c) => (
    <>
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke={c} strokeWidth={1.8} fill="none" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  info: (c) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={c} strokeWidth={1.8} fill="none" />
      <Line x1={12} y1={8} x2={12} y2={12} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={12} y1={16} x2={12.01} y2={16} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  circle: (c) => (
    <Circle cx={12} cy={12} r={10} stroke={c} strokeWidth={1.8} fill="none" />
  ),
};
