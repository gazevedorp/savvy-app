import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import Chip from '@/components/ui/Chip';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelector({
  categories,
  selectedCategories,
  onSelectCategory,
}: CategorySelectorProps) {
  const { colors, spacing, typography } = useTheme();

  if (categories.length === 0) {
    return (
      <Text
        style={[
          typography.caption,
          { color: colors.textSecondary, fontFamily: 'Inter-Regular', marginBottom: spacing.lg },
        ]}
      >
        Nenhuma categoria disponível
      </Text>
    );
  }

  return (
    <View style={[styles.container, { marginBottom: spacing.md, gap: spacing.xs }]}>
      {categories.map((category) => {
        const isSelected = category.id ? selectedCategories.includes(category.id) : false;
        return (
          <Chip
            key={category.id}
            label={category.name}
            selected={isSelected}
            tint={category.color}
            onPress={() => {
              if (category.id) onSelectCategory(category.id);
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
