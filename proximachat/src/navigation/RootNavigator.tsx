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
import {IdentityService} from '../services/IdentityService';
import {E2EEService} from '../services/E2EEService';
import {CRDTService} from '../services/CRDTService';
import {MessageQueueService} from '../services/MessageQueueService';
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
          let resolvedProfile = data.profile;
          if (!resolvedProfile.identityPublicKey) {
            const identity = await IdentityService.ensureIdentity();
            resolvedProfile = {
              ...resolvedProfile,
              identityPublicKey: identity.publicKey,
            };
            await StorageService.saveProfile(resolvedProfile);
          }

          hydrateState({
            profile: resolvedProfile,
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

        // Defer queue retries until after first render to reduce startup crash risk.
        setTimeout(() => {
          void MessageQueueService.processQueue().catch((err) => {
            console.warn('[Nav] Queue processing skipped during startup:', err);
          });
        }, 0);
      }
    })();
  }, [hydrateState]);

  useEffect(() => {
    const unsubscribe = NearbyService.addEventListener(async (incomingPayload) => {
      const state = useAppStore.getState();
      const me = state.profile;
      if (!me || incomingPayload.senderId === me.id) {
        return;
      }

      try {
        let payload = incomingPayload;

        if (payload.type === 'encrypted_envelope' && payload.encryptedEnvelope) {
          const identity = await StorageService.loadIdentity();
          if (!identity?.secretKey) {
            return;
          }
          const decrypted = E2EEService.decryptPayload(
            payload.encryptedEnvelope,
            identity.secretKey,
          );
          if (!decrypted) {
            return;
          }
          payload = decrypted;
        }

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
              identityPublicKey: sender.identityPublicKey,
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

            const merged = CRDTService.mergeMessages(
              latest.messages[message.conversationId] ?? [],
              [
                {
                  ...message,
                  status: message.status === 'failed' ? 'delivered' : message.status,
                },
              ],
            );
            latest.setMessages(message.conversationId, merged);

            await Promise.all([
              StorageService.saveMessages(
                message.conversationId,
                merged,
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
