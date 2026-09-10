import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MediaItem } from '@/utils/itunes';
import { useTheme } from '@/context/ThemeContext';
import { getTypeColor, getTypeLabel } from '@/utils/media';
import { Plus } from 'lucide-react-native';

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
  const { colors, spacing, radius, typography } = useTheme();
  const typeColor = getTypeColor(item.kind, colors.primary);
  const isMovie = item.kind === 'movie';
  const meta = [item.subtitle, item.releaseYear, item.collectionName]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.sm,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      disabled={saving}
    >
      {item.artworkUrl ? (
        <Image
          source={{ uri: item.artworkUrl }}
          style={[styles.artwork, isMovie ? styles.poster : styles.cover]}
        />
      ) : (
        <View
          style={[
            styles.artwork,
            isMovie ? styles.poster : styles.cover,
            { backgroundColor: colors.primaryLight },
          ]}
        />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, typography.label, { fontFamily: 'Inter-Bold', color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {meta ? (
          <Text style={[styles.meta, typography.caption, { fontFamily: 'Inter-Regular', color: colors.textSecondary }]} numberOfLines={2}>
            {meta}
          </Text>
        ) : null}
        <View style={[styles.typeTag, { backgroundColor: typeColor + '20', borderRadius: radius.lg }]}>
          <Text style={[styles.typeText, { color: typeColor }]}>
            {item.itunesKind === 'collection' ? 'Álbum' : getTypeLabel(item.kind)}
          </Text>
        </View>
      </View>

      <View style={[styles.saveButton, { backgroundColor: colors.primaryLight }]}>
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
    borderRadius: 8,
    backgroundColor: '#111',
  },
  cover: {
    width: 64,
    height: 64,
  },
  poster: {
    width: 52,
    height: 78,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
