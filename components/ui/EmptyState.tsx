import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BookmarkPlus, FolderPlus, Search } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: 'BookmarkPlus' | 'FolderPlus' | 'Search'; // Add more icon options as needed
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  const { colors } = useTheme();
  
  const renderIcon = () => {
    const size = 64;
    const color = colors.primary;
    
    switch (icon) {
      case 'BookmarkPlus':
        return <BookmarkPlus size={size} color={color} />;
      case 'FolderPlus':
        return <FolderPlus size={size} color={color} />;
      case 'Search':
        return <Search size={size} color={color} />;
      default:
        return <BookmarkPlus size={size} color={color} />;
    }
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500).delay(300)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        {renderIcon()}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
});