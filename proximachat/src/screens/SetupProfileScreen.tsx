/**
 * SetupProfileScreen - First-time user profile creation
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserAvatar} from '../components/UserAvatar';
import {AnimatedBat} from '../components/AnimatedBat';
import {useAppStore} from '../store/useAppStore';
import {StorageService} from '../services/StorageService';
import {NearbyService} from '../services/NearbyService';
import {COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS} from '../theme';
import type {RootStackParamList, UserProfile} from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('react-native-uuid');

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AVATAR_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC107', '#4CAF50', '#26C6DA',
  '#42A5F5', '#7E57C2', '#EC407A', '#26A69A', '#8D6E63',
];

const AVATAR_EMOJIS = [
  '🦊', '🐬', '🦁', '🐼', '🦋', '🦄', '🐉', '🦅', '🌟', '🔥',
];

export const SetupProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {setProfile, setProfileSetup} = useAppStore();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('Hey, I am using ProximaChat!');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const trimName = displayName.trim();
    const trimUser = username.trim().replace(/\s+/g, '_').toLowerCase();

    if (!trimName) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    if (trimUser.length < 3) {
      Alert.alert('Username too short', 'Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimUser)) {
      Alert.alert('Invalid username', 'Username can only contain letters, numbers, and underscores.');
      return;
    }

    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: String(uuid.v4()),
        username: trimUser,
        displayName: trimName,
        avatarColor: selectedColor,
        avatarEmoji: selectedEmoji,
        status: status.trim() || 'Hey, I am using ProximaChat!',
        createdAt: Date.now(),
      };

      await StorageService.saveProfile(profile);
      setProfile(profile);
      setProfileSetup(true);
      NearbyService.initialize(profile);

      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + SPACING.base, paddingBottom: insets.bottom + SPACING.xxl},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <AnimatedBat size={80} />
          <Text style={styles.title}>Welcome to ProximaChat</Text>
          <Text style={styles.subtitle}>
            Set up your profile to start chatting with nearby people
          </Text>
        </View>

        {/* Avatar Preview */}
        <View style={styles.avatarPreview}>
          <UserAvatar
            displayName={displayName || 'You'}
            avatarColor={selectedColor}
            avatarEmoji={selectedEmoji}
            size={80}
          />
          <Text style={styles.avatarName}>
            {displayName || 'Your Name'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor={COLORS.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={30}
              autoCorrect={false}
            />
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>@</Text>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="your_username"
                placeholderTextColor={COLORS.textTertiary}
                value={username}
                onChangeText={(v) =>
                  setUsername(v.replace(/\s+/g, '_').toLowerCase())
                }
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={status}
              onChangeText={setStatus}
              maxLength={60}
              autoCorrect
            />
          </View>

          {/* Color Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Avatar Color</Text>
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    {backgroundColor: color},
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Emoji Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Avatar Emoji (optional)</Text>
            <View style={styles.emojiRow}>
              <TouchableOpacity
                style={[
                  styles.emojiDot,
                  !selectedEmoji && styles.emojiDotSelected,
                ]}
                onPress={() => setSelectedEmoji(undefined)}>
                <Text style={styles.emojiText}>None</Text>
              </TouchableOpacity>
              {AVATAR_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiDot,
                    selectedEmoji === emoji && styles.emojiDotSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!displayName.trim() || username.length < 3) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isLoading || !displayName.trim() || username.length < 3}
          activeOpacity={0.85}>
          <Text style={styles.createButtonText}>
            {isLoading ? 'Setting up…' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: SPACING.base,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  form: {
    gap: SPACING.base,
    marginBottom: SPACING.xl,
  },
  field: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    ...SHADOWS.small,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.base,
    ...SHADOWS.small,
  },
  prefix: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  inputFlex: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    ...({elevation: 0} as object),
    shadowOpacity: 0,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: COLORS.primary,
    transform: [{scale: 1.15}],
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  emojiDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  emojiDotSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '15',
  },
  emojiText: {
    fontSize: FONT_SIZES.lg,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  createButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textWhite,
    letterSpacing: 0.5,
  },
});
