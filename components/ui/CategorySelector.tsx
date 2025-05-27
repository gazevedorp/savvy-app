import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Check } from 'lucide-react-native';

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
  const { colors } = useTheme();

  if (categories.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No categories available
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              { 
                backgroundColor: isSelected ? category.color + '20' : colors.card,
                borderColor: isSelected ? category.color : colors.border,
              }
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text 
              style={[
                styles.categoryName,
                { color: isSelected ? category.color : colors.text }
              ]}
            >
              {category.name}
            </Text>
            
            {isSelected && (
              <Check size={16} color={category.color} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 4,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
});