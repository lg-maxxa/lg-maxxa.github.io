/**
 * AnimatedBat - Lottie animation of the bat icon from icons8
 */
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

interface Props {
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

export const AnimatedBat: React.FC<Props> = ({
  size = 120,
  autoPlay = true,
  loop = true,
}) => {
  const emojiSize = Math.max(20, Math.floor(size * 0.52));

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <View style={[styles.fallbackCircle, {width: size, height: size, borderRadius: size / 2}]}> 
        <Text style={[styles.fallbackEmoji, {fontSize: emojiSize}]}>🦇</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
});
