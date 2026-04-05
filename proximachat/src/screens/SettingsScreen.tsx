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
  Platform,
  PermissionsAndroid,
  Share,
  type Permission,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserAvatar} from '../components/UserAvatar';
import {SvgIcon, IconName} from '../components/SvgIcon';
import {useAppStore} from '../store/useAppStore';
import {StorageService} from '../services/StorageService';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    profile,
    isBluetoothEnabled,
    isWifiEnabled,
    setBluetoothEnabled,
    setWifiEnabled,
    settings,
    updateSettings,
    diagnostics,
    clearDiagnosticLogs,
  } = useAppStore();

  const [notifications, setNotifications] = useState(true);

  const persistSettings = async (updates: Parameters<typeof updateSettings>[0]) => {
    const next = {...useAppStore.getState().settings, ...updates};
    updateSettings(updates);
    await StorageService.saveSettings(next);
  };

  const getPermissionSnapshot = async (): Promise<string[]> => {
    if (Platform.OS !== 'android') {
      return ['iOS runtime permissions are managed by the system prompt flow.'];
    }

    const checks: Array<[string, Permission]> = [
      ['ACCESS_FINE_LOCATION', PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION],
      ['ACCESS_COARSE_LOCATION', PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION],
      ['BLUETOOTH_SCAN', PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN],
      ['BLUETOOTH_CONNECT', PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT],
      ['BLUETOOTH_ADVERTISE', PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE],
      ['NEARBY_WIFI_DEVICES', PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES],
    ];

    const results: string[] = [];
    for (const [label, permission] of checks) {
      if (!permission) {
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const granted = await PermissionsAndroid.check(permission);
      results.push(`${label}: ${granted ? 'GRANTED' : 'DENIED'}`);
    }
    return results;
  };

  const runConnectivityCheck = async () => {
    const apiLevel = await DeviceInfo.getApiLevel().catch(() => null);
    const os = DeviceInfo.getSystemVersion();
    const permissions = await getPermissionSnapshot();
    const logs = useAppStore.getState().diagnostics.logs.slice(0, 8);

    Alert.alert(
      'Connectivity Diagnostics',
      [
        `Device: ${DeviceInfo.getModel()}`,
        `Android: ${os}${apiLevel ? ` (API ${apiLevel})` : ''}`,
        `Bluetooth toggle: ${useAppStore.getState().isBluetoothEnabled ? 'ON' : 'OFF'}`,
        `Wi-Fi Direct toggle: ${useAppStore.getState().isWifiEnabled ? 'ON' : 'OFF'}`,
        '',
        'Permissions:',
        ...permissions,
        '',
        'Recent transport logs:',
        ...(logs.length > 0
          ? logs.map((l) => `${new Date(l.timestamp).toLocaleTimeString()} [${l.level}] ${l.message}`)
          : ['No logs yet']),
      ].join('\n'),
    );
  };

  const exportDiagnostics = async () => {
    const logs = useAppStore.getState().diagnostics.logs;
    const payload = {
      generatedAt: new Date().toISOString(),
      deviceModel: DeviceInfo.getModel(),
      settings: useAppStore.getState().settings,
      bluetoothEnabled: useAppStore.getState().isBluetoothEnabled,
      wifiEnabled: useAppStore.getState().isWifiEnabled,
      logs,
    };

    await Share.share({
      title: 'ProximaChat Diagnostics',
      message: JSON.stringify(payload, null, 2),
    });
  };

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

        {/* Professional controls */}
        <Text style={styles.sectionTitle}>Professional Controls</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="signal"
            label="Delivery Retry"
            subtitle="Retry failed peer sends with fallback transport"
            right={
              <Switch
                value={settings.deliveryRetryEnabled}
                onValueChange={(v) => {
                  void persistSettings({deliveryRetryEnabled: v});
                }}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
          />
          <SettingsRow
            icon="wifi"
            label="Strict Nearby Mode"
            subtitle="Show only peers with stable transport signal"
            right={
              <Switch
                value={settings.strictNearbyMode}
                onValueChange={(v) => {
                  void persistSettings({strictNearbyMode: v});
                }}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
          />
          <SettingsRow
            icon="chat"
            label="Compact Peer Cards"
            subtitle="Reduce discovery card spacing for dense lists"
            right={
              <Switch
                value={settings.compactPeerCards}
                onValueChange={(v) => {
                  void persistSettings({compactPeerCards: v});
                }}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
          />
          <SettingsRow
            icon="circle"
            label="Reduced Motion"
            subtitle="Minimize non-essential animations"
            right={
              <Switch
                value={settings.reducedMotion}
                onValueChange={(v) => {
                  void persistSettings({reducedMotion: v});
                }}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
          />
          <SettingsRow
            icon="lock"
            label="High Contrast"
            subtitle="Increase contrast for improved readability"
            right={
              <Switch
                value={settings.highContrast}
                onValueChange={(v) => {
                  void persistSettings({highContrast: v});
                }}
                trackColor={{false: COLORS.inputBorder, true: COLORS.accent}}
                thumbColor={COLORS.textWhite}
              />
            }
            isLast
          />
        </View>

        {/* Diagnostics */}
        <Text style={styles.sectionTitle}>Diagnostics</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="info"
            label="Run Connectivity Check"
            subtitle="Validate permissions, API level and transport state"
            onPress={() => {
              void runConnectivityCheck();
            }}
          />
          <SettingsRow
            icon="attach"
            label="Export Diagnostics"
            subtitle="Share technical logs for QA and support"
            onPress={() => {
              void exportDiagnostics();
            }}
          />
          <SettingsRow
            icon="close"
            label="Clear Diagnostics Logs"
            subtitle={`${diagnostics.logs.length} log entries currently stored`}
            onPress={() => {
              clearDiagnosticLogs();
            }}
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
