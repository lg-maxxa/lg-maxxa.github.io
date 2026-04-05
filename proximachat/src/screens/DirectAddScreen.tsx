import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import {SvgIcon} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {InviteService} from '../services/InviteService';
import {ChatService} from '../services/ChatService';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';
import type {Friend, FriendsStackParamList} from '../types';

type Nav = NativeStackNavigationProp<FriendsStackParamList>;

export const DirectAddScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {profile, addFriend, upsertConversation} = useAppStore();
  const [inviteInput, setInviteInput] = useState('');

  const inviteUri = useMemo(() => {
    if (!profile) {
      return '';
    }
    return InviteService.encodeInvite(InviteService.createInvitePayload(profile));
  }, [profile]);

  const handleShare = async () => {
    if (!inviteUri) {
      return;
    }
    await Share.share({
      title: 'ProximaChat Direct Add',
      message: inviteUri,
    });
  };

  const handleAddFromInvite = async () => {
    if (!profile) {
      return;
    }

    const decoded = InviteService.decodeInvite(inviteInput);
    if (!decoded) {
      Alert.alert('Invalid invite', 'Please paste a valid ProximaChat invite code.');
      return;
    }

    if (decoded.profileId === profile.id) {
      Alert.alert('Invalid invite', 'You cannot add your own profile.');
      return;
    }

    const friend: Friend = {
      id: decoded.profileId,
      username: decoded.username,
      displayName: decoded.displayName,
      avatarColor: decoded.avatarColor,
      avatarEmoji: decoded.avatarEmoji,
      addedAt: Date.now(),
      isOnline: true,
      connectionType: 'unknown',
    };

    addFriend(friend);
    const conversation = ChatService.openConversation(profile, friend);
    upsertConversation(conversation);

    await Promise.all([
      StorageService.saveFriends(useAppStore.getState().friends),
      StorageService.saveConversations(useAppStore.getState().conversations),
    ]);

    Alert.alert('Added', `${friend.displayName} was added to your friends.`);
    setInviteInput('');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <SvgIcon name="arrow-back" size={22} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Direct Add</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Your Invite QR</Text>
        <View style={styles.qrCard}>
          {inviteUri ? (
            <QRCode value={inviteUri} size={180} color={COLORS.textPrimary} backgroundColor={COLORS.surface} />
          ) : (
            <Text style={styles.helper}>Create your profile first to generate invite.</Text>
          )}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={!inviteUri}>
            <SvgIcon name="attach" size={16} color={COLORS.textWhite} />
            <Text style={styles.shareText}>Share Invite Link</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Add Friend From Invite</Text>
        <View style={styles.inputCard}>
          <TextInput
            value={inviteInput}
            onChangeText={setInviteInput}
            placeholder="Paste invite link or payload"
            placeholderTextColor={COLORS.textTertiary}
            multiline
            style={styles.input}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddFromInvite}>
            <SvgIcon name="add-person" size={16} color={COLORS.textWhite} />
            <Text style={styles.addText}>Add Friend Directly</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Enterprise note: QR invite works offline and is useful when discovery transport is unstable on vendor ROMs.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backBtn: {padding: SPACING.xs},
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxl,
    gap: SPACING.base,
  },
  sectionTitle: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.base,
  },
  helper: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  shareText: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.sm,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
  },
  addText: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  note: {
    marginTop: SPACING.base,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
  },
});
