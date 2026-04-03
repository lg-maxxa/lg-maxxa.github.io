/**
 * SplashScreen - App launch screen with animated bat and ProximaChat branding
 */
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AnimatedBat} from '../components/AnimatedBat';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {RootStackParamList} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Setup');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Animated Bat Logo */}
      <View style={styles.logoArea}>
        <AnimatedBat size={160} />
      </View>

      {/* Branding */}
      <Text style={styles.appName}>ProximaChat</Text>
      <Text style={styles.tagline}>Connect offline. Chat nearby.</Text>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Text style={styles.poweredBy}>
          Powered by Bluetooth & Wi-Fi Direct
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  logoArea: {
    marginBottom: SPACING.xl,
  },
  appName: {
    fontSize: FONT_SIZES.hero,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: SPACING.xxl,
  },
  poweredBy: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
