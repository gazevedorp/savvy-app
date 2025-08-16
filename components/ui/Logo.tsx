import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'medium' }: LogoProps) {
  const { colors } = useTheme();

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { iconSize: 48, spacing: 8 };
      case 'medium':
        return { iconSize: 64, spacing: 12 };
      case 'large':
        return { iconSize: 80, spacing: 16 };
      default:
        return { iconSize: 64, spacing: 12 };
    }
  };

  const { iconSize, spacing } = getSizes();

  return (
    <View style={[styles.container, { marginBottom: spacing }]}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={[
          styles.icon,
          {
            width: iconSize,
            height: iconSize,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    borderRadius: 16,
  },
});
