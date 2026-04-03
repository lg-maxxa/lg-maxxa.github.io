/**
 * Badge - Notification count badge
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../theme/colors';

interface Props {
  count: number;
  maxCount?: number;
}

export const Badge: React.FC<Props> = ({count, maxCount = 99}) => {
  const display = count > maxCount ? `${maxCount}+` : String(count);
  const isWide = display.length > 2;

  return (
    <View style={[styles.badge, isWide && styles.wide]}>
      <Text style={styles.text}>{display}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  wide: {
    minWidth: 24,
  },
  text: {
    color: COLORS.badgeText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
});
