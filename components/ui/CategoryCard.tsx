import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
// Icons are no longer directly used here
import Animated, { FadeIn } from 'react-native-reanimated';

interface CategoryCardProps {
  category: Category;
  linkCount: number;
  width: number;
  onLongPress: (category: Category) => void; // Changed from onEdit/onDelete
}

export default function CategoryCard({ category, linkCount, width, onLongPress }: CategoryCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();

  const getContrastColor = (hexColor: string): string => {
    if (!hexColor || hexColor.length < 7) return '#FFFFFF'; // Default to white for invalid or undefined colors
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
    return brightness > 125 ? '#000000' : '#FFFFFF';
  };
  
  const textColor = getContrastColor(category.color || colors.primary); // Fallback if color is undefined

  const handleCardPress = () => {
    router.push({ pathname: '/', params: { categoryId: category.id, categoryName: category.name } });
  };


  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: category.color || colors.primary,
            width: width,
            borderRadius: radius.md,
            padding: spacing.sm,
          }
        ]}
        onPress={handleCardPress}
        onLongPress={() => onLongPress(category)} // Call onLongPress with the category
        activeOpacity={0.8}
        delayLongPress={300} // Standard delay for long press
      >
        <View style={styles.content}>
          <Text style={[styles.name, typography.label, { fontFamily: 'Inter-Bold', color: textColor }]} numberOfLines={2}>
            {category.name}
          </Text>
          
          <Text style={[styles.count, typography.caption, { color: textColor + 'B3' }]}>
            {linkCount} {linkCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        {/* Action icons are removed */}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
  },
  content: {
    flex: 1, // Takes available space
    justifyContent: 'space-between', // Distributes name and count vertically
    height: '100%', // Ensure it takes full height for space-between to work
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginBottom: 4, // Add some space between name and count
  },
  count: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});