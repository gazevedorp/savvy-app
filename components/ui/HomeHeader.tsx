import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface HomeHeaderProps {
  title: string;
  subtitle: string;
  insetTop?: boolean;
}

export default function HomeHeader({
  title,
  subtitle,
  insetTop = true,
}: HomeHeaderProps) {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          paddingTop: insetTop ? Math.max(insets.top, spacing.sm) : spacing.md,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.hero, { color: colors.text }]}>{title}</Text>
      <Text
        style={[
          typography.subtitle,
          { color: colors.textSecondary, marginTop: spacing.xxs },
        ]}
        numberOfLines={1}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'flex-end',
  },
});
