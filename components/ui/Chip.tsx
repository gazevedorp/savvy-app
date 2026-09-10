import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  variant?: 'filter' | 'tag';
  tint?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  onClear,
  variant = 'filter',
  tint,
  style,
}: ChipProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const isTag = variant === 'tag';
  const active = isTag || selected;
  const accent = tint || colors.primary;
  const accentSoft = tint ? `${tint}22` : colors.primaryLight;

  const content = (
    <Text
      style={[
        typography.caption,
        { color: active ? accent : colors.textSecondary },
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
      backgroundColor: active ? accentSoft : 'transparent',
      borderColor: active ? accent : colors.border,
    },
    style,
  ];

  const body = (
    <>
      {content}
      {onClear ? (
        <X
          size={14}
          color={active ? accent : colors.textSecondary}
          style={{ marginLeft: spacing.xxs }}
        />
      ) : null}
    </>
  );

  if (onPress || onClear) {
    return (
      <TouchableOpacity
        style={chipStyle}
        onPress={onClear || onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={onClear ? `Remover ${label}` : label}
      >
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={chipStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
