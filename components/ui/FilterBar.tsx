import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import Chip from '@/components/ui/Chip';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export default function FilterBar({ options, activeFilter, onFilterChange }: FilterBarProps) {
  const { colors, spacing } = useTheme();

  return (
    <Animated.View
      style={[styles.container, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}
      entering={FadeIn.duration(300)}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
      >
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={activeFilter === option.id}
            onPress={() => onFilterChange(option.id)}
            style={{ marginRight: spacing.xs }}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
});
