/**
 * EmptyState - Shown when a list is empty
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SvgIcon, IconName} from './SvgIcon';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';

interface Props {
  icon?: IconName;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  icon = 'chat-bubble',
  title,
  subtitle,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <SvgIcon name={icon} size={48} color={COLORS.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
