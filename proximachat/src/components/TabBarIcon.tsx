/**
 * TabBarIcon - Custom icon renderer for bottom navigation tabs
 */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SvgIcon} from './SvgIcon';
import {Badge} from './Badge';
import {COLORS, ICON_SIZES} from '../theme';

interface Props {
  routeName: string;
  focused: boolean;
  color: string;
  badge?: number;
}

const ROUTE_ICONS: Record<string, string> = {
  Chats: 'chat',
  Discovery: 'radar',
  Friends: 'people',
  Settings: 'settings',
};

export const TabBarIcon: React.FC<Props> = ({routeName, focused, color, badge}) => {
  const iconName = ROUTE_ICONS[routeName] ?? 'circle';

  return (
    <View style={styles.container}>
      <SvgIcon
        name={iconName as any}
        size={ICON_SIZES.base}
        color={color}
        style={focused ? styles.focused : undefined}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Badge count={badge} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  focused: {
    transform: [{scale: 1.1}],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
  },
});
