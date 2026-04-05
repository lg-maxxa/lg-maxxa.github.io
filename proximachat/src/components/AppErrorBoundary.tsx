import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '../theme';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: unknown): void {
    console.error('[AppErrorBoundary] Render crash caught:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>ProximaChat</Text>
          <Text style={styles.message}>
            Something went wrong while rendering the app. Please reopen ProximaChat.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
