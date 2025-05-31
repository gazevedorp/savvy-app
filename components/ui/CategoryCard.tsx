import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CategoryCardProps {
  category: Category;
  linkCount: number;
  width: number;
}

export default function CategoryCard({ category, linkCount, width }: CategoryCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Function to ensure the category color has proper contrast
  const getContrastColor = (hexColor: string): string => {
    // Simple contrast calculation (could be more sophisticated)
    return hexColor === '#FFFFFF' || hexColor === '#FFF' ? '#000000' : '#FFFFFF';
  };
  
  // Get text color with good contrast against the category color
  const textColor = getContrastColor(category.color);
  
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: category.color,
            width,
          }
        ]}
        onPress={() => {
          router.push({ pathname: '/', params: { categoryId: category.id, categoryName: category.name } });
        }}
      >
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {category.name}
        </Text>
        
        <Text style={[styles.count, { color: textColor + '99' }]}>
          {linkCount} {linkCount === 1 ? 'link' : 'links'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    height: 100,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  count: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});