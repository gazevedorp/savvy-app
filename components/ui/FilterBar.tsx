import React from 'react';
import { StyleSheet, ScrollView, type StyleProp, type ViewStyle } from 'react-native';
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
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function FilterBar({
  options,
  activeFilter,
  onFilterChange,
  bordered = false,
  style,
}: FilterBarProps) {
  const { colors, spacing } = useTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        bordered && { borderBottomColor: colors.border, borderBottomWidth: 1 },
        { paddingVertical: spacing.xs },
        style,
      ]}
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
  container: {},
});
