import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface SegmentOption {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (id: string) => void;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.primary,
          borderRadius: radius.sm,
          marginHorizontal: spacing.md,
          marginVertical: spacing.sm,
        },
      ]}
    >
      {options.map((option, index) => {
        const selected = value === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? colors.primary : 'transparent',
                borderRightWidth: index < options.length - 1 ? 1 : 0,
                borderRightColor: colors.primary,
                paddingVertical: spacing.xs,
              },
            ]}
            onPress={() => onChange(option.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                typography.caption,
                { color: selected ? colors.onPrimary : colors.primary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
