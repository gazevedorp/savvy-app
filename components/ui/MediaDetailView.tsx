import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Link } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import {
  formatDuration,
  getTypeColor,
  getTypeLabel,
  mediaChips,
  resolveMediaMetadata,
} from '@/utils/media';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Play } from 'lucide-react-native';
import Chip from '@/components/ui/Chip';
import Card from '@/components/ui/Card';

interface MediaDetailViewProps {
  link: Link;
  categoryNames: string;
}

export default function MediaDetailView({ link, categoryNames }: MediaDetailViewProps) {
  const { colors, theme, spacing, radius, typography } = useTheme();
  const metadata = resolveMediaMetadata(link);
  const artwork = metadata?.artworkUrl || link.thumbnail;
  const isMovie = link.type === 'movie';
  const typeColor = getTypeColor(link.type, colors.primary);
  const overlay = theme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.42)';
  const chips = mediaChips(metadata, link.type);
  const subtitle = metadata?.artistName;
  const previewUrl = metadata?.previewUrl;

  const handlePreview = async () => {
    if (previewUrl) {
      await Linking.openURL(previewUrl);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            marginBottom: spacing.md,
          },
        ]}
      >
        {artwork ? (
          <Image
            source={{ uri: artwork }}
            style={styles.heroImage}
            resizeMode={isMovie ? 'cover' : 'cover'}
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: typeColor }]} />
        )}
        <View style={[styles.heroOverlay, { backgroundColor: overlay, padding: spacing.lg }]}>
          <View
            style={[
              styles.typeTag,
              { backgroundColor: typeColor, borderRadius: radius.md, marginBottom: spacing.sm },
            ]}
          >
            <Text style={[styles.typeTagText, typography.caption, { color: colors.onPrimary }]}>
              {getTypeLabel(link.type)}
            </Text>
          </View>
          <Text style={[styles.heroTitle, typography.hero]}>{link.title}</Text>
          {subtitle ? (
            <Text style={[styles.heroSubtitle, typography.subtitle]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {chips.length > 0 && (
        <View style={[styles.chipsRow, { marginBottom: spacing.md, gap: spacing.xs }]}>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} variant="tag" />
          ))}
        </View>
      )}

      {previewUrl ? (
        <TouchableOpacity
          style={[
            styles.previewButton,
            {
              backgroundColor: typeColor,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              marginBottom: spacing.md,
              gap: spacing.xs,
            },
          ]}
          onPress={handlePreview}
        >
          <Play size={16} color={colors.onPrimary} fill={colors.onPrimary} />
          <Text style={[typography.label, { color: colors.onPrimary }]}>
            {isMovie ? 'Abrir prévia' : 'Ouvir prévia'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {link.description ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.overline, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
            {isMovie ? 'Sinopse' : 'Sobre'}
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>{link.description}</Text>
        </Card>
      ) : null}

      <Card style={{ marginBottom: spacing.md }}>
        <View style={[styles.metaRow, { marginBottom: spacing.sm, gap: spacing.sm }]}>
          <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>Salvo</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatRelativeTime(link.created_at)}
          </Text>
        </View>
        {metadata?.collectionName && link.type === 'music' ? (
          <View style={[styles.metaRow, { marginBottom: spacing.sm, gap: spacing.sm }]}>
            <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>Álbum</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{metadata.collectionName}</Text>
          </View>
        ) : null}
        {formatDuration(metadata?.durationMs) ? (
          <View style={[styles.metaRow, { marginBottom: spacing.sm, gap: spacing.sm }]}>
            <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>Duração</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatDuration(metadata?.durationMs)}
            </Text>
          </View>
        ) : null}
        <View style={[styles.metaRow, { gap: spacing.sm }]}>
          <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>Categorias</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{categoryNames}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 100,
  },
  hero: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroImage: {
    width: '100%',
    height: 360,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeTagText: {},
  heroTitle: {
    color: '#fff',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    width: 90,
  },
  metaValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
});
