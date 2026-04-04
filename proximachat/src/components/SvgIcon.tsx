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
  Ellipse,
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
      {/* 3D Chat Bubble with gradient effect */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="19" rx="9" ry="2" fill={c} opacity={0.1} />
        {/* Main bubble */}
        <Path
          d="M2 6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-10l-4 4v-4H4c-1.1 0-2-.9-2-2V6z"
          fill={c}
          opacity={0.2}
          stroke={c}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Highlight (3D effect) */}
        <Path
          d="M4 8c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V8z"
          fill={c}
          opacity={0.15}
        />
      </G>
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
      {/* 3D Radar/Proximity */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="19.5" rx="8" ry="1.5" fill={c} opacity={0.08} />
        {/* Center point */}
        <Circle cx="12" cy="12" r="1.5" fill={c} />
        {/* Radar circles */}
        <Circle cx="12" cy="12" r="5" stroke={c} strokeWidth={1} opacity={0.6} fill="none" />
        <Circle cx="12" cy="12" r="8" stroke={c} strokeWidth={0.8} opacity={0.4} fill="none" />
        {/* Sweep line */}
        <Line x1="12" y1="12" x2="12" y2="4" stroke={c} strokeWidth={1.2} opacity={0.8} />
        <Line x1="12" y1="12" x2="16.5" y2="7.5" stroke={c} strokeWidth={0.8} opacity={0.5} />
      </G>
    </>
  ),
  people: (c) => (
    <>
      {/* 3D Friends/People */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="20" rx="9" ry="1.5" fill={c} opacity={0.08} />
        {/* Person 1 (left) */}
        <Circle cx="7" cy="6" r="2.5" fill={c} opacity={0.2} stroke={c} strokeWidth={1} />
        <Path
          d="M4 11c0-1 1-2 2-2h2c1 0 2 1 2 2v4c0 1-1 2-2 2H6c-1 0-2-1-2-2v-4z"
          fill={c}
          opacity={0.15}
          stroke={c}
          strokeWidth={1}
        />
        {/* Person 2 (right) */}
        <Circle cx="17" cy="6" r="2.5" fill={c} opacity={0.2} stroke={c} strokeWidth={1} />
        <Path
          d="M14 11c0-1 1-2 2-2h2c1 0 2 1 2 2v4c0 1-1 2-2 2h-2c-1 0-2-1-2-2v-4z"
          fill={c}
          opacity={0.15}
          stroke={c}
          strokeWidth={1}
        />
      </G>
    </>
  ),
  settings: (c) => (
    <>
      {/* 3D Settings/Gear */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="19.5" rx="8" ry="1.5" fill={c} opacity={0.08} />
        {/* Gear circle */}
        <Circle cx="12" cy="12" r="5" fill={c} opacity={0.15} stroke={c} strokeWidth={1} />
        {/* Gear teeth */}
        <Rect x="10.5" y="2" width="3" height="2" fill={c} opacity={0.2} />
        <Rect x="17" y="6.5" width="2.5" height="2.5" rx={0.5} fill={c} opacity={0.2} />
        <Rect x="20" y="11" width="2" height="2" fill={c} opacity={0.2} />
        {/* Center */}
        <Circle cx="12" cy="12" r="2" fill={c} opacity={0.25} />
        {/* Highlight */}
        <Circle cx="10" cy="10" r="1.5" fill={c} opacity={0.1} />
      </G>
    </>
  ),
  person: (c) => (
    <>
      {/* 3D Person/Avatar */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="20" rx="7" ry="1.5" fill={c} opacity={0.08} />
        {/* Head */}
        <Circle cx="12" cy="6" r="3" fill={c} opacity={0.18} stroke={c} strokeWidth={1} />
        {/* Body */}
        <Path
          d="M8 11c0-1 1-2 2-2h4c1 0 2 1 2 2v6c0 1-1 2-2 2H10c-1 0-2-1-2-2v-6z"
          fill={c}
          opacity={0.12}
          stroke={c}
          strokeWidth={1}
        />
        {/* Highlight (3D effect) */}
        <Circle cx="10" cy="7" r="1" fill={c} opacity={0.2} />
      </G>
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
    <>
      {/* 3D Send Arrow */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="19" rx="7" ry="1.5" fill={c} opacity={0.08} />
        {/* Arrow shaft */}
        <Path
          d="M2 12l14 0"
          stroke={c}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrow head */}
        <Path
          d="M16 8l6 4-6 4"
          stroke={c}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    </>
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
      {/* 3D Notification Bell */}
      <G>
        {/* Shadow */}
        <Ellipse cx="12" cy="20" rx="7" ry="1.5" fill={c} opacity={0.08} />
        {/* Bell body */}
        <Path
          d="M5 9c0-2.5 2-4 7-4s7 1.5 7 4c0 4-3 5-3 5h-8c0 0-3-1-3-5z"
          fill={c}
          opacity={0.15}
          stroke={c}
          strokeWidth={1}
        />
        {/* Bell clapper */}
        <Path
          d="M11 17h2v1h-2z"
          fill={c}
          opacity={0.2}
        />
        {/* Notification badge */}
        <Circle cx="17" cy="5" r="2" fill={c} />
        {/* Highlight */}
        <Circle cx="15" cy="3" r="0.8" fill={c} opacity={0.3} />
      </G>
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
