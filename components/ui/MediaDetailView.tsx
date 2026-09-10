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

interface MediaDetailViewProps {
  link: Link;
  categoryNames: string;
}

export default function MediaDetailView({ link, categoryNames }: MediaDetailViewProps) {
  const { colors, theme } = useTheme();
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
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {artwork ? (
          <Image
            source={{ uri: artwork }}
            style={styles.heroImage}
            resizeMode={isMovie ? 'cover' : 'cover'}
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: typeColor }]} />
        )}
        <View style={[styles.heroOverlay, { backgroundColor: overlay }]}>
          <View style={[styles.typeTag, { backgroundColor: typeColor }]}>
            <Text style={styles.typeTagText}>{getTypeLabel(link.type)}</Text>
          </View>
          <Text style={styles.heroTitle}>{link.title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((chip) => (
            <View
              key={chip}
              style={[styles.chip, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
            >
              <Text style={[styles.chipText, { color: colors.primary }]}>{chip}</Text>
            </View>
          ))}
        </View>
      )}

      {previewUrl ? (
        <TouchableOpacity
          style={[styles.previewButton, { backgroundColor: typeColor }]}
          onPress={handlePreview}
        >
          <Play size={16} color="#fff" fill="#fff" />
          <Text style={styles.previewButtonText}>
            {isMovie ? 'Abrir prévia' : 'Ouvir prévia'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {link.description ? (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {isMovie ? 'Sinopse' : 'Sobre'}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>{link.description}</Text>
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Salvo</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatRelativeTime(link.created_at)}
          </Text>
        </View>
        {metadata?.collectionName && link.type === 'music' ? (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Álbum</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{metadata.collectionName}</Text>
          </View>
        ) : null}
        {formatDuration(metadata?.durationMs) ? (
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Duração</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatDuration(metadata?.durationMs)}
            </Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Categorias</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{categoryNames}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 100,
  },
  hero: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 360,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: 20,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  typeTagText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  heroTitle: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  metaLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    width: 90,
  },
  metaValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
});
