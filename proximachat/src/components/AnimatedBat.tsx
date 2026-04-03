/**
 * AnimatedBat - Lottie animation of the bat icon from icons8
 */
import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

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
  const animation = useRef<LottieView>(null);

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <LottieView
        ref={animation}
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../assets/icons/icons8-bat.json')}
        style={styles.lottie}
        autoPlay={autoPlay}
        loop={loop}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
