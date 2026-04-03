/**
 * UserAvatar - Circular avatar with color, initials, or emoji
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FONT_SIZES, FONT_WEIGHTS} from '../theme/typography';

interface Props {
  displayName: string;
  avatarColor: string;
  avatarEmoji?: string;
  size?: number;
  showOnlineBadge?: boolean;
  isOnline?: boolean;
}

export const UserAvatar: React.FC<Props> = ({
  displayName,
  avatarColor,
  avatarEmoji,
  size = 46,
  showOnlineBadge = false,
  isOnline = false,
}) => {
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size * 0.36;
  const badgeSize = size * 0.28;

  return (
    <View style={[styles.wrapper, {width: size + 4, height: size + 4}]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: avatarColor,
          },
        ]}>
        <Text style={[styles.text, {fontSize}]}>
          {avatarEmoji ?? initials}
        </Text>
      </View>
      {showOnlineBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isOnline ? '#25D366' : '#8696A0',
              bottom: 1,
              right: 1,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
