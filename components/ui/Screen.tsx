import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function Screen({
  children,
  scroll = false,
  padded = false,
  safe = false,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const paddedStyle = padded ? { padding: spacing.md } : undefined;
  const background = { backgroundColor: colors.background };

  const body = scroll ? (
    <ScrollView
      style={[styles.fill, background, style]}
      contentContainerStyle={[paddedStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, background, paddedStyle, style]}>{children}</View>
  );

  if (safe) {
    return <SafeAreaView style={[styles.fill, background]}>{body}</SafeAreaView>;
  }

  return body;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
