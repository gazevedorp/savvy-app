import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  backIcon?: 'arrow' | 'close';
  right?: React.ReactNode;
  insetTop?: boolean;
}

export default function AppHeader({
  title,
  onBack,
  backIcon = 'arrow',
  right,
  insetTop = true,
}: AppHeaderProps) {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const BackIcon = backIcon === 'close' ? X : ArrowLeft;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insetTop ? Math.max(insets.top, spacing.sm) : spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.md,
        },
      ]}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.side} accessibilityRole="button">
          <BackIcon size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      <Text
        style={[styles.title, typography.heading, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
