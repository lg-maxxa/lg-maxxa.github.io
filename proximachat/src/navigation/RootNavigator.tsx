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
import {NearbyService} from '../services/NearbyService';
import {ChatService} from '../services/ChatService';
import type {Friend, RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {isProfileSetup, hydrateState} = useAppStore();
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
            settings: data.settings
              ? {...useAppStore.getState().settings, ...data.settings}
              : useAppStore.getState().settings,
          });
        }
      } catch (err) {
        console.error('[Nav] Failed to load stored data:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [hydrateState]);

  useEffect(() => {
    const unsubscribe = NearbyService.addEventListener(async (payload) => {
      const state = useAppStore.getState();
      const me = state.profile;
      if (!me || payload.senderId === me.id) {
        return;
      }

      try {
        switch (payload.type) {
          case 'friend_request_received': {
            if (!payload.friendRequest || payload.friendRequest.toPeerId !== me.id) {
              return;
            }
            state.addFriendRequest(payload.friendRequest);
            await StorageService.saveFriendRequests(useAppStore.getState().friendRequests);
            break;
          }

          case 'friend_request_accepted': {
            const sender = payload.senderProfile;
            if (!sender?.id || !sender.username || !sender.displayName || !sender.avatarColor) {
              return;
            }

            const friend: Friend = {
              id: sender.id,
              username: sender.username,
              displayName: sender.displayName,
              avatarColor: sender.avatarColor,
              avatarEmoji: sender.avatarEmoji,
              addedAt: Date.now(),
              isOnline: true,
              connectionType: 'wifi',
            };

            state.addFriend(friend);
            const conv = ChatService.openConversation(me, friend);
            state.upsertConversation(conv);

            if (payload.friendRequest?.id) {
              state.updateFriendRequest(payload.friendRequest.id, {
                status: 'accepted',
                respondedAt: Date.now(),
              });
            }

            await Promise.all([
              StorageService.saveFriends(useAppStore.getState().friends),
              StorageService.saveConversations(useAppStore.getState().conversations),
              StorageService.saveFriendRequests(useAppStore.getState().friendRequests),
            ]);
            break;
          }

          case 'message_received': {
            const message = payload.message;
            if (!message) {
              return;
            }

            const latest = useAppStore.getState();
            const existingConversation = latest.conversations.find(
              (c) => c.id === message.conversationId,
            );

            if (!existingConversation) {
              const friend = latest.friends.find((f) => f.id === payload.senderId);
              if (friend) {
                latest.upsertConversation(ChatService.openConversation(me, friend));
              }
            }

            latest.addMessage(message.conversationId, {
              ...message,
              status: message.status === 'failed' ? 'delivered' : message.status,
            });

            await Promise.all([
              StorageService.saveMessages(
                message.conversationId,
                useAppStore.getState().messages[message.conversationId] ?? [],
              ),
              StorageService.saveConversations(useAppStore.getState().conversations),
            ]);
            break;
          }

          case 'typing_start':
          case 'typing_stop': {
            const conversationId = ChatService.conversationId(me.id, payload.senderId);
            state.setPeerTyping(conversationId, payload.type === 'typing_start');
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[Nav] Failed to process nearby event:', err);
      }
    });

    return unsubscribe;
  }, []);

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
