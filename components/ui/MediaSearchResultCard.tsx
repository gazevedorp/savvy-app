import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MediaItem } from '@/utils/itunes';
import { useTheme } from '@/context/ThemeContext';
import { getTypeColor, getTypeLabel } from '@/utils/media';
import { Plus } from 'lucide-react-native';
import Chip from '@/components/ui/Chip';

interface MediaSearchResultCardProps {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
  saving?: boolean;
}

export default function MediaSearchResultCard({
  item,
  onPress,
  saving = false,
}: MediaSearchResultCardProps) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const typeColor = getTypeColor(item.kind, colors.primary);
  const isMovie = item.kind === 'movie';
  const meta = [item.subtitle, item.releaseYear, item.collectionName]
    .filter(Boolean)
    .join(' · ');
  const typeLabel = item.itunesKind === 'collection' ? 'Álbum' : getTypeLabel(item.kind);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.sm,
          marginBottom: spacing.sm,
          opacity: saving ? 0.7 : 1,
        },
        elevation.sm,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      disabled={saving}
      accessibilityRole="button"
      accessibilityLabel={`Salvar ${item.title}`}
    >
      {item.artworkUrl ? (
        <Image
          source={{ uri: item.artworkUrl }}
          style={[
            styles.artwork,
            isMovie ? styles.poster : styles.cover,
            { borderRadius: radius.sm, marginRight: spacing.sm },
          ]}
        />
      ) : (
        <View
          style={[
            styles.artwork,
            isMovie ? styles.poster : styles.cover,
            {
              backgroundColor: `${typeColor}22`,
              borderRadius: radius.sm,
              marginRight: spacing.sm,
            },
          ]}
        />
      )}

      <View style={styles.content}>
        <Text
          style={[typography.heading, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {meta ? (
          <Text
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                fontFamily: 'Inter-Regular',
                marginTop: spacing.xxs,
              },
            ]}
            numberOfLines={2}
          >
            {meta}
          </Text>
        ) : null}
        <View style={[styles.footer, { marginTop: spacing.xs }]}>
          <Chip label={typeLabel} variant="tag" tint={typeColor} />
        </View>
      </View>

      <View
        style={[
          styles.saveButton,
          {
            backgroundColor: colors.primaryLight,
            marginLeft: spacing.xs,
          },
        ]}
      >
        <Plus size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  artwork: {
    backgroundColor: '#111',
  },
  cover: {
    width: 72,
    height: 72,
  },
  poster: {
    width: 54,
    height: 80,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
