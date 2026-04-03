/**
 * SettingsScreen - User profile, app info, and preferences
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserAvatar} from '../components/UserAvatar';
import {SvgIcon, IconName} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {profile, isBluetoothEnabled, isWifiEnabled, setBluetoothEnabled, setWifiEnabled} =
    useAppStore();

  const [notifications, setNotifications] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all messages, friends, and your profile. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            useAppStore.setState({
              profile: null,
              isProfileSetup: false,
              conversations: [],
              messages: {},
              friends: [],
              friendRequests: [],
              discovery: {isScanning: false, peers: []},
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + SPACING.sm}]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + SPACING.xxl}]}
        showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        {profile && (
          <View style={styles.profileCard}>
            <UserAvatar
              displayName={profile.displayName}
              avatarColor={profile.avatarColor}
              avatarEmoji={profile.avatarEmoji}
              size={64}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.displayName}</Text>
              <Text style={styles.profileUsername}>@{profile.username}</Text>
              <Text style={styles.profileStatus}>{profile.status}</Text>
            </View>
          </View>
        )}

        {/* Connectivity */}
        <Text style={styles.sectionTitle}>Connectivity</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="bluetooth"
            label="Bluetooth"
            subtitle="Discover and connect to nearby users"
            right={
              <Switch
                value={isBluetoothEnabled}
                onValueChange={setBluetoothEnabled}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
          />
          <SettingsRow
            icon="wifi"
            label="Wi-Fi Direct"
            subtitle="High-speed local network messaging"
            right={
              <Switch
                value={isWifiEnabled}
                onValueChange={setWifiEnabled}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
            isLast
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="bell"
            label="Message Notifications"
            subtitle="Get notified of new messages"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
            isLast
          />
        </View>

        {/* Privacy & Security */}
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="lock"
            label="End-to-End Encryption"
            subtitle="All messages are encrypted locally"
            right={<View style={styles.badge}><Text style={styles.badgeText}>Active</Text></View>}
          />
          <SettingsRow
            icon="info"
            label="How P2P Works"
            subtitle="Learn about offline communication"
            onPress={() =>
              Alert.alert(
                'How It Works',
                'ProximaChat uses Bluetooth Low Energy (BLE) and Wi-Fi Direct to discover and connect with nearby devices without an internet connection.\n\n• Android: BLE + Wi-Fi Direct (Wi-Fi P2P)\n• iOS: MultipeerConnectivity (Bluetooth + Wi-Fi)\n\nMessages are sent directly between devices when in range (typically 10–30 meters).',
              )
            }
            isLast
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="heart"
            label="ProximaChat"
            subtitle="Version 1.0.0 • Offline P2P Chat"
            isLast
          />
        </View>

        {/* Danger zone */}
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Sub-component ─────────────────────────────────────────────────────────────
interface SettingsRowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  subtitle,
  right,
  onPress,
  isLast,
}) => (
  <TouchableOpacity
    style={[styles.row, !isLast && styles.rowBorder]}
    onPress={onPress}
    disabled={!onPress && !right}
    activeOpacity={onPress ? 0.7 : 1}>
    <View style={styles.rowIcon}>
      <SvgIcon name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{label}</Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>
    {right ?? (onPress ? <SvgIcon name="arrow-back" size={16} color={COLORS.textTertiary} style={styles.rowArrow} /> : null)}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
  },
  scroll: {
    paddingTop: SPACING.base,
    paddingHorizontal: SPACING.base,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  profileUsername: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  rowArrow: {
    transform: [{rotate: '180deg'}],
  },
  badge: {
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.pill,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
  },
  dangerButton: {
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.buttonDanger + '60',
    marginBottom: SPACING.base,
  },
  dangerButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.buttonDanger,
  },
});
