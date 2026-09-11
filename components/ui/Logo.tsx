import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
}

export default function Logo({ size = 'medium', showWordmark = true }: LogoProps) {
  const { colors, spacing, typography, radius } = useTheme();

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { iconSize: 48, gap: spacing.xs, type: typography.heading };
      case 'large':
        return { iconSize: 80, gap: spacing.sm, type: typography.hero };
      case 'medium':
      default:
        return { iconSize: 64, gap: spacing.xs, type: typography.title };
    }
  };

  const { iconSize, gap, type } = getSizes();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={[
          styles.icon,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: radius.lg,
          },
        ]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {showWordmark ? (
        <Text style={[type, styles.wordmark, { color: colors.primary, marginTop: gap }]}>
          Savvy
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {},
  wordmark: {
    letterSpacing: -0.4,
  },
});
