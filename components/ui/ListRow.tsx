import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ListRowProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  divider?: boolean;
}

export default function ListRow({
  icon,
  title,
  description,
  onPress,
  trailing,
  divider = true,
}: ListRowProps) {
  const { colors, spacing, typography } = useTheme();

  const content = (
    <>
      {icon ? <View style={[styles.icon, { marginRight: spacing.md }]}>{icon}</View> : null}
      <View style={styles.content}>
        <Text style={[typography.label, { color: colors.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, typography.micro, { color: colors.textSecondary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing}
    </>
  );

  const rowStyle = [
    styles.row,
    {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomColor: colors.border,
      borderBottomWidth: divider ? 1 : 0,
    },
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={rowStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
});
