/**
 * ProximaChat - Offline P2P Chat Application
 * Root Application Component
 */
import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AppStoreProvider} from './src/store/AppContext';
import {StorageService} from './src/services/StorageService';
import {AppErrorBoundary} from './src/components/AppErrorBoundary';
import {navigationRef} from './src/navigation/navigationRef';
import {COLORS} from './src/theme/colors';

// Suppress known harmless warnings in dev
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate`',
]);

const App: React.FC = () => {
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await StorageService.init();
      } catch (err) {
        // Avoid startup crash loops on devices where native storage modules fail.
        if (mounted) {
          console.error('[App] Storage init failed:', err);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppStoreProvider>
          <AppErrorBoundary>
            <NavigationContainer ref={navigationRef} theme={navigationTheme}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
                translucent={false}
              />
              <RootNavigator />
            </NavigationContainer>
          </AppErrorBoundary>
        </AppStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const navigationTheme = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.accent,
  },
};

export default App;
