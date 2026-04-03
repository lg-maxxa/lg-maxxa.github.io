/**
 * RootNavigator - Top-level navigation switching between Splash, Setup, and Main
 */
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SplashScreen} from '../screens/SplashScreen';
import {SetupProfileScreen} from '../screens/SetupProfileScreen';
import {MainNavigator} from './MainNavigator';
import {useAppStore} from '../store/useAppStore';
import {StorageService} from '../services/StorageService';
import type {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {isProfileSetup, hydrateState, setProfileSetup} = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await StorageService.loadAll();
        if (data.profile) {
          hydrateState({
            profile: data.profile,
            isProfileSetup: true,
            friends: data.friends,
            friendRequests: data.friendRequests,
            conversations: data.conversations,
          });
        }
      } catch (err) {
        console.error('[Nav] Failed to load stored data:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [hydrateState]);

  if (isLoading) {
    return null; // SplashScreen handles loading state
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
      {!isProfileSetup ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen
            name="Setup"
            component={SetupProfileScreen}
            options={{animation: 'slide_from_right'}}
          />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};
