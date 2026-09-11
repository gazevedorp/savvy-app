import React from 'react';
import { View, StyleSheet, Text, Image, Linking } from 'react-native';
import { Link } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { getTypeColor, getTypeLabel } from '@/utils/media';
import { formatRelativeTime } from '@/utils/dateUtils';
import {
  canPreviewUrl,
  genericBodyTitle,
  genericDetailChips,
  genericDetailSubtitle,
  getDetailArtwork,
  isLocalImageLink,
  shouldShowDetailHero,
} from '@/utils/detail';
import Chip from '@/components/ui/Chip';
import Card from '@/components/ui/Card';
import WebView from '@/components/WebView';

interface GenericDetailViewProps {
  link: Link;
  categoryNames: string[];
}

export default function GenericDetailView({ link, categoryNames }: GenericDetailViewProps) {
  const { colors, theme, spacing, radius, typography } = useTheme();
  const artwork = getDetailArtwork(link);
  const showHero = shouldShowDetailHero(link);
  const typeColor = getTypeColor(link.type, colors.primary);
  const overlay = theme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.42)';
  const chips = genericDetailChips(link);
  const subtitle = genericDetailSubtitle(link);
  const isImage = link.type === 'image';
  const showWebPreview = canPreviewUrl(link) && !isImage;

  return (
    <View style={styles.wrapper}>
      {showHero ? (
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
              style={[styles.heroImage, isImage ? styles.heroImageTall : null]}
              resizeMode={isImage ? 'contain' : 'cover'}
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
      ) : (
        <Card style={{ marginBottom: spacing.md }}>
          <View
            style={[
              styles.typeTag,
              {
                backgroundColor: typeColor,
                borderRadius: radius.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.onPrimary }]}>
              {getTypeLabel(link.type)}
            </Text>
          </View>
          <Text style={[typography.hero, { color: colors.text, marginBottom: spacing.xs }]}>
            {link.title}
          </Text>
        </Card>
      )}

      {showHero && chips.length > 0 && (
        <View style={[styles.chipsRow, { marginBottom: spacing.md, gap: spacing.xs }]}>
          {chips.map((chip) => (
            <Chip key={chip} label={chip} variant="tag" tint={chip === getTypeLabel(link.type) ? typeColor : undefined} />
          ))}
        </View>
      )}

      {link.description ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.overline, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
            {genericBodyTitle(link.type)}
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>{link.description}</Text>
        </Card>
      ) : null}

      {isLocalImageLink(link) && !showHero ? (
        <Card padded={false} style={{ marginBottom: spacing.md, overflow: 'hidden' }}>
          <Image source={{ uri: link.url }} style={styles.localImage} resizeMode="contain" />
        </Card>
      ) : null}

      {showWebPreview ? (
        <Card padded={false} style={{ marginBottom: spacing.md, overflow: 'hidden' }}>
          <Text
            style={[
              typography.overline,
              {
                color: colors.textSecondary,
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
              },
            ]}
          >
            Prévia
          </Text>
          <WebView url={link.url} style={styles.webView} />
        </Card>
      ) : null}

      <Card style={{ marginBottom: spacing.md }}>
        <View style={[styles.metaRow, { marginBottom: spacing.sm, gap: spacing.sm }]}>
          <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>
            Salvo
          </Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatRelativeTime(link.created_at)}
          </Text>
        </View>
        {link.url && !isLocalImageLink(link) ? (
          <View style={[styles.metaRow, { marginBottom: spacing.sm, gap: spacing.sm }]}>
            <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>
              URL
            </Text>
            <Text
              style={[styles.metaValue, { color: colors.primary }]}
              onPress={() => Linking.openURL(link.url)}
            >
              {link.url}
            </Text>
          </View>
        ) : null}
        <View style={[styles.metaRow, { gap: spacing.sm, alignItems: 'flex-start' }]}>
          <Text style={[styles.metaLabel, typography.caption, { color: colors.textSecondary }]}>
            Categorias
          </Text>
          <View style={[styles.categoryChips, { gap: spacing.xxs }]}>
            {categoryNames.length > 0 ? (
              categoryNames.map((name) => <Chip key={name} label={name} variant="tag" />)
            ) : (
              <Text style={[styles.metaValue, { color: colors.text }]}>Nenhuma categoria</Text>
            )}
          </View>
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
    height: 280,
  },
  heroImageTall: {
    height: 360,
    backgroundColor: '#111',
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
  categoryChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  localImage: {
    width: '100%',
    height: 300,
  },
  webView: {
    height: 350,
  },
});
