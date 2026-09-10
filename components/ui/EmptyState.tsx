import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  BookmarkPlus,
  CheckCircle2,
  FolderPlus,
  Inbox,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';

export type EmptyStateIcon =
  | 'BookmarkPlus'
  | 'FolderPlus'
  | 'Search'
  | 'Inbox'
  | 'CheckCircle'
  | 'Filter';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: EmptyStateIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  const renderIcon = () => {
    const size = 56;
    const color = colors.primary;

    switch (icon) {
      case 'FolderPlus':
        return <FolderPlus size={size} color={color} />;
      case 'Search':
        return <Search size={size} color={color} />;
      case 'Inbox':
        return <Inbox size={size} color={color} />;
      case 'CheckCircle':
        return <CheckCircle2 size={size} color={color} />;
      case 'Filter':
        return <SlidersHorizontal size={size} color={color} />;
      case 'BookmarkPlus':
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
            marginBottom: spacing.lg,
          },
        ]}
      >
        {renderIcon()}
      </View>
      <Text
        style={[
          typography.title,
          styles.title,
          { color: colors.text, marginBottom: spacing.xs },
        ]}
      >
        {title}
      </Text>
      <Text style={[typography.body, styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View style={[styles.action, { marginTop: spacing.lg, minWidth: 220 }]}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
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
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
    fontFamily: 'Inter-Regular',
  },
  action: {
    alignSelf: 'center',
  },
});
