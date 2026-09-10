import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filter' | 'tag';
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  variant = 'filter',
  style,
}: ChipProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const isTag = variant === 'tag';
  const active = isTag || selected;

  const content = (
    <Text
      style={[
        typography.caption,
        { color: active ? colors.primary : colors.textSecondary },
      ]}
    >
      {label}
    </Text>
  );

  const chipStyle = [
    styles.chip,
    {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs + 2,
      borderRadius: radius.lg,
      backgroundColor: active ? colors.primaryLight : 'transparent',
      borderColor: active ? colors.primary : colors.border,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={chipStyle} onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={chipStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
