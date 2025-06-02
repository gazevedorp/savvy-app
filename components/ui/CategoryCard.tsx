import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Edit, Trash2 } from 'lucide-react-native'; // Import icons
import Animated, { FadeIn } from 'react-native-reanimated';

interface CategoryCardProps {
  category: Category;
  linkCount: number;
  width: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CategoryCard({ category, linkCount, width, onEdit, onDelete }: CategoryCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  // Function to ensure the category color has proper contrast
  const getContrastColor = (hexColor: string): string => {
    // Simple contrast calculation (could be more sophisticated)
    return hexColor === '#FFFFFF' || hexColor === '#FFF' ? '#000000' : '#FFFFFF';
  };
  
  // Get text color with good contrast against the category color
  const textColor = getContrastColor(category.color || colors.primary); // Fallback if color is undefined

  const handleCardPress = () => {
    router.push({ pathname: '/', params: { categoryId: category.id, categoryName: category.name } });
  };

  const handleEditPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when edit is pressed
    onEdit();
  };

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: category.color,
            width: width, // Ensure width is applied
          }
        ]}
        onPress={handleCardPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
            {category.name}
          </Text>
          
          <Text style={[styles.count, { color: textColor + 'B3' }]}> {/* Slightly more opaque for better readability */}
            {linkCount} {linkCount === 1 ? 'link' : 'links'}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleEditPress} style={styles.actionButton}>
            <Edit size={18} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); onDelete(); }} // Prevent card press
            style={styles.actionButton}
          >
            <Trash2 size={18} color={textColor} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    height: 100,
    flexDirection: 'row', // To align content and actions
    justifyContent: 'space-between', // Pushes content to left, actions to right
    alignItems: 'flex-end', // Aligns items to the bottom, good for actions
  },
  content: {
    flex: 1, // Takes available space
    justifyContent: 'space-between', // Distributes name and count vertically
    height: '100%', // Ensure it takes full height for space-between to work
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4, // Add some space between name and count
  },
  count: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'column', // Stack icons vertically
    justifyContent: 'space-between', // Space them out a bit
    alignItems: 'center',
    marginLeft: 8, // Space between content and actions
  },
  actionButton: {
    padding: 8, // Make touch target larger
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: subtle background for buttons
    // borderRadius: 15,
    // marginBottom: 8, // If stacked vertically and need space
  },
});