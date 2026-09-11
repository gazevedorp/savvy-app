import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { contrastOnColor, formatCategoryCount } from '@/utils/categories';

interface CategoryCardProps {
  category: Category;
  linkCount: number;
  width: number;
  onOpenActions: (category: Category) => void;
}

export default function CategoryCard({
  category,
  linkCount,
  width,
  onOpenActions,
}: CategoryCardProps) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const router = useRouter();
  const accent = category.color || colors.primary;
  const onAccent = contrastOnColor(accent);

  const handleCardPress = () => {
    router.push({
      pathname: '/',
      params: { categoryId: category.id, categoryName: category.name },
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ width }}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.sm,
          },
          elevation.sm,
        ]}
      >
        <Pressable
          style={styles.main}
          onPress={handleCardPress}
          onLongPress={() => onOpenActions(category)}
          delayLongPress={300}
          accessibilityRole="button"
          accessibilityLabel={`${category.name}, ${formatCategoryCount(linkCount)}`}
          accessibilityHint="Toque para filtrar. Mantenha pressionado para editar ou excluir."
        >
          <View style={[styles.swatch, { backgroundColor: accent, borderRadius: radius.md }]}>
            <CategoryIcon name={category.icon} color={onAccent} size={22} />
          </View>

          <View style={[styles.body, { marginLeft: spacing.sm }]}>
            <Text style={[typography.heading, { color: colors.text }]} numberOfLines={2}>
              {category.name}
            </Text>
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textSecondary,
                  marginTop: spacing.xxs,
                  fontFamily: 'Inter-Regular',
                },
              ]}
            >
              {formatCategoryCount(linkCount)}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => onOpenActions(category)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Ações para ${category.name}`}
          style={styles.more}
        >
          <EllipsisVertical size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 88,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  swatch: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  more: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
