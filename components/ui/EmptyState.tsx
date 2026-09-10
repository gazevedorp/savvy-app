import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BookmarkPlus, FolderPlus, Search } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: 'BookmarkPlus' | 'FolderPlus' | 'Search';
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

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
    <View style={[styles.container, { padding: spacing.xl }]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.primaryLight,
            marginBottom: spacing.xl,
          },
        ]}
      >
        {renderIcon()}
      </View>
      <Text style={[typography.heading, styles.title, { color: colors.text, marginBottom: spacing.xs }]}>
        {title}
      </Text>
      <Text style={[typography.caption, styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});
