import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';

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
  const { colors } = useTheme();

  return (
    <Animated.View 
      style={[styles.container, { borderBottomColor: colors.border }]}
      entering={FadeIn.duration(300)}
    >
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterOption,
              activeFilter === option.id && { 
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
              activeFilter !== option.id && {
                borderColor: colors.border,
              }
            ]}
            onPress={() => onFilterChange(option.id)}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === option.id ? colors.primary : colors.textSecondary }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});