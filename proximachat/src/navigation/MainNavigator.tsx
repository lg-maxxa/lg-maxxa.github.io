/**
 * MainNavigator - Bottom tab navigator for the main app experience
 */
import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Screens
import {ConversationListScreen} from '../screens/ConversationListScreen';
import {ChatScreen} from '../screens/ChatScreen';
import {DiscoveryScreen} from '../screens/DiscoveryScreen';
import {FriendsListScreen} from '../screens/FriendsListScreen';
import {FriendRequestsScreen} from '../screens/FriendRequestsScreen';
import {SettingsScreen} from '../screens/SettingsScreen';

// Components
import {TabBarIcon} from '../components/TabBarIcon';
import {Badge} from '../components/Badge';

// Store & Theme
import {useAppStore} from '../store/useAppStore';
import {COLORS, SPACING, SHADOWS} from '../theme';

import type {
  MainTabParamList,
  ChatsStackParamList,
  FriendsStackParamList,
} from '../types';

// ─── Stacks inside tabs ───────────────────────────────────────────────────────

const ChatsStack = createNativeStackNavigator<ChatsStackParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function ChatsNavigator() {
  return (
    <ChatsStack.Navigator screenOptions={{headerShown: false}}>
      <ChatsStack.Screen
        name="ConversationList"
        component={ConversationListScreen}
      />
      <ChatsStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{animation: 'slide_from_right'}}
      />
    </ChatsStack.Navigator>
  );
}

function FriendsNavigator() {
  return (
    <FriendsStack.Navigator screenOptions={{headerShown: false}}>
      <FriendsStack.Screen name="FriendsList" component={FriendsListScreen} />
      <FriendsStack.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{animation: 'slide_from_right'}}
      />
    </FriendsStack.Navigator>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

export const MainNavigator: React.FC = () => {
  const {conversations, friendRequests, profile} = useAppStore();
  const insets = useSafeAreaInsets();

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingRequests = friendRequests.filter(
    (r) => r.status === 'pending' && r.toPeerId === profile?.id,
  ).length;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {paddingBottom: Math.max(insets.bottom, SPACING.sm)},
        ],
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.iconInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({focused, color}) => (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            color={color}
            badge={
              route.name === 'Chats' && totalUnread > 0
                ? totalUnread
                : route.name === 'Friends' && pendingRequests > 0
                ? pendingRequests
                : undefined
            }
          />
        ),
      })}>
      <Tab.Screen
        name="Chats"
        component={ChatsNavigator}
        options={{tabBarLabel: 'Chats'}}
      />
      <Tab.Screen
        name="Discovery"
        component={DiscoveryScreen}
        options={{tabBarLabel: 'Discover'}}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsNavigator}
        options={{tabBarLabel: 'Friends'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 60,
    paddingTop: SPACING.xs,
    ...SHADOWS.small,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
