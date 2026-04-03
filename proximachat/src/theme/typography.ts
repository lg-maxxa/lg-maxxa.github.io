/**
 * ProximaChat Typography
 * Clean, modern typography system
 */
import {StyleSheet} from 'react-native';

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  hero: 32,
};

export const LINE_HEIGHTS = {
  xs: 16,
  sm: 18,
  base: 20,
  md: 22,
  lg: 24,
  xl: 26,
  xxl: 28,
  xxxl: 32,
  hero: 40,
};

export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography = StyleSheet.create({
  hero: {
    fontSize: FONT_SIZES.hero,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.hero,
  },
  h1: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.xxxl,
  },
  h2: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.xxl,
  },
  h3: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.lg,
  },
  body: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: LINE_HEIGHTS.md,
  },
  bodySmall: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: LINE_HEIGHTS.base,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: LINE_HEIGHTS.sm,
  },
  micro: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: LINE_HEIGHTS.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: LINE_HEIGHTS.xs,
  },
  badge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.xs,
  },
});
